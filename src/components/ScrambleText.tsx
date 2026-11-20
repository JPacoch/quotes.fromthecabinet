"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  triggerKey: string | number;
  duration?: number;
  waveWidth?: number;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Optical width-matched rings keep word lengths stable in proportional sans-serif (Geist Variable)
// so lines do not rewrap or twitch during the scramble wave.
const LOWER_NARROW = "iljtfr";
const LOWER_WIDE = "mw";
const LOWER_MEDIUM = "acdeghknopqsuvxyz";

const UPPER_NARROW = "IJ";
const UPPER_WIDE = "MW";
const UPPER_MEDIUM = "ABCDEFGHKLNOPQRSTUVXYZ";

function isLetter(ch: string): boolean {
  return /\p{L}/u.test(ch);
}

function pickWidthMatchedChar(ch: string, seed: number): string {
  const isUpper = ch === ch.toUpperCase() && ch !== ch.toLowerCase();

  let ring: string;
  if (isUpper) {
    if (UPPER_NARROW.includes(ch)) ring = UPPER_NARROW;
    else if (UPPER_WIDE.includes(ch)) ring = UPPER_WIDE;
    else ring = UPPER_MEDIUM;
  } else {
    if (LOWER_NARROW.includes(ch)) ring = LOWER_NARROW;
    else if (LOWER_WIDE.includes(ch)) ring = LOWER_WIDE;
    else ring = LOWER_MEDIUM;
  }

  return ring[Math.abs(seed) % ring.length];
}

function buildFrame(
  chars: string[],
  progress: number,
  tickBucket: number,
  waveWidth: number
): string {
  const total = chars.length;
  return chars
    .map((ch, idx) => {
      if (!isLetter(ch)) return ch;

      const pos = total <= 1 ? 0 : idx / (total - 1);
      const charStart = pos * (1 - waveWidth);
      const charEnd = charStart + waveWidth;

      if (progress >= charEnd) {
        return ch;
      }

      if (progress < charStart) {
        return pickWidthMatchedChar(ch, idx * 7 + tickBucket);
      }

      return pickWidthMatchedChar(ch, idx * 13 + tickBucket * 3);
    })
    .join("");
}

export default function ScrambleText({
  text,
  triggerKey,
  duration = 780,
  waveWidth = 0.34,
}: ScrambleTextProps) {
  const liveRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = liveRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }

    const chars = Array.from(text);
    if (chars.length === 0) {
      el.textContent = text;
      return;
    }

    let rafId = 0;
    const startTime = performance.now();
    const effectiveDuration = Math.min(Math.max(duration, chars.length * 3.8), 1080);

    // Paint initial scrambled frame synchronously before first visual frame
    el.textContent = buildFrame(chars, 0, 0, waveWidth);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / effectiveDuration, 1);

      if (progress >= 1) {
        el.textContent = text;
        return;
      }

      const tickBucket = Math.floor(elapsed / 52);
      el.textContent = buildFrame(chars, progress, tickBucket, waveWidth);
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      el.textContent = text;
    };
  }, [text, triggerKey, duration, waveWidth]);

  return (
    <span className="scramble-wrap" data-text={text}>
      <span ref={liveRef} className="scramble-live">
        {text}
      </span>
    </span>
  );
}
