import type { FreeTask, ReadingText } from "../types";

// ============================================================================
// SLUTDIAGNOS – lång text i stil med nationella provet, helt utan stöd.
// Samma text för alla elever (inte intresseanpassad) – detta är målet
// som de stegvis anpassade texterna leder fram till.
// ============================================================================

export const DIAGNOS_TEXT: ReadingText = {
  title: "Låt oss få ha tråkigt",
  source: "Debattartikel i en dagstidning",
  paragraphs: [
    "När jag var barn kunde en söndagseftermiddag kännas oändlig. Det fanns ingenting att göra, och just därför hittade jag på saker: jag byggde kojor, ritade serier och lärde mig spela gitarr, ett ackord i taget. I dag behöver ingen ha tråkigt. Mobilen ligger alltid inom räckhåll, och varje tom sekund kan fyllas med ett nytt klipp. Det låter som en befrielse. Jag är inte så säker på att det är det.",
    "Tristess har länge setts som något negativt, något som ska botas. Men forskningen ger en mer komplicerad bild. I ett välkänt experiment fick deltagarna först göra en mycket tråkig uppgift – att skriva av nummer ur en telefonkatalog – och sedan komma på så många användningsområden som möjligt för två plastmuggar. De som först hade haft tråkigt kom på fler och mer originella idéer än de som inte hade det. När hjärnan inte får stimulans utifrån börjar den nämligen leta inåt. Det är i det tillståndet som dagdrömmar, minnen och nya kopplingar uppstår.",
    "Tristessen har också en annan sida. Den är en signal om att något saknas. Den som aldrig känner den signalen får svårare att fråga sig vad hen egentligen vill göra med sitt liv. När vi direkt dövar varje obehag med en skärm tränar vi bort förmågan att stå ut med att inte bli underhållna. Det är en förmåga som behövs för att läsa en lång bok, lösa ett svårt matematikproblem eller lyssna på någon som pratar länge.",
    "Jag vill inte svartmåla tekniken. Mobilen ger oss kontakt med vänner, kunskap och musik. Många unga använder den på kreativa sätt: de redigerar film, skriver texter och lär sig nya språk. Dessutom är det lätt för oss vuxna att försköna vår egen barndom. Alla mina söndagar var inte kreativa – en del var bara långa och ensamma.",
    "Men just därför behövs balans. Mitt förslag är enkelt: skapa medvetet stunder utan skärm. Lämna mobilen i hallen en timme om dagen. Låt bussresan få vara en bussresa. Ge barn tid som inte är schemalagd. Det kommer att kännas tråkigt i början, och det är precis meningen.",
    "Vi lägger mycket kraft på att ge unga stimulans. Kanske borde vi lägga lika mycket kraft på att ge dem tomrum. Det är i tomrummet man upptäcker vem man är.",
  ],
};

const DIAG_FALLBACK = "Svaret är sparat.";

export const DIAGNOS_TASKS: FreeTask[] = [
  {
    kind: "free",
    category: "texttyp",
    prompt:
      "Fråga 1 av 5: Vilken typ av sakprosatext är det här, och vad är skribentens syfte? Motivera med minst två drag ur texten.",
    criteria: ["Rätt texttyp", "Syftet", "Två drag ur texten"],
    rubric:
      "Debattartikel/argumenterande text (krönika godtas om det motiveras) med syftet att påverka läsaren att ge unga tid utan skärm. Drag: tes (rubriken/'skapa medvetet stunder utan skärm'), argument med belägg (experimentet), bemötande av motargument ('Jag vill inte svartmåla tekniken'), konkreta förslag/uppmaningar, personlig jag-form.",
    fallbackFeedback: DIAG_FALLBACK,
  },
  {
    kind: "free",
    category: "pa_raderna",
    prompt:
      "Fråga 2 av 5: Vad fick deltagarna i experimentet göra, och vad blev resultatet?",
    criteria: ["Vad deltagarna gjorde", "Resultatet"],
    rubric:
      "Deltagarna gjorde först en tråkig uppgift (skrev av nummer ur en telefonkatalog) och skulle sedan komma på användningsområden för två plastmuggar. De som hade haft tråkigt kom på fler och mer originella idéer.",
    fallbackFeedback: DIAG_FALLBACK,
  },
  {
    kind: "free",
    category: "mellan_raderna",
    prompt:
      "Fråga 3 av 5: Skribenten skriver att det kommer att kännas tråkigt i början, 'och det är precis meningen'. Vad menar skribenten med det?",
    criteria: ["Vad skribenten menar", "Stöd i texten"],
    rubric:
      "Eleven drar slutsatsen att tristessen är själva poängen: det obekväma tomrummet är det som får hjärnan att leta inåt och bli kreativ/reflektera/öva uthållighet. Eleven kopplar till textens resonemang (experimentet, tristess som signal, förmågan att stå ut).",
    fallbackFeedback: DIAG_FALLBACK,
  },
  {
    kind: "free",
    category: "sammanfatta",
    prompt: "Fråga 4 av 5: Sammanfatta textens huvudbudskap i 2–4 meningar.",
    rubric:
      "Ämne (skärmar fyller all tid, unga får aldrig ha tråkigt); huvudargument (tristess främjar kreativitet, självinsikt och uthållighet, med stöd i forskning); nyansering (tekniken har fördelar, man ska inte försköna det förflutna); förslag (medvetna skärmfria stunder). Utan detaljer som kojor/gitarr/plastmuggar, med egna ord och utan egna åsikter.",
    fallbackFeedback: DIAG_FALLBACK,
  },
  {
    kind: "free",
    category: "resonera",
    prompt:
      "Fråga 5 av 5: Håller du med skribenten om att unga behöver mer tid utan skärm? Ta ställning och för ett utvecklat resonemang med stöd i texten.",
    criteria: ["Påstående", "Belägg ur texten", "Orsak och följd"],
    rubric:
      "Eleven tar ställning; använder belägg från texten (experimentet, tristess som signal, förmågan att stå ut med att inte underhållas, mobilens fördelar); förklarar orsak och följd i minst två led; väger in andra sidan.",
    fallbackFeedback: DIAG_FALLBACK,
  },
];

// Högläsningstext inför diagnosen (diktamen/läsflyt)
export const DIKTAMEN_TEXT: ReadingText = {
  title: "Människans roll i den digitala eran",
  source: "Högläsningstext",
  paragraphs: [
    "Det är lätt att tro att tekniken styr vår framtid på ett ödesbestämt sätt. Men varje rad kod och varje politiskt beslut formuleras i grunden av människor. Frågan är inte vad maskinen vill göra med oss, utan vad vi väljer att göra med varandra genom maskinen.",
  ],
};
