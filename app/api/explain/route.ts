import { NextRequest, NextResponse } from "next/server";
import { explainParagraph, explainWord } from "../../ai/explain";

/** Edda förklarar ett ord eller tolkar ett stycke i lästexten. */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "API-nyckel saknas i .env.local." }, { status: 500 });
    }
    const options = { apiKey, model: process.env.OPENAI_MODEL };
    const input = await request.json();

    if (input?.kind === "word" && typeof input.word === "string" && typeof input.sentence === "string") {
      return NextResponse.json(await explainWord(input, options));
    }
    if (
      input?.kind === "paragraph" &&
      Array.isArray(input.paragraphs) &&
      input.paragraphs.every((p: unknown) => typeof p === "string") &&
      typeof input.question === "string" &&
      typeof input.studentAnswer === "string"
    ) {
      return NextResponse.json(await explainParagraph(input, options));
    }
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  } catch (error: unknown) {
    console.error("Förklaringen misslyckades:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Edda kunde inte förklara just nu." }, { status: 502 });
  }
}
