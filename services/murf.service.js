// /services/murf.service.js

/**
 * Generates speech from text using the Murf AI API.
 * @param {string} text The text to convert to speech.
 * @param {string} voiceId The ID of the voice to use.
 * @returns {Promise<object>} The JSON response from the Murf API, typically { audioUrl, ... }.
 * @throws {Error} If the API request fails.
 */
export async function generateSpeech(text, voiceId) {
  try {
    const murfResponse = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.MURF_API_KEY, // Ensure your API key is in .env.local
      },
      body: JSON.stringify({
        text,
        voiceId,
      }),
    });

    const responseData = await murfResponse.json();

    if (!murfResponse.ok) {
      // Throw an error with the message from Murf's API if available
      throw new Error(responseData.message || "Murf API request failed");
    }

    return responseData;
  } catch (error) {
    console.error("Error in Murf Service:", error.message);
    // Re-throw the error to be caught by the API route handler
    throw error;
  }
}