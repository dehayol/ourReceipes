"use client";

import { useState } from "react";
import Link from "next/link";
import type { Recipe } from "@/lib/recipes";

interface Props {
  recipes: Recipe[];
}

function getCardFlex(i: number, hoveredIdx: number | null): number {
  if (hoveredIdx === null) return 1;
  const dist = Math.abs(i - hoveredIdx);
  if (dist === 0) return 2.5;
  if (dist === 1) return 1.18;
  if (dist === 2) return 1.05;
  return 1;
}

function getCardBrightness(i: number, hoveredIdx: number | null): number {
  if (hoveredIdx === null) return 1;
  const dist = Math.abs(i - hoveredIdx);
  if (dist === 0) return 1;
  if (dist === 1) return 0.82;
  if (dist === 2) return 0.68;
  return 0.58;
}

export default function HeroCarousel({ recipes }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  if (recipes.length === 0) return null;

  return (
    <section className="hero-carousel-section" style={{ marginBottom: 48 }}>
      <div className="hero-carousel-track">
        {recipes.map((recipe, i) => {
          const isHovered = hoveredIdx === i;
          const flexVal = getCardFlex(i, hoveredIdx);
          const brightness = getCardBrightness(i, hoveredIdx);

          return (
            <Link
              key={recipe.id}
              href={`/recettes/${recipe.id}`}
              className="hero-card"
              onMouseEnter={() => { setHoveredIdx(i); setActiveIdx(i); }}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                textDecoration: "none",
                // Desktop flex (overridden by CSS on mobile)
                ["--hero-flex" as string]: flexVal,
                ["--hero-brightness" as string]: brightness,
              }}
            >
              {/* Image */}
              {recipe.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%", objectFit: "cover",
                    transition: "transform 0.5s ease",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                  }}
                />
              ) : (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 72, background: "var(--bg-alt)",
                }}>
                  {recipe.emoji}
                </div>
              )}

              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)",
              }} />

              {/* Content */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "20px",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                {/* Category */}
                <span style={{
                  fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.25s ease",
                }}>
                  {recipe.category}
                </span>

                {/* Title */}
                <p style={{
                  color: "white", fontWeight: 700,
                  fontSize: isHovered ? 22 : 15,
                  lineHeight: 1.25,
                  display: "-webkit-box",
                  WebkitLineClamp: isHovered ? 3 : 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  margin: 0,
                  transition: "font-size 0.3s ease",
                }}>
                  {recipe.title}
                </p>

                {/* Meta row */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  fontSize: 12, color: "rgba(255,255,255,0.8)",
                }}>
                  <span>{recipe.totalTime}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{recipe.servings}</span>
                </div>

                {/* CTA — visible on hover */}
                <div style={{
                  overflow: "hidden",
                  maxHeight: isHovered ? 56 : 0,
                  opacity: isHovered ? 1 : 0,
                  transition: "max-height 0.3s ease, opacity 0.25s ease",
                  marginTop: isHovered ? 4 : 0,
                }}>
                  <span style={{
                    display: "inline-block",
                    background: "var(--accent)", color: "white",
                    fontWeight: 600, fontSize: 13,
                    padding: "10px 20px", borderRadius: 8,
                  }}>
                    Voir la recette
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination dots — desktop only */}
      <div className="hero-dots">
        {recipes.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            aria-label={`Recette ${i + 1}`}
            style={{
              width: i === activeIdx ? 20 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              padding: 0,
              background: i === activeIdx ? "var(--accent)" : "var(--line)",
              transition: "width 0.25s ease, background 0.25s ease",
            }}
          />
        ))}
      </div>

      <style>{`
        .hero-carousel-section {
          margin-left: -20px;
          margin-right: -20px;
        }

        /* Mobile: horizontal scroll, CSS custom props not used */
        .hero-carousel-track {
          display: flex;
          gap: 12px;
          padding: 0 20px 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hero-carousel-track::-webkit-scrollbar { display: none; }

        .hero-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-alt);
          display: block;
          flex-shrink: 0;
          width: 260px;
          height: 380px;
          /* no transition on mobile */
        }

        .hero-dots { display: none; }

        @media (min-width: 768px) {
          .hero-carousel-section {
            margin-left: 0;
            margin-right: 0;
          }
          .hero-carousel-track {
            padding: 0;
            overflow: visible;
            height: 420px;
          }
          .hero-card {
            width: auto;
            height: 420px;
            border-radius: 10px;
            flex-shrink: 1;
            /* flex and filter driven by CSS custom properties set inline */
            flex: var(--hero-flex, 1);
            filter: brightness(var(--hero-brightness, 1));
            transition:
              flex 0.38s cubic-bezier(0.4, 0, 0.2, 1),
              filter 0.32s ease;
          }
          .hero-dots {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 6px;
            margin-top: 16px;
          }
        }

        @media (min-width: 1024px) {
          .hero-carousel-track { height: 460px; }
          .hero-card { height: 460px; }
        }
      `}</style>
    </section>
  );
}
