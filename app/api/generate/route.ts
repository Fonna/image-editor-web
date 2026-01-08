import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Image Editor Clone",
  },
});

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    let model = "";
    let messages = [];

    if (image) {
      // Vision/Image Editing Mode
      model = "google/gemini-2.0-flash-exp:free";
      messages = [
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
                url: image,
              },
            },
          ],
        },
      ];
    } else {
      // Text to Image Mode
      model = "black-forest-labs/flux-1-schnell:free";
      messages = [
        {
          role: "user",
          content: prompt,
        },
      ];
    }

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages as any,
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
