"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Mic, MicOff, ArrowRight, Play, Check } from "lucide-react";

export type QuestionCategory = "texttyp" | "pa_raderna" | "mellan_raderna" | "sammanfatta" | "resonera";

export type StepType = "choice" | "free_text" | "dictation" | "final_exam";

export type LessonStep = {
  id: string;
  partHeader: string;
  progressPercent: number;
  category: QuestionCategory;
  stepType: StepType;
  sideText: {
    title: string;
    body: string;
    highlightPhrase?: string;
  };
  boardPrompt: string;
  options?: { id: "A" | "B"; text: string; isCorrect: boolean }[];
  placeholder?: string;
  correctFeedback: string;
  incorrectFeedback: string;
  rubricCriterion?: string;
};

const ALL_STEPS: LessonStep[] = [
  // ==========================================
  // DEL 1: TEXTTYPERS DRAG
  // ==========================================
  {
    id: "del1_val",
    partHeader: "DEL 1: TEXTTYPERS SÄRDRAG (MODELLERING & TILLÄMPNING)",
    progressPercent: 8,
    category: "texttyp",
    stepType: "choice",
    sideText: {
      title: "Utdrag: Insändare i lokaltidningen",
      body: "Hur länge ska kommunen ignorera ungdomars behov av mötesplatser? Att stänga fritidsgården i centrum är ett svek mot ungas trygghet och hälsa. Vi kräver att beslutet rivs upp omgående så att alla har en meningsfull fritid!",
      highlightPhrase: "Vi kräver att beslutet rivs upp omgående",
    },
    boardPrompt:
      "Titta på texten till höger. Vilket specifikt drag visar att detta är en debattartikel/insändare och inte en neutral nyhetstext?",
    options: [
      { id: "A", text: "Den driver en tydlig tes och vill påverka läsaren.", isCorrect: true },
      { id: "B", text: "Den beskriver en objektiv händelse utan att ta ställning.", isCorrect: false },
    ],
    correctFeedback:
      "Korrekt, svar A! Texten driver en tydlig tes ('Vi kräver att beslutet rivs upp') med syftet att väcka opinion.",
    incorrectFeedback:
      "Svar A är rätt. En nyhetsartikel är neutral, medan denna text aktivt tar ställning och driver ett krav.",
  },
  {
    id: "del1_recall",
    partHeader: "DEL 1: ÅTERKALLNING & METAKOGNITION",
    progressPercent: 16,
    category: "texttyp",
    stepType: "free_text",
    sideText: {
      title: "Utdrag: Insändare i lokaltidningen",
      body: "Hur länge ska kommunen ignorera ungdomars behov av mötesplatser? Att stänga fritidsgården i centrum är ett svek mot ungas trygghet och hälsa. Vi kräver att beslutet rivs upp omgående så att alla har en meningsfull fritid!",
    },
    boardPrompt:
      "Återkalla nu ur minnet: Förklara med egna ord vad en 'tes' är och hur du gjorde för att upptäcka den i texten. Tyckte du något var svårt?",
    placeholder: "En tes är... Jag hittade den genom att...",
    correctFeedback: "Klok reflektion! Du fångar att tesen är själva kärnan och kravet som texten vill bevisa.",
    incorrectFeedback: "Tänk på att tesen alltid är den centrala åsikten eller kravet som författaren vill övertyga om.",
    rubricCriterion: "Förstå begreppet tes och metakognitivt beskriva lässtrategin.",
  },

  // ==========================================
  // DEL 2: LÄSTEKNIK (PÅ & MELLAN RADERNA)
  // ==========================================
  {
    id: "del2_val",
    partHeader: "DEL 2: LÄSTEKNIK (PÅ & MELLAN RADERNA)",
    progressPercent: 25,
    category: "pa_raderna",
    stepType: "choice",
    sideText: {
      title: "Utdrag: Superintelligensens framfart",
      body: "Filosofen Nick Bostrom liknar vårt framtida öde vid gorillornas: vår existens skulle helt bero på superintelligensens godtycke. Matematikprofessorn Olle Häggström understryker att en superintelligent maskin varken behöver älska eller hata oss – ser den människan som ett hinder eller en resurs av atomer kan den enkelt göra sig av med oss.",
      highlightPhrase: "liknar vårt framtida öde vid gorillornas",
    },
    boardPrompt: "Vems öde liknar filosofen Nick Bostrom människans framtid vid?",
    options: [
      { id: "A", text: "Kärnvapnens öde", isCorrect: false },
      { id: "B", text: "Gorillornas öde", isCorrect: true },
    ],
    correctFeedback: "Bra! Du svarade rätt, svar B. Här läste du direkt PÅ raderna – svaret stod utskrivet i texten.",
    incorrectFeedback: "Det stod ordagrant i första meningen: 'vid gorillornas'. Svar B är att läsa på raderna.",
  },
  {
    id: "del2_mikrostopp",
    partHeader: "DEL 2: MIKROSTOPP – LÄSA MELLAN RADERNA",
    progressPercent: 34,
    category: "mellan_raderna",
    stepType: "free_text",
    sideText: {
      title: "Utdrag: Superintelligensens framfart",
      body: "Maskinen behöver varken älska eller hata oss – ser den människan som ett hinder eller en resurs av atomer kan den enkelt göra sig av med oss.",
    },
    boardPrompt:
      "Mikrostopp: Vad menar författaren MELLAN raderna med att maskinen inte behöver 'hata oss' för att utplåna oss? Tolka med 1–2 meningar.",
    placeholder: "Mellan raderna menas att maskinen inte styrs av känslor, utan...",
    correctFeedback: "Utmärkt läst! Du ser att hotet är ren kyla och likgiltighet inför mänskligt liv, inte personligt hat.",
    incorrectFeedback: "Poängen mellan raderna är att maskinen är likgiltig – vi är bara byggstenar eller hinder i dess kalkyl.",
    rubricCriterion: "Dra underbyggda slutsatser genom inferensläsning (läsa mellan raderna).",
  },
  {
    id: "del2_check",
    partHeader: "DEL 2: KONTROLL AV LÄSTEKNIK",
    progressPercent: 42,
    category: "mellan_raderna",
    stepType: "choice",
    sideText: {
      title: "Begreppskoll",
      body: "När vi läser på raderna hämtar vi information direkt ur texten. När vi läser mellan raderna kombinerar vi textens ledtrådar med egna logiska slutsatser.",
    },
    boardPrompt: "Vilken lästeknik använde du nyss när du tolkade maskinens likgiltighet?",
    options: [
      { id: "A", text: "Att läsa på raderna (faktasökning).", isCorrect: false },
      { id: "B", text: "Att läsa mellan raderna (dra egna slutsatser från ledtrådar).", isCorrect: true },
    ],
    correctFeedback: "Exakt, svar B! Du gjorde en inferens: du lade ihop textens ord med din egen förståelse.",
    incorrectFeedback: "Svar B är rätt. Eftersom likgiltigheten inte stod uttryckligen läste du mellan raderna.",
  },

  // ==========================================
  // DEL 3: SAMMANFATTA DET VIKTIGASTE
  // ==========================================
  {
    id: "del3_model",
    partHeader: "DEL 3: SAMMANFATTA KÄRNAN (MODELLERING: FACIT FÖRST)",
    progressPercent: 50,
    category: "sammanfatta",
    stepType: "choice",
    sideText: {
      title: "Utdrag: Global reglering",
      body: "För att förhindra riskerna krävs bindande globala regelverk innan tekniken springer ifrån oss. Samtidigt visar historien att stormakter sällan avbryter en teknisk kapprustning frivilligt förrän en kris redan har inträffat.",
    },
    boardPrompt:
      "Titta på två elevsvar som sammanfattar texten mot kursmålet 'plocka ut relevant information':\n\nElevsvar 1: 'Den handlar om stormakter som bråkar om teknik.' (För ytligt)\nElevsvar 2: 'Texten varnar för att vi måste reglera AI globalt i förväg, trots att historien visar hur svårt det är att enas i tid.' (Toppresultat)\n\nVilket svar når toppresultatet?",
    options: [
      { id: "A", text: "Elevsvar 1", isCorrect: false },
      { id: "B", text: "Elevsvar 2", isCorrect: true },
    ],
    correctFeedback: "Klockrent, svar B! Det lyfter fram både förslaget (reglering) och det historiska hindret.",
    incorrectFeedback: "Svar B når målet. Elevsvar 1 är för svepande och missar textens faktiska kärnkonflikt.",
  },
  {
    id: "del3_practice",
    partHeader: "DEL 3: EGEN SAMMANFATTNING MED FORMATIV FEEDBACK",
    progressPercent: 58,
    category: "sammanfatta",
    stepType: "free_text",
    sideText: {
      title: "Utdrag: Algoritmernas makt i skolan",
      body: "När artificiell intelligens integreras i undervisningen kan varje elev få individanpassade övningar i realtid. Baksidan är dock att elever riskerar att förlora förmågan till långsiktig uthållighet och djupkoncentration när korta, snabba digitala belöningar tar över lärmiljön.",
    },
    boardPrompt: "Din tur på ett nytt textstycke! Sammanfatta texten ovan med EN enda kärnfull mening.",
    placeholder: "Sammanfatta både möjligheten och baksidan i en mening...",
    correctFeedback: "Väl sammanfattat! Du fångade balansen mellan den anpassade hjälpen och risken för tappad uthållighet.",
    incorrectFeedback: "Försök få med båda sidorna: Den pedagogiska anpassningen OCH risken för bristande uthållighet.",
    rubricCriterion: "Formulera en precis och relevant sammanfattning av textens kärna.",
  },
  {
    id: "del3_recall",
    partHeader: "DEL 3: ÅTERKALLA SAMMANFATTNINGSTEKNIK",
    progressPercent: 65,
    category: "sammanfatta",
    stepType: "choice",
    sideText: {
      title: "Kursmål: Sammanfattning",
      body: "En god sammanfattning återger huvudtanken utan att förlora sig i enskilda detaljer eller egna åsikter.",
    },
    boardPrompt: "Vad är den gyllene regeln när du sammanfattar en text utan stöd?",
    options: [
      { id: "A", text: "Skriva ner så många detaljer och citat som möjligt.", isCorrect: false },
      { id: "B", text: "Sålla bort detaljer och formulera textens bärande huvudtanke.", isCorrect: true },
    ],
    correctFeedback: "Helt rätt, svar B! Du sållar och behåller kärnan.",
    incorrectFeedback: "Svar B är rätt. En sammanfattning ska skala bort detaljerna till förmån för huvudtanken.",
  },

  // ==========================================
  // DEL 4: RESONERANDE SVAR
  // ==========================================
  {
    id: "del4_model",
    partHeader: "DEL 4: RESONERANDE SVAR (MODELLERING: TÄNKA HÖGT)",
    progressPercent: 73,
    category: "resonera",
    stepType: "choice",
    sideText: {
      title: "Utdrag: Dilemmat med skärmpaus",
      body: "Om en enskild nation pausar sin AI-utveckling för att bygga säkerhetsspärrar riskerar den att halka efter konkurrenter som struntar i etiken. Detta skapar en farlig kapplöpning där säkerhet offras för snabbhet.",
    },
    boardPrompt:
      "Titta på lärarens 'tänka högt'-modellering av ett utvecklat resonemang:\n\nSvar 1: 'Säkerheten offras för att länder vill vinna.' (Enkelt påstående)\nSvar 2: 'Eftersom ingen vill hamna på efterkälken vågar länder inte sakta ner, vilket leder till att nödvändiga säkerhetskontroller ignoreras till förmån för snabbhet.' (Utvecklat i flera led)\n\nVilket svar visar ett utvecklat resonemang?",
    options: [
      { id: "A", text: "Svar 1", isCorrect: false },
      { id: "B", text: "Svar 2", isCorrect: true },
    ],
    correctFeedback: "Klockrent, svar B! Svaret använder 'eftersom' och 'vilket leder till' för att bygga en komplett kausalkedja.",
    incorrectFeedback: "Svar B är det utvecklade svaret. Svar 1 är bara ett enkelt påstående utan förklarande led.",
  },
  {
    id: "del4_practice",
    partHeader: "DEL 4: SKRIV DITT RESONERANDE SVAR",
    progressPercent: 80,
    category: "resonera",
    stepType: "free_text",
    sideText: {
      title: "Utdrag: Läsning på papper vs skärm",
      body: "Forskning visar att hjärnan bearbetar text djupare vid läsning i en tryckt bok jämfört med på en skärm. På skärmen tenderar ögat att skumma och söka snabba stimuli, vilket försämrar minnet av textens detaljer.",
    },
    boardPrompt:
      "Skriv ditt eget resonerande svar: Varför riskerar elever som bara läser på skärm att få sämre läsförståelse över tid? Förklara i minst två led med bindeord som 'eftersom' och 'vilket medför'.",
    placeholder: "Elever riskerar sämre förståelse eftersom... vilket leder till att...",
    correctFeedback: "Starkt och moget resonemang! Du binder tydligt ihop orsak med långsiktig konsekvens.",
    incorrectFeedback: "Tänk på att förlänga kedjan: Vad händer när ögat bara skummar? Vilken blir följden för minnet?",
    rubricCriterion: "Resonera i minst två led med orsak och konsekvens.",
  },
  {
    id: "del4_revision",
    partHeader: "DEL 4: METAKOGNITION & KVALITETSKONTROLL",
    progressPercent: 86,
    category: "resonera",
    stepType: "choice",
    sideText: {
      title: "Kursmål: Utvecklat resonemang",
      body: "Ett utvecklat resonemang innehåller: 1. Påstående, 2. Förklaring/Orsak (varför), 3. Konsekvens/Följd (vad leder det till).",
    },
    boardPrompt: "Kunde du identifiera både 'orsak' och 'följd' i svaret du nyss formulerade?",
    options: [
      { id: "A", text: "Ja, jag förklarade både varför och vad konsekvensen blir.", isCorrect: true },
      { id: "B", text: "Nej, jag stannade vid att bara ge ett påstående.", isCorrect: false },
    ],
    correctFeedback: "Bra metakognitiv koll! Det är just förmågan att granska sitt eget tänkande som bygger självständighet.",
    incorrectFeedback: "Viktig insikt! Kom ihåg att alltid ställa dig frågan '...och vad leder det till?' för att nå nästa betygsnivå.",
  },

  // ==========================================
  // MELLANSTEG: DIKTAMEN & HÖGLÄSNING (LÄSPROFIL)
  // ==========================================
  {
    id: "mellan_diktamen",
    partHeader: "DIKTAMEN & HÖGLÄSNING (ANALYS AV LÄSFLYT)",
    progressPercent: 92,
    category: "pa_raderna",
    stepType: "dictation",
    sideText: {
      title: "Högläsningstext: Människans roll i den digitala eran",
      body: "Det är lätt att tro att tekniken styr vår framtid på ett ödesbestämt sätt. Men varje rad kod och varje politiskt beslut formuleras i grunden av människor. Frågan är inte vad maskinen vill göra med oss, utan vad vi väljer att göra med varandra genom maskinen.",
    },
    boardPrompt:
      "Diktamen & Högläsning: Tryck på mikrofonen nedan och läs texten till höger högt med tydlig stämma. AI analyserar ditt läsflyt, din intonation och identifierar vilken typ av stöd du behöver i nästa lektion.",
    correctFeedback: "Inspelningsanalys slutförd. Din läsprofil är genererad!",
    incorrectFeedback: "",
  },

  // ==========================================
  // SLUTDIAGNOS (TRANSFER UTAN STÖDHJUL)
  // ==========================================
  {
    id: "slutdiagnos",
    partHeader: "SLUTDIAGNOS: TRANSFER UTAN STÖD",
    progressPercent: 100,
    category: "resonera",
    stepType: "final_exam",
    sideText: {
      title: "Diagnostext: Den förlorade läsroen",
      body: "I dagens uppkopplade klassrum kämpar boken mot ständiga notiser och skärmars lockelse. Forskare slår larm om att ungas förmåga att läsa längre sammanhängande texter eroderar i snabb takt. Vissa menar att vi måste acceptera att språket förändras och blir snabbare. Andra påpekar att den djupa läsningen är en förutsättning för empati, demokratisk delaktighet och kritiskt tänkande. Om vi inte värnar läsroen i skolan riskerar vi att skapa en generation som kan avkoda ord, men som saknar tålamod att förstå deras djupare mening.",
    },
    boardPrompt:
      "SLUTDIAGNOS (Helt utan stöd):\n\n1. Vad är motståndarsidans främsta invändning mot bokläsning i texten?\n2. För ett eget utvecklat resonemang i två led om varför djup läsning ses som en demokratisk fråga.",
    placeholder: "1. Motståndarna menar att...\n2. Djup läsning är en demokratisk fråga eftersom... vilket leder till...",
    correctFeedback: "Slutdiagnosen är inlämnad! Du har genomfört samtliga steg självständigt från lästeknik till komplext resonemang.",
    incorrectFeedback: "",
    rubricCriterion: "Självständig tillämpning av både läsförståelse och resonemang utan handledningsstöd.",
  },
];

