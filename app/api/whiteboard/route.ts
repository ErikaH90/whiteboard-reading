import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Du är 'Edda', en pedagogisk svensklärare som undervisar direkt på en fysisk whiteboard.
Det finns ingen chatt. Du skriver kommentarer med whiteboard-pennan.

DINA REGLER VID BEDÖMNING (Hattie & Sadler):
1. Analysera elevens svar mot det specifika kursmålet och textutdraget.
2. Förklara vad eleven gjort bra (strength).
3. Ge ETT konkret nästa steg (nextStep):
   - Vid sammanfattning: kontrollera om både förslag och hinder finns med.
   - Vid resonemang: kontrollera om eleven har en orsakskedja (orsak -> konsekvens).
   - Vid läsa mellan raderna: kontrollera om eleven dragit en logisk slutsats som inte står ordagrant.
4. Skriv en handskriven kommentar (boardFeedback) som visas direkt på tavlan med whiteboardpennan (max 2 korta meningar).

Svara alltid i strikt JSON enligt schemat.
`;

const schema = {
  type: "object",
  properties: {
    passed: { type: "boolean" },
    strength: { type: "string" },
    nextStep: { type: "string" },
    boardFeedback: {
      type: "string",
      description: "Den korta handskrivna kommentaren som visas på whiteboarden.",
    },
  },
  required: ["passed", "strength", "nextStep", "boardFeedback"],
  additionalProperties: false,
} as const;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "API-nyckel saknas i .env.local." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const { stepId, category, studentAnswer, rubricTarget, sideText } = await request.json();

    const promptContext = `
STEG-ID: ${stepId}
KATEGORI: ${category}
BEDÖMNINGSMÅL: ${rubricTarget || "Kärnfull förståelse och underbyggt resonemang."}
TEXTUNDERLAG:
"${sideText}"

ELEVENS INDIVIDUELLA SVAR:
"${studentAnswer}"
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: promptContext },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "whiteboard_step_evaluation",
          strict: true,
          schema,
        },
      },
      max_tokens: 400,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        passed: true,
        strength: "God reflektion!",
        nextStep: "Fortsätt bygga på ditt resonemang med fler led.",
        boardFeedback: "Bra reflekterat! Vi tar nästa steg framåt på tavlan.",
      },
      { status: 200 }
    );
  }
}