# CLAUDE.md – AI-driven app för läsförståelse

@AGENTS.md

> **Den pedagogiska progressionen är projektets kärna.**
> Modellering → Guidad träning → Självständig träning → Återkallning utan stöd → Befästa kunskap.
> Ingen implementation får förenkla bort den. Den ska finnas i alla fyra lärmoment och styra hur AI-handledaren, whiteboarden, textbanken och bedömningsmotorn fungerar.

---

## 1. Projektbeskrivning

Vi utvecklar en AI-driven, adaptiv lärplattform för läsförståelse.

Appen ska hjälpa elever att utveckla sin läsförståelse genom strukturerad undervisning, aktiv träning och gradvis ökad självständighet. Eleven ska inte bara träna på att besvara frågor om texter, utan lära sig strategier för att:

- förstå olika typer av sakprosatexter
- läsa aktivt och använda olika lässtrategier
- läsa på, mellan och bortom raderna
- identifiera relevant information
- sammanfatta textinnehåll
- resonera och utveckla svar med stöd från texten
- självständigt tillämpa sina kunskaper i nya texter.

AI:n fungerar som en **pedagogisk handledare**. Den modellerar strategier, vägleder eleven och minskar stödet successivt tills eleven kan använda strategierna helt självständigt.

Den övergripande ambitionen är att eleven stegvis ska utveckla en läsförmåga som gör det möjligt att förstå och analysera längre och mer komplexa sakprosatexter, på en nivå som närmar sig texterna och uppgifterna i svenska nationella prov.

**Målet är inte att eleven ska bli bättre på att svara på AI-genererade frågor. Målet är att eleven ska bli en självständig, aktiv och reflekterande läsare som kan förstå, analysera, sammanfatta och resonera kring nya texter utan hjälp.**

---

## 2. Pedagogisk grundfilosofi

Progressionen gäller i alla fyra undervisningsmoment:

| Fas | Vem gör vad | Stöd |
|---|---|---|
| 1. Modellering | AI:n visar och förklarar | Fullt |
| 2. Guidad träning | AI:n och eleven arbetar tillsammans | Ledtrådar och följdfrågor |
| 3. Självständig träning | Eleven arbetar på en ny text | Återhållsamt |
| 4. Återkallning utan stöd | Eleven använder strategin själv | Inget. Bedöms först efter inlämning |
| 5. Befästa kunskap | Eleven visar kunskapen i ett nytt sammanhang | Återkoppling och reflektion |

Eleven ska få möjlighet att:

- se hur en skicklig läsare arbetar
- förstå varför en viss strategi används
- träna med stöd
- träna självständigt
- återkalla och tillämpa kunskapen utan stöd
- visa att kunskapen fungerar i nya sammanhang.

**AI:n är en handledare, inte en svarsmaskin.** Den ska aldrig vara snabb med att ge svaret. I första hand använder den vägledande frågor och ledtrådar som hjälper eleven att själv komma fram till lösningen.

### 2.1 Modellering

AI:n visar hur en uppgift kan lösas. Den ska:

- visa ett tydligt exempel på önskat resultat
- förklara strategin steg för steg
- peka ut viktiga delar av texten
- visa hur man hittar information och drar slutsatser
- förklara varför olika val görs.

AI:n ska visa en pedagogiskt begriplig lösningsprocess. Den ska inte påstå att den visar sin privata, interna tankekedja.

### 2.2 Guidad träning

Eleven tränar på en liknande uppgift. AI:n ska:

- ställa en fråga i taget
- ge ledtrådar vid behov
- hjälpa eleven att hitta rätt information
- ställa följdfrågor
- uppmuntra eleven att motivera sina svar.

### 2.3 Självständig träning

Eleven får en ny text och en ny uppgift. AI:n är återhållsam med stöd. Eleven ska få tänka, prova och göra misstag.

### 2.4 Återkallning utan stöd

Eleven använder självständigt den strategi som har tränats. Under fasen gäller:

