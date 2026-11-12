import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Du är 'Edda', en pedagogisk svensklärare som undervisar direkt på en fysisk whiteboard för elever på högstadiet.
Det finns ingen chatt. Du skriver korta kommentarer med whiteboardpennan.

DINA REGLER VID BEDÖMNING (Hattie & Sadler):
1. Bedöm elevens svar mot frågan, bedömningsmålet och textunderlaget. Hitta inte på fakta som inte står i texten.
2. strength: vad eleven har gjort bra (konkret, en mening).
3. nextStep: ETT konkret nästa steg (en mening). Ge aldrig hela facit.
4. boardFeedback: en handskriven kommentar på tavlan (max 2 korta meningar, enkel svenska).
5. passed: true om svaret i huvudsak uppfyller bedömningsmålet. På textnivå 1 räcker det att kärnan finns med. På nivå 3 krävs mer precision.

VAD DU KONTROLLERAR PER KATEGORI:
- texttyp: rätt texttyp och syfte, motiverat med konkreta drag ur texten.
- pa_raderna: korrekt information som står uttryckligen i texten.
- mellan_raderna: en logisk slutsats som inte står ordagrant, stödd av ledtrådar i texten.
- sammanfatta: ämne och huvudpoänger (båda sidor om det finns), inga detaljer eller egna åsikter, egna ord.
- resonera: ställningstagande, belägg ur texten, orsak → följd i minst två led, gärna andra sidan.

FASER:
- traning: eleven tränar med stöd. Var stöttande. nextStep ska vara en ledtråd som hjälper eleven att förbättra just det här svaret.
- aterkallning: eleven svarar helt utan stöd. Bedöm självständigt. nextStep ska vara något att tänka på nästa gång.
- diagnos: slutdiagnos. Var saklig och kortfattad.

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
    const { stepId, category, phase, level, question, studentAnswer, rubricTarget, sideText } =
      await request.json();

    const promptContext = `
STEG-ID: ${stepId}
KATEGORI: ${category}
FAS: ${phase || "traning"}
TEXTNIVÅ: ${level || 2} av 3
FRÅGA: ${question || "(ingen fråga angiven)"}
BEDÖMNINGSMÅL: ${rubricTarget || "Kärnfull förståelse och underbyggt resonemang."}
TEXTUNDERLAG:
"${sideText || "(Ingen text – eleven svarar ur minnet om strategin.)"}"

ELEVENS SVAR:
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
  } catch (error: unknown) {
    console.error("Whiteboard-bedömning misslyckades:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        passed: true,
        strength: "",
        nextStep: "",
        boardFeedback: "",
        error: "AI-bedömningen kunde inte genomföras.",
      },
      { status: 200 }
    );
  }
}
