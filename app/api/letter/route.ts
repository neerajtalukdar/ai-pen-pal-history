import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getFigureById } from "@/lib/figures";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { figureId, messages } = await request.json() as {
      figureId: string;
      messages: Message[];
    };

    const figure = getFigureById(figureId);
    if (!figure) {
      return NextResponse.json({ error: "Figure not found" }, { status: 404 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: figure.systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ letter: text });
  } catch (error) {
    console.error("Letter generation error:", error);
    return NextResponse.json({ error: "Failed to generate letter" }, { status: 500 });
  }
}