- inga ledtrådar
- inga modellerade svar
- ingen vägledning under arbetet
- AI:n avslöjar inte vilken strategi som ska användas.

AI:n utvärderar svaret först efter att eleven har lämnat in.

### 2.5 Befästa kunskapen

Eleven visar att kunskapen fungerar i ett nytt sammanhang. AI:n ska:

- ge återkoppling
- identifiera styrkor och utvecklingsområden
- låta eleven förklara vad hen har lärt sig
- vid behov planera mer repetition.

---

## 3. Lärandeflödet: fem huvudmoment

Moment 1–4 följer femstegsprogressionen i avsnitt 2. Moment 5 är slutdiagnosen (avsnitt 4).

### Moment 1 – Texttypers särdrag: sakprosa

**Lärandemål:** Eleven förstår vad sakprosa är, hur sakprosatexter är uppbyggda och vad som skiljer dem från andra texttyper. Eleven kan:

- identifiera sakprosa
- förstå textens syfte
- identifiera avsändare och mottagare
- känna igen rubrik, ingress, underrubriker och faktarutor
- skilja mellan fakta, åsikter och exempel
- förstå hur textens struktur hjälper läsaren.

| Fas | Innehåll |
|---|---|
| Modellering | AI:n analyserar en kort sakprosatext. Den visar hur rubriken används för att förutse innehållet, hur man identifierar syftet och hur man känner igen sakprosans kännetecken och textens struktur. |
| Guidad träning | Ny text. Frågor: Vad handlar texten om? Vad vill författaren uppnå? Vem kan vara mottagaren? Vilka delar innehåller fakta? Finns det åsikter? Hur hjälper underrubrikerna läsaren? Vilka kännetecken visar att det är sakprosa? |
| Självständig träning | Ny text. Eleven identifierar texttypen, beskriver syftet, hittar tre kännetecken och förklarar hur strukturen fungerar. |
| Återkallning | Helt ny text. Eleven besvarar frågor om texttyp, syfte, struktur, fakta och åsikter samt kännetecken. |
| Befästa | Eleven förklarar vad sakprosa är och identifierar texttypen i nya sammanhang. |

### Moment 2 – Lästeknik: läsa på, mellan och bortom raderna

**Lärandemål:** Eleven använder olika lässtrategier för att förstå innehållet, dra slutsatser och tolka underförstådd information. Moment 2 tränar tre läsnivåer:

- **På raderna:** hitta information som uttryckligen står i texten, identifiera fakta och detaljer, hitta svar på direkta frågor.
- **Mellan raderna:** dra slutsatser utifrån ledtrådar, tolka känslor och avsikter, förstå samband som inte uttrycks direkt, kombinera flera delar av texten.
- **Bortom raderna:** reflektera över innehållet, värdera information, resonera kring konsekvenser, relatera innehållet till större sammanhang, motivera tolkningar med stöd från texten.

| Fas | Innehåll |
|---|---|
| Modellering | AI:n visar de tre läsnivåerna med konkreta exempel: hur man hittar direkta svar, upptäcker ledtrådar, drar rimliga slutsatser och använder textinformation för att tolka. |
| Guidad träning | Korta texter. Frågor: Vad får du veta direkt? Vilka ledtrådar hittar du? Vilken slutsats kan du dra? Vilka ord eller meningar hjälper dig? Kan det finnas fler rimliga tolkningar? Hur vet du att slutsatsen stämmer med texten? |
| Självständig träning | Längre texter med blandade frågor som kräver informationssökning, inferenser, tolkning, förståelse av samband och reflektion. |
| Återkallning | Ny text. Eleven får inte veta vilken strategi som ska användas utan väljer själv lässtrategi. |
| Befästa | Eleven förklarar skillnaden mellan de tre läsnivåerna och visar att strategierna fungerar i nya texter. |

### Moment 3 – Sammanfatta det viktigaste och hitta relevant information

**Lärandemål:** Eleven identifierar huvudbudskap, väljer ut relevant information och skiljer viktiga detaljer från mindre viktiga. Eleven kan:

