import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswer } from "../../ai/evaluate";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "API-nyckel saknas i .env.local." }, { status: 500 });
    }

    const input = await request.json();
    const result = await evaluateAnswer(input, {
      apiKey,
      model: process.env.OPENAI_MODEL,
    });
    // Analysen och manipulationsflaggan stannar på servern
    const { passed, quality, checks, quote, strength, nextStep, boardFeedback } = result;
    return NextResponse.json({ passed, quality, checks, quote, strength, nextStep, boardFeedback });
  } catch (error: unknown) {
    console.error(
      "Whiteboard-bedömning misslyckades:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        passed: true,
        quality: null,
        strength: "",
        nextStep: "",
        boardFeedback: "",
        error: "AI-bedömningen kunde inte genomföras.",
      },
      { status: 200 },
    );
  }
}
