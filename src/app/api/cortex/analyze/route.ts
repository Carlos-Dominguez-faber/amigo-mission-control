import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai/openai";
import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = [
  "vibe-coding",
  "openclaw",
  "prompts",
  "nanobanana",
  "resources",
  "ideas",
];

const SYSTEM_PROMPT = `You are an AI assistant that analyzes knowledge items for a personal knowledge management system.

For each item, provide:
1. A concise summary (2-3 sentences max)
2. A category from EXACTLY one of: ${VALID_CATEGORIES.join(", ")}

Category guidelines:
- vibe-coding: coding techniques, dev tools, programming tips, AI-assisted coding
- openclaw: AI agents, automation, agent frameworks, OpenClaw-related
- prompts: prompt engineering, AI prompts, system prompts, skill files
- nanobanana: NanoBanana project related content
- resources: tutorials, courses, articles, documentation, references
- ideas: business ideas, project ideas, feature requests, creative concepts

Respond in JSON format: { "summary": "...", "category": "..." }`;

export async function POST(request: Request) {
  try {
    const { itemId, sourceType, content, fileUrl } = await request.json();

    if (!itemId || !sourceType) {
      return NextResponse.json({ error: "Missing itemId or sourceType" }, { status: 400 });
    }

    const supabase = await createClient();

    // Mark as processing
    await supabase
      .from("cortex_items")
      .update({ ai_status: "processing" })
      .eq("id", itemId);

    const openai = getOpenAI();

    let userMessage: string;
    const messages: Array<{ role: "system" | "user"; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    switch (sourceType) {
      case "text":
        userMessage = `Analyze this text note:\n\n${content}`;
        messages.push({ role: "user", content: userMessage });
        break;

      case "link":
        userMessage = `Analyze this URL and categorize it based on what the URL suggests:\n\n${content}`;
        messages.push({ role: "user", content: userMessage });
        break;

      case "image":
        messages.push({
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and categorize it:" },
            { type: "image_url", image_url: { url: fileUrl } },
          ],
        });
        break;

      case "voice":
        userMessage = `Analyze this voice transcription:\n\n${content}`;
        messages.push({ role: "user", content: userMessage });
        break;

      case "file":
        userMessage = `Analyze this file. File name: "${content}". Categorize based on the file name and type.`;
        messages.push({ role: "user", content: userMessage });
        break;

      default:
        return NextResponse.json({ error: "Invalid sourceType" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: { summary?: string; category?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { summary: raw, category: "resources" };
    }

    const category = VALID_CATEGORIES.includes(parsed.category ?? "")
      ? parsed.category
      : "resources";

    const { error: updateError } = await supabase
      .from("cortex_items")
      .update({
        ai_summary: parsed.summary ?? null,
        ai_category: category,
        ai_status: "done",
        processed_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (updateError) throw updateError;

    return NextResponse.json({
      summary: parsed.summary,
      category,
    });
  } catch (err) {
    console.error("[cortex/analyze] Error:", err);

    // Try to mark as failed
    try {
      const { itemId } = await request.clone().json();
      if (itemId) {
        const supabase = await createClient();
        await supabase
          .from("cortex_items")
          .update({ ai_status: "failed" })
          .eq("id", itemId);
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