- identifiera vad ett stycke handlar om
- hitta huvudbudskapet
- identifiera nyckelinformation
- skilja huvudinformation från exempel
- välja relevant information för att besvara frågor
- sammanfatta med egna ord
- undvika oväsentliga detaljer.

| Fas | Innehåll |
|---|---|
| Modellering | AI:n visar arbetsgången på whiteboarden: läs rubriken → identifiera ämnet → läs varje stycke → hitta huvudbudskapet per stycke → markera viktig information → skilj huvudinformation från exempel → välj information som frågan kräver → formulera en sammanfattning med egna ord. |
| Guidad träning | Frågor: Vad handlar texten huvudsakligen om? Vad är viktigast i första stycket? Vilka detaljer är exempel? Vilken information behövs för att svara på frågan? Vad kan väljas bort? Kan du sammanfatta stycket i en mening, och hela texten i tre? Eleven övar också på att **markera textdelar** som besvarar specifika frågor. |
| Självständig träning | Ny text. Eleven identifierar huvudbudskapet, väljer ut de viktigaste uppgifterna, sorterar relevant och irrelevant information, besvarar frågor med textstöd och skriver en egen sammanfattning. |
| Återkallning | Ny text utan markerade nyckelord eller vägledning. Eleven identifierar huvudbudskapet, hittar relevant information, motiverar varför den är relevant och sammanfattar självständigt. |
| Befästa | Eleven visar självständigt hur man går från en längre text till en kort och relevant sammanfattning. |

### Moment 4 – Resonera och utveckla svar med stöd från texten

**Lärandemål:** Eleven formulerar utvecklade svar, använder textbelägg och motiverar sina slutsatser. Eleven kan:

- besvara frågor tydligt
- använda information från texten
- hänvisa till relevanta exempel
- förklara varför informationen stödjer svaret
- resonera kring orsaker och konsekvenser
- jämföra olika perspektiv
- utveckla resonemang.

**Svarstrappan** är grundmodellen:

1. **SVARA:** formulera ett tydligt svar.
2. **BELÄGG:** använd information från texten.
3. **FÖRKLARA:** förklara varför informationen stödjer svaret.
4. **FÖRDJUPA:** utveckla resonemanget med fler perspektiv, samband eller konsekvenser.

| Fas | Innehåll |
|---|---|
| Modellering | AI:n visar skillnaden mellan ett enkelt svar, ett utvecklat svar, ett svar med textbelägg och ett resonemang med flera perspektiv. Den förklarar vad som gör ett svar välutvecklat. |
| Guidad träning | Frågor: Vad tror du är orsaken? Vilken information i texten stödjer ditt svar? Kan du ge ett konkret exempel? Varför är exemplet relevant? Vad kan konsekvenserna bli? Finns det fler perspektiv? Kan du utveckla resonemanget mer? |
| Självständig träning | Ny text. Eleven formulerar egna utvecklade svar. AI:n ger inga färdiga formuleringar. |
| Återkallning | Nya frågor. Eleven svarar, hittar textbelägg, förklarar sambandet och utvecklar resonemanget. Ingen svarsmall visas. |
| Befästa | Ny text. Eleven visar att hen kan använda svarstrappan självständigt. |

---

## 4. Slutdiagnos

Efter de fyra momenten gör eleven en slutdiagnos som mäter den självständiga läsförståelsen.

**Under diagnosen får eleven inte** AI-hjälp, ledtrådar, modellerade exempel, svarsmallar eller automatiska förklaringar. AI:n analyserar svaren först efter inlämning.

**Innehåll:**

- en längre och mer komplex sakprosatext som närmar sig nationella provens texter och krav
- cirka **12–16 frågor** med varierande svårighetsgrad, som testar:
  - texttyp och textstruktur
  - direkt informationssökning
  - läsning mellan raderna
  - läsning bortom raderna
  - huvudbudskap och sammanfattning
  - urval av relevant information
  - textbelägg
  - utvecklade resonemang.

