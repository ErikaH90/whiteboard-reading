import type { FreeTask, QuestionCategory } from "./types";

// ============================================================================
// Bocklistan: de två–tre korta krav som eleven får se efter ett fritextsvar.
// Edda bockar av dem i stället för att skriva en lång kommentar.
// ============================================================================

/** Standardkrav per förmåga. En fråga kan ha egna krav i fältet `criteria`. */
export const DEFAULT_CRITERIA: Record<QuestionCategory, string[]> = {
  texttyp: ["Två drag", "Stöd i texten"],
  pa_raderna: ["Rätt uppgifter ur texten"],
  mellan_raderna: ["En slutsats", "Stöd i texten"],
  sammanfatta: ["Ämnet", "Huvudpoängerna", "Inga detaljer eller åsikter"],
  resonera: ["Påstående", "Belägg ur texten", "Orsak och följd"],
};

export function criteriaFor(task: FreeTask): string[] {
  return task.criteria ?? DEFAULT_CRITERIA[task.category];
}
