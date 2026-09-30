"use client";

import { useEffect, useState } from "react";

// Shrink-to-fit type measurement.
//
// The deck's font sizes are fractions of the canvas, tuned against the English
// copy. A translation is routinely 30-40% longer (German, Russian, Finnish) or
// much shorter (CJK), and the layout below the caption — gold line, phone
// mockups — is positioned by the project transforms from those same fixed offsets. So a
// headline that wraps one extra line does not just look bad, it pushes into the
// artwork.
//
// Rather than reflow the layout per locale, we keep the box and shrink the type
// until the longest line fits. Same composition in every language, only the
// words change.

let ctx: CanvasRenderingContext2D | null = null;

function context(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  return ctx;
}

export interface FitOptions {
  text: string;
  /** Width the text must fit inside, in px. */
  maxWidth: number;
  /** Font size the English copy was designed at. */
  baseSize: number;
  fontFamily: string;
  fontWeight?: number | string;
  /** CSS letter-spacing in px. Canvas measureText ignores it, so we add it back. */
  letterSpacing?: number;
  uppercase?: boolean;
  /** Never shrink below this fraction of baseSize. */
  minScale?: number;
}

// Canvas 2D context does not support CSS variables like `var(--font-condensed)`.
// Setting context.font to a string containing `var(...)` fails silently and resets
// context.font to the default "10px sans-serif".
// We resolve CSS variables from document.body computed styles so the canvas measures
// against the actual loaded web fonts (Barlow, Barlow Condensed).
function resolveCanvasFontFamily(fontFamily: string): string {
  if (typeof document === "undefined") return fontFamily;
  return fontFamily.replace(/var\((--[^),]+)\)/g, (_, varName) => {
    try {
      const val = getComputedStyle(document.body).getPropertyValue(varName).trim();
      if (val) return val;
    } catch {}
    if (varName === "--font-condensed") return '"Barlow Condensed", sans-serif';
    if (varName === "--font-sans") return 'Barlow, sans-serif';
    return 'sans-serif';
  });
}

/**
 * Widest rendered line width at `size`, honouring explicit newlines. Returns 0
 * when measurement is unavailable (server render) so callers fall back to base.
 */
export function widestLine(text: string, size: number, opts: Omit<FitOptions, "text" | "maxWidth" | "baseSize">): number {
  const c = context();
  if (!c || !text) return 0;
  const value = opts.uppercase ? text.toLocaleUpperCase() : text;
  const fontFam = resolveCanvasFontFamily(opts.fontFamily);
  c.font = `${opts.fontWeight ?? 400} ${size}px ${fontFam}`;
  const spacing = opts.letterSpacing ?? 0;
  let widest = 0;
  for (const line of value.split("\n")) {
    // Letter-spacing applies between glyphs, so n-1 gaps.
    const width = c.measureText(line).width + Math.max(0, line.length - 1) * spacing;
    if (width > widest) widest = width;
  }
  return widest;
}

/** Font size that makes the longest line fit `maxWidth`, clamped by minScale. */
export function fitFontSize(opts: FitOptions): number {
  const { text, maxWidth, baseSize, minScale = 0.50 } = opts;
  if (!text || maxWidth <= 0) return baseSize;
  const width = widestLine(text, baseSize, opts);
  if (width <= 0 || width <= maxWidth) return baseSize;
  // 0.99 safety factor ensures sub-pixel rendering never causes line breaks
  const scaled = baseSize * ((maxWidth * 0.99) / width);
  return Math.max(baseSize * minScale, scaled);
}

/**
 * `fitFontSize`, re-run once web fonts finish loading.
 *
 * The first paint can measure against a fallback face whose metrics differ from
 * Barlow, which would bake a wrong size into an export fired immediately after
 * load. Re-measuring on `document.fonts.ready` costs one extra render and makes
 * the result deterministic.
 */
export function useFittedFontSize(opts: FitOptions): number {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    if (fontsReady || typeof document === "undefined" || !document.fonts) return;
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) setFontsReady(true);
    });
    return () => {
      alive = false;
    };
  }, [fontsReady]);

  // fontsReady is not read inside fitFontSize; it exists to force a re-measure.
  void fontsReady;
  return fitFontSize(opts);
}
