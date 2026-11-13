"use client";

import { useEffect, useRef } from "react";

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export default function LinkTooltip() {
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return;

    const tip = tipRef.current;
    if (!tip) return;

    let activeEl: HTMLElement | null = null;
    let visible = false;
    let rafId: number | null = null;
    let lastTime = 0;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let velX = 0;
    let sway = 0;
    let velSway = 0;
    let scale = 0.86;
    let velScale = 0;
    let posMode: "above" | "below" = "above";

    const updateTextFromTarget = () => {
      if (!activeEl) return;
      const text = activeEl.getAttribute("data-tooltip");
      if (!text) {
        hide();
        return;
      }
      tip.textContent = text;
    };

    const observer = new MutationObserver(() => {
      if (visible && activeEl) {
        updateTextFromTarget();
      }
    });

    const computeTargetPosition = (clientX: number, el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const tipWidth = tip.offsetWidth || 120;
      const tipHeight = tip.offsetHeight || 30;
      const margin = 12;

      const rawX = clientX - tipWidth / 2;
      targetX = clamp(rawX, margin, window.innerWidth - tipWidth - margin);

      if (rect.top >= tipHeight + 20) {
        posMode = "above";
        targetY = rect.top - tipHeight - 10;
      } else {
        posMode = "below";
        targetY = rect.bottom + 10;
      }
    };

    const tick = (now: number) => {
      if (!visible) {
        rafId = null;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05) || 0.016;
      lastTime = now;

      // Horizontal cursor spring
      const posF = 240 * (targetX - currentX) - 20 * velX;
      velX += posF * dt;
      currentX += velX * dt;

      // Velocity-coupled aerodynamic sway
      const targetSway = clamp((targetX - currentX) * 0.42 + velX * 0.019, -11, 11);
      const swayF = 200 * (targetSway - sway) - 12.5 * velSway;
      velSway += swayF * dt;
      sway += velSway * dt;

      // Scale spring pop-in (0.86 -> 1)
      const scaleF = 380 * (1 - scale) - 22 * velScale;
      velScale += scaleF * dt;
      scale += velScale * dt;

      const dir = posMode === "above" ? 1 : -1;
      const rot = clamp(-sway * 0.48 * dir, -5.5, 5.5);
      const skew = clamp(sway * 0.82 * dir, -8.5, 8.5);

      tip.style.transform = `translate3d(${currentX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) skewX(${skew.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

      const settled =
        Math.abs(targetX - currentX) < 0.08 &&
        Math.abs(velX) < 0.4 &&
        Math.abs(sway) < 0.05 &&
        Math.abs(1 - scale) < 0.002 &&
        Math.abs(velScale) < 0.01;

      if (!settled) {
        rafId = requestAnimationFrame(tick);
      } else {
        tip.style.transform = `translate3d(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0) scale(1)`;
        rafId = null;
      }
    };

    const ensureLoop = () => {
      if (rafId === null) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };

    const show = (el: HTMLElement, clientX: number) => {
      const text = el.getAttribute("data-tooltip");
      if (!text) return;

      const isNewTarget = activeEl !== el;
      activeEl = el;
      tip.textContent = text;
      observer.disconnect();
      observer.observe(el, { attributes: true, attributeFilter: ["data-tooltip"] });

      computeTargetPosition(clientX, el);

      if (!visible || isNewTarget) {
        currentX = targetX;
        velX = 0;
        sway = 0;
        velSway = 0;
        scale = 0.86;
        velScale = 0;
      }

      visible = true;
      tip.style.opacity = "1";
      ensureLoop();
    };

    const hide = () => {
      if (!visible && !activeEl) return;
      visible = false;
      activeEl = null;
      observer.disconnect();
      tip.style.opacity = "0";
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-tooltip]");
      if (!target) {
        if (activeEl) hide();
        return;
      }
      show(target, e.clientX);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!visible || !activeEl || e.pointerType !== "mouse") return;
      computeTargetPosition(e.clientX, activeEl);
      ensureLoop();
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!activeEl) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !activeEl.contains(related)) {
        const nextTooltipEl = related?.closest<HTMLElement>("[data-tooltip]");
        if (!nextTooltipEl) {
          hide();
        }
      }
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    window.addEventListener("blur", hide);

    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", hide, { capture: true });
      window.removeEventListener("blur", hide);
    };
  }, []);

  return <div ref={tipRef} className="link-tooltip" role="tooltip" aria-hidden="true" />;
}
