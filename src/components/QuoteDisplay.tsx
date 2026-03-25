"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Share2, ChevronRight } from "lucide-react";

export interface Quote {
    id: string;
    text: string;
    author: string;
    context: string;
    date: string;
}

interface QuoteDisplayProps {
    quote: Quote;
    isFlashing: boolean;
    isLoading: boolean;
    onNext: () => void;
    onShare: () => void;
}

function formatDateline(isoDate: string): string {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).toUpperCase();
}

export default function QuoteDisplay({ quote, isFlashing, isLoading, onNext, onShare }: QuoteDisplayProps) {
    const spring = { type: "spring" as const, stiffness: 120, damping: 22, mass: 1 };

    return (
        <main>
            {/* Flash overlay */}
            <AnimatePresence>
                {isFlashing && (
                    <motion.div
                        className="flash-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    />
                )}
            </AnimatePresence>

            {/* Loading overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="loading-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="loading-inner">
                            <div className="loading-spinner" />
                            <span className="loading-label">Retrieving</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="quote-stage">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={quote.id}
                        className="quote-wrapper"
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14, transition: { duration: 0.18 } }}
                        transition={spring}
                    >
                        {/* Dateline */}
                        <motion.div
                            className="quote-dateline"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.7 }}
                        >
                            {formatDateline(quote.date)}
                        </motion.div>

                        {/* Quote text — sits directly on background */}
                        <motion.blockquote
                            className="quote-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.18, duration: 0.9 }}
                        >
                            {quote.text}
                        </motion.blockquote>

                        {/* Attribution */}
                        <motion.div
                            className="quote-attribution"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                        >
                            <span className="quote-rule" />
                            <span className="quote-author">— {quote.author}</span>
                            <span className="quote-context">{quote.context}</span>
                        </motion.div>

                        {/* Action row — directly under quote */}
                        <motion.div
                            className="quote-actions"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.44, duration: 0.6 }}
                        >
                            {/* Share — ghost */}
                            <motion.button
                                className="q-btn q-btn--ghost"
                                onClick={onShare}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                aria-label="Share this quote"
                            >
                                <span style={{ display: "inline-flex", position: "relative", zIndex: 1 }}>
                                    <Share2 size={13} strokeWidth={1.5} aria-hidden="true" />
                                </span>
                                <span>Share</span>
                            </motion.button>

                            {/* Another thought — primary */}
                            <motion.button
                                className="q-btn q-btn--primary"
                                onClick={onNext}
                                disabled={isLoading}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                aria-label="Show another quote"
                            >
                                <span>Another thought</span>
                                <motion.span
                                    animate={{ x: isLoading ? [0, 3, 0] : 0 }}
                                    transition={{ repeat: isLoading ? Infinity : 0, duration: 0.8 }}
                                    style={{ display: "inline-flex" }}
                                >
                                    <ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" />
                                </motion.span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