**Bedömning:**

- Varje kunskapsområde bedöms för sig.
- Bedömningen tar hänsyn till korrekthet, förståelse, relevans, textbelägg, förmåga att dra slutsatser, hur utvecklade resonemangen är och självständighet.
- AI:n ska kunna skilja verklig kunskap från ytlig förståelse.
- Bedömningen ska bygga på tydliga kriterier, inte bara på en generell AI-genererad poäng.

**Resultatet visar:** elevens styrkor, utvecklingsområden, resultat per kunskapsområde och rekommenderade nästa steg.

---

## 5. Adaptivitet och individuell progression

Innehåll och uppgifter anpassas efter två **separata** dimensioner:

1. **Läsförmåga**
2. **Ämnesintresse**

Intresset ska göra läsningen mer engagerande, men får aldrig ersätta utvecklingen av läsförmågan.

### Textprogression (illustrativ nivåmodell)

| Nivå | Beskrivning |
|---|---|
| 1 | Korta och konkreta texter |
| 2 | Lite längre texter med tydlig struktur |
| 3 | Mer komplexa texter och svårare ordförråd |
| 4 | Längre texter med flera perspektiv och mer avancerade slutsatser |
| 5 | Sakprosatexter i stil med nationella provet |

Nivåerna får inte bygga enbart på textlängd. Ta också hänsyn till ordförråd, meningsbyggnad, informationstäthet, textstruktur, krav på inferenser, antal perspektiv och kognitiv komplexitet.

### Intresseanpassning

I introduktionen väljer eleven intresseområden, till exempel sport, djur, natur, rymden, teknik, gaming, historia, musik, samhälle och vetenskap. AI:n ska successivt kunna bredda elevens intressen genom att introducera närliggande ämnen.

### Anpassning efter resultat

AI:n analyserar:

- rätt och fel svar
- hur eleven motiverar sina svar
- om eleven använder textbelägg
- om eleven behöver ledtrådar
- om eleven klarar uppgifter utan stöd
- om eleven kan tillämpa kunskapen i nya sammanhang.

**Självständighet väger tungt.** En elev som svarar rätt med mycket stöd ska inte räknas som lika självständig som en elev som löser uppgiften utan hjälp.

---

## 6. Whiteboard och gränssnitt

Gränssnittet har tre huvudsakliga arbetsytor.

### 6.1 Whiteboard

Används för AI-modellering, markeringar, tankekartor, exempel, sammanfattningar, sortering av information, elevens eget arbete och visuell återkoppling.

Whiteboarden ändras beroende på fas:

| Fas | Whiteboardens roll |
|---|---|
| Modellering | AI:n visar och förklarar |
| Guidad träning | AI:n och eleven arbetar tillsammans |
| Självständig träning | Eleven arbetar själv med begränsat stöd |
| Återkallning | Fri från vägledning och färdiga svar |
| Återkoppling | AI:n visar vad som fungerade och vad som kan utvecklas |

### 6.2 Textyta

Texten visas bredvid whiteboarden. Textytan har:

- läsvänlig typografi
- tydlig styckeindelning, rubriker och underrubriker
- markering av text
- möjlighet att anteckna
- möjlighet att välja textdelar som stöd för svar.

### 6.3 AI-handledare

AI:n finns i en **separat konversationsyta**. Den ska:

- förklara uppgifter
- ställa frågor
- ge ledtrådar
- anpassa språket till eleven
- ge uppmuntrande återkoppling
- anpassa stödnivån efter elevens progression.

AI:n tar aldrig över elevens arbete.

---

## 7. Textbank och textdata

Appen använder en strukturerad textbank. Varje text har metadata som gör det möjligt att hitta och anpassa innehåll:

```json
{
  "id": "text_001",
  "title": "Varför behöver vi bin?",
  "genre": "sakprosa",
  "topic": "natur",
  "difficulty": 2,
  "word_count": 350,
  "reading_features": {
    "vocabulary": "intermediate",
    "sentence_complexity": "medium",
    "information_density": "medium",
    "inference_level": "medium"
  },
  "learning_objectives": ["hitta_information", "dra_slutsatser", "sammanfatta", "resonera"]
}
```

