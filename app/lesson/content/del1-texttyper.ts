import type { FreeTask, PartDefinition } from "../types";

// Återkallning av texttyp – samma fråga oavsett intresse
const recallTexttyp: FreeTask = {
  kind: "free",
  category: "texttyp",
  prompt:
    "Vilken typ av sakprosatext är det här, och vad är syftet med den? Motivera med två drag från texten.",
  criteria: ["Rätt texttyp", "Syftet", "Två drag ur texten"],
  rubric:
    "Eleven identifierar rätt texttyp (nyhetsartikel = informera; debattartikel/insändare = påverka) och motiverar med två konkreta drag kopplade till texten. Nyhetsartikel: neutral ton, fakta/siffror, det viktigaste först, citat från källa. Debattartikel/insändare: tes/krav, argument, värdeladdade ord, retoriska frågor, uppmaning, avsändare.",
  fallbackFeedback:
    "Tänk på: Vill texten informera neutralt eller påverka? Peka sedan på två konkreta drag i texten.",
};

export const DEL1: PartDefinition = {
  part: 1,
  title: "Texttypers särdrag",
  goal: "Känna igen vad en sakprosatext vill (informera eller påverka) och visa det med drag ur texten.",
  bridge:
    "I den här delen lär du dig se vad en text vill: informera eller påverka. Då vet du hur du ska läsa den.",

  // --------------------------------------------------------------------------
  // MODELLERING
  // --------------------------------------------------------------------------
  model: {
    text: {
      title: "Rädda fritidsgården!",
      source: "Insändare i lokaltidningen",
      paragraphs: [
        "Hur länge ska kommunen ignorera ungdomars behov av mötesplatser? Att stänga fritidsgården i centrum är ett svek mot ungas trygghet och hälsa.",
        "Fritidsgården är den enda platsen i stan där vi kan träffas utan att det kostar pengar. Utan den hamnar många av oss ensamma hemma eller ute på gatan.",
        "Vi kräver att beslutet rivs upp omgående så att alla har en meningsfull fritid!",
      ],
      signature: "/ Elevrådet på Centrumskolan",
    },
    thinkAloud: {
      kind: "think_aloud",
      category: "texttyp",
      intro:
        "Nu tänker jag högt och visar hur jag tar reda på vilken sorts text det här är. Följ med i texten till höger – jag markerar det jag lägger märke till.",
      thoughts: [
        {
          label: "Kolla avsändaren",
          text: "Först kollar jag var texten kommer ifrån. Det står 'Insändare', och elevrådet har skrivit under. Då vet jag redan att någon säger vad de tycker. Det är ingen neutral nyhet.",
          highlight: "/ Elevrådet på Centrumskolan",
        },
        {
          label: "Retorisk fråga",
          text: "Texten börjar med en fråga som inte väntar på något svar, en retorisk fråga. Den finns där för att väcka känslor hos mig som läser.",
          highlight: "Hur länge ska kommunen ignorera ungdomars behov av mötesplatser?",
        },
        {
          label: "Värdeladdat ord",
          text: "Ordet 'svek' är värdeladdat. En nyhetstext hade skrivit 'kommunen har beslutat att stänga', inte kallat det ett svek.",
          highlight: "svek",
        },
        {
          label: "Argument",
          text: "Här kommer ett argument: gården är gratis, och utan den blir unga ensamma. Ett argument är ett skäl som ska stödja åsikten.",
          highlight: "den enda platsen i stan där vi kan träffas utan att det kostar pengar",
        },
        {
          label: "Tesen och uppmaningen",
          text: "Till sist kommer 'Vi kräver...'. Det är tesen, alltså huvudåsikten, och den slutar med en uppmaning.",
          highlight: "Vi kräver att beslutet rivs upp omgående",
        },
      ],
      summary:
        "Slutsats: Tes + argument + värdeladdade ord + uppmaning = en argumenterande text, här en insändare. Syftet är att påverka. En nyhetsartikel vill i stället informera och är neutral.",
    },
    example: {
      kind: "choice",
      category: "texttyp",
      prompt: "Vilket svar visar bäst vilken texttyp det är?",
      // Edda säger uppgiften. På tavlan står bara frågan och svaren.
      say:
        "Två elever svarade på frågan: vilken texttyp är det, och hur vet du det? Läs båda svaren. Vilket visar bäst att eleven kan texttypens särdrag?",
      options: [
        {
          id: "A",
          text: "Det är en insändare för att skribenten verkar arg.",
          isCorrect: false,
        },
        {
          id: "B",
          text: "Det är en insändare. Skribenten driver en tes (\"Vi kräver att beslutet rivs upp\"), ger argument och använder värdeladdade ord som \"svek\".",
          isCorrect: true,
        },
      ],
      correctFeedback:
        "Rätt! Svar B säger vilken texttyp det är OCH bevisar det med konkreta drag ur texten: tes, argument och värdeladdade ord. Så ser ett starkt svar ut.",
      incorrectFeedback:
        "Svar B är starkare. Svar A gissar utifrån en känsla, medan svar B pekar på konkreta drag i texten: tes, argument och värdeladdade ord.",
    },
  },

  // --------------------------------------------------------------------------
  // TRÄNA SJÄLV + ÅTERKALLA – per intresse
  // --------------------------------------------------------------------------
  themes: {
    sport: {
      practiceText: {
        title: "Gör idrotten gratis för alla unga",
        source: "Debattartikel",
        paragraphs: [
          "Alla barn borde få chansen att idrotta, oavsett hur mycket pengar familjen har. Ändå kostar en säsong i en fotbollsklubb ofta flera tusen kronor. Det är orimligt.",
          "Därför kräver vi att kommunen betalar medlemsavgiften för alla under 16 år. Rörelse gör att unga mår bättre, sover bättre och klarar skolan bättre.",
        ],
        level2: [
          "Den som tycker att det blir för dyrt glömmer en sak: det kostar betydligt mer för samhället när unga mår dåligt och blir stillasittande.",
        ],
        level3: [
          "Kommuner som redan har infört avgiftsfri idrott för unga berättar om fler aktiva barn och färre avhopp. Det är dags att följa deras exempel, innan ännu fler barn lämnar idrotten för gott.",
        ],
        glossary: [
          { term: "orimligt", meaning: "inte rimligt, inte rättvist" },
          { term: "medlemsavgift", meaning: "pengar man betalar för att vara med i en klubb" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "texttyp",
          prompt: "Din tur! Vilken typ av sakprosatext är det här?",
          options: [
            { id: "A", text: "En nyhetsartikel som informerar neutralt.", isCorrect: false },
            { id: "B", text: "En debattartikel som vill påverka.", isCorrect: true },
            { id: "C", text: "En instruktion som förklarar hur man gör.", isCorrect: false },
          ],
          correctFeedback:
            "Rätt! Skribenten kräver en förändring och ger argument för den. Det är typiskt för en debattartikel.",
          incorrectFeedback:
            "Rätt svar är B. Texten tar ställning ('Det är orimligt', 'vi kräver'). En nyhetsartikel skulle vara neutral.",
          hint: {
            text: "Leta efter ett ord som visar att skribenten vill att något ska förändras.",
            highlight: "Därför kräver vi",
          },
        },
        {
          kind: "free",
          category: "texttyp",
          prompt:
            "Ge två drag i texten som visar att det är en debattartikel. Citera eller hänvisa till texten, precis som i det bra exemplet.",
          placeholder: "Ett drag är ... till exempel när det står '...'. Ett annat drag är ...",
          rubric:
            "Eleven namnger två relevanta särdrag för debattartikel (tes/krav, argument, värdeladdade ord som 'orimligt', uppmaning) och kopplar dem till konkreta ställen i texten.",
          remodel:
            {
              say: "Jag letar efter drag som visar att någon tycker något. 'Det är orimligt' är ett värdeladdat ord, och 'vi kräver' är ett krav. Det är två drag, och båda hör till en debattartikel.",
              points: [
                { label: "Värdeladdat ord", highlight: "Det är orimligt." },
                { label: "Krav", highlight: "kräver vi" },
              ],
            },
          hint: {
            text: "Tänk på modellen: tes, argument och värdeladdade ord. Vilket ord visar vad skribenten tycker om priset?",
            highlight: "Det är orimligt.",
          },
          fallbackFeedback:
            "Bra försök! Peka ut tesen ('vi kräver...') och ett värdeladdat ord som 'orimligt'.",
        },
      ],
      recallText: {
        title: "Rekordmånga tjejer spelar fotboll",
        source: "Nyhetsartikel",
        paragraphs: [
          "Antalet tjejer som spelar fotboll i föreningar har ökat med 15 procent på två år, enligt en ny undersökning. Störst är ökningen bland flickor mellan 10 och 13 år.",
          "– Vi ser en tydlig effekt efter damlandslagets framgångar, säger Sara Lind, som arbetar med ungdomsfotboll.",
        ],
        level2: [
          "Flera klubbar uppger att de har fått starta nya lag under hösten för att alla ska få plats.",
        ],
        level3: [
          "Samtidigt rapporterar en del föreningar brist på planer och ledare, vilket kan bli ett problem om ökningen fortsätter i samma takt.",
        ],
      },
      recall: [recallTexttyp],
    },

    gaming: {
      practiceText: {
        title: "Skola startar e-sportprofil",
        source: "Nyhetsartikel",
        paragraphs: [
          "Från och med hösten kan elever på Norrby gymnasium välja e-sport som profil. Utbildningen omfattar fem timmar i veckan med spelträning, taktik och fysisk träning.",
          "– Många tror att e-sport bara handlar om att sitta still, men våra elever kommer också att träna kondition och lära sig om sömn, säger rektor Amir Haddad.",
        ],
        level2: ["Intresset är stort: över 200 elever har redan sökt till de 30 platserna."],
        level3: [
          "Det finns inga nationella regler för hur en e-sportprofil ska se ut, utan varje skola utformar innehållet själv. Kritiker menar att det kan leda till stora skillnader i kvalitet mellan skolorna.",
        ],
        glossary: [
          { term: "profil", meaning: "en inriktning man kan välja i skolan" },
          { term: "omfattar", meaning: "innehåller" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "texttyp",
          prompt: "Din tur! Vilken typ av sakprosatext är det här?",
          options: [
            { id: "A", text: "En nyhetsartikel som informerar.", isCorrect: true },
            { id: "B", text: "En debattartikel som vill påverka.", isCorrect: false },
            { id: "C", text: "En berättelse med påhittade personer.", isCorrect: false },
          ],
          correctFeedback:
            "Rätt! Texten berättar neutralt vad som händer, var och när. Den som tycker något är rektorn, och han citeras. Skribenten tar inte själv ställning.",
          incorrectFeedback:
            "Rätt svar är A. Skribenten tar inte ställning. Texten berättar vad, var och när och låter en källa (rektorn) komma till tals.",
          hint: {
            text: "Tar skribenten själv ställning? Titta på vem som uttrycker en åsikt: är det skribenten eller någon som citeras?",
            highlight: "säger rektor Amir Haddad",
          },
        },
        {
          kind: "free",
          category: "texttyp",
          prompt:
            "Ge två drag i texten som visar att det är en nyhetsartikel. Hänvisa till texten, precis som i det bra exemplet.",
          placeholder: "Ett drag är ... till exempel ... Ett annat drag är ...",
          rubric:
            "Eleven namnger två relevanta särdrag för nyhetsartikel (neutral ton, fakta om vad/var/när direkt i början, citat från källa, skribenten tar inte ställning) och kopplar dem till texten.",
          remodel:
            {
              say: "Jag tittar på första meningen. Där får jag veta vad, var och när direkt, utan att skribenten tycker något. Sedan citeras rektorn, som är en källa. Neutral ton och citat från en källa är två drag i en nyhetsartikel.",
              points: [
                { label: "Vad, var och när direkt", highlight: "Från och med hösten kan elever på Norrby gymnasium välja e-sport som profil." },
                { label: "Citat från en källa", highlight: "säger rektor Amir Haddad" },
              ],
            },
          hint: {
            text: "Titta på första meningen: vad, var och när får du veta direkt? Och vem är det som citeras?",
            highlight:
              "Från och med hösten kan elever på Norrby gymnasium välja e-sport som profil.",
          },
          fallbackFeedback:
            "Bra försök! Lyft fram att det viktigaste (vad, var, när) kommer först och att en källa citeras.",
        },
      ],
      recallText: {
        title: "Låt e-sport bli en riktig idrott",
        source: "Debattartikel",
        paragraphs: [
          "Det är hög tid att e-sport räknas som idrott. Den som tävlar på hög nivå tränar flera timmar om dagen, behöver snabba reflexer och måste samarbeta i laget, precis som i fotboll.",
          "Ändå får e-sportföreningar sällan del av kommunernas idrottsbidrag. Det är ett hån mot tusentals unga som brinner för sin sport. Ge e-sporten samma villkor nu!",
        ],
        level2: [
          "Många föräldrar ser fortfarande spelande som slöseri med tid, men e-sport lär unga strategi, kommunikation och att hantera press.",
        ],
        level3: [
          "Den som invänder att e-sport saknar fysisk ansträngning bör minnas att även skytte och schack i olika sammanhang har räknats som idrott. Frågan handlar alltså inte om svett, utan om tävling, träning och gemenskap.",
        ],
      },
      recall: [recallTexttyp],
    },

    natur: {
      practiceText: {
        title: "Därför är bina viktiga",
        source: "Faktatext",
        paragraphs: [
          "Ungefär en tredjedel av den mat vi äter är beroende av att insekter pollinerar växterna. Bin flyger från blomma till blomma och för med sig pollen, vilket gör att växterna kan bilda frukt och frön.",
          "I Sverige finns nästan 300 olika arter av bin. De flesta lever ensamma och bygger bon i marken eller i gamla trästammar.",
        ],
        level2: [
          "Det tama honungsbiet är bara en av arterna. Vilda bin är minst lika viktiga för pollineringen, särskilt för vilda växter.",
        ],
        level3: [
          "Under de senaste decennierna har många vilda biarter minskat. Forskare pekar på flera samverkande orsaker, bland annat att blomrika ängar har försvunnit och att bekämpningsmedel används i jordbruket.",
        ],
        glossary: [
          { term: "pollinera", meaning: "föra pollen mellan blommor så att de kan bilda frön" },
          { term: "art", meaning: "en sorts djur eller växt" },
        ],
      },
      practice: [
        {
          kind: "choice",
          category: "texttyp",
          prompt: "Din tur! Vilken typ av sakprosatext är det här?",
          options: [
            { id: "A", text: "En debattartikel som vill påverka.", isCorrect: false },
            { id: "B", text: "En nyhetsartikel om något som just har hänt.", isCorrect: false },
            { id: "C", text: "En faktatext som informerar och förklarar.", isCorrect: true },
          ],
          correctFeedback:
            "Rätt! Texten förklarar hur något fungerar, med fakta och siffror och utan åsikter. Det är en informerande faktatext.",
          incorrectFeedback:
            "Rätt svar är C. Texten tar inte ställning och handlar inte om en ny händelse. Den förklarar hur pollinering fungerar.",
          hint: {
            text: "Handlar texten om något som just har hänt, om en åsikt eller om hur något fungerar?",
            highlight: "vilket gör att växterna kan bilda frukt och frön",
          },
        },
        {
          kind: "free",
          category: "texttyp",
          prompt:
            "Ge två drag i texten som visar att det är en informerande faktatext. Hänvisa till texten.",
          placeholder: "Ett drag är ... till exempel ... Ett annat drag är ...",
          rubric:
            "Eleven namnger två särdrag för informerande/förklarande text (neutral ton, fakta och siffror, förklarar samband med t.ex. 'vilket gör att', fackord, inga åsikter) och kopplar dem till texten.",
          remodel:
            {
              say: "Jag letar efter fakta och förklaringar. 'Ungefär en tredjedel' är en siffra, och 'vilket gör att' förklarar hur något hänger ihop. Jag hittar ingen åsikt. Det är två drag i en faktatext.",
              points: [
                { label: "Fakta med siffror", highlight: "Ungefär en tredjedel" },
                { label: "Förklarar samband", highlight: "vilket gör att" },
              ],
            },
          hint: {
            text: "Leta efter siffror och ord som förklarar hur något hänger ihop, till exempel 'vilket gör att'.",
            highlight: "Ungefär en tredjedel",
          },
          fallbackFeedback:
            "Bra försök! Peka på siffrorna (en tredjedel, 300 arter) och på hur texten förklarar samband.",
        },
      ],
      recallText: {
        title: "Sluta såga ner vår skog!",
        source: "Insändare",
        paragraphs: [
          "Varje vecka försvinner mer av skogen bakom vår skola. Där har vi sett rådjur, ugglor och hackspettar. Nu blir det kalhyggen i stället.",
          "Är det verkligen värt att förstöra djurens hem för några kronor till? Vi uppmanar markägaren och kommunen att stoppa avverkningen innan det är för sent.",
        ],
        level2: [
          "Skogen är också vår plats för friluftsdagar och idrottslektioner. Utan den förlorar hela skolan något värdefullt.",
        ],
        level3: [
          "Den som påstår att skogen ändå växer upp igen glömmer att det tar flera generationer innan en gammal skog med alla sina arter är tillbaka. Ett kalhygge går att göra på en dag, men det går inte att ångra.",
        ],
        signature: "/ Klass 8B, Björkskolan",
      },
      recall: [recallTexttyp],
    },
  },

  // --------------------------------------------------------------------------
  // BEFÄSTA – strategin ur minnet
  // --------------------------------------------------------------------------
  strategyRecall: {
    kind: "free",
    category: "texttyp",
    prompt:
      "Svara ur minnet, utan text: Hur tar du reda på om en sakprosatext vill påverka eller informera? Nämn minst tre saker du letar efter.",
    criteria: ["Tre saker att leta efter"],
    rubric:
      "Eleven nämner minst tre relevanta kännetecken. Påverkande text: tes/åsikt, argument, värdeladdade ord, retoriska frågor, uppmaning, avsändare som tar ställning. Informerande text: neutral ton, fakta/siffror, citat från källor, svarar på vad/var/när, förklarar samband.",
    fallbackFeedback:
      "Tänk på tes, argument och värdeladdade ord (påverka) och på neutral ton, fakta och källor (informera).",
  },
};
