import { NextResponse } from "next/server";
import OpenAI from "openai";
import { OpenRouter } from "@openrouter/sdk";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Image Editor Clone",
  },
});

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { image, prompt, mode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Text to Image Mode
    if (mode === "text-to-image") {
      console.log("Sending request to OpenRouter API via fetch...");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Image Editor Clone",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          // modalities: ["image", "text"], // Removed standard modality if not strictly required by raw API or try without it first
        })
      });

      const rawText = await response.text();
      console.log("Raw OpenRouter Response:", rawText);

      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return NextResponse.json({ error: "Invalid JSON from OpenRouter" }, { status: 500 });
      }

      // Manually extract images
      const message = result.choices?.[0]?.message;
      let extractedImageUrl = null;

      if (message) {
         // Check standard 'images' array often used by OpenRouter for some models
         if (result.choices[0].images && Array.isArray(result.choices[0].images)) {
             extractedImageUrl = result.choices[0].images[0];
         }
         // Check inside message (Gemini specific sometimes)
         else if (message.images && Array.isArray(message.images)) {
             const img = message.images[0];
             extractedImageUrl = img.url || img.imageUrl?.url || img.image_url?.url;
         }
         // Check for content being a URL directly (rare but possible)
         else if (typeof message.content === 'string' && message.content.startsWith('http')) {
             // Basic check, might be text though
         }
      }

      return NextResponse.json({ 
        full_response: result,
        imageUrl: extractedImageUrl,
        result: message?.content 
      });
    }

    // Image to Image Mode (Existing Logic)
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: image, // Assuming base64 data URL
              },
            },
          ],
        },
      ],
    });

    const result = completion.choices[0].message.content;

    return NextResponse.json({ result, full_response: completion });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
