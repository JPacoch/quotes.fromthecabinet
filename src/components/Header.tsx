"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Header() {
    const [isDark, setIsDark] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
            setIsDark(true);
        }

        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <header className={scrolled ? "scrolled" : ""}>
            <div className="container">
                <nav className="nav">
                    {/* Left — brand */}
                    <div className="brand">
                        <span className="brand-title">Quotes from the Cabinet</span>
                        <span className="brand-sub">A quote for every day</span>
                    </div>

                    {/* Right — actions */}
                    <div className="nav-actions">
                        {/* Blog back-link */}
                        <motion.a
                            href="https://fromthecabinet.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="back-link"
                            aria-label="Back to From the Cabinet"
                            whileHover="hover"
                            initial="rest"
                            animate="rest"
                        >
                            <motion.span
                                className="back-link-arrow"
                                variants={{
                                    rest: { x: 0 },
                                    hover: { x: -3 },
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            >
                                {/* Arrow left */}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M19 12H5M12 5l-7 7 7 7" />
                                </svg>
                            </motion.span>
                            <span>The Cabinet</span>
                        </motion.a>

                        {/* Abstract theme toggle */}
                        <button
                            className={`theme-toggle${isDark ? " is-dark" : ""}`}
                            onClick={toggleTheme}
                            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            <span className="theme-toggle-track">
                                <span className="theme-toggle-orb" />
                            </span>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
}
