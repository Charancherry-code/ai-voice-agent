

// import { NextResponse } from 'next/server';
// import { AssemblyAI } from 'assemblyai';
// import { GoogleGenerativeAI } from "@google/generative-ai"; // Gemini SDK


// const assemblyClient = new AssemblyAI({
//   apiKey: process.env.ASSEMBLYAI_API_KEY,
// });

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const audioFile = formData.get('audio');

//     if (!audioFile) {
//       return NextResponse.json({ error: 'No audio file found.' }, { status: 400 });
//     }
//     const audioBuffer = Buffer.from(await audioFile.arrayBuffer());


//     console.log('Transcribing audio...');
//     const transcript = await assemblyClient.transcripts.transcribe({
//       audio: audioBuffer
//     });

//     if (!transcript.text) {
//       return NextResponse.json({ error: 'Could not understand the audio.' }, { status: 400 });
//     }
//     console.log('User Query:', transcript.text);


//     console.log('Sending query to Gemini...');
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


//     const prompt = `Please keep your response concise and under 2500 characters. The user's question is: "${transcript.text}"`;
    
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const llmResponseText = response.text();

//     if (!llmResponseText) {
//       return NextResponse.json({ error: 'LLM did not return a response.' }, { status: 500 });
//     }
//     console.log('LLM Response:', llmResponseText);


//     console.log('Sending LLM response to Murf AI...');
//     const murfResponse = await fetch('https://api.murf.ai/v1/speech/generate', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-key': process.env.MURF_API_KEY,
//       },
//       body: JSON.stringify({
//         text: llmResponseText,
//         voiceId: 'en-US-natalie',
//       }),
//     });

//     if (!murfResponse.ok) {
//       const errorText = await murfResponse.text();
//       throw new Error(`Murf API Error: ${errorText}`);
//     }

//     const murfData = await murfResponse.json();
    

//     return NextResponse.json({
//       userQuery: transcript.text,
//       llmResponse: llmResponseText,
//       audioUrl: murfData.audioFile,
//     });

//   } catch (error) {
//     console.error('Error in /api/llm/query:', error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { GoogleGenerativeAI } from "@google/generative-ai";

const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file found.' }, { status: 400 });
    }
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    console.log('Transcribing audio...');
    const transcript = await assemblyClient.transcripts.transcribe({ audio: audioBuffer });

    if (!transcript.text) {
      throw new Error("Could not understand the audio. Please speak clearly.");
    }
    console.log('User Query:', transcript.text);

    console.log('Sending query to Gemini...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Please keep your response concise and under 2500 characters. The user's question is: "${transcript.text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
      throw new Error("LLM failed to return a valid response.");
    }

    const llmResponseText = response.text();
    console.log('LLM Response:', llmResponseText);

    console.log('Sending LLM response to Murf AI...');
    const murfResponse = await fetch('https://api.murf.ai/v1/speech/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': process.env.MURF_API_KEY, },
      body: JSON.stringify({ text: llmResponseText, voiceId: 'en-US-natalie' }),
    });

    if (!murfResponse.ok) {
      const errorText = await murfResponse.text();
      throw new Error(`Murf API Error: ${errorText}`);
    }
    const murfData = await murfResponse.json();
    
    return NextResponse.json({
      userQuery: transcript.text,
      llmResponse: llmResponseText,
      audioUrl: murfData.audioFile,
    });

  } catch (error) {
    console.error('CRITICAL_ERROR in /api/llm/query:', error.message);
    
    return NextResponse.json({
        error: true,
        errorMessage: "I'm facing a technical problem right now. Please try again shortly.",
        // FIX: Updated path to match your file structure from the screenshot
        fallbackAudioUrl: "/audio/fallback-error.mp3" 
    }, { status: 503 });
  }
}