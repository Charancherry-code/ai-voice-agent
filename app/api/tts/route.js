// File: app/api/tts/route.js



import { NextResponse } from "next/server";



export async function POST(req) {

  try {

    // Destructure both text and voiceId from the request body

    const { text, voiceId } = await req.json();



    // Validate that both fields are present

    if (!text || !voiceId) {

      return NextResponse.json(

        { error: "Text and voiceId fields are required." },

        { status: 400 }

      );

    }



    const murfResponse = await fetch("https://api.murf.ai/v1/speech/generate", {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "api-key": process.env.MURF_API_KEY,

      },

      body: JSON.stringify({

        text,    // The text from the user

        voiceId, // The dynamic voiceId from the dropdown

      }),

    });



    if (!murfResponse.ok) {

      const errorText = await murfResponse.text();

      console.error("Murf API Error:", errorText);

      throw new Error(errorText || "Murf API request failed");

    }



    const data = await murfResponse.json();

    return NextResponse.json(data);



  } catch (error) {

    console.error("Internal Server Error in /api/tts:", error.message);

    return NextResponse.json({ error: error.message }, { status: 500 });

  }

}