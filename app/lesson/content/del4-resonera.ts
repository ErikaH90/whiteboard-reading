import type { FreeTask, PartDefinition } from "../types";

function reasoningTask(
  question: string,
  rubricEvidence: string,
  withSupport: boolean,
  hint?: FreeTask["hint"],
  remodel?: string,
): FreeTask {
  return {
    kind: "free",
    category: "resonera",
    prompt: withSupport
      ? `${question} Ta ställning och stöd dig på texten. Resonera i minst två led (t.ex. 'eftersom' och 'vilket leder till') och ta gärna upp andra sidan.`
      : `${question} För ett utvecklat resonemang med stöd i texten.`,
    placeholder: withSupport
      ? "Jag anser att ... I texten står det att ... eftersom ... vilket leder till ... Samtidigt ..."
      : undefined,
    rubric: `Eleven tar ställning; använder belägg från texten (${rubricEvidence}); förklarar orsak och följd i minst två led med bindeord; väger gärna in motargument/andra sidan.`,
    hint: withSupport ? hint : undefined,
    remodel: withSupport ? remodel : undefined,
    fallbackFeedback:
      "Kontrollera att du har: påstående → belägg ur texten → förklaring (eftersom) → följd (vilket leder till) → andra sidan (samtidigt).",
  };
}

