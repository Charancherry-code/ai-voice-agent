// /app/api/tts/route.js
import { NextResponse } from "next/server";
import { generateSpeech } from "@/services/murf.service"; // Adjust path if needed

export async function POST(req) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: "Text and voiceId fields are required." },
        { status: 400 }
      );
    }

    // Delegate the API call to the service
    const data = await generateSpeech(text, voiceId);

    // Return the successful response from the service
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in /api/tts route:", error.message);
    // Return a generic server error message
    return NextResponse.json({ error: error.message || "An internal server error occurred." }, { status: 500 });
  }
}