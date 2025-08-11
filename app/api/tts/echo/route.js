import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file found.' }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    const transcribedText = await assemblyClient.transcripts.transcribe({
      audio: audioBuffer
    });

    if (!transcribedText.text) {
      const uploadUrl = await assemblyClient.files.upload(audioBuffer);
      const transcript = await assemblyClient.transcripts.create({
        audio_url: uploadUrl,
      });

      if (transcript.status === 'error' || !transcript.text) {
        console.error('AssemblyAI Transcription Error:', transcript.error || "No text transcribed");
        return NextResponse.json({ error: 'Could not understand the audio. Please try again.' }, { status: 400 });
      }
      transcribedText.text = transcript.text;
    }
    
    console.log('Transcription successful:', transcribedText.text);

    const murfResponse = await fetch('https://api.murf.ai/v1/speech/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.MURF_API_KEY,
      },
      body: JSON.stringify({
        text: transcribedText.text,
        voiceId: 'en-US-natalie', 
      }),
    });

    if (!murfResponse.ok) {
      const errorText = await murfResponse.text();
      console.error('Murf AI Error:', errorText);
      throw new Error(errorText || 'Murf API request failed');
    }

    const murfData = await murfResponse.json();

    // =================================================================
    // THE FIX: Use murfData.audioFile instead of murfData.audioUrl
    // =================================================================
    return NextResponse.json({
      audioUrl: murfData.audioFile,
      transcript: transcribedText.text,
    });

  } catch (error) {
    console.error('Error in /api/tts/echo:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}