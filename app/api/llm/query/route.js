// // src/app/api/llm/query/route.js

// import { NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import OpenAI from 'openai';
// import fetch from 'node-fetch';

// // --- Initialize APIs ---
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // --- Helper Functions from Day 9 (keep them) ---
// const generateMurfAudio = async (text, voiceId) => {
//     // ... (same Murf API call function as Day 9)
//     const murfResponse = await fetch("https://api.murf.ai/v1/speech/generate", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "api-key": process.env.MURF_API_KEY,
//         },
//         body: JSON.stringify({ text, voiceId }),
//     });
//     if (!murfResponse.ok) {
//         const errorText = await murfResponse.text();
//         console.error("Murf API Error:", errorText);
//         throw new Error("Failed to generate audio with Murf.ai");
//     }
//     return await murfResponse.json();
// };

// const transcribeAudio = async (audioFile) => {
//     // ... (same Whisper transcription function as Day 9)
//     const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
//     const audioStream = new require('stream').Readable();
//     audioStream.push(audioBuffer);
//     audioStream.push(null);
//     audioStream.path = 'audio.webm';

//     const transcription = await openai.audio.transcriptions.create({
//         model: "whisper-1",
//         file: audioStream,
//     });
//     return transcription.text;
// };

// // --- Main Handler ---
// export async function POST(req) {
//     try {
//         const requestData = await req.formData();
//         const audioFile = requestData.get('audio');
//         const voiceId = requestData.get('voiceId') || 'en-US-miles'; // Default to Miles

//         if (!audioFile) {
//             return NextResponse.json({ error: "No audio file found." }, { status: 400 });
//         }

//         // 1. Transcribe User's Audio
//         console.log("Transcribing audio...");
//         const userQuery = await transcribeAudio(audioFile);
//         console.log("User said:", userQuery);

//         // 2. Initiate Gemini Stream and Synthesize First Sentence
//         console.log("Streaming from Gemini and listening for the first sentence...");
        
//         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//         const resultStream = await model.generateContentStream(userQuery);

//         let bufferedText = "";
//         let firstSentenceSynthesized = false;
//         let finalAudioUrl = null;

//         for await (const chunk of resultStream.stream) {
//             bufferedText += chunk.text();
            
//             // Regex to find the first sentence (ends with ., !, or ?)
//             const sentenceEndMatch = bufferedText.match(/([^.!?]+[.!?])/);

//             if (sentenceEndMatch && !firstSentenceSynthesized) {
//                 firstSentenceSynthesized = true;
//                 const firstSentence = sentenceEndMatch[0].trim();
                
//                 console.log("First sentence detected:", firstSentence);
//                 console.log("Sending to Murf for synthesis...");

//                 // Call Murf with the first complete sentence
//                 const murfAudioData = await generateMurfAudio(firstSentence, voiceId);
//                 finalAudioUrl = murfAudioData.audioUrl;

//                 // We have what we need, break the loop.
//                 // In a more advanced app, you might continue to stream and queue up more audio.
//                 break;
//             }
//         }

//         if (!finalAudioUrl) {
//            // This is a fallback in case the response was too short for a sentence ending
//            if (bufferedText.trim()) {
//                 console.log("Stream ended, response was short. Synthesizing full text:", bufferedText);
//                 const murfAudioData = await generateMurfAudio(bufferedText.trim(), voiceId);
//                 finalAudioUrl = murfAudioData.audioUrl;
//            } else {
//                throw new Error("LLM returned an empty response.");
//            }
//         }
        
//         console.log("Returning audio URL to client.");
//         return NextResponse.json({ audioUrl: finalAudioUrl });

//     } catch (error) {
//         console.error("Streaming pipeline error:", error);
//         return NextResponse.json({ error: error.message || "An internal server error occurred" }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Gemini SDK

// Initialize clients with API keys from .env.local
const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});
// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file found.' }, { status: 400 });
    }
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // --- 1. Transcribe Audio with AssemblyAI ---
    console.log('Transcribing audio...');
    const transcript = await assemblyClient.transcripts.transcribe({
      audio: audioBuffer
    });

    if (!transcript.text) {
      return NextResponse.json({ error: 'Could not understand the audio.' }, { status: 400 });
    }
    console.log('User Query:', transcript.text);

    // --- 2. Get Response from Google Gemini ---
    console.log('Sending query to Gemini...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Add instructions to keep the response short for Murf AI
    const prompt = `Please keep your response concise and under 2500 characters. The user's question is: "${transcript.text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const llmResponseText = response.text();

    if (!llmResponseText) {
      return NextResponse.json({ error: 'LLM did not return a response.' }, { status: 500 });
    }
    console.log('LLM Response:', llmResponseText);

    // --- 3. Generate Speech with Murf AI ---
    console.log('Sending LLM response to Murf AI...');
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
      const errorText = await murfResponse.text();
      throw new Error(`Murf API Error: ${errorText}`);
    }

    const murfData = await murfResponse.json();
    
    // Return all data to the frontend
    return NextResponse.json({
      userQuery: transcript.text,
      llmResponse: llmResponseText,
      audioUrl: murfData.audioFile,
    });

  } catch (error) {
    console.error('Error in /api/llm/query:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}