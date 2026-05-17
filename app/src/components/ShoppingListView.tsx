"use client";

import { useState } from "react";
import Link from "next/link";
import type { ShoppingList, ShoppingEntry } from "@/types/shopping";

interface Props {
  initialList: ShoppingList;
}

export default function ShoppingListView({ initialList }: Props) {
  const [list, setList] = useState<ShoppingList>(initialList);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const totalItems = list.reduce((acc, e) => acc + e.ingredients.length, 0);
  const checkedItems = list.reduce((acc, e) => acc + e.ingredients.filter((i) => i.checked).length, 0);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleIngredient = async (recipeId: string, index: number) => {
    const entry = list.find((e) => e.recipeId === recipeId);
    if (!entry) return;
    const checked = !entry.ingredients[index].checked;

    setList((prev) =>
      prev.map((e) =>
        e.recipeId !== recipeId ? e : {
          ...e,
          ingredients: e.ingredients.map((ing, i) =>
            i === index ? { ...ing, checked } : ing
          ),
        }
      )
    );

    await fetch("/api/shopping-list", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId, index, checked }),
    });
  };

  const removeRecipe = async (recipeId: string) => {
    setList((prev) => prev.filter((e) => e.recipeId !== recipeId));
    await fetch(`/api/shopping-list?recipeId=${recipeId}`, { method: "DELETE" });
    window.dispatchEvent(new Event("shopping-list-updated"));
  };

  const clearAll = async () => {
    if (!confirm("Vider toute la liste ?")) return;
    setList([]);
    await fetch("/api/shopping-list?clear=true", { method: "DELETE" });
    window.dispatchEvent(new Event("shopping-list-updated"));
  };

  const share = async () => {
    const text = list.map((entry) => {
      const lines = entry.ingredients
        .filter((i) => !i.checked)
        .map((i) => `• ${i.quantity ? i.quantity + " " : ""}${i.item}`)
        .join("\n");
      return `${entry.recipeEmoji} ${entry.recipeTitle} (${entry.requestedServings} pers.)\n${lines}`;
    }).join("\n\n");

    if (navigator.share) {
      await navigator.share({ title: "Liste de courses — Mijoté", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Liste copiée dans le presse-papier !");
    }
  };

  if (list.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Liste de courses</h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 14, marginBottom: 28 }}>
          Ajoute des recettes depuis leur page pour voir leurs ingrédients ici.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--accent)", color: "white",
            padding: "12px 24px", borderRadius: 100,
            textDecoration: "none", fontSize: 14, fontWeight: 600,
          }}
        >
          Parcourir les recettes
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 28 }} className="no-print">
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Liste de courses</h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>
          {checkedItems}/{totalItems} ingrédient{totalItems > 1 ? "s" : ""} · {list.length} recette{list.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Print header */}
      <div className="print-only" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Liste de courses — Mijoté</h1>
        <p style={{ fontSize: 12, color: "#666" }}>{new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
      </div>

      {/* Actions */}
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        <button
          onClick={() => window.print()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 100,
            border: "1px solid var(--line)", background: "var(--bg-alt)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", color: "var(--ink)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Imprimer
        </button>
        <button
          onClick={share}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 100,
            border: "1px solid var(--line)", background: "var(--bg-alt)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", color: "var(--ink)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Partager
        </button>
        <button
          onClick={clearAll}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 100,
            border: "1px solid var(--line)", background: "transparent",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit", color: "var(--ink-muted)",
            marginLeft: "auto",
          }}
        >
          Tout effacer
        </button>
      </div>

      {/* Recipe sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {list.map((entry) => (
          <RecipeSection
            key={entry.recipeId}
            entry={entry}
            collapsed={collapsed.has(entry.recipeId)}
            onToggleCollapse={() => toggleCollapse(entry.recipeId)}
            onToggleIngredient={(idx) => toggleIngredient(entry.recipeId, idx)}
            onRemove={() => removeRecipe(entry.recipeId)}
          />
        ))}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
        }
        .print-only { display: none; }

        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>
    </>
  );
}

function RecipeSection({
  entry, collapsed, onToggleCollapse, onToggleIngredient, onRemove,
}: {
  entry: ShoppingEntry;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleIngredient: (idx: number) => void;
  onRemove: () => void;
}) {
  const checked = entry.ingredients.filter((i) => i.checked).length;
  const total = entry.ingredients.length;
  const allDone = checked === total;

  return (
    <div style={{
      border: "1px solid var(--line)", borderRadius: 12,
      overflow: "hidden",
      opacity: allDone ? 0.6 : 1,
      transition: "opacity 0.3s",
    }}>
      {/* Section header */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px",
          background: "var(--bg-alt)",
          borderBottom: collapsed ? "none" : "1px solid var(--line)",
          cursor: "pointer",
        }}
        onClick={onToggleCollapse}
      >
        <span style={{ fontSize: 22 }}>{entry.recipeEmoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {entry.recipeTitle}
          </p>
          <p style={{ fontSize: 12, color: "var(--ink-muted)" }}>
            {entry.requestedServings} pers. · {checked}/{total}
          </p>
        </div>

        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="no-print"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-muted)", padding: 4, borderRadius: 6,
            display: "flex", alignItems: "center",
          }}
          aria-label="Retirer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Collapse arrow */}
        <span className="no-print" style={{
          color: "var(--ink-muted)", fontSize: 11,
          transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          display: "flex", alignItems: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>
      </div>

      {/* Ingredients */}
      {!collapsed && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {entry.ingredients.map((ing, i) => (
            <li
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 16px",
                borderBottom: i < entry.ingredients.length - 1 ? "1px solid var(--line)" : "none",
                cursor: "pointer",
              }}
              onClick={() => onToggleIngredient(i)}
            >
              {/* Checkbox */}
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                border: ing.checked ? "none" : "1.5px solid var(--line)",
                background: ing.checked ? "var(--accent)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, border 0.15s",
              }}>
                {ing.checked && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                )}
              </div>

              {/* Text */}
              <span style={{
                fontSize: 14, color: "var(--ink)",
                textDecoration: ing.checked ? "line-through" : "none",
                opacity: ing.checked ? 0.45 : 1,
                transition: "opacity 0.2s, text-decoration 0.2s",
              }}>
                <span style={{ fontWeight: 600 }}>{ing.quantity}</span>
                {ing.quantity ? " " : ""}{ing.item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
