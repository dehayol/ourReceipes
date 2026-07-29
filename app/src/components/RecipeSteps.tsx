"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Ingredient } from "@/types/recipe";
import {
  buildIngredientStepMatrix,
  computeEntrySteps,
  computeParticipation,
  buildRenderPlan,
  extractStepDuration,
  shortStepLabel,
} from "@/utils/ingredientStepMatrix";

interface Props {
  ingredients: Ingredient[];
  steps: string[];
  notes?: string;
  view: "list" | "table";
  onViewChange: (view: "list" | "table") => void;
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RecipeSteps({ ingredients, steps, notes, view, onViewChange }: Props) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [offIngredients, setOffIngredients] = useState<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const matrix = useMemo(
    () => buildIngredientStepMatrix(ingredients, steps),
    [ingredients, steps]
  );
  const entrySteps = useMemo(() => computeEntrySteps(matrix), [matrix]);
  const participation = useMemo(
    () => computeParticipation(entrySteps, steps.length),
    [entrySteps, steps.length]
  );
  const plan = useMemo(() => buildRenderPlan(participation), [participation]);
  const durations = useMemo(() => steps.map(extractStepDuration), [steps]);
  const labels = useMemo(() => steps.map((s) => shortStepLabel(s)), [steps]);

  const cooking = activeStep !== null;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (activeStep === null) return;

