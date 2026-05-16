import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const CATEGORIES = ["Apéro", "Entrées", "Plats", "Desserts", "Boulange", "Bases"];
const DIFFICULTIES = ["Très facile", "Facile", "Intermédiaire", "Difficile"];

const SYSTEM_PROMPT = `Tu es un assistant qui extrait des recettes de cuisine depuis un texte brut (PDF, TXT, copie web, etc.) et les convertit en JSON structuré.

Retourne UNIQUEMENT un objet JSON valide, sans markdown, sans explication, sans balise de code.

Structure attendue :
{
  "title": "string — nom de la recette",
  "category": "string — une de ces valeurs exactes : Apéro, Entrées, Plats, Desserts, Boulange, Bases",
  "emoji": "string — un seul emoji représentatif",
  "description": "string — 1-2 phrases d'intro alléchantes",
  "prepTime": "string — ex: '20 min'",
  "cookTime": "string — ex: '45 min' ou '0 min' si pas de cuisson",
  "totalTime": "string — ex: '1h05'",
  "servings": "string — ex: '4 personnes' ou '6 parts'",
  "difficulty": "string — une de ces valeurs exactes : Très facile, Facile, Intermédiaire, Difficile",
  "tags": ["array de strings — mots-clés pertinents en minuscules"],
  "ingredients": [
    { "quantity": "string", "item": "string" }
  ],
  "steps": ["array de strings — chaque étape est une phrase complète"],
  "notes": "string ou null — conseils, variantes, conservation"
}

Règles :
- Si une information est absente, devine-la de façon raisonnable selon le contexte
- La catégorie doit être une des valeurs exactes listées (${CATEGORIES.join(", ")})
- La difficulté doit être une des valeurs exactes listées (${DIFFICULTIES.join(", ")})
- Les quantités doivent être en français (c. à soupe, c. à café, g, ml, etc.)
- Chaque étape doit être une instruction claire et autonome
- Ne jamais retourner autre chose que le JSON pur`;

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY manquante dans .env.local" },
      { status: 500 }
    );
  }

  const { text } = (await req.json()) as { text: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "Texte vide" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Voici le texte de la recette à convertir en JSON :\n\n${text.slice(0, 12000)}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed;
  try {
    // Nettoyer au cas où Claude mettrait des backticks malgré les instructions
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Impossible de parser la réponse de Claude", raw },
      { status: 500 }
    );
  }

  return NextResponse.json({ recipe: parsed });
}