Varje text kopplas till lärandemål, modelleringsexempel, guidad träning, självständiga uppgifter, återkallningsuppgifter, facit, bedömningskriterier, ledtrådar och svårighetsgrad.

- Börja med ett begränsat antal kvalitetssäkrade texter.
- AI-genererade texter och frågor ska uppfylla samma pedagogiska kvalitetskrav som övrigt material.
- Alla texter ska vara originaltexter eller ha rättigheter som tillåter användningen.
- Fakta i texterna ska stämma. Hitta inte på statistik och tillskriv den inte verkliga organisationer.

---

## 8. Elevprofil och kunskapsminne

Appen sparar en individuell lärandeprofil med:

- genomförda moment
- resultat per lärandemål
- vilka strategier eleven behärskar
- återkommande svårigheter
- antal och typ av ledtrådar
- självständighetsgrad
- textnivå
- intresseområden
- rekommenderade repetitionsmoment.

AI:n använder profilen för att anpassa undervisningen. Eleven ska inte behöva börja om vid varje inloggning.

Profilen skiljer mellan kunskap som eleven:

1. visar **med stöd**
2. visar **självständigt**
3. **ännu inte** har etablerat.

**Repetition:** Tidigare färdigheter ska återkomma i nya texter. Använd repetition med mellanrum för att kontrollera att eleven behåller kunskapen över tid.

---

## 9. Bedömningsprinciper

Bedömningen ska vara formativ och pedagogiskt användbar. AI:n ska:

- ge specifik återkoppling
- förklara vad eleven har gjort bra
- visa vad som saknas
- ge konkreta förslag på förbättringar
- undvika generella kommentarer som bara säger att svaret är bra eller dåligt.

Svar bedöms utifrån förståelse av frågan, relevans, textförankring, slutsatser, resonemang och självständighet. Olika frågetyper har olika bedömningskriterier.

- **Förväxla inte språklig korrekthet med läsförståelse.** Ett svar på enkel svenska kan visa mycket god läsförståelse.
- Är bedömningen osäker ska AI:n inte dra långtgående slutsatser. Markera då att svaret behöver granskas.

---

## 10. UX- och designprinciper

Appen ska upplevas som trygg, motiverande, tydlig och modern, lekfull utan att bli barnslig, och tillgänglig för elever med olika läsförmåga.

- Överbelasta inte eleven med information.
- Visa en uppgift i taget när det är pedagogiskt lämpligt.
- Gör det tydligt var eleven befinner sig, vad hen tränar på, vad nästa steg är och vad hen har lärt sig.
- Progressionen ska vara synlig och begriplig.
- Prioritera läsbarhet och fokus.

---

## 11. Tekniska och säkerhetsmässiga principer

- Separera pedagogisk logik från användargränssnittet.
- Separera textdata från applikationskoden.
- Gör AI-funktionerna modulära.
- Skapa tydliga gränssnitt mellan AI, textbank och bedömningsmotor.
- Spara elevens progression strukturerat.
- Gör det möjligt att testa den pedagogiska logiken separat från AI-modellen.
- Undvik onödiga externa beroenden.
- Gör inga obefogade antaganden om ramverk, databaser eller AI-leverantör vid nya arkitekturval. Analysera och föreslå först.

Målgruppen kan vara barn. Ta därför särskild hänsyn till:

- dataminimering och integritet
- åldersanpassat innehåll
- säker hantering av elevdata och personuppgifter
- behörigheter
- säker AI-interaktion.

AI:n ska aldrig be eleven lämna ut känsliga personuppgifter. API-nycklar ligger i `.env.local` och får aldrig skickas till klienten eller checkas in.

---

## 12. Nuläge: prototypen jämfört med specifikationen

