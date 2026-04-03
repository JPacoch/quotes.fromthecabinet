"use client";

import { useEffect, useRef } from "react";

export default function PhilosophicalCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const pos = useRef({ x: -200, y: -200 });
    const ring = useRef({ x: -200, y: -200 });
    const rafId = useRef<number>(0);

    useEffect(() => {
        const isTouch = matchMedia("(pointer: coarse)").matches;
        const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (isTouch || prefersReduced) return;

        document.body.classList.add("cursor-on");

        const onMove = (e: PointerEvent) => {
            pos.current.x = e.clientX;
            pos.current.y = e.clientY;
        };

        const onEnter = () => {
            dotRef.current?.classList.add("cursor-dot--hover");
            ringRef.current?.classList.add("cursor-ring--hover");
        };
        const onLeave = () => {
            dotRef.current?.classList.remove("cursor-dot--hover");
            ringRef.current?.classList.remove("cursor-ring--hover");
        };

        const attach = () => {
            document.querySelectorAll("a, button, [role='button'], input, textarea, select, label").forEach((el) => {
                el.addEventListener("mouseenter", onEnter);
                el.addEventListener("mouseleave", onLeave);
            });
        };
        attach();

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const tick = () => {
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
            }
            ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
            ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
            if (ringRef.current) {
                ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
            }
            rafId.current = requestAnimationFrame(tick);
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        rafId.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("pointermove", onMove);
            cancelAnimationFrame(rafId.current);
            document.body.classList.remove("cursor-on");
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
            <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
        </>
    );
}
