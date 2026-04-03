"use client";

import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { motion } from "framer-motion";

/* ── Types ── */
type Phase = "idle" | "covering" | "revealing";

interface TransitionContextValue {
    triggerThemeTransition: (callback: () => void) => void;
}

/* ── Context ── */
const TransitionContext = createContext<TransitionContextValue>({
    triggerThemeTransition: (cb) => cb(),
});

export function usePageTransition() {
    return useContext(TransitionContext);
}

/* ── Provider ── */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
    const [phase, setPhase] = useState<Phase>("idle");
    const callbackRef = useRef<(() => void) | null>(null);
    const isActiveRef = useRef(false);

    const triggerThemeTransition = useCallback((callback: () => void) => {
        if (isActiveRef.current) return;
        isActiveRef.current = true;
        callbackRef.current = callback;
        setPhase("covering");
    }, []);

    const handleAnimationComplete = useCallback(() => {
        if (!isActiveRef.current) return;

        if (phase === "covering") {
            const cb = callbackRef.current;
            callbackRef.current = null;
            cb?.();
            setPhase("revealing");
        } else if (phase === "revealing") {
            isActiveRef.current = false;
            setPhase("idle");
        }
    }, [phase]);

    const transformOrigin = phase === "revealing" ? "bottom" : "top";
    const scaleY =
        phase === "covering" ? 1
            : phase === "revealing" ? 0
                : 0;

    return (
        <TransitionContext.Provider value={{ triggerThemeTransition }}>
            {children}

            {/* Barba-style full-page ink wipe */}
            <motion.div
                aria-hidden="true"
                initial={{ scaleY: 0 }}
                animate={{ scaleY }}
                transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                onAnimationComplete={handleAnimationComplete}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9000,
                    background: "var(--ink)",
                    transformOrigin,
                    pointerEvents: phase === "idle" ? "none" : "all",
                    willChange: "transform",
                }}
            />
        </TransitionContext.Provider>
    );
}
