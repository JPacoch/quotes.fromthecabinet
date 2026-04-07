"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function PhilosophicalCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isTouch = matchMedia("(pointer: coarse)").matches;
        const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (isTouch || prefersReduced) return;

        document.body.classList.add("cursor-on");

        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.5, ease: "power3" });

        const onMove = (e: PointerEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest("a, button, .theme-toggle, [role='button']")) {
                gsap.to(cursorRef.current, { scale: 3.6, duration: 0.4, ease: "power3.out" });
            }
        };

        const onMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest("a, button, .theme-toggle, [role='button']")) {
                gsap.to(cursorRef.current, { scale: 1, duration: 0.4, ease: "power3.out" });
            }
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("mouseover", onMouseOver, { passive: true });
        window.addEventListener("mouseout", onMouseOut, { passive: true });

        gsap.set(cursorRef.current, { x: -200, y: -200 });

        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("mouseover", onMouseOver);
            window.removeEventListener("mouseout", onMouseOut);
            document.body.classList.remove("cursor-on");
        };
    }, []);

    return (
        <div ref={cursorRef} className="cursor-pristine" aria-hidden="true" />
    );
}