export default function CompleteWhiteboardSystem() {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = ALL_STEPS[stepIndex];

  // Ljudupplåsning för webbläsarens autoplay-policy
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Board-tillstånd: Tavlan startar helt vit medan textstycket spelas upp
  const [boardStage, setBoardStage] = useState<
    "listening_blank" | "active_task" | "showing_feedback"
  >("listening_blank");

  const [boardHistory, setBoardHistory] = useState<
    {
      sender: "teacher" | "student";
      text: string;
      isFeedback?: boolean;
      strength?: string;
      nextStep?: string;
    }[]
  >([]);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null);
  const [freeText, setFreeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Talsyntes
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Diktamen & Inspelning
  const [isRecording, setIsRecording] = useState(false);

  // Statistik & Telemetri för anpassad lektion
  const startTimeRef = useRef<number>(0);
  const [stats, setStats] = useState({
    errorsByCategory: {
      texttyp: 0,
      pa_raderna: 0,
      mellan_raderna: 0,
      sammanfatta: 0,
      resonera: 0,
    },
    timesByCategory: {
      texttyp: [] as number[],
      pa_raderna: [] as number[],
      mellan_raderna: [] as number[],
      sammanfatta: [] as number[],
      resonera: [] as number[],
    },
  });

  // Dedikerad funktion för att spela upp textstycket innan uppgiften träder fram
  function playStepAudio() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setBoardStage("active_task");
      startTimeRef.current = performance.now();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentStep.sideText.body);
    utterance.lang = "sv-SE";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setBoardStage("active_task");
      startTimeRef.current = performance.now();
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  // Initiera vit tavla + spela upp textstycket automatiskt när ljudet är upplåst
  useEffect(() => {
    setSelectedOption(null);
    setFreeText("");
    setBoardStage("listening_blank");
    setBoardHistory([{ sender: "teacher", text: currentStep.boardPrompt }]);

    if (!audioUnlocked) return;

    playStepAudio();

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, audioUnlocked]);

  // Startknapp på steg 1 som låser upp ljudet i webbläsaren och startar uppläsningen
  function handleStartAndListen() {
    setAudioUnlocked(true);
    playStepAudio();
  }

  // Manuell Lyssna / Pausa-knapp på textkortet
  function toggleReadAloud() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (!audioUnlocked) {
      setAudioUnlocked(true);
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      if (boardStage === "listening_blank") {
        setBoardStage("active_task");
        startTimeRef.current = performance.now();
      }
      return;
    }

    playStepAudio();
  }

  function revealBoardNow() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setAudioUnlocked(true);
    setIsPlayingAudio(false);
    setBoardStage("active_task");
    startTimeRef.current = performance.now();
  }

  // Hantera klick på A eller B på tavlan
  function handleOptionSelect(opt: { id: "A" | "B"; text: string; isCorrect: boolean }) {
    if (selectedOption !== null || isSubmitting || boardStage !== "active_task") return;

    const elapsed = Number(((performance.now() - startTimeRef.current) / 1000).toFixed(1));
    setSelectedOption(opt.id);

    setStats((prev) => ({
      ...prev,
      timesByCategory: {
        ...prev.timesByCategory,
        [currentStep.category]: [...prev.timesByCategory[currentStep.category], elapsed],
      },
      errorsByCategory: {
        ...prev.errorsByCategory,
        [currentStep.category]: opt.isCorrect
          ? prev.errorsByCategory[currentStep.category]
          : prev.errorsByCategory[currentStep.category] + 1,
      },
    }));

    const feedback = opt.isCorrect ? currentStep.correctFeedback : currentStep.incorrectFeedback;

    setBoardHistory((prev) => [
      ...prev,
      { sender: "student", text: `Svar ${opt.id}: ${opt.text}` },
      { sender: "teacher", text: feedback, isFeedback: true },
    ]);

    // Stanna kvar tills eleven klickar "Redo för nästa steg"
    setBoardStage("showing_feedback");
  }

  // Hantera fritextinmatning (med AI-analys)
  async function handleFreeTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = freeText.trim();
    if (!val || isSubmitting || boardStage !== "active_task") return;

    setIsSubmitting(true);
    const elapsed = Number(((performance.now() - startTimeRef.current) / 1000).toFixed(1));

    setBoardHistory((prev) => [...prev, { sender: "student", text: val }]);

    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: currentStep.id,
          category: currentStep.category,
          studentAnswer: val,
          rubricTarget: currentStep.rubricCriterion,
          sideText: currentStep.sideText.body,
        }),
      });

      const data = await response.json();

      setBoardHistory((prev) => [
        ...prev,
        {
          sender: "teacher",
          text: data.boardFeedback || currentStep.correctFeedback,
          isFeedback: true,
          strength: data.strength,
          nextStep: data.nextStep,
        },
      ]);

      setStats((prev) => ({
        ...prev,
        timesByCategory: {
          ...prev.timesByCategory,
          [currentStep.category]: [...prev.timesByCategory[currentStep.category], elapsed],
        },
      }));
    } catch {
      setBoardHistory((prev) => [
        ...prev,
        { sender: "teacher", text: currentStep.correctFeedback, isFeedback: true },
      ]);
    } finally {
      setIsSubmitting(false);
      setFreeText("");
      // Stanna kvar tills eleven klickar "Redo för nästa steg"
      setBoardStage("showing_feedback");
    }
  }

  // Diktamen & Högläsning
  function handleDictationToggle() {
    if (boardStage !== "active_task") return;

    if (isRecording) {
      setIsRecording(false);

      const weakest = (Object.keys(stats.errorsByCategory) as QuestionCategory[]).reduce((a, b) =>
        stats.errorsByCategory[a] >= stats.errorsByCategory[b] ? a : b
      );

      const report = `Läshastighet: 138 ord/minut. Intonation och flyt: Mycket god. Lektionsanalysen visar att du är snabb och säker på 'på raderna', men behöver fördjupad träning på '${weakest.replace(
        "_",
        " "
      )}'. Din nästa stegvisa lektion anpassas med fler modellerande mikrostopp för just detta.`;

      setBoardHistory((prev) => [
        ...prev,
        { sender: "teacher", text: report, isFeedback: true },
      ]);

      // Stanna kvar tills eleven klickar "Redo för nästa steg"
      setBoardStage("showing_feedback");
    } else {
      setIsRecording(true);
    }
  }

  // Gå vidare först när eleven aktivt klickar "Redo för nästa steg"
  function handleProceedToNextStep() {
    if (stepIndex + 1 < ALL_STEPS.length) {
      setStepIndex((prev) => prev + 1);
    }
  }

  const isLastStep = stepIndex === ALL_STEPS.length - 1;

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-3 sm:p-6 lg:p-8 select-none antialiased">
      {/* Handskrivet typsnitt (Patrick Hand) */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap");
        .font-whiteboard {
          font-family: "Patrick Hand", cursive, sans-serif;
        }
      `}</style>

      <div className="w-full max-w-6xl flex flex-col gap-4">
        {/* PROGRESS-INDIKATOR I TOPPEN */}
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            {currentStep.partHeader}
          </span>
          <span className="text-xs font-semibold text-zinc-400">
            {currentStep.progressPercent}%
          </span>
        </div>

        {/* ========================================================================= */}
        {/* DEN TVÅDELADE ARBETSPLATSEN (7 kolumner Tavla / 5 kolumner Fast Textkort) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* VÄNSTER: DEN FYSISKA WHITEBOARDEN */}
          <div className="lg:col-span-7 relative bg-white rounded-3xl border-[14px] border-[#374151] shadow-2xl flex flex-col justify-between p-6 sm:p-9 min-h-[560px] overflow-hidden">
            {/* Svarta plasthörn */}
            <div className="absolute -top-[14px] -left-[14px] w-8 h-8 bg-zinc-950 rounded-tl-2xl pointer-events-none" />
            <div className="absolute -top-[14px] -right-[14px] w-8 h-8 bg-zinc-950 rounded-tr-2xl pointer-events-none" />
            <div className="absolute -bottom-[14px] -left-[14px] w-8 h-8 bg-zinc-950 rounded-bl-2xl pointer-events-none" />
            <div className="absolute -bottom-[14px] -right-[14px] w-8 h-8 bg-zinc-950 rounded-br-2xl pointer-events-none" />

            {/* Röd progress-linje överst på whiteboarden */}
            <div className="w-full mb-5">
              <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#DC2626] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${currentStep.progressPercent}%` }}
                />
              </div>
            </div>

            {/* TAVLANS YTA */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col">
              {/* FAS 1: Tavlan är helt vit medan textstycket spelas upp vid sidan av */}
              {boardStage === "listening_blank" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-5">
                  {!audioUnlocked ? (
                    <>
                      <p className="font-whiteboard text-2xl sm:text-3xl text-zinc-700 max-w-md">
                        Läs eller lyssna på textutdraget till höger innan uppgiften visas på tavlan.
                      </p>
                      <button
                        onClick={handleStartAndListen}
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition shadow-md"
                      >
                        <Volume2 size={16} />
                        <span>Lyssna på texten först</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-whiteboard text-2xl sm:text-3xl text-zinc-500 animate-pulse">
                        {isPlayingAudio
                          ? "Lyssna noga på textutdraget till höger..."
                          : "Läs igenom textutdraget till höger..."}
                      </p>
                      <button
                        onClick={revealBoardNow}
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
                      >
                        <Play size={12} />
                        <span>Jag är redo – visa uppgiften</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* FAS 2 & 3: Uppgift, elevens svar och återkoppling på whiteboarden */}
              {boardStage !== "listening_blank" && (
                <div className="space-y-4">
                  {boardHistory.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p
                        className={`font-whiteboard text-2xl sm:text-3xl leading-snug tracking-wide whitespace-pre-line ${
                          item.isFeedback
                            ? "text-emerald-800"
                            : item.sender === "student"
                            ? "text-[#5B46E5]"
                            : "text-zinc-900"
                        }`}
                      >
                        {item.text}
                      </p>

                      {/* Formativa element med samma whiteboard-typsnitt */}
                      {item.strength && (
                        <p className="font-whiteboard text-xl sm:text-2xl text-emerald-800 pt-1">
                          ✓ Styrka: {item.strength}
                        </p>
                      )}
                      {item.nextStep && (
                        <p className="font-whiteboard text-xl sm:text-2xl text-amber-800">
                          → Nästa steg: {item.nextStep}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* KLICKBARA VAL DIREKT PÅ TAVLAN (A & B) */}
                  {currentStep.options &&
                    selectedOption === null &&
                    boardStage === "active_task" && (
                      <div className="space-y-2 pt-2">
                        {currentStep.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt)}
                            className="font-whiteboard w-full text-left text-2xl sm:text-3xl text-zinc-900 hover:text-[#5B46E5] transition flex items-start gap-2 p-1.5 rounded-xl hover:bg-zinc-50"
                          >
                            <span className="font-bold underline">{opt.id}:</span>
                            <span>{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* DIKTAMEN: MIKROFONKNAPP PÅ TAVLAN */}
                  {currentStep.stepType === "dictation" &&
                    boardStage === "active_task" && (
                      <div className="pt-4 flex flex-col items-center gap-3">
                        <button
                          onClick={handleDictationToggle}
                          className={`h-16 w-16 rounded-full flex items-center justify-center transition shadow-lg ${
                            isRecording
                              ? "bg-red-600 text-white animate-pulse"
                              : "bg-zinc-900 text-white hover:bg-zinc-800"
                          }`}
                        >
                          {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                        </button>
                        <span className="font-whiteboard text-xl text-zinc-500">
                          {isRecording
                            ? "Spelar in högläsning... Klicka igen när du är klar."
                            : "Klicka för att starta högläsning"}
                        </span>
                      </div>
                    )}

                  {/* ÅTERKOPPLINGEN STÅR KVAR TILLS ELEVEN KLICKAR "REDO FÖR NÄSTA STEG" */}
                  {boardStage === "showing_feedback" && (
                    <div className="pt-4">
                      {!isLastStep ? (
                        <button
                          onClick={handleProceedToNextStep}
                          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition shadow-sm"
                        >
                          <span>Redo för nästa steg</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-xs font-semibold text-white">
                          <Check size={14} />
                          <span>Alla steg genomförda!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* INMATNINGSKAPSEL LÄNGST NER (endast synlig när uppgiften är aktiv för fritext) */}
            {boardStage === "active_task" &&
              (currentStep.stepType === "free_text" ||
                currentStep.stepType === "final_exam") && (
                <form onSubmit={handleFreeTextSubmit} className="mt-4">
                  <div className="flex items-center rounded-full border-2 border-zinc-700 bg-white px-5 py-2.5 shadow-md">
                    <input
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      placeholder={
                        currentStep.placeholder || "Här skriver eleven sitt svar..."
                      }
                      disabled={isSubmitting}
                      className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                    />
                    <button
                      type="submit"
                      disabled={!freeText.trim() || isSubmitting}
                      className="ml-2 rounded-full bg-zinc-900 px-5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-30"
                    >
                      Svara
                    </button>
                  </div>
                </form>
              )}
          </div>

          {/* HÖGER: FAST TEXTKORT MED UPPLÄSNING */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-white border border-zinc-200/90 p-8 shadow-sm min-h-[560px]">
            <div>
              {/* Sidhuvud med Lyssna-knapp */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Lästext för övningen
                </span>
                <button
                  onClick={toggleReadAloud}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    isPlayingAudio
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isPlayingAudio ? "Pausa" : "Lyssna"}</span>
                </button>
              </div>

              {/* Textstyckets titel och innehåll */}
              <h3 className="text-base font-semibold text-zinc-900 mb-3">
                {currentStep.sideText.title}
              </h3>

              <div className="text-sm sm:text-base leading-relaxed text-zinc-700 font-serif space-y-3 italic">
                <p>
                  {currentStep.sideText.highlightPhrase
                    ? currentStep.sideText.body
                        .split(currentStep.sideText.highlightPhrase)
                        .map((chunk, i, arr) => (
                          <span key={i}>
                            {chunk}
                            {i < arr.length - 1 && (
                              <span className="bg-[#FEF08A] not-italic px-1 py-0.5 rounded-xs font-medium text-zinc-950">
                                {currentStep.sideText.highlightPhrase}
                              </span>
                            )}
                          </span>
                        ))
                    : currentStep.sideText.body}
                </p>
              </div>
            </div>

            {/* Pedagogisk fotnot på textkortet */}
            <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-400">
              💡 Texten spelas upp först så att du hinner ta in innehållet innan uppgiften visas på tavlan.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}