export const DEL4: PartDefinition = {
  part: 4,
  title: "Resonera med stöd i texten",
  goal: "Föra utvecklade resonemang med stöd i texten: påstående, belägg, förklaring, följd och andra sidan.",
  bridge:
    "Du kan redan hitta det viktigaste i en text. Nu använder du det som stöd när du resonerar, för det är så du visar att du har förstått.",

  // --------------------------------------------------------------------------
  // MODELLERING
  // --------------------------------------------------------------------------
  model: {
    text: {
      title: "Fyradagarsvecka i skolan?",
      source: "Informerande artikel",
      paragraphs: [
        "I några länder har skolor testat att bara ha undervisning fyra dagar i veckan. Den femte dagen kan eleverna vila, träna eller göra läxor.",
        "Lärare på en av skolorna berättar att eleverna var piggare och att färre var sjuka. Men föräldrar som arbetar heltid fick svårt att ordna tillsyn för de yngsta barnen under den lediga dagen.",
        "Dessutom blir de fyra skoldagarna längre, eftersom eleverna ska hinna lika mycket. Vissa elever säger att de är helt slut när de kommer hem.",
      ],
    },
    thinkAloud: {
      kind: "think_aloud",
      category: "resonera",
      intro:
        "Frågan är: 'Är fyradagarsvecka en bra idé för elever?' Nu visar jag hur jag bygger ett utvecklat resonemang, steg för steg och med stöd i texten.",
      thoughts: [
        {
          label: "Påstående: ta ställning",
          text: "Steg 1, påstående: Jag tar ställning. 'Fyradagarsvecka kan vara bra för en del elever, men inte för alla.'",
        },
        {
          label: "Belägg från texten",
          text: "Steg 2, belägg: Jag hämtar stöd i texten. Lärarna berättar att eleverna var piggare och att färre var sjuka.",
          highlight: "eleverna var piggare och att färre var sjuka",
        },
        {
          label: "Förklara med 'eftersom'",
          text: "Steg 3, förklaring: Jag förklarar VARFÖR med 'eftersom'. Eftersom eleverna får en extra dag att vila, orkar de mer på lektionerna...",
        },
        {
          label: "Följd: vad leder det till?",
          text: "Steg 4, följd: Vad LEDER det till? '...vilket kan leda till att de lär sig mer.' Nu har jag en kedja i flera led.",
        },
        {
          label: "Andra sidan: motargument",
          text: "Steg 5, andra sidan: Ett starkt resonemang tar med motargument. 'Samtidigt blir dagarna längre, och vissa elever är helt slut när de kommer hem.'",
          highlight: "Vissa elever säger att de är helt slut när de kommer hem.",
        },
      ],
      summary:
        "Påstående → belägg ur texten → förklaring (eftersom) → följd (vilket leder till) → andra sidan (samtidigt). Bindeorden håller ihop kedjan.",
    },
    example: {
      kind: "choice",
      category: "resonera",
      prompt:
        "Så här ser ett bra svar ut. Frågan var: 'Vilka nackdelar kan fyradagarsvecka ha?'\n\nSvar A: 'Det finns nackdelar, till exempel för föräldrar.'\n\nSvar B: 'En nackdel är att skoldagarna blir längre, eftersom eleverna ska hinna lika mycket på fyra dagar. Det leder till att vissa elever är helt slut när de kommer hem, vilket kan göra det svårare att orka med läxor och fritid.'\n\nVilket svar är ett utvecklat resonemang med stöd i texten?",
      options: [
        { id: "A", text: "Svar A", isCorrect: false },
        { id: "B", text: "Svar B", isCorrect: true },
      ],
      correctFeedback:
        "Rätt! Svar B har belägg ur texten, en förklaring (eftersom) och en följd i flera led (det leder till, vilket kan). Svar A är bara ett påstående utan stöd.",
      incorrectFeedback:
        "Svar B är det utvecklade svaret. Svar A säger bara att det finns nackdelar, utan belägg, förklaring eller följd.",
    },
  },

  // --------------------------------------------------------------------------
  // TRÄNA SJÄLV + ÅTERKALLA – per intresse
  // --------------------------------------------------------------------------
  themes: {
    sport: {
      practiceText: {
        title: "En idrott – eller många?",
        source: "Populärvetenskaplig artikel",
        paragraphs: [
          "Allt fler barn satsar tidigt på en enda idrott. Redan i tioårsåldern tränar en del fem dagar i veckan i samma sport, i hopp om att bli proffs.",
          "Men forskare varnar för att tidig specialisering kan öka risken för förslitningsskador, eftersom samma muskler och leder belastas om och om igen. Många som satsar hårt tidigt slutar dessutom innan de har fyllt femton, för att det har slutat vara roligt.",
          "Studier av elitidrottare visar att många av dem höll på med flera olika idrotter som barn. De fick en bred rörelseförmåga och kunde välja sin huvudidrott senare.",
          "Samtidigt finns idrotter, som gymnastik och konståkning, där man ofta når toppen tidigt. Där kan det vara svårt att vänta med att satsa.",
        ],
        level2: [
          "Tränare berättar att trycket ofta kommer från föräldrar som är rädda att barnet ska halka efter.",
        ],
        level3: [
          "Flera idrottsförbund rekommenderar nu att barn under tolv ska prova olika idrotter och att träningen ska utgå från lek snarare än resultat. Kritiker menar dock att rekommendationerna är svåra att följa när konkurrensen om platserna i de bästa lagen blir allt hårdare.",
        ],
        glossary: [
          { term: "specialisering", meaning: "att satsa på bara en sak" },
          { term: "förslitningsskada", meaning: "skada som kommer av att samma rörelse görs väldigt många gånger" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "resonera",
          prompt:
            "Frågan är: 'Varför kan det vara riskabelt att satsa på en enda idrott för tidigt?' Vilket belägg ur texten stöder ett svar bäst?",
          options: [
            {
              id: "A",
              text: "I gymnastik och konståkning når man ofta toppen tidigt.",
              isCorrect: false,
            },
            {
              id: "B",
              text: "Samma muskler och leder belastas om och om igen, vilket kan ge förslitningsskador.",
              isCorrect: true,
            },
            { id: "C", text: "Vissa tioåringar tränar fem dagar i veckan.", isCorrect: false },
          ],
          correctFeedback:
            "Rätt! Ett bra belägg svarar direkt på frågan. B förklarar varför det är riskabelt.",
          incorrectFeedback:
            "Rätt svar är B. A talar snarare FÖR att satsa tidigt, och C är ett faktum som inte förklarar någon risk.",
          hint: {
            text: "Ett belägg ska svara på 'varför riskabelt?'. Vilket alternativ handlar om en risk?",
            highlight: "förslitningsskador",
          },
        },
        reasoningTask(
          "Borde barn prova många idrotter i stället för att satsa på en?",
          "förslitningsskador, många slutar för att det inte är roligt, elitidrottare provade flera idrotter, undantag som gymnastik/konståkning",
          true,
          {
            text: "Börja med ditt påstående. Hämta sedan ett belägg, till exempel vad studier av elitidrottare visar, och förklara vad det leder till.",
            highlight: "många av dem höll på med flera olika idrotter som barn",
          },
          "Jag väljer en sida, du får välja din egen. Påstående: barn bör prova flera idrotter. Belägg: många elitidrottare höll på med flera idrotter som barn. Förklaring: eftersom de fick en bred rörelseförmåga kunde de välja senare, vilket leder till att färre tröttnar. Andra sidan: i gymnastik når man toppen tidigt.",
        ),
      ],
      recallText: {
        title: "Mer idrott i skolan?",
        source: "Informerande artikel",
        paragraphs: [
          "Högstadieelever har i dag ungefär två lektioner idrott och hälsa i veckan. Många forskare och läkare menar att det är för lite.",
          "Fysisk aktivitet stärker inte bara kroppen. Studier visar att elever som rör sig regelbundet ofta kan koncentrera sig bättre och lättare minns det de har lärt sig. Rörelse kan också minska stress och oro.",
          "Kritiker påpekar att fler idrottslektioner betyder att andra ämnen får mindre tid, om inte skoldagen blir längre. Dessutom är idrott det ämne som en del elever tycker minst om, särskilt de som inte är vana att röra sig.",
          "Några skolor har valt en annan väg: korta rörelsepauser under vanliga lektioner i stället för fler idrottslektioner.",
        ],
        level2: [
          "På en skola som har infört daglig rörelse berättar lärarna att det har blivit lugnare i klassrummen efter lunch.",
        ],
        level3: [
          "Frågan handlar också om jämlikhet. För elever vars familjer inte har råd med föreningsidrott är skolan ibland det enda stället där de rör sig regelbundet. Om skolan drar ner på rörelsen är det därför de som redan rör sig minst som förlorar mest.",
        ],
      },
      recall: [
        reasoningTask(
          "Borde skolan ha mer idrott och hälsa?",
          "bättre koncentration och minne, minskad stress, andra ämnen får mindre tid, alla gillar inte idrott, rörelsepauser som alternativ",
          false,
        ),
      ],
    },

    gaming: {
      practiceText: {
        title: "Ska staten begränsa spelandet?",
        source: "Informerande artikel",
        paragraphs: [
          "I Kina finns regler som begränsar hur många timmar i veckan unga får spela onlinespel. I Sverige har några debattörer föreslagit liknande gränser.",
          "De som är för menar att många unga spelar så mycket att sömn, skola och träning blir lidande. En gräns skulle enligt dem skydda unga, eftersom det är svårt att sluta själv när spelen är byggda för att man ska vilja fortsätta.",
          "De som är emot menar att det är föräldrarnas ansvar och inte statens. De påpekar också att spelande kan vara socialt och lärorikt, och att tekniska spärrar är lätta att ta sig runt.",
          "Forskare är oeniga om hur mycket spelande som är för mycket. Många menar att det viktiga inte är antalet timmar, utan om spelandet tränger undan annat.",
        ],
        level2: [
          "Spelföretagen har själva börjat införa funktioner som påminner spelare om att ta paus, men det är frivilligt att använda dem.",
        ],
        level3: [
          "En svårighet är att det är svårt att kontrollera vem som faktiskt sitter vid skärmen. I länder med strikta regler har det rapporterats att unga loggar in med vuxnas konton, vilket gör att regeln främst drabbar dem som följer den.",
        ],
        glossary: [
          { term: "debattör", meaning: "person som deltar i en debatt och säger vad hen tycker" },
          { term: "spärr", meaning: "något som stoppar, t.ex. en tidsgräns i ett spel" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "resonera",
          prompt:
            "Frågan är: 'Varför kan det vara svårt för unga att begränsa spelandet själva?' Vilket belägg stöder ett svar bäst?",
          options: [
            {
              id: "A",
              text: "Spelen är byggda för att man ska vilja fortsätta spela.",
              isCorrect: true,
            },
            { id: "B", text: "Spelande kan vara socialt och lärorikt.", isCorrect: false },
            { id: "C", text: "I Kina finns regler för spelande.", isCorrect: false },
          ],
          correctFeedback: "Rätt! A förklarar direkt varför det är svårt att sluta.",
          incorrectFeedback:
            "Rätt svar är A. B är ett argument mot en gräns, och C är ett faktum som inte förklarar varför det är svårt.",
          hint: {
            text: "Vilket alternativ förklarar VARFÖR det är svårt att sluta?",
            highlight: "spelen är byggda för att man ska vilja fortsätta",
          },
        },
        reasoningTask(
          "Borde det finnas en lag som begränsar hur mycket unga får spela?",
          "sömn/skola/träning blir lidande, svårt att sluta, föräldrarnas ansvar, socialt och lärorikt, spärrar kringgås, forskare: det viktiga är om spelandet tränger undan annat",
          true,
          {
            text: "Forskarnas syn i sista stycket kan bli ett starkt belägg, oavsett vad du tycker. Förklara vad det leder till.",
            highlight: "det viktiga inte är antalet timmar",
          },
          "Jag väljer en sida, du får välja din egen. Påstående: en lag behövs inte. Belägg: forskarna menar att det viktiga inte är antalet timmar. Förklaring: eftersom det avgörande är om spelandet tränger undan annat, träffar en timgräns fel, vilket leder till att den inte hjälper dem som behöver det. Andra sidan: det är svårt att sluta själv.",
        ),
      ],
      recallText: {
        title: "Datorspel på lektionerna",
        source: "Informerande artikel",
        paragraphs: [
          "Allt fler lärare använder datorspel i undervisningen. I historia kan eleverna bygga upp en medeltida stad, och i matematik kan de lösa problem för att klara nya nivåer.",
          "De som är för menar att spel ökar motivationen, eftersom eleverna får direkt återkoppling och vill klara nästa utmaning. Elever som annars har svårt att komma igång kan plötsligt arbeta en hel lektion.",
          "Kritikerna invänder att spelen kan ta fokus från själva kunskapen. Eleverna kan bli duktiga på att vinna spelet utan att förstå det de ska lära sig. Dessutom tar spelen tid som kunde ha använts till läsning och skrivande.",
          "Lärare som använder spel säger att det fungerar bäst när man pratar om spelet efteråt och kopplar det till ämnet.",
        ],
        level2: [
          "Spelen kostar också pengar, och alla skolor har inte råd med licenser och datorer som klarar dem.",
        ],
        level3: [
          "Forskningen pekar åt olika håll. Vissa studier visar bättre resultat, men många är små och gjorda under kort tid. Det är därför svårt att veta om effekten håller i sig när det nya har lagt sig.",
        ],
      },
      recall: [
        reasoningTask(
          "Borde lärare använda mer datorspel i undervisningen?",
          "ökad motivation och direkt återkoppling, elever som har svårt att komma igång arbetar mer, fokus kan hamna på spelet i stället för kunskapen, tar tid från läsning och skrivande, fungerar bäst med efterföljande samtal",
          false,
        ),
      ],
    },

    natur: {
      practiceText: {
        title: "Mindre kött för klimatets skull?",
        source: "Informerande artikel",
        paragraphs: [
          "Matens klimatpåverkan har blivit en het fråga. Särskilt nötkött ger stora utsläpp av växthusgaser, bland annat eftersom kor bildar metan när de idisslar.",
          "Därför föreslår många forskare att vi i rika länder ska äta mindre kött och mer baljväxter, som bönor och linser. Det skulle minska utsläppen och samtidigt kunna vara bra för hälsan.",
          "Men i Sverige bidrar betande djur också med något viktigt: de håller landskapet öppet. Utan kor och får som betar växer många ängar igen, och växter och insekter som lever där försvinner.",
          "Många experter landar därför i en mellanväg: mindre men bättre kött, gärna från djur som betar på naturbetesmarker.",
        ],
        level2: [
          "I skolmatsalarna har flera kommuner infört en eller flera vegetariska dagar i veckan.",
        ],
        level3: [
          "Frågan handlar också om rättvisa och tradition. Lantbrukare som har levt på djurhållning i generationer känner sig ibland utpekade i debatten, medan unga klimataktivister menar att förändringen går alldeles för långsamt.",
        ],
        glossary: [
          { term: "idissla", meaning: "när kor tuggar maten en gång till" },
          { term: "baljväxter", meaning: "bönor, ärter och linser" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "resonera",
          prompt:
            "Frågan är: 'Varför kan det vara bra för naturen att det finns kor i Sverige?' Vilket belägg stöder ett svar bäst?",
          options: [
            { id: "A", text: "Kor bildar metan när de idisslar.", isCorrect: false },
            {
              id: "B",
              text: "Betande djur håller landskapet öppet, så att ängarnas växter och insekter finns kvar.",
              isCorrect: true,
            },
            { id: "C", text: "Bönor och linser kan vara bra för hälsan.", isCorrect: false },
          ],
          correctFeedback: "Rätt! B svarar direkt på frågan om varför kor kan vara bra för naturen.",
          incorrectFeedback:
            "Rätt svar är B. A är en nackdel med kor, och C handlar inte om kor alls.",
          hint: {
            text: "Vilket alternativ handlar om något POSITIVT som korna gör för naturen?",
            highlight: "de håller landskapet öppet",
          },
        },
        reasoningTask(
          "Borde vi äta mindre kött?",
          "nötkött ger stora utsläpp/metan, baljväxter minskar utsläppen och är bra för hälsan, betande djur håller landskapet öppet och skyddar ängarnas arter, mellanvägen mindre men bättre kött",
          true,
          {
            text: "Texten ger argument åt båda hållen: utsläpp och hälsa, men också öppna landskap. Välj sida, hämta ett belägg och förklara vad det leder till.",
            highlight: "mindre men bättre kött",
          },
          "Jag väljer en sida, du får välja din egen. Påstående: vi bör äta mindre kött, men inte sluta helt. Belägg: nötkött ger stora utsläpp. Förklaring: eftersom kor bildar metan leder mindre kött till lägre utsläpp. Andra sidan: betande djur håller landskapet öppet, så mellanvägen är mindre men bättre kött.",
        ),
      ],
      recallText: {
        title: "Vindkraft i skogen – för eller emot?",
        source: "Informerande artikel",
        paragraphs: [
          "För att klara klimatmålen behöver Sverige mer el från förnybara källor. Vindkraft är ett av de snabbaste sätten att få det, och många nya vindkraftverk planeras i skogsområden.",
          "De som är för menar att vindkraften behövs för att kunna ersätta fossila bränslen i till exempel transporter och industri. De påpekar också att verken ger jobb och intäkter till landsbygden.",
          "Motståndarna oroar sig för naturen. Vägar och fundament splittrar skogen, och stora fåglar som örnar kan krocka med rotorbladen. Många som bor nära tycker också att ljudet och det blinkande ljuset stör.",
          "I flera kommuner har invånarna fått säga sitt, och svaren går isär.",
        ],
        level2: [
          "Kommunerna har rätt att säga nej till vindkraft inom sitt område, något som kallas det kommunala vetot.",
        ],
        level3: [
          "Forskare försöker hitta lösningar som minskar konflikten, till exempel att stänga av verken när känsliga fåglar flyttar förbi eller att bygga där naturen redan är påverkad. Men varje kompromiss har ett pris, och frågan om vems intressen som väger tyngst kommer sannolikt att följa med länge.",
        ],
      },
      recall: [
        reasoningTask(
          "Borde det byggas mer vindkraft i skogen?",
          "behövs för att ersätta fossila bränslen, jobb och intäkter till landsbygden, splittrad skog, fåglar krockar, ljud och blinkande ljus stör de som bor nära",
          false,
        ),
      ],
    },
  },

  // --------------------------------------------------------------------------
  // BEFÄSTA – strategin ur minnet
  // --------------------------------------------------------------------------
  strategyRecall: {
    kind: "free",
    category: "resonera",
    prompt:
      "Svara ur minnet, utan text: Vilka delar ska ett utvecklat resonemang med stöd i texten innehålla? Ge också exempel på bindeord du kan använda.",
    rubric:
      "Eleven nämner påstående/ståndpunkt, belägg/stöd ur texten, förklaring (varför), följd/konsekvens och gärna motargument/andra perspektiv, samt ger exempel på bindeord (eftersom, därför, vilket leder till, det innebär att, samtidigt, å andra sidan).",
    fallbackFeedback:
      "Påstående → belägg → förklaring (eftersom) → följd (vilket leder till) → andra sidan (samtidigt).",
  },
};
