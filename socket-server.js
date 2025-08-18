const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer, WebSocket } = require('ws');
const { AssemblyAI } = require('assemblyai');

// --- Configuration ---
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;
const MURF_VOICE_ID = 'en-US-natalie';

// --- Initialize Clients ---
const myAssemblyApiKey = "fa31ec2219dd41ebac5ebef272b45b20"; // Your AssemblyAI key
const myMurfApiKey = "YOUR_MURF_API_KEY_HERE"; // ⚠️ Remember to add your Murf key
const assemblyClient = new AssemblyAI({ apiKey: myAssemblyApiKey });

app.prepare().then(() => {
    const server = createServer((req, res) => handle(req, res, parse(req.url, true)));
    const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    // Only handle upgrade requests for our specific WebSocket path
    if (parse(req.url).pathname === '/ws') {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    }
    // By having no 'else', we are now ignoring other paths,
    // allowing Next.js's internal systems to work correctly.
});
    // --- Main WebSocket Logic ---
    wss.on('connection', (clientWs) => {
        console.log('✅ Client connected for a new conversation.');
        
        // --- FIX #1: Tell AssemblyAI to use the latest model ---
      const transcriber = assemblyClient.realtime.transcriber({
    sampleRate: 16000,
    model: "universal" // Add this line
});

        const sendTTSResponse = (text) => {
            console.log(`[Murf] Generating speech for: "${text}"`);
            const murfSocket = new WebSocket('wss://api.murf.ai/v1/speech/stream', {
                headers: { 'api-key': myMurfApiKey },
            });
            murfSocket.on('open', () => {
                murfSocket.send(JSON.stringify({ voiceId: MURF_VOICE_ID, text }));
            });
            murfSocket.on('message', (audioChunk) => {
                if (clientWs.readyState === WebSocket.OPEN) clientWs.send(audioChunk);
            });
            murfSocket.on('close', () => console.log('[Murf] TTS stream finished.'));
            murfSocket.on('error', (err) => console.error('[Murf] Error:', err));
        };

        transcriber.on('transcript', (transcript) => {
            if (clientWs.readyState === WebSocket.OPEN && transcript.text) {
                clientWs.send(JSON.stringify({
                    type: 'transcript',
                    text: transcript.text,
                    isFinal: transcript.message_type === 'FinalTranscript'
                }));
            }
            if (transcript.message_type === 'FinalTranscript' && transcript.text) {
                console.log(`[AssemblyAI] You said: "${transcript.text}"`);
                const responseText = `You said: ${transcript.text}`;
                sendTTSResponse(responseText);
            }
        });

        transcriber.on('error', (error) => console.error('[AssemblyAI] Error:', error));
        transcriber.connect();

        // Handle incoming audio from the client
        clientWs.on('message', (audioChunk) => {
            // --- FIX #2: Remove the incorrect .isOpen() check ---
            if (transcriber) {
                transcriber.stream(audioChunk);
            }
        });

        clientWs.on('close', () => {
            console.log('❌ Client disconnected.');
             // --- FIX #2 again: Remove the incorrect .isOpen() check ---
            if (transcriber) {
                transcriber.close();
            }
        });
    });

    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});