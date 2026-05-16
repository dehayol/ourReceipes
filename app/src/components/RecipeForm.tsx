"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Recipe, Ingredient } from "@/types/recipe";

const CATEGORIES = ["Apéro", "Entrées", "Plats", "Desserts", "Boulange", "Bases"];
const DIFFICULTIES = ["Très facile", "Facile", "Intermédiaire", "Difficile"];
const STORAGE_KEY = "mijote_admin_auth";

const LABEL: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.08em",
  color: "var(--ink-muted)", marginBottom: 6,
};

const INPUT: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  border: "1px solid var(--line)", borderRadius: 8,
  fontSize: 15, fontFamily: "inherit",
  background: "var(--bg)", color: "var(--ink)", outline: "none",
};

const SECTION: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--line)",
  borderRadius: 12, padding: "28px 32px", marginBottom: 24,
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  recipe?: Recipe;
  mode: "create" | "edit";
}

export default function RecipeForm({ recipe, mode }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Recipe>(
    recipe ?? {
      id: "",
      title: "",
      category: "Plats",
      emoji: "🍽️",
      description: "",
      prepTime: "",
      cookTime: "",
      totalTime: "",
      servings: "",
      difficulty: "Facile",
      image: null,
      tags: [],
      ingredients: [{ quantity: "", item: "" }],
      steps: [""],
      notes: "",
      createdAt: new Date().toISOString().split("T")[0],
    }
  );

  const set = (key: keyof Recipe, value: Recipe[keyof Recipe]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Ingredients
  const addIngredient = () => set("ingredients", [...form.ingredients, { quantity: "", item: "" }]);
  const removeIngredient = (i: number) =>
    set("ingredients", form.ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof Ingredient, value: string) => {
    const updated = [...form.ingredients];
    updated[i] = { ...updated[i], [field]: value };
    set("ingredients", updated);
  };

  // Steps
  const addStep = () => set("steps", [...form.steps, ""]);
  const removeStep = (i: number) => set("steps", form.steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, value: string) => {
    const updated = [...form.steps];
    updated[i] = value;
    set("steps", updated);
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    const pwd = sessionStorage.getItem(STORAGE_KEY) ?? "";
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-password": pwd },
      body: fd,
    });
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      set("image", url);
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const pwd = sessionStorage.getItem(STORAGE_KEY) ?? "";
    const id = mode === "create" ? slugify(form.title) || `recette-${Date.now()}` : form.id;
    const payload: Recipe = { ...form, id };

    const res = await fetch(
      mode === "create" ? "/api/recipes" : `/api/recipes/${id}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pwd,
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      router.push(`/recettes/${id}`);
      router.refresh();
    } else {
      setError("Erreur lors de la sauvegarde. Vérifiez votre connexion ou le mot de passe.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>

      {/* Infos générales */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, marginBottom: 24 }}>
          Infos générales
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={LABEL}>Titre *</label>
            <input style={INPUT} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Tarte tatin à la pomme" required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={LABEL}>Catégorie *</label>
              <select style={INPUT} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Emoji</label>
              <input style={INPUT} value={form.emoji} onChange={(e) => set("emoji", e.target.value)} placeholder="🍽️" />
            </div>
          </div>
          <div>
            <label style={LABEL}>Description</label>
            <textarea
              style={{ ...INPUT, minHeight: 80, resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Un court texte d'intro..."
            />
          </div>
          <div>
            <label style={LABEL}>Tags (séparés par des virgules)</label>
            <input
              style={INPUT}
              value={form.tags.join(", ")}
              onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              placeholder="pizza, fromage, apéro"
            />
          </div>
        </div>
      </div>

      {/* Temps & portions */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, marginBottom: 24 }}>
          Temps et portions
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div>
            <label style={LABEL}>Temps de préparation *</label>
            <input style={INPUT} value={form.prepTime} onChange={(e) => set("prepTime", e.target.value)} placeholder="Ex: 20 min" required />
          </div>
          <div>
            <label style={LABEL}>Temps de cuisson *</label>
            <input style={INPUT} value={form.cookTime} onChange={(e) => set("cookTime", e.target.value)} placeholder="Ex: 45 min" required />
          </div>
          <div>
            <label style={LABEL}>Temps total *</label>
            <input style={INPUT} value={form.totalTime} onChange={(e) => set("totalTime", e.target.value)} placeholder="Ex: 1h05" required />
          </div>
          <div>
            <label style={LABEL}>Portions *</label>
            <input style={INPUT} value={form.servings} onChange={(e) => set("servings", e.target.value)} placeholder="Ex: 4 personnes" required />
          </div>
          <div>
            <label style={LABEL}>Difficulté</label>
            <select style={INPUT} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Photo */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, marginBottom: 24 }}>
          Photo
        </h2>
        {form.image && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", maxHeight: 200 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image} alt="Aperçu" style={{ width: "100%", height: 200, objectFit: "cover" }} />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploadingImage}
          style={{
            padding: "10px 20px", borderRadius: 100,
            border: "1px solid var(--line)",
            background: "transparent", color: "var(--ink)",
            fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {uploadingImage ? "Upload en cours..." : form.image ? "Changer la photo" : "Uploader une photo"}
        </button>
        {form.image && (
          <button
            type="button"
            onClick={() => set("image", null)}
            style={{
              marginLeft: 8, padding: "10px 20px", borderRadius: 100,
              border: "1px solid var(--line)", background: "transparent",
              color: "var(--ink-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Supprimer la photo
          </button>
        )}
      </div>

      {/* Ingrédients */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, marginBottom: 24 }}>
          Ingrédients
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {form.ingredients.map((ing, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                style={{ ...INPUT, maxWidth: 140 }}
                value={ing.quantity}
                onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                placeholder="Quantité"
              />
              <input
                style={{ ...INPUT, flex: 1 }}
                value={ing.item}
                onChange={(e) => updateIngredient(i, "item", e.target.value)}
                placeholder="Ingrédient"
              />
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: "1px solid var(--line)", background: "transparent",
                    color: "var(--ink-muted)", cursor: "pointer", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          style={{
            marginTop: 12, padding: "8px 16px", borderRadius: 100,
            border: "1px dashed var(--line)", background: "transparent",
            color: "var(--ink-soft)", fontSize: 13, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + Ajouter un ingrédient
        </button>
      </div>

      {/* Étapes */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, marginBottom: 24 }}>
          Étapes de préparation
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {form.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{
                minWidth: 28, height: 28, borderRadius: "50%",
                background: "var(--bg-alt)", border: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, color: "var(--ink-muted)",
                marginTop: 10, flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <textarea
                style={{ ...INPUT, flex: 1, minHeight: 72, resize: "vertical" }}
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`Étape ${i + 1}...`}
              />
              {form.steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: "1px solid var(--line)", background: "transparent",
                    color: "var(--ink-muted)", cursor: "pointer", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 10,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          style={{
            marginTop: 12, padding: "8px 16px", borderRadius: 100,
            border: "1px dashed var(--line)", background: "transparent",
            color: "var(--ink-soft)", fontSize: 13, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + Ajouter une étape
        </button>
      </div>

      {/* Notes */}
      <div style={SECTION}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, marginBottom: 24 }}>
          Notes &amp; conseils
        </h2>
        <textarea
          style={{ ...INPUT, minHeight: 100, resize: "vertical" }}
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Conseils, variantes, conservation..."
        />
      </div>

      {/* Submit */}
      {error && (
        <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 16 }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "14px 32px", borderRadius: 100,
            background: "var(--accent)", color: "white",
            border: "none", fontSize: 15, fontWeight: 500,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          {saving ? "Sauvegarde..." : mode === "create" ? "Publier la recette" : "Sauvegarder les modifications"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: "14px 24px", borderRadius: 100,
            border: "1px solid var(--line)", background: "transparent",
            color: "var(--ink)", fontSize: 15, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Annuler
        </button>
      </div>

    </form>
  );
}