    const duration = durations[activeStep];
    if (!duration) {
      setRemaining(null);
      return;
    }
    setRemaining(duration.seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  const goTo = (i: number) => setActiveStep(Math.max(0, Math.min(steps.length - 1, i)));
  const toggleIngredient = (i: number) => {
    setOffIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div style={{ minWidth: 0 }}>
      <div
        className="no-print"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, paddingBottom: 12,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Préparation</h2>

        <div style={{
          display: "flex", gap: 2, padding: 3,
          background: "var(--bg-alt)", borderRadius: 100,
        }}>
          {(["list", "table"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewChange(mode)}
              style={{
                border: "none", cursor: "pointer",
                padding: "6px 14px", borderRadius: 100,
                fontSize: 12, fontWeight: 600,
                background: view === mode ? "var(--accent)" : "transparent",
                color: view === mode ? "#fff" : "var(--ink-soft)",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {mode === "list" ? "Étapes" : "Tableau"}
            </button>
          ))}
        </div>
      </div>

      {/* Titre visible uniquement à l'impression, puisque le toggle est masqué */}
      <h2 className="print-only" style={{
        display: "none",
        fontSize: 18, fontWeight: 700,
        marginBottom: 16, paddingBottom: 12,
        borderBottom: "1px solid var(--line)",
      }}>
        Préparation
      </h2>

      {view === "list" ? (
        <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 20 }}>
          {steps.map((step, i) => (
            <li
              key={i}
              className={`step-row anim-delay-${Math.min(i + 4, 9)}`}
              style={{ display: "flex", gap: 14 }}
            >
              <span style={{
                minWidth: 30, height: 30,
                background: "var(--accent)", color: "white",
                borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 3,
              }}>
                {i + 1}
              </span>
              <p style={{
                fontSize: 15, lineHeight: 1.7,
                color: "var(--ink-soft)", paddingTop: 2,
              }}>
                {step}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 14, lineHeight: 1.6 }}>
            Vue façon tableur : chaque ligne est un ingrédient, chaque colonne une étape.
            Les cellules fusionnées indiquent qu&apos;un ingrédient reste dans la préparation
            (détection automatique, approximative). Clique un ingrédient pour le cocher.
          </p>

          {/* Contrôles / barre d'étape du mode cuisine */}
          <div className="no-print" style={{ marginBottom: 14 }}>
            {!cooking ? (
              <button
                onClick={() => goTo(0)}
                style={{
                  border: "none", cursor: "pointer",
                  padding: "9px 18px", borderRadius: 100,
                  fontSize: 13, fontWeight: 700,
                  background: "var(--accent)", color: "#fff",
                }}
              >
                Démarrer la cuisson
              </button>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                border: "1px solid var(--line)", background: "var(--bg-alt)",
                borderRadius: 10, padding: "10px 16px",
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "var(--accent)", whiteSpace: "nowrap",
                }}>
                  Étape {activeStep! + 1} / {steps.length}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 500, flex: 1, minWidth: 160, lineHeight: 1.5 }}>
                  {steps[activeStep!]}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => goTo(activeStep! - 1)}
                    disabled={activeStep === 0}
                    style={{
                      border: "1px solid var(--line)", background: "transparent",
                      borderRadius: 100, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                      cursor: activeStep === 0 ? "default" : "pointer",
                      opacity: activeStep === 0 ? 0.4 : 1,
                    }}
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={() => goTo(activeStep! + 1)}
                    disabled={activeStep === steps.length - 1}
                    style={{
                      border: "1px solid var(--line)", background: "transparent",
                      borderRadius: 100, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                      cursor: activeStep === steps.length - 1 ? "default" : "pointer",
                      opacity: activeStep === steps.length - 1 ? 0.4 : 1,
                    }}
                  >
                    Suivant →
                  </button>
                  <button
                    onClick={() => setActiveStep(null)}
                    style={{
                      border: "1px solid var(--line)", background: "transparent",
                      borderRadius: 100, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Quitter
                  </button>
                </div>
                <span style={{
                  fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: 15,
                  minWidth: 56, textAlign: "right",
                  color: remaining === 0 ? "#fff" : "var(--ink)",
                  background: remaining === 0 ? "var(--accent)" : "transparent",
                  padding: remaining === 0 ? "2px 8px" : 0,
                  borderRadius: 6,
                }}>
                  {remaining === null ? "—" : formatClock(remaining)}
                </span>
              </div>
            )}
          </div>

          <div className="table-scroll" style={{ marginBottom: 24, paddingBottom: 6 }}>
            <table style={{
              borderCollapse: "collapse", width: "100%", fontSize: 13,
              tableLayout: "fixed",
              minWidth: 180 + steps.length * 92,
            }}>
              <colgroup>
                <col style={{ width: 180 }} />
                {steps.map((_, i) => <col key={i} />)}
              </colgroup>
              <thead>
                <tr>
                  <th style={{
                    textAlign: "left", padding: "8px 10px",
                    borderBottom: "2px solid var(--line)",
                    color: "var(--ink-muted)", fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    Ingrédient
                  </th>
                  {steps.map((_, i) => (
                    <th key={i} style={{
                      padding: "8px 6px",
                      borderBottom: "2px solid var(--line)",
                      borderLeft: "1px solid var(--line)",
                      textAlign: "center",
                      background: cooking && activeStep === i ? "var(--accent)" : "transparent",
                      borderRadius: cooking && activeStep === i ? 6 : 0,
                    }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: "50%",
                        background: cooking && activeStep === i ? "#fff" : "var(--accent)",
                        color: cooking && activeStep === i ? "var(--accent)" : "#fff",
                        fontWeight: 700, fontSize: 11,
                      }}>
                        {i + 1}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, ri) => {
                  const isOff = offIngredients.has(ri);
                  const rowHot = cooking && participation[ri][activeStep!];
                  return (
                    <tr key={ri} className={`ingredient-row anim-delay-${Math.min(ri + 3, 9)}`}>
                      <td
                        onClick={() => toggleIngredient(ri)}
                        style={{
                          padding: "8px 10px", borderBottom: "1px solid var(--line)",
                          wordBreak: "break-word", cursor: "pointer",
                          background: rowHot ? "var(--bg-alt)" : "transparent",
                          opacity: cooking && !rowHot ? 0.35 : isOff ? 0.4 : 1,
                          textDecoration: isOff ? "line-through" : "none",
                          transition: "opacity 0.15s, background 0.15s",
                        }}
                      >
                        <span style={{ fontWeight: 700, color: "var(--accent)" }}>{ing.quantity}</span>
                        {" "}
                        <span style={{ color: "var(--ink-soft)" }}>{ing.item}</span>
                      </td>
                      {steps.map((_, ci) => {
                        const cell = plan[ri][ci];
                        if (cell.skip) return null;
                        const isHotCell = cooking && activeStep === ci && cell.value;
                        const dimmed = cooking && !(activeStep === ci && cell.value);
                        const duration = durations[ci];
                        return (
                          <td
                            key={ci}
                            rowSpan={cell.rowSpan}
                            style={{
                              padding: "8px 8px", borderBottom: "1px solid var(--line)",
                              borderLeft: "1px solid var(--line)", textAlign: "center",
                              verticalAlign: "middle",
                              background: isHotCell
                                ? "var(--accent)"
                                : cell.value ? "var(--bg-alt)" : "transparent",
                              color: isHotCell ? "#fff" : "var(--ink)",
                              opacity: dimmed ? 0.35 : 1,
                              transition: "opacity 0.15s, background 0.15s, color 0.15s",
                              cursor: cell.value ? "pointer" : "default",
                            }}
                            onClick={() => cell.value && goTo(ci)}
                          >
                            {cell.value && (
                              <>
                                <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.3 }}>
                                  {labels[ci]}
                                </div>
                                {duration && (
                                  <div style={{
                                    fontSize: 10.5, marginTop: 2,
                                    color: isHotCell ? "rgba(255,255,255,0.85)" : "var(--ink-muted)",
                                  }}>
                                    {duration.label}
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notes && (
        <div className="anim-fade-up anim-delay-6" style={{
          marginTop: 32, padding: "18px 20px",
          background: "var(--bg-alt)", borderRadius: 10,
          borderLeft: "3px solid var(--accent)",
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "var(--accent)", marginBottom: 8,
          }}>
            Notes
          </p>
          <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7 }}>
            {notes}
          </p>
        </div>
      )}

      <style>{`
        .table-scroll {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--accent) var(--bg-alt);
        }
        .table-scroll::-webkit-scrollbar { height: 8px; }
        .table-scroll::-webkit-scrollbar-track { background: var(--bg-alt); border-radius: 100px; }
        .table-scroll::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 100px; }
      `}</style>
    </div>
  );
}
