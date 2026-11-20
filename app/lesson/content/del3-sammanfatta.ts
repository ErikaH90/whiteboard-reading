import type { FreeTask, Hint, PartDefinition } from "../types";

const summaryTemplateHint: Hint = {
  text: "Använd mallen: 'Texten handlar om ... Vissa menar att ... medan andra ... Just nu ...' Stryk exempel och detaljer.",
};

function summaryTask(rubric: string, withSupport: boolean): FreeTask {
  return {
    kind: "free",
    category: "sammanfatta",
    prompt: withSupport
      ? "Sammanfatta texten i 2–3 meningar. Ta med ämnet, de viktigaste poängerna och hur det ser ut nu. Hoppa över detaljer och egna åsikter."
      : "Sammanfatta texten i 2–3 meningar.",
    placeholder: withSupport ? "Texten handlar om ... Vissa menar att ... medan ..." : undefined,
    rubric,
    hint: withSupport ? summaryTemplateHint : undefined,
    fallbackFeedback:
      "Kontrollera att du har med ämnet och huvudpoängerna, och att du har strukit detaljer och egna åsikter.",
  };
}

export const DEL3: PartDefinition = {
  part: 3,
  title: "Sammanfatta det viktigaste",
  goal: "Skilja viktig information från detaljer och sammanfatta textens kärna med egna ord.",

  // --------------------------------------------------------------------------
  // MODELLERING
  // --------------------------------------------------------------------------
  model: {
    text: {
      title: "Mobilen i skolan",
      source: "Informerande artikel",
      paragraphs: [
        "Allt fler skolor har infört mobilförbud under skoldagen. Mobilerna samlas in på morgonen och lämnas tillbaka när sista lektionen är slut.",
        "De som är för förbudet menar att eleverna blir mer koncentrerade och att det blir mer rörelse och samtal på rasterna. På en skola i Göteborg började eleverna spela pingis igen, fast bordet hade stått oanvänt i flera år.",
        "Kritikerna är oroliga för att skolan tar bort ett viktigt verktyg. Mobilen kan användas för att söka information, och vissa elever använder appar som stöd i skolarbetet.",
        "Forskningen om mobilförbud ger ännu inget entydigt svar. Vissa studier visar bättre resultat, andra visar ingen tydlig skillnad.",
      ],
    },
    thinkAloud: {
      kind: "think_aloud",
      category: "sammanfatta",
      intro:
        "Nu visar jag hur jag sållar fram det viktigaste. En sammanfattning är inte en kortare kopia. Den är textens kärna, skriven med mina egna ord.",
      thoughts: [
        {
          label: "Hitta ämnet",
          text: "Steg 1: Vad handlar texten om i stort? Jag tittar på första stycket: mobilförbud i skolan. Det är ämnet.",
          highlight: "Allt fler skolor har infört mobilförbud under skoldagen.",
        },
        {
          label: "Huvudpoängen i stycket",
          text: "Steg 2: Jag letar efter huvudpoängen i varje stycke. I stycke 2 är det att eleverna blir mer koncentrerade. Det är viktigt.",
          highlight: "eleverna blir mer koncentrerade",
        },
        {
          label: "Stryk exempel",
          text: "Men pingisbordet? Det är en rolig detalj, ett exempel. Det stryker jag, för det behövs inte för att förstå kärnan.",
          highlight: "På en skola i Göteborg började eleverna spela pingis igen",
        },
        {
          label: "Ta med andra sidan",
          text: "I stycke 3 tycker kritikerna att skolan tar bort ett viktigt verktyg. Det är andra sidan, och den MÅSTE vara med. Annars blir sammanfattningen skev.",
          highlight: "skolan tar bort ett viktigt verktyg",
        },
        {
          label: "Textens slutsats",
          text: "I stycke 4 står det att forskningen inte ger något säkert svar. Det är textens slutsats.",
          highlight: "Forskningen om mobilförbud ger ännu inget entydigt svar.",
        },
      ],
      summary:
        "Min sammanfattning: 'Allt fler skolor förbjuder mobiler. De som är för menar att eleverna blir mer koncentrerade, medan kritiker anser att ett viktigt verktyg försvinner. Forskningen ger ännu inget tydligt svar.' Ämne + huvudpoänger + slutsats. Inga detaljer, inga egna åsikter.",
    },
    example: {
      kind: "choice",
      category: "sammanfatta",
      prompt:
        "Så här ser en bra sammanfattning ut, och så här ser två svagare ut. Vilken sammanfattning fångar textens kärna bäst?",
      options: [
        {
          id: "A",
          text: "Texten handlar om en skola i Göteborg där eleverna började spela pingis när mobilerna samlades in.",
          isCorrect: false,
        },
        {
          id: "B",
          text: "Skolor förbjuder mobiler, och det är bra eftersom unga använder mobilen alldeles för mycket.",
          isCorrect: false,
        },
        {
          id: "C",
          text: "Mobilförbud i skolan väcker debatt. Vissa menar att koncentrationen ökar, andra att ett viktigt verktyg försvinner, och forskningen ger inget entydigt svar.",
          isCorrect: true,
        },
      ],
      correctFeedback:
        "Rätt! C har med ämnet, båda sidorna och slutsatsen, utan detaljer och utan egna åsikter.",
      incorrectFeedback:
        "C är bäst. A fastnar i en detalj (pingisbordet). B lägger till en egen åsikt och missar kritikerna.",
    },
  },

  // --------------------------------------------------------------------------
  // TRÄNA SJÄLV + ÅTERKALLA – per intresse
  // --------------------------------------------------------------------------
  themes: {
    sport: {
      practiceText: {
        title: "Ska barn få tävla?",
        source: "Informerande artikel",
        paragraphs: [
          "I många idrotter får barn under tolv år inte tävla om placeringar. Ingen räknar mål i matcherna, och alla som deltar i en tävling får samma medalj.",
          "Tanken är att barn ska ha roligt och utvecklas i sin egen takt. Många barn slutar idrotta i tidiga tonåren, ofta för att kraven känns för höga.",
          "Men alla håller inte med. En del tränare och föräldrar menar att barn behöver lära sig att vinna och förlora. I en simklubb i Västerås har man ändå börjat skriva upp tiderna, på barnens egen begäran.",
          "Frågan om när tävlandet ska börja diskuteras fortfarande inom idrottsrörelsen.",
        ],
        level2: [
          "Idrottsrörelsens riktlinjer säger att barnidrott ska utgå från barnens perspektiv, men hur det ska tolkas skiljer sig mellan olika förbund.",
        ],
        level3: [
          "Några förbund har valt en mellanväg: resultat noteras, men inga tabeller eller rankningar publiceras förrän barnen är tretton år. Det ska ge barnen möjlighet att mäta sin egen utveckling utan att ständigt jämföras med andra.",
        ],
        glossary: [
          { term: "placering", meaning: "vilken plats man kommer på, t.ex. etta eller tvåa" },
          { term: "begäran", meaning: "när man ber om något" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "sammanfatta",
          prompt: "Vilken information är en DETALJ som inte behövs i en sammanfattning?",
          options: [
            { id: "A", text: "Att barn under tolv ofta inte får tävla om placeringar.", isCorrect: false },
            {
              id: "B",
              text: "Att en simklubb i Västerås skriver upp tiderna på barnens begäran.",
              isCorrect: true,
            },
            {
              id: "C",
              text: "Att vissa tycker att barn behöver lära sig att vinna och förlora.",
              isCorrect: false,
            },
          ],
          correctFeedback:
            "Rätt! Simklubben är ett exempel. Kärnan är att det finns argument både för och emot.",
          incorrectFeedback:
            "Rätt svar är B. Simklubben i Västerås är ett enskilt exempel. A och C är huvudpoänger som måste vara med.",
          hint: {
            text: "Fråga dig: skulle läsaren missförstå texten om informationen saknades? Exempel om en enskild klubb brukar vara detaljer.",
            highlight: "I en simklubb i Västerås",
          },
        },
        summaryTask(
          "Sammanfattningen tar med: ämnet (barn under tolv får ofta inte tävla om placeringar), skälet för (glädje/utveckling, många slutar annars), skälet emot (barn behöver lära sig vinna och förlora) och att frågan fortfarande diskuteras. Detaljer som simklubben i Västerås ska inte vara med. Inga egna åsikter, egna ord.",
          true,
        ),
      ],
      recallText: {
        title: "Energidryck och unga idrottare",
        source: "Informerande artikel",
        paragraphs: [
          "Energidrycker har blivit populära bland unga som idrottar. Burkarna marknadsförs ofta med kända idrottsstjärnor och lovar mer energi och bättre prestationer.",
          "Men dryckerna innehåller ofta mycket koffein och socker. Läkare varnar för att stora mängder kan ge hjärtklappning, sömnproblem och oro, särskilt hos barn och unga.",
          "Flera butikskedjor har därför slutat sälja energidryck till personer under 15 år. Vissa tycker att det borde bli en lag, medan andra menar att det är föräldrarnas ansvar.",
          "En spelare i ett juniorlag i fotboll berättar att hela laget brukade dricka energidryck före matcherna, tills tränaren förbjöd det.",
        ],
        level2: [
          "Det finns inget som tyder på att energidryck gör unga till bättre idrottare. Vatten och vanlig mat räcker för de allra flesta.",
        ],
        level3: [
          "I några andra länder finns redan regler som begränsar försäljningen till unga. De som vill ha en svensk lag menar att butikernas frivilliga åtaganden inte räcker, eftersom drycken fortfarande går att köpa på nätet och på bensinstationer.",
        ],
      },
      recall: [
        summaryTask(
          "Sammanfattningen tar med: ämnet (energidryck är populärt bland unga idrottare), riskerna (mycket koffein och socker, kan ge hjärtklappning, sömnproblem och oro) och debatten/åtgärderna (butiker har slutat sälja till under 15 år; lag eller föräldrarnas ansvar). Detaljen om juniorlaget ska inte vara med. Egna ord, inga egna åsikter.",
          false,
        ),
      ],
    },

    gaming: {
      practiceText: {
        title: "Loot boxes – spel eller hasard?",
        source: "Informerande artikel",
        paragraphs: [
          "I många datorspel kan man köpa så kallade loot boxes, virtuella lådor med slumpmässigt innehåll. Man vet inte vad man får förrän man har betalat.",
          "Kritiker menar att loot boxes fungerar som hasardspel och att de kan lära unga att spela om pengar. Några länder har därför förbjudit eller begränsat dem.",
          "Spelföretagen svarar att lådorna är en frivillig del av spelet och att de ger pengar till fortsatt utveckling. Den mest populära lådan i ett fotbollsspel kan innehålla en sällsynt spelare med guldkant.",
          "I Sverige diskuteras det om det behövs nya regler, till exempel en åldersgräns.",
        ],
        level2: [
          "Forskare har sett ett samband mellan att köpa många loot boxes och att ha problem med spel om pengar, men det är oklart vad som är orsak och vad som är verkan.",
        ],
        level3: [
          "Frågan kompliceras av att lådorna ser olika ut i olika spel. I vissa kan innehållet säljas vidare för riktiga pengar, i andra stannar det inne i spelet. Därför är det svårt att dra en gemensam gräns för vad som ska räknas som hasard.",
        ],
        glossary: [
          { term: "hasardspel", meaning: "spel om pengar där slumpen avgör, t.ex. på kasino" },
          { term: "slumpmässig", meaning: "det bestäms av slumpen" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "sammanfatta",
          prompt: "Vilken information är en DETALJ som inte behövs i en sammanfattning?",
          options: [
            { id: "A", text: "Kritiker menar att loot boxes liknar hasardspel.", isCorrect: false },
            { id: "B", text: "Spelföretagen säger att lådorna är frivilliga.", isCorrect: false },
            {
              id: "C",
              text: "Den mest populära lådan kan innehålla en sällsynt spelare med guldkant.",
              isCorrect: true,
            },
          ],
          correctFeedback:
            "Rätt! Guldspelaren är en detalj. Kritikernas och spelföretagens syn är kärnan.",
          incorrectFeedback:
            "Rätt svar är C. A och B är de två sidorna i debatten och måste vara med. Guldspelaren är bara ett exempel.",
          hint: {
            text: "Vilket alternativ är ett exempel och inte en åsikt eller ett huvudargument?",
            highlight: "en sällsynt spelare med guldkant",
          },
        },
        summaryTask(
          "Sammanfattningen tar med: ämnet (loot boxes = köpta lådor med slumpmässigt innehåll), kritiken (liknar hasardspel, risk för unga, vissa länder har förbjudit/begränsat dem), spelföretagens svar (frivilligt, finansierar utveckling) och läget i Sverige (diskussion om regler/åldersgräns). Guldspelaren ska inte vara med. Egna ord, inga egna åsikter.",
          true,
        ),
      ],
      recallText: {
        title: "Lär man sig engelska av att spela?",
        source: "Informerande artikel",
        paragraphs: [
          "Många svenska ungdomar säger att de har lärt sig mycket engelska genom att spela datorspel. I spelen läser man instruktioner, lyssnar på dialog och pratar med spelare från andra länder.",
          "Forskare har sett att unga som spelar mycket på engelska ofta har ett större ordförråd än andra. Särskilt spel där man måste samarbeta och prata med varandra verkar ge effekt.",
          "Samtidigt varnar lärare för att spelengelskan kan bli ensidig. Man lär sig ord som 'respawn' och 'loot', men inte alltid det språk som behövs för att skriva en uppsats.",
          "En niondeklassare berättar att hon lärde sig ordet 'ambush' innan hon visste vad det hette på svenska.",
        ],
        level2: [
          "Effekten verkar vara störst för elever som spelar tillsammans med andra och måste uttrycka sig, inte för dem som bara klickar sig igenom menyer.",
        ],
        level3: [
          "Vissa forskare menar att skolan borde ta tillvara elevernas fritidsengelska, till exempel genom att låta dem jämföra spelspråk med formellt språk. Andra påpekar att alla elever inte spelar och att undervisningen då riskerar att gynna dem som redan har ett försprång.",
        ],
      },
      recall: [
        summaryTask(
          "Sammanfattningen tar med: ämnet (unga lär sig engelska genom datorspel), det positiva (man läser, lyssnar och pratar; större ordförråd, särskilt i samarbetsspel) och begränsningen (spelengelskan kan bli ensidig och räcker inte för t.ex. uppsatser). Detaljen om 'ambush' ska inte vara med. Egna ord, inga egna åsikter.",
          false,
        ),
      ],
    },

    natur: {
      practiceText: {
        title: "Stadsträdens hemliga jobb",
        source: "Informerande artikel",
        paragraphs: [
          "Träd i städer gör mer än att se fina ut. De ger skugga och kan sänka temperaturen på en gata med flera grader en varm sommardag.",
          "Träden tar också upp regnvatten, vilket minskar risken för översvämningar när det regnar kraftigt. Dessutom visar studier att människor som har grönska nära hemmet ofta mår bättre.",
          "Men stadsträd har det tufft. Rötterna får lite plats, och vägsalt och avgaser skadar dem. Utanför stadshuset i en mellansvensk stad står en lind som är över 200 år gammal.",
          "Därför planerar många kommuner att plantera fler träd och ge dem bättre växtplatser.",
        ],
        level2: [
          "Ett stort träd kan ta hand om hundratals liter vatten under ett enda kraftigt regn.",
        ],
        level3: [
          "Det räcker dock inte att plantera nytt. Ett ungt träd ger bara en bråkdel av den nytta som ett gammalt träd med stor krona ger, och det tar årtionden innan det har vuxit ikapp. Att bevara de träd som redan finns är därför minst lika viktigt.",
        ],
        glossary: [
          { term: "översvämning", meaning: "när vatten svämmar över och täcker marken" },
          { term: "grönska", meaning: "träd, gräs och växter" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "sammanfatta",
          prompt: "Vilken information är en DETALJ som inte behövs i en sammanfattning?",
          options: [
            {
              id: "A",
              text: "Träd sänker temperaturen och minskar risken för översvämningar.",
              isCorrect: false,
            },
            {
              id: "B",
              text: "Utanför ett stadshus står en lind som är över 200 år gammal.",
              isCorrect: true,
            },
            {
              id: "C",
              text: "Stadsträd skadas av vägsalt, avgaser och brist på plats.",
              isCorrect: false,
            },
          ],
          correctFeedback:
            "Rätt! Linden är en intressant detalj, men kärnan är trädens nytta och problem.",
          incorrectFeedback:
            "Rätt svar är B. A och C är huvudpoänger (nytta och problem). Linden är ett enskilt exempel.",
          hint: {
            text: "Vilket alternativ handlar om ett enda träd i stället för stadsträd i allmänhet?",
            highlight: "Utanför stadshuset i en mellansvensk stad står en lind",
          },
        },
        summaryTask(
          "Sammanfattningen tar med: ämnet (stadsträdens nytta), nyttorna (skugga/svalka, tar upp regnvatten, människor mår bättre), problemen (lite plats, vägsalt, avgaser) och åtgärden (kommuner planerar fler träd och bättre växtplatser). Linden ska inte vara med. Egna ord, inga egna åsikter.",
          true,
        ),
      ],
      recallText: {
        title: "Plasten i havet",
        source: "Informerande artikel",
        paragraphs: [
          "Varje år hamnar miljontals ton plast i världshaven. En stor del kommer från land, till exempel skräp som blåser iväg eller spolas ut via floder.",
          "Plasten bryts sakta ner till mikroplast, små bitar som fiskar och fåglar äter. Forskare undersöker nu hur mikroplasten påverkar djuren och oss människor som äter fisk.",
          "För att minska problemet har EU förbjudit vissa engångsartiklar i plast, som sugrör och bestick. Många menar ändå att det behövs mer, till exempel bättre återvinning i hela världen.",
          "På en strand på västkusten hittade en skolklass över 3 000 plastbitar på en enda förmiddag.",
        ],
        level2: [
          "Plast som flyter i havet kan färdas tusentals kilometer med havsströmmarna innan den sjunker eller spolas upp på en strand.",
        ],
        level3: [
          "Problemet är svårt att lösa eftersom det är globalt: plasten följer inga landsgränser, och länder med bristfällig avfallshantering saknar ofta resurser att bygga upp fungerande system. Därför efterlyser många forskare ett bindande internationellt avtal.",
        ],
      },
      recall: [
        summaryTask(
          "Sammanfattningen tar med: ämnet (mycket plast hamnar i haven, mest från land), problemet (bryts ner till mikroplast som djur äter; påverkan undersöks) och åtgärderna (EU har förbjudit vissa engångsartiklar, men mer behövs, t.ex. bättre återvinning). Detaljen om skolklassen ska inte vara med. Egna ord, inga egna åsikter.",
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
    category: "sammanfatta",
    prompt:
      "Svara ur minnet, utan text: Beskriv steg för steg hur du gör när du sammanfattar en text. Vad tar du med, och vad tar du bort?",
    rubric:
      "Eleven beskriver: ta reda på ämnet/huvudtanken, hitta huvudpoängen i varje stycke, stryka detaljer/exempel/citat, ta med båda sidor om det finns flera, skriva kort med egna ord och utan egna åsikter.",
    fallbackFeedback:
      "Ämne → huvudpoäng per stycke → stryk detaljer och exempel → båda sidor → egna ord, inga åsikter.",
  },
};
