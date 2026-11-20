import type { PartDefinition } from "../types";

export const DEL2: PartDefinition = {
  part: 2,
  title: "Lästeknik – läsa på och mellan raderna",
  goal: "Välja lästeknik (skumläsa, sökläsa, närläsa), hitta det som står i texten och dra slutsatser om det som inte står rakt ut.",

  // --------------------------------------------------------------------------
  // MODELLERING
  // --------------------------------------------------------------------------
  model: {
    text: {
      title: "Varför sover tonåringar för lite?",
      source: "Artikel i en webbtidning",
      paragraphs: [
        "Tonåringar behöver mellan åtta och tio timmars sömn per natt. Ändå sover många högstadieelever betydligt mindre än så under skolveckorna.",
        "En förklaring är att kroppens inre klocka förskjuts i tonåren: man blir trött senare på kvällen. En annan är mobilen. Många ligger kvar med skärmen i sängen långt efter att lampan har släckts.",
        "På en skola i Norrland testade man att börja skoldagen en timme senare. Efter en termin hade frånvaron från första lektionen nästan halverats, och lärarna berättade att eleverna var piggare och mer delaktiga.",
      ],
    },
    thinkAloud: {
      kind: "think_aloud",
      category: "mellan_raderna",
      intro:
        "Nu visar jag HUR jag läser. Jag läser inte allt på samma sätt. Jag väljer lästeknik efter vad jag letar efter.",
      thoughts: [
        {
          label: "Skumläsa för överblick",
          text: "Först skumläser jag rubriken och första meningen i varje stycke. Då ser jag att texten handlar om sömn, om varför unga sover för lite och om ett försök på en skola.",
          highlight:
            "Tonåringar behöver mellan åtta och tio timmars sömn per natt.",
        },
        {
          label: "Sökläsa: på raderna",
          text: "Om frågan är 'Hur mycket sömn behöver tonåringar?' sökläser jag efter siffror. Svaret står ordagrant: åtta till tio timmar. Det kallas att läsa PÅ raderna.",
          highlight: "mellan åtta och tio timmars sömn",
        },
        {
          label: "Leta ledtrådar",
          text: "Nu kommer en svårare fråga: Vad tycker skribenten om mobilen? Det står inte 'mobilen är dålig'. Men mobilen nämns som en förklaring till att unga sover för lite. Det är en ledtråd.",
          highlight: "En annan är mobilen.",
        },
        {
          label: "Närläsa exemplet",
          text: "Jag närläser försöket. Frånvaron halverades och eleverna blev piggare. Skribenten skriver inte rakt ut att skolan borde börja senare. Men varför skulle exemplet annars vara med?",
          highlight: "frånvaron från första lektionen nästan halverats",
        },
        {
          label: "Slutsats mellan raderna",
          text: "Min slutsats MELLAN raderna: skribenten antyder att en senare skolstart kan vara bra för unga. Jag kombinerar ledtrådarna i texten med min egen logik, för det står inte ordagrant.",
        },
      ],
      summary:
        "Kom ihåg: Skumläs för att få en överblick → sökläs efter fakta (PÅ raderna) → närläs och kombinera ledtrådar för att dra slutsatser (MELLAN raderna).",
    },
    example: {
      kind: "choice",
      category: "mellan_raderna",
      prompt:
        "Så här ser ett bra svar ut. Frågan var: 'Vad vill skribenten antyda med exemplet från skolan?'\n\nSvar A: 'Att frånvaron nästan halverades.'\n\nSvar B: 'Att en senare skolstart verkar vara bra för elever, eftersom de blev piggare och var borta mindre, fast skribenten inte säger det rakt ut.'\n\nVilket svar läser MELLAN raderna?",
      options: [
        { id: "A", text: "Svar A", isCorrect: false },
        { id: "B", text: "Svar B", isCorrect: true },
      ],
      correctFeedback:
        "Rätt! Svar A återger bara fakta som står i texten (på raderna). Svar B drar en slutsats och stöder den med textens ledtrådar (mellan raderna).",
      incorrectFeedback:
        "Svar B läser mellan raderna. Svar A upprepar bara det som står. Svar B drar en slutsats som inte står ordagrant och stöder den med ledtrådar.",
    },
  },

  // --------------------------------------------------------------------------
  // TRÄNA SJÄLV + ÅTERKALLA – per intresse
  // --------------------------------------------------------------------------
  themes: {
    sport: {
      practiceText: {
        title: "Målvakten som nästan slutade",
        source: "Reportage",
        paragraphs: [
          "Elin var tretton år när hon bestämde sig för att lägga av med hockeyn. Hon var den enda tjejen i laget, och i omklädningsrummet pratade ingen med henne.",
          "– Jag älskade att stå i mål, men jag gick hem och grät efter nästan varje träning, berättar hon.",
          "Det var tränaren Johan som märkte att något var fel. Han flyttade samlingen före träningarna ut på isen, där alla var med, och lät spelarna byta omklädningsrum i par. Ett halvår senare var Elin lagkapten.",
        ],
        level2: ["I dag är hon sjutton och tränar själv ett ungdomslag två kvällar i veckan."],
        level3: [
          "– Jag vet hur lätt det är att försvinna ur en lagidrott utan att någon märker det. Därför frågar jag alltid alla i laget hur de har det, inte bara dem som syns mest, säger hon.",
        ],
        glossary: [{ term: "samling", meaning: "när laget träffas och pratar innan träningen" }],
      },
      practice: [
        {
          kind: "choice",
          category: "pa_raderna",
          prompt: "Läs PÅ raderna: Hur gammal var Elin när hon ville sluta med hockeyn?",
          options: [
            { id: "A", text: "Sjutton år", isCorrect: false },
            { id: "B", text: "Tretton år", isCorrect: true },
            { id: "C", text: "Femton år", isCorrect: false },
          ],
          correctFeedback: "Rätt! Det stod ordagrant i första meningen. Du sökläste på raderna.",
          incorrectFeedback:
            "Rätt svar är B. Det står i första meningen: 'Elin var tretton år när...'. Sökläs efter siffror och åldrar.",
          hint: {
            text: "Sökläs efter en ålder i början av texten.",
            highlight: "Elin var tretton år",
          },
        },
        {
          kind: "choice",
          category: "mellan_raderna",
          prompt: "Läs MELLAN raderna: Varför ville Elin sluta?",
          options: [
            { id: "A", text: "Hon var inte tillräckligt bra som målvakt.", isCorrect: false },
            { id: "B", text: "Hon kände sig utanför och ensam i laget.", isCorrect: true },
            { id: "C", text: "Hon hade för lite tid för skolan.", isCorrect: false },
          ],
          correctFeedback:
            "Rätt! Det står inte 'ensam', men ledtrådarna (ingen pratade med henne, hon grät) visar det. Du läste mellan raderna.",
          incorrectFeedback:
            "Rätt svar är B. Ledtrådarna är att ingen pratade med henne och att hon grät efter träningarna. Hon älskade ju att stå i mål.",
          hint: {
            text: "Ordet 'ensam' står inte i texten. Men vad betyder det att ingen pratade med henne i omklädningsrummet?",
            highlight: "i omklädningsrummet pratade ingen med henne",
          },
        },
        {
          kind: "free",
          category: "mellan_raderna",
          prompt:
            "Vilken slutsats kan man dra om tränaren Johans betydelse för Elin? Stöd ditt svar med något ur texten.",
          placeholder: "Jag drar slutsatsen att ... eftersom det står att ...",
          rubric:
            "Eleven drar slutsatsen att tränaren förändrade gemenskapen i laget och att det fick Elin att stanna/trivas, och stöder det med ledtrådar (samlingen på isen, byta omklädningsrum i par, lagkapten ett halvår senare).",
          hint: {
            text: "Jämför hur det var före och efter att Johan ändrade något. Vad hände med Elin?",
            highlight: "Ett halvår senare var Elin lagkapten.",
          },
          fallbackFeedback:
            "Bra försök! Koppla ihop det Johan ändrade med att Elin blev lagkapten.",
        },
      ],
      recallText: {
        title: "Loppet i regnet",
        source: "Reportage",
        paragraphs: [
          "Klockan är halv sju på morgonen och regnet öser ner över startområdet. Amina, 16 år, drar upp huvan och stampar med fötterna för att hålla värmen.",
          "Det här är hennes första halvmaraton. För ett år sedan orkade hon knappt springa till busshållplatsen. Alla träningsdagböcker har hon sparat i en låda under sängen.",
          "När startskottet går ler hon för första gången den morgonen.",
        ],
        level2: [
          "Hennes mamma står vid sidan av banan med en skylt där det står: 'Ett år sedan – nu!'",
        ],
        level3: [
          "Efter två timmar och fjorton minuter korsar Amina mållinjen. Hon är långt ifrån snabbast, men när hon får sin medalj håller hon den länge i handen innan hon hänger den runt halsen.",
        ],
      },
      recall: [
        {
          kind: "choice",
          category: "pa_raderna",
          prompt: "Vilken sorts lopp springer Amina?",
          options: [
            { id: "A", text: "Ett maraton", isCorrect: false },
            { id: "B", text: "Ett halvmaraton", isCorrect: true },
            { id: "C", text: "Ett terränglopp", isCorrect: false },
          ],
          correctFeedback: "Rätt! Du hittade det på raderna utan stöd.",
          incorrectFeedback: "Rätt svar är B: 'Det här är hennes första halvmaraton.' Läs noga, varje ord räknas.",
        },
        {
          kind: "free",
          category: "mellan_raderna",
          prompt:
            "Vad kan man förstå om Aminas känslor inför loppet, och hur förändras de? Stöd din slutsats med ledtrådar ur texten.",
          rubric:
            "Eleven drar slutsatsen att Amina är nervös/spänd/frusen i början men glad/stolt/redo när loppet startar, och stöder med ledtrådar (stampar med fötterna, ler för första gången vid startskottet, har sparat träningsdagböckerna, för ett år sedan orkade hon knappt springa).",
          fallbackFeedback:
            "Leta efter vad Amina GÖR i texten: stampar, ler. Vad säger det om hur hon känner sig?",
        },
      ],
    },

    gaming: {
      practiceText: {
        title: "Laget som aldrig har träffats",
        source: "Reportage",
        paragraphs: [
          "Varje torsdag klockan 19 loggar fem tonåringar in på samma server. De bor i fyra olika länder och har aldrig träffats på riktigt.",
          "– Vi pratar engelska med varandra, men Lukas från Tyskland har lärt oss några tyska svordomar, skrattar Noah, 15, från Malmö.",
          "I våras kvalade laget till en europeisk turnering. När Noahs internet gick ner mitt i finalen spelade de andra fyra vidare utan att klaga, och efteråt skickade de honom en video från segern.",
        ],
        level2: [
          "Noahs föräldrar var först tveksamma till hur mycket tid han lade på spelet, men ändrade sig när de hörde honom planera taktik på flytande engelska.",
        ],
        level3: [
          "– Folk tror att man blir ensam av att spela. För mig är det tvärtom. Det här är mina bästa vänner, även om jag aldrig har kramat någon av dem, säger Noah.",
        ],
        glossary: [{ term: "kvala", meaning: "ta sig vidare till en större tävling" }],
      },
      practice: [
        {
          kind: "choice",
          category: "pa_raderna",
          prompt: "Läs PÅ raderna: I hur många länder bor spelarna?",
          options: [
            { id: "A", text: "Fem", isCorrect: false },
            { id: "B", text: "Fyra", isCorrect: true },
            { id: "C", text: "Två", isCorrect: false },
          ],
          correctFeedback: "Rätt! Det står ordagrant i första stycket. Du sökläste på raderna.",
          incorrectFeedback:
            "Rätt svar är B. Fem är antalet spelare, men de bor i fyra olika länder. Läs noga vad siffran gäller!",
          hint: {
            text: "Det finns två siffror i första stycket. Vilken handlar om länder?",
            highlight: "De bor i fyra olika länder",
          },
        },
        {
          kind: "choice",
          category: "mellan_raderna",
          prompt: "Läs MELLAN raderna: Vad visar det att laget skickade en video till Noah efter segern?",
          options: [
            { id: "A", text: "Att de ville skryta inför honom.", isCorrect: false },
            {
              id: "B",
              text: "Att de brydde sig om honom och ville att han skulle känna sig delaktig.",
              isCorrect: true,
            },
            { id: "C", text: "Att de var arga för att han försvann.", isCorrect: false },
          ],
          correctFeedback:
            "Rätt! De klagade inte och delade segern med honom. Det visar omtanke, fast det inte står rakt ut.",
          incorrectFeedback:
            "Rätt svar är B. Ledtråden är 'utan att klaga'. De var inte arga, de ville dela segern med honom.",
          hint: {
            text: "Hur reagerade de när hans internet gick ner? Vad säger det om relationen?",
            highlight: "spelade de andra fyra vidare utan att klaga",
          },
        },
        {
          kind: "free",
          category: "mellan_raderna",
          prompt:
            "Vilken slutsats kan man dra om vänskapen i laget, trots att de aldrig har träffats? Stöd ditt svar med texten.",
          placeholder: "Jag drar slutsatsen att ... eftersom det står att ...",
          rubric:
            "Eleven drar slutsatsen att vänskapen är äkta/stark/omtänksam trots avståndet och stöder det med ledtrådar (ses varje torsdag, skämtar med varandra, klagar inte, skickar video efter segern).",
          hint: {
            text: "Leta efter saker de GÖR för varandra. Vad säger de om vänskapen?",
            highlight: "skickade de honom en video från segern",
          },
          fallbackFeedback: "Bra försök! Koppla din slutsats till vad laget gör för varandra.",
        },
      ],
      recallText: {
        title: "Natten före releasen",
        source: "Reportage",
        paragraphs: [
          "Kön utanför spelbutiken ringlar sig runt hörnet. Det är minus fem grader, men ingen verkar bry sig. Någon har tagit med en termos varm choklad som går runt i kön.",
          "Ella, 14, har stått här sedan klockan åtta på kvällen. I fickan har hon pengarna hon har tjänat på att rasta grannens hund i tre månader.",
          "När dörrarna öppnas vid midnatt är det hon som får den första kartongen.",
        ],
        level2: ["Expediten räcker över spelet och säger att hon har stått i kö längst av alla."],
        level3: [
          "Hade hon inte kunnat ladda ner spelet hemma i stället? Jo. Men då hade det inte varit samma sak, förklarar hon och kramar kartongen hårt mot jackan.",
        ],
      },
      recall: [
        {
          kind: "choice",
          category: "pa_raderna",
          prompt: "Hur har Ella fått ihop pengarna till spelet?",
          options: [
            { id: "A", text: "Hon har fått dem i present.", isCorrect: false },
            { id: "B", text: "Hon har rastat grannens hund.", isCorrect: true },
            { id: "C", text: "Hon har sålt gamla spel.", isCorrect: false },
          ],
          correctFeedback: "Rätt! Du hittade det på raderna utan stöd.",
          incorrectFeedback: "Rätt svar är B: 'pengarna hon har tjänat på att rasta grannens hund'.",
        },
        {
          kind: "free",
          category: "mellan_raderna",
          prompt:
            "Vad betyder spelet för Ella? Dra en slutsats och stöd den med ledtrådar ur texten.",
          rubric:
            "Eleven drar slutsatsen att spelet/ögonblicket är mycket viktigt för Ella, att hon har längtat och kämpat för det, och stöder det med ledtrådar (köat sedan kl. 20 i kylan, tjänat pengarna själv i tre månader, först i kön).",
          fallbackFeedback:
            "Leta efter vad Ella har gjort för att få spelet. Vad säger det om hur viktigt det är?",
        },
      ],
    },

    natur: {
      practiceText: {
        title: "Vargen som kom tillbaka",
        source: "Reportage",
        paragraphs: [
          "Under stora delar av 1900-talet var vargen nästan utrotad i Sverige. Men i början av 1980-talet vandrade några vargar in från Finland och Ryssland, och i dag finns det några hundra i landet.",
          "Fårbonden Karin har satt upp ett nytt elstängsel runt hagen. – Förra sommaren hittade jag tre döda lamm. Sedan dess sover jag dåligt, säger hon.",
          "Samtidigt åker turister långt för att få höra vargarna yla i skymningen.",
        ],
        level2: [
          "För Karin är vargen ett hot mot det hon lever av. För turisterna är den en symbol för vild natur.",
        ],
        level3: [
          "Politikerna står mitt emellan. Hur många vargar ska Sverige ha, och vem ska bära kostnaden när vargen tar tamdjur? Frågan har delat landsbygd och stad i flera decennier.",
        ],
        glossary: [
          { term: "utrotad", meaning: "helt försvunnen" },
          { term: "skymning", meaning: "när det håller på att bli mörkt" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "pa_raderna",
          prompt: "Läs PÅ raderna: Varifrån kom vargarna som vandrade in till Sverige?",
          options: [
            { id: "A", text: "Från Norge och Danmark", isCorrect: false },
            { id: "B", text: "Från Finland och Ryssland", isCorrect: true },
            { id: "C", text: "Från Tyskland", isCorrect: false },
          ],
          correctFeedback: "Rätt! Det står ordagrant i första stycket. Du sökläste på raderna.",
          incorrectFeedback: "Rätt svar är B. Sökläs efter landsnamn i första stycket.",
          hint: {
            text: "Sökläs efter landsnamn i första stycket.",
            highlight: "vandrade några vargar in från Finland och Ryssland",
          },
        },
        {
          kind: "choice",
          category: "mellan_raderna",
          prompt: "Läs MELLAN raderna: Varför har Karin satt upp ett nytt elstängsel?",
          options: [
            { id: "A", text: "För att hålla turisterna borta.", isCorrect: false },
            {
              id: "B",
              text: "För att hon är rädd att vargar ska döda fler av hennes djur.",
              isCorrect: true,
            },
            { id: "C", text: "För att fåren brukar rymma.", isCorrect: false },
          ],
          correctFeedback:
            "Rätt! Texten säger inte varför, men du kopplade ihop stängslet med de döda lammen.",
          incorrectFeedback:
            "Rätt svar är B. Koppla ihop stängslet med att hon hittade tre döda lamm och sover dåligt.",
          hint: {
            text: "Texten säger inte rakt ut varför. Koppla ihop stängslet med vad hon hittade förra sommaren.",
            highlight: "hittade jag tre döda lamm",
          },
        },
        {
          kind: "free",
          category: "mellan_raderna",
          prompt:
            "Vad vill skribenten visa genom att berätta både om Karin och om turisterna? Dra en slutsats med stöd i texten.",
          placeholder: "Skribenten vill visa att ... eftersom ...",
          rubric:
            "Eleven drar slutsatsen att vargen väcker helt olika känslor hos olika grupper (hot mot försörjning vs. upplevelse av vild natur) och stöder med texten (döda lamm/sover dåligt vs. turister åker långt; ordet 'Samtidigt' markerar kontrast).",
          hint: {
            text: "Ordet 'Samtidigt' visar en kontrast. Vad tycker Karin om vargen, och vad tycker turisterna?",
            highlight: "Samtidigt",
          },
          fallbackFeedback: "Bra försök! Jämför Karins och turisternas syn på vargen.",
        },
      ],
      recallText: {
        title: "Igelkotten i trädgården",
        source: "Reportage",
        paragraphs: [
          "Varje kväll vid niotiden prasslar det i rabatten hos familjen Berg. Tolvårige Ali ligger på magen i gräset med en ficklampa som har rött filter.",
          "– Om man lyser med vanligt ljus springer den, viskar han.",
          "Igelkotten har han döpt till Sixten. Ali har ställt ut ett fat med kattmat och grävt ett litet hål under staketet, så att Sixten kan ta sig mellan trädgårdarna.",
        ],
        level2: [
          "Igelkottarna har blivit färre i Sverige, bland annat för att trädgårdar har blivit mer inhägnade och städade.",
        ],
        level3: [
          "I skolan har Ali hållit en redovisning om igelkottar. Efteråt grävde tre klasskamrater egna hål under sina staket. – Det känns som att Sixten har fått fler vägar att gå, säger Ali.",
        ],
      },
      recall: [
        {
          kind: "choice",
          category: "pa_raderna",
          prompt: "Vad har Ali ställt ut åt igelkotten?",
          options: [
            { id: "A", text: "Ett fat med kattmat", isCorrect: true },
            { id: "B", text: "Ett fat med mjölk", isCorrect: false },
            { id: "C", text: "En skål med frukt", isCorrect: false },
          ],
          correctFeedback: "Rätt! Du hittade det på raderna utan stöd.",
          incorrectFeedback: "Rätt svar är A: 'ett fat med kattmat'. Läs noga vad som faktiskt står.",
        },
        {
          kind: "free",
          category: "mellan_raderna",
          prompt:
            "Vad kan man förstå om vad Ali känner för igelkotten? Stöd din slutsats med ledtrådar ur texten.",
          rubric:
            "Eleven drar slutsatsen att Ali bryr sig mycket om/är omtänksam mot/fascinerad av igelkotten och stöder det med ledtrådar (varje kväll, rött ljus för att inte skrämma, viskar, har döpt den, ställer ut mat, gräver hål under staketet).",
          fallbackFeedback:
            "Leta efter vad Ali GÖR för igelkotten. Vad säger det om hans känslor?",
        },
      ],
    },
  },

  // --------------------------------------------------------------------------
  // BEFÄSTA – strategin ur minnet
  // --------------------------------------------------------------------------
  strategyRecall: {
    kind: "free",
    category: "mellan_raderna",
    prompt:
      "Svara ur minnet, utan text: Vad är skillnaden mellan att läsa PÅ raderna och MELLAN raderna? Berätta också när du skumläser, sökläser och närläser.",
    rubric:
      "Eleven förklarar att på raderna = information som står uttryckligen i texten, och mellan raderna = slutsatser som man drar genom att kombinera ledtrådar med egen logik. Eleven beskriver lästeknikerna: skumläsa för överblick, sökläsa efter specifik information, närläsa för djupare förståelse.",
    fallbackFeedback:
      "På raderna = det står i texten. Mellan raderna = du drar en slutsats av ledtrådar. Skumläs → sökläs → närläs.",
  },
};
