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

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get Guest ID from headers
    const guestId = req.headers.get("X-Guest-Id");

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
    } else {
       // Optional: Enforce Guest limits here via DB check if we wanted to be strict
       // But currently we rely on frontend + localstorage for UX, and this backend logging for auditing.
    }

    const { image, prompt, mode, model } = await req.json();
    const cleanModel = model ? model.trim() : "unknown";
    
    console.log(`[Generate API] Request received. User: ${user?.id || 'Guest'}, Model: '${cleanModel}', Mode: '${mode}'`);

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Helper: Deduct Credits
    const deductCredits = async () => {
      if (user) {
        const { error } = await adminSupabase
          .from('user_credits')
          .update({ credits: currentCredits - 2 })
          .eq('user_id', user.id);
        if (error) console.error("Failed to deduct credits:", error);
      }
    };

    // Helper: Save to Storage & DB
    const saveResult = async (tempImageUrl: string) => {
      try {
        console.log("Downloading image from provider...", tempImageUrl);
        const imageRes = await fetch(tempImageUrl);
        if (!imageRes.ok) throw new Error("Failed to download generated image");
        
        const imageBlob = await imageRes.blob();
        const buffer = await imageBlob.arrayBuffer();
        
        const fileName = `${user ? user.id : (guestId || 'anonymous')}/${Date.now()}.png`;
        
        console.log("Uploading to Supabase Storage:", fileName);
        const { error: uploadError } = await adminSupabase
          .storage
          .from('generated_images')
          .upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          console.error("Storage upload failed:", uploadError);
          // Fallback: return the temp URL if upload fails, but don't save to DB strictly
          return tempImageUrl; 
        }

        const { data: { publicUrl } } = adminSupabase
          .storage
          .from('generated_images')
          .getPublicUrl(fileName);

        // Save metadata to DB
        console.log("Saving metadata to generations table...");
        await adminSupabase.from('generations').insert({
          user_id: user?.id || null,
          guest_id: user ? null : guestId, // Only save guest_id if not logged in
          prompt: prompt,
          model: cleanModel,
          mode: mode,
          image_url: publicUrl,
          credits_used: user ? 2 : 0, // Track "value" even if guests are free
        });

        return publicUrl;
      } catch (e) {
        console.error("Error in saveResult:", e);
        return tempImageUrl; // Fail gracefully by returning original URL
      }
    };

    let generatedImageUrl = null;
    let finalResultText = prompt;

    // --- AI GENERATION LOGIC ---

    // 1. Volcengine Doubao
    if (cleanModel === "doubao-seedream-4.5") {
      const requestBody: any = {
        model: "doubao-seedream-4-5-251128",
        prompt: prompt,
        size: "2K",
        response_format: "url",
        watermark: false
      };
      if (mode === "image-to-image" && image) {
        requestBody.image = image;
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
      
      if (result.error) throw new Error(result.error.message || "Volcengine API Error");
      generatedImageUrl = result.data?.[0]?.url;
    }

    // 2. Zhipu AI
    else if (cleanModel === "glm-image") {
       const apiKey = process.env.ZHIPU_API_KEY;
       if (!apiKey) throw new Error("ZHIPU_API_KEY missing");

       const submitResponse = await fetch("https://open.bigmodel.cn/api/paas/v4/async/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "glm-image", prompt: prompt, size: "1024x1024", watermark_enabled: false })
      });
      const submitData = await submitResponse.json();
      if (!submitData.id) throw new Error(submitData.error?.message || "Zhipu API Submission Failed");

      const taskId = submitData.id;
      let attempts = 0;
      while (attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const checkResponse = await fetch(`https://open.bigmodel.cn/api/paas/v4/async-result/${taskId}`, {
           headers: { "Authorization": `Bearer ${apiKey}` }
        });
        const checkData = await checkResponse.json();
        if (checkData.task_status === 'SUCCESS') {
           const item = checkData.image_result?.[0] || checkData.images?.[0] || checkData.data?.[0];
           generatedImageUrl = item?.url;
           break;
        } else if (checkData.task_status === 'FAIL') {
           throw new Error("Image generation failed at provider");
        }
        attempts++;
      }
      if (!generatedImageUrl) throw new Error("Generation timed out");
    }

    // 3. OpenRouter (Fallback / Text-to-Image)
    else if (mode === "text-to-image") {
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
          messages: [{ role: "user", content: prompt }],
        })
      });
      const result = await response.json();
      const message = result.choices?.[0]?.message;
      finalResultText = message?.content;
      
      if (result.choices?.[0]?.images) generatedImageUrl = result.choices[0].images[0];
      else if (message?.images) {
         const img = message.images[0];
         generatedImageUrl = img.url || img.imageUrl?.url || img.image_url?.url;
      }
    }

    // 4. OpenRouter (Image-to-Image)
    else if (mode === "image-to-image") {
       if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });
       const completion = await openai.chat.completions.create({
        model: "google/gemini-2.5-flash-image",
        messages: [{
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } },
            ],
          }],
      });
      // Gemini Flash often returns text description, not always a new image link directly unless configured.
      // Assuming for now we just return the text result as we did before, 
      // BUT if we want to save history, we can't save an image if none is generated.
      // For this specific fallback case, we might skip image saving or save the input image? 
      // Let's keep original behavior for now:
      finalResultText = completion.choices[0].message.content;
      await deductCredits();
      return NextResponse.json({ result: finalResultText, full_response: completion });
    }

    // --- FINALIZE ---

    if (generatedImageUrl) {
      // Deduct credits FIRST (or after, depending on policy. Let's do it after successful gen)
      await deductCredits();

      // Save to Storage & DB (Async but awaited to return the perm URL)
      const permanentUrl = await saveResult(generatedImageUrl);

      return NextResponse.json({
        imageUrl: permanentUrl, // Return the permanent URL to frontend
        result: finalResultText
      });
    } else {
      return NextResponse.json({ error: "No image URL generated" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
