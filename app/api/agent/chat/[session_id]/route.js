


import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { GoogleGenerativeAI } from "@google/generative-ai";

const assemblyClient = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatHistories = new Map();

function formatHistoryForPrompt(history) {
    let promptString = "You are a helpful conversational assistant named Natalie. ..."; // (Your existing function is correct)
    history.forEach(turn => {
        if (turn.role === 'user') promptString += `User: ${turn.content}\n`;
        else promptString += `Assistant: ${turn.content}\n`;
    });
    promptString += "Assistant: "; 
    return promptString;
}

export async function POST(req, { params }) { 
    try {
        // --- This entire 'try' block is your existing "happy path" logic ---
        const { session_id } = params;
        const formData = await req.formData();
        const audioFile = formData.get('audio');

        if (!audioFile || !session_id) { 
            return NextResponse.json({ error: 'Audio file and session ID are required.' }, { status: 400 });
        }
        
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const transcript = await assemblyClient.transcripts.transcribe({ audio: audioBuffer });

        if (!transcript.text) {
            return NextResponse.json({ error: 'Could not understand the audio.' }, { status: 400 });
        }
        
        let history = chatHistories.get(session_id) || [];
        history.push({ role: 'user', content: transcript.text });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        const prompt = formatHistoryForPrompt(history);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const llmResponseText = response.text();

        if (!llmResponseText) {
            return NextResponse.json({ error: 'LLM did not return a response.' }, { status: 500 });
        }

        history.push({ role: 'assistant', content: llmResponseText });
        chatHistories.set(session_id, history);
        
        const murfResponse = await fetch('https://api.murf.ai/v1/speech/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.MURF_API_KEY,
            },
            body: JSON.stringify({
                text: llmResponseText,
                voiceId: 'en-US-natalie',
            }),
        });

        if (!murfResponse.ok) {
            // This will be caught by our catch block below
            throw new Error(`Murf API Error: ${await murfResponse.text()}`);
        }

        const murfData = await murfResponse.json();
        
        return NextResponse.json({
            history: history, 
            audioUrl: murfData.audioFile,
        });

    } catch (error) {
        // --- MODIFIED CATCH BLOCK ---
        console.error('--- A CRITICAL ERROR OCCURRED ---', error.message);
        
        // Respond with a specific payload for the frontend to handle gracefully
        return NextResponse.json(
          {
            error: true,
            errorMessage: "A critical service failed. Please try again.",
            fallbackAudioUrl: '/audio/fallback-error.mp3' // The path to your static audio file
          }, 
          { status: 500 } // Use the 500 Internal Server Error status
        );
    }
}