Prototypen är en **Next.js-app** (se `@AGENTS.md`: läs Next-dokumentationen i `node_modules/next/dist/docs/` innan du skriver Next-kod). Den använder **OpenAI** för bedömning av fritextsvar och **ElevenLabs** för uppläsning.

### Struktur i dag

```
app/
├── page.tsx                  # UI: whiteboard + textkort, steglogik, ljud
├── api/
│   ├── whiteboard/route.ts   # AI-bedömning av fritextsvar (OpenAI, strikt JSON)
│   └── tts/route.ts          # Uppläsning via ElevenLabs
└── lesson/
    ├── types.ts              # Typer: steg, uppgifter, texter, faser
    ├── flow.ts               # Bygger flödet, nivåanpassning, intressen
    └── content/              # Textbank: en fil per moment + diagnos
        ├── del1-texttyper.ts
        ├── del2-lasteknik.ts
        ├── del3-sammanfatta.ts
        ├── del4-resonera.ts
        └── diagnos.ts
```

### Verifiering

| Kommando | Kontrollerar |
|---|---|
| `npm test` | Vitest: lärlogik (`tests/lesson/flow.test.ts`) och innehållskvalitet (`tests/lesson/content.test.ts`) |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run eval` | AI-bedömningen mot svarssamlingen i `tests/eval/svarssamling.ts` (85 påhittade svar med förbestämt facit). Anropar riktig AI och kostar pengar, så kör den när bedömningsprompten eller modellen i `app/ai/evaluate.ts` ändras. Resultatet sparas i `tests/eval/resultat/`. Annan modell: `EVAL_MODEL=gpt-4o npm run eval` |

Innehållstesterna kontrollerar bland annat: exakt ett rätt svar per flervalsfråga, att markerade fraser finns ordagrant i nivå 1-texten, att faser utan stöd saknar ledtrådar och meningsstartare, att nivåtexterna blir längre per nivå och att texterna blir längre del för del fram till diagnosen. Kör `npm test` efter varje ändring i `app/lesson/`. UI, API-routerna och AI-bedömningen saknar tester än så länge.

### Vad som finns

- Fyra moment som vart och ett följer modellering (AI tänker högt med markeringar och ett bra exempel) → träna själv (ledtråd och en chans att förbättra svaret) → återkalla utan stöd (ny text och strategin ur minnet).
- Tre intressen (sport, gaming, natur) och tre textnivåer, där högre nivåer lägger till stycken till grundtexten.
- Nivåregel: två rätt i rad utan stöd höjer nivån, ett fel sänker den.
- Högläsningssteg och en slutdiagnos med fem frågor som rättas efter inlämning och visas som en läsprofil.

### Skillnader mot specifikationen (att bygga vidare på)

| Specifikation | Prototyp i dag |
|---|---|
| Fem faser: guidad och självständig träning är separata | Guidad och självständig träning är sammanslagna i "Träna själv" |
| Befästa kunskap i en ny text | Befästning sker genom att återkalla strategin ur minnet, utan text |
| Läsa *bortom* raderna | Bara på och mellan raderna |
| Moment 1: struktur, avsändare/mottagare, fakta/åsikt | Främst texttyp och syfte |
| Svarstrappan: svara, belägg, förklara, fördjupa | Påstående, belägg, förklaring, följd, andra sidan (motsvarar i stort, men namnen behöver bytas) |
| Fem textnivåer som inte bara bygger på längd | Tre nivåer som främst skiljer sig i längd |
| 10 intressen som breddas successivt | 3 intressen |
| Slutdiagnos med 12–16 frågor | 5 frågor, text på 375 ord |
| Separat AI-handledare i konversationsyta | Kommentarer direkt på whiteboarden |
| Elevprofil som sparas mellan inloggningar | Allt tillstånd ligger i minnet och försvinner vid omladdning |
| Markera och anteckna i texten, välja textdelar som belägg | Bara AI:ns markeringar |
| Kriteriebaserad bedömning per område | AI-bedömning mot en kort rubrik per fråga |
| Repetition med mellanrum | Saknas |
| Lärarvy | Saknas (fas 5) |

Högläsningssteget är fortfarande en attrapp: rapporten om läsflytet är hårdkodad.

---

## 13. Rekommenderad målstruktur

Anpassa efter vald teknikstack, men separera dessa områden:

```
project/
├── CLAUDE.md
├── .claude/
│   ├── agents/
│   ├── skills/
│   └── rules/
├── docs/
│   ├── product-specification.md
│   ├── pedagogical-framework.md
│   ├── learning-progression.md
│   ├── assessment-model.md
│   └── technical-architecture.md
├── content/
│   ├── texts/
│   ├── questions/
│   └── assessment-criteria/
├── src/
│   ├── components/
│   ├── features/
│   ├── learning-engine/
│   ├── ai/
│   ├── student-profile/
│   └── data/
└── tests/
```

---

## 14. Rekommenderade subagents

| Subagent | Ansvar |
|---|---|
| **Pedagogical Architect** | Pedagogisk progression, lärandemål, modellering, träningsmoment, bedömningskriterier |
| **UX/UI Designer** | Whiteboard, textyta, elevupplevelse, visuell progression, tillgänglighet |
| **AI Learning Engineer** | AI-handledaren, ledtrådar, adaptivitet, individuell återkoppling, styrning av stödnivå |
| **Content Designer** | Textbanken, sakprosatexter, frågekonstruktion, modelleringsexempel, bedömningsunderlag |
| **Developer** | Implementation, arkitektur, integration, kodkvalitet |
| **QA Tester** | Funktionella och pedagogiska tester, test av lärandeflöden, kontroll av AI:ns beteende |

## 15. Rekommenderade skills

Projektspecifika skills som ska följa detta dokument och återanvända dess pedagogiska principer:

- `create-learning-module`
- `create-reading-text`
- `design-ai-tutor`
- `evaluate-student-answer`
- `build-adaptive-progression`
- `test-learning-flow`

---

## 16. Utvecklingsstrategi

Utveckla appen stegvis.

| Fas | Implementera |
|---|---|
| **1. Pedagogisk prototyp** | De fyra undervisningsmomenten, femstegsprogressionen, en första uppsättning texter, AI-modellering, guidad träning, självständig träning, återkallning utan stöd |
| **2. Gränssnitt** | Whiteboard, textyta, AI-handledare, progressionsvy, elevens arbetsyta |
| **3. Adaptivitet** | Elevprofil, nivåanpassning, intresseanpassning, självständighetsbedömning, repetition |
| **4. Slutdiagnos** | Längre sakprosatexter, diagnosfrågor, bedömningsmotor, individuell kunskapsprofil, rekommendationer för fortsatt träning |
| **5. Lärarvy och vidareutveckling** | Läraröversikt, elevgrupper, individuell uppföljning, klassöversikt, resultat över tid |

---

## 17. Instruktioner till Claude Code

När du arbetar i projektet ska du alltid:

1. Läsa CLAUDE.md innan du börjar arbeta.
2. Förstå den pedagogiska avsikten innan du implementerar funktioner.
3. Analysera befintlig kod och arkitektur innan du gör ändringar.
4. Föreslå en genomtänkt plan innan större implementationer.
5. Använda relevanta subagents när uppgifter kan delas upp.
6. Återanvända befintliga komponenter och funktioner.
7. Följa projektets skills och rules.
8. Göra små och avgränsade ändringar.
9. Testa både den tekniska funktionaliteten och de pedagogiska flödena.
10. Dokumentera viktiga arkitekturbeslut.
11. Fråga innan du gör större arkitektoniska förändringar.
12. Inte ändra orelaterade delar av projektet.

### Särskilt viktigt

Den pedagogiska progressionen är projektets kärna. Ingen implementation får förenkla bort:

**Modellering → Guidad träning → Självständig träning → Återkallning utan stöd → Befästa kunskap.**

Den ska finnas i alla fyra lärmoment och styra hur AI-handledaren, whiteboarden, textbanken och bedömningsmotorn fungerar.
