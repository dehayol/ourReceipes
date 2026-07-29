import { Ingredient } from "@/types/recipe";

// Mots vides / adjectifs trop génériques à ignorer lors de l'extraction des
// mots-clés d'un ingrédient (ex: "gros oignon blanc" -> on garde "oignon").
const STOPWORDS = new Set([
  "de", "d", "du", "des", "la", "le", "les", "l", "un", "une", "et", "ou",
  "a", "au", "aux", "en", "pour", "avec", "sans", "selon", "sur", "non",
  "dans", "par", "ou", "à",
  "gros", "grosse", "petit", "petits", "petite", "petites",
  "moyen", "moyenne", "moyens", "moyennes",
  "frais", "fraiche", "fraîche", "fraiches", "fraîches", "fraichement", "fraîchement",
  "mur", "mûr", "murs", "mûrs", "mure", "mûre",
  "rape", "râpé", "rapee", "râpée", "rapes", "râpés",
  "decortiques", "décortiqués", "surgeles", "surgelés",
  "seche", "sèche", "seches", "sèches", "seché", "séché", "sechee", "séchée",
  "cru", "crus", "crue", "crues",
  "type", "optionnel", "facon", "façon",
  "coupe", "coupé", "coupes", "coupés", "coupee", "coupée",
  "traites", "traités", "traite", "traitée",
  "goutte", "gouttes", "quelques", "gousse", "gousses",
]);

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function extractKeywords(item: string): string[] {
  const cleaned = normalize(item).replace(/\([^)]*\)/g, " ");
  const words = cleaned.split(/[^a-z]+/).filter(Boolean);
  const keywords = words.filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return Array.from(new Set(keywords));
}

function stepContainsKeyword(stepNormalized: string, keyword: string): boolean {
  const base = keyword.endsWith("s") ? keyword.slice(0, -1) : keyword;
  const pattern = new RegExp(`\\b${base}s?\\b`);
  return pattern.test(stepNormalized);
}

/**
 * Heuristique : détecte, pour chaque ingrédient, dans quelle(s) étape(s) il
 * est probablement utilisé, en cherchant ses mots-clés dans le texte de
 * l'étape. Aucune saisie manuelle requise, mais résultat approximatif.
 */
export function buildIngredientStepMatrix(
  ingredients: Ingredient[],
  steps: string[]
): boolean[][] {
  const stepsNormalized = steps.map(normalize);
  const ingredientKeywords = ingredients.map((ing) => extractKeywords(ing.item));

  return ingredientKeywords.map((keywords) =>
    stepsNormalized.map((stepText) =>
      keywords.some((kw) => stepContainsKeyword(stepText, kw))
    )
  );
}

/**
 * Pour chaque ingrédient, index de la première étape où il est détecté
 * (l'étape où il "entre en jeu"). Si aucune étape ne le mentionne, on
 * suppose qu'il est présent dès le début (index 0).
 */
export function computeEntrySteps(matrix: boolean[][]): number[] {
  return matrix.map((row) => {
    const idx = row.findIndex(Boolean);
    return idx === -1 ? 0 : idx;
  });
}

/**
 * Une fois entré, un ingrédient reste "dans le plat" pour toutes les étapes
 * suivantes (façon notation Cooking For Engineers) : participation[i][j] est
 * vrai dès que j >= entrySteps[i].
 */
export function computeParticipation(entrySteps: number[], numSteps: number): boolean[][] {
  return entrySteps.map((entry) =>
    Array.from({ length: numSteps }, (_, j) => j >= entry)
  );
}

export interface CellPlan {
  skip: boolean;
  rowSpan: number;
  value: boolean;
}

/**
 * Calcule, pour chaque cellule (ingrédient x étape), si elle doit être
 * affichée (avec un rowSpan fusionnant les lignes voisines qui partagent le
 * même état) ou ignorée car recouverte par la fusion d'une ligne précédente.
 */
export function buildRenderPlan(participation: boolean[][]): CellPlan[][] {
  const numRows = participation.length;
  const numCols = numRows ? participation[0].length : 0;
  const plan: CellPlan[][] = Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => ({ skip: true, rowSpan: 0, value: false }))
  );

  for (let j = 0; j < numCols; j++) {
    let i = 0;
    while (i < numRows) {
      const value = participation[i][j];
      let length = 1;
      while (i + length < numRows && participation[i + length][j] === value) length++;
      plan[i][j] = { skip: false, rowSpan: length, value };
      for (let k = 1; k < length; k++) plan[i + k][j] = { skip: true, rowSpan: 0, value };
      i += length;
    }
  }

  return plan;
}

const DURATION_UNIT_LABEL: Record<string, string> = {
  heure: "h", heures: "h", h: "h",
  minute: "min", minutes: "min", min: "min",
  seconde: "sec", secondes: "sec", sec: "sec",
};

const DURATION_UNIT_SECONDS: Record<string, number> = {
  heure: 3600, heures: 3600, h: 3600,
  minute: 60, minutes: 60, min: 60,
  seconde: 1, secondes: 1, sec: 1,
};

export interface StepDuration {
  seconds: number;
  label: string;
}

/**
 * Extrait une durée approximative depuis le texte d'une étape (ex: "5 à 7
 * minutes", "15-20 secondes"). Retourne null si aucune durée n'est détectée
 * (l'étape n'aura alors pas de minuteur en mode cuisine).
 */
export function extractStepDuration(step: string): StepDuration | null {
  const normalized = normalize(step);
  const match = normalized.match(
    /(\d+)\s*(?:(?:à|-|—)\s*(\d+))?\s*(heures?|h\b|minutes?|min\b|secondes?|sec\b)/
  );
  if (!match) return null;

  const lo = parseInt(match[1], 10);
  const hi = match[2] ? parseInt(match[2], 10) : lo;
  const unit = match[3];
  const unitSeconds = DURATION_UNIT_SECONDS[unit] ?? 60;
  const unitLabel = DURATION_UNIT_LABEL[unit] ?? "min";
  const midpoint = (lo + hi) / 2;

  return {
    seconds: Math.max(1, Math.round(midpoint * unitSeconds)),
    label: lo === hi ? `${lo} ${unitLabel}` : `${lo}–${hi} ${unitLabel}`,
  };
}

/**
 * Résumé court d'une étape pour l'affichage compact dans une cellule
 * fusionnée du tableau (ex: première proposition avant la première virgule).
 */
export function shortStepLabel(step: string, maxLength = 34): string {
  const firstClause = step.split(/[,.;:—]/)[0].trim();
  const base = firstClause.length > 0 ? firstClause : step.trim();
  if (base.length <= maxLength) return base;
  return `${base.slice(0, maxLength - 1).trimEnd()}…`;
}
