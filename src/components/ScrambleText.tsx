"use client";

import { useEffect, useState } from "react";

interface ScrambleTextProps {
  text: string;
  triggerKey: string | number;
  duration?: number;
  waveWidth?: number;
}

const LOWER_RING = "abcdefghijklmnopqrstuvwxyz";
const UPPER_RING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function isAsciiOrLatinLetter(ch: string): boolean {
  return /\p{L}/u.test(ch);
}

function pickRingChar(ch: string, seed: number): string {
  const isUpper = ch === ch.toUpperCase() && ch !== ch.toLowerCase();
  const ring = isUpper ? UPPER_RING : LOWER_RING;
  return ring[Math.abs(seed) % ring.length];
}

export default function ScrambleText({
  text,
  triggerKey,
  duration = 820,
  waveWidth = 0.34,
}: ScrambleTextProps) {
  const [rendered, setRendered] = useState<{ key: string | number; value: string; done: boolean }>(
    { key: triggerKey, value: text, done: true }
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const chars = Array.from(text);
    const total = chars.length;
    if (total === 0) return;

    let rafId = 0;
    const startTime = performance.now();
    const effectiveDuration = Math.min(Math.max(duration, total * 4), 1150);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / effectiveDuration, 1);
      const tickBucket = Math.floor(elapsed / 48);

      if (progress >= 1) {
        setRendered({ key: triggerKey, value: text, done: true });
        return;
      }

      const next = chars
        .map((ch, idx) => {
          if (!isAsciiOrLatinLetter(ch)) return ch;

          const pos = total <= 1 ? 0 : idx / (total - 1);
          const charStart = pos * (1 - waveWidth);
          const charEnd = charStart + waveWidth;

          if (progress >= charEnd) {
            return ch;
          }

          if (progress < charStart) {
            return pickRingChar(ch, idx * 7 + tickBucket);
          }

          return pickRingChar(ch, idx * 13 + tickBucket * 3);
        })
        .join("");

      setRendered({ key: triggerKey, value: next, done: false });
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [text, triggerKey, duration, waveWidth]);

  if (rendered.key !== triggerKey || rendered.done) {
    return <>{text}</>;
  }

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{rendered.value}</span>
    </>
  );
}
