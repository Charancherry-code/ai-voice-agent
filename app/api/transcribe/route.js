import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';


const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file found." }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

   
    const uploadUrl = await client.files.upload(audioBuffer);

  
    const transcript = await client.transcripts.create({
      audio_url: uploadUrl,
    });

    if (transcript.status === 'error') {
      return NextResponse.json({ error: transcript.error }, { status: 500 });
    }

    return NextResponse.json(
      { 
        message: "Transcription successful!",
        transcript: transcript.text 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error handling transcription:", error);
    const errorMessage = error.error || "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}