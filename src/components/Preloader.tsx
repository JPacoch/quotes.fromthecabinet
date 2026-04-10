"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const duration = 2500;
        const interval = 20;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const nextProgress = Math.min((currentStep / steps) * 100, 100);

            const easeOutProgress = 100 - (100 * Math.pow(1 - nextProgress / 100, 3));
            setProgress(easeOutProgress);

            if (currentStep >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: "-10vh", filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "var(--bg)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: -1,
                background: `
          radial-gradient(ellipse 70% 60% at 5% 5%, var(--glow-a), transparent 65%),
          radial-gradient(ellipse 55% 70% at 95% 95%, var(--glow-b), transparent 60%)
        `,
                opacity: 0.5
            }} />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{
                    fontFamily: '"Funnel Display", sans-serif',
                    textTransform: "uppercase",
                    letterSpacing: "0.26em",
                    fontSize: "0.65rem",
                    fontWeight: 500,
                    color: "var(--ink-muted)",
                    marginBottom: "32px",
                }}
            >
                Loading thoughts
            </motion.div>

            <div style={{ width: "200px", height: "1px", background: "var(--line)", position: "relative", overflow: "hidden" }}>
                <motion.div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        background: "var(--accent)",
                        width: `${progress}%`,
                    }}
                />
            </div>

            <div style={{
                marginTop: "16px",
                fontFamily: '"Noto Serif", serif',
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "1.2rem",
                color: "var(--ink)",
            }}>
                {Math.round(progress)}%
            </div>
        </motion.div>
    );
}
