import { NextResponse } from "next/server";
import OpenAI from "openai";
import { OpenRouter } from "@openrouter/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Credit Check for Logged-in Users
    let currentCredits = 0;
    const adminSupabase = createAdminClient();

    if (user) {
      const { data: creditData } = await adminSupabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      // Lazy initialization if record doesn't exist
      if (!creditData) {
        const { data: newCredit } = await adminSupabase
          .from('user_credits')
          .insert([{ user_id: user.id, credits: 10 }])
          .select('credits')
          .single();
        currentCredits = newCredit ? newCredit.credits : 10;
      } else {
        currentCredits = creditData.credits;
      }

      if (currentCredits < 2) {
        return NextResponse.json(
          { error: "Insufficient credits. You need 2 credits to generate." },
          { status: 403 }
        );
      }
    }

    const { image, prompt, mode, model } = await req.json();

    const cleanModel = model ? model.trim() : "";
    console.log(`[Generate API] Request received. Model: '${cleanModel}', Mode: '${mode}'`);

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const deductCredits = async () => {
      if (user) {
        // Deduct 2 credits
        const { error } = await adminSupabase
          .from('user_credits')
          .update({ credits: currentCredits - 2 })
          .eq('user_id', user.id);

        if (error) {
          console.error("Failed to deduct credits:", error);
        }
      }
    };

    // Volcengine Doubao Model
    if (cleanModel === "doubao-seedream-4.5") {
      console.log("Sending request to Volcengine API...");

      const requestBody: any = {
        model: "doubao-seedream-4-5-251128",
        prompt: prompt,
        size: "2K",
        response_format: "url",
        watermark: false
      };

      // Add image for image-to-image mode
      if (mode === "image-to-image" && image) {
        requestBody.image = image; // Supports both URL and base64 data URLs
        requestBody.sequential_image_generation = "disabled";
      }

      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ARK_API_KEY}`,
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log("Volcengine Response:", JSON.stringify(result, null, 2));

      if (result.error) {
        return NextResponse.json({ error: result.error.message || "Volcengine API Error" }, { status: 500 });
      }

      // Extract image URL from response
      const imageUrl = result.data?.[0]?.url;

      if (!imageUrl) {
        return NextResponse.json({ error: "No image URL in response" }, { status: 500 });
      }

      await deductCredits();

      return NextResponse.json({
        imageUrl: imageUrl,
        result: prompt
      });
    }

    // Default: OpenRouter (Nano Banana / Gemini)
    console.log("Using OpenRouter fallback...");

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
        if (result.choices[0].images && Array.isArray(result.choices[0].images)) {
          extractedImageUrl = result.choices[0].images[0];
        }
        else if (message.images && Array.isArray(message.images)) {
          const img = message.images[0];
          extractedImageUrl = img.url || img.imageUrl?.url || img.image_url?.url;
        }
      }

      // Deduct credits on success
      await deductCredits();

      return NextResponse.json({
        full_response: result,
        imageUrl: extractedImageUrl,
        result: message?.content
      });
    }

    // Image to Image Mode
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

    // Deduct credits on success
    await deductCredits();

    return NextResponse.json({ result, full_response: completion });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
