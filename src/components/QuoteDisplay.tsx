"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Share2, ArrowRight } from "lucide-react";

export interface Quote {
    id: string;
    text: string;
    author: string;
    context: string;
    date: string;
}

interface QuoteDisplayProps {
    quote: Quote;
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

function splitWords(text: string) {
    return text.split(" ").map((word, i) => (
        <span key={i} className="quote-word" style={{ marginRight: "0.28em" }}>
            {word}
        </span>
    ));
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
    exit: {
        transition: { staggerChildren: 0.02, staggerDirection: -1 },
    },
};

const wordVariants = {
    hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { type: "spring" as const, stiffness: 160, damping: 24 },
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: "blur(2px)",
        transition: { duration: 0.18 },
    },
};

const quoteMarkVariants = {
    hidden: { opacity: 0, x: "-50%", y: -10 },
    visible: {
        opacity: 0.055,
        x: "-50%",
        y: 0,
        transition: { type: "spring" as const, stiffness: 160, damping: 24 },
    },
    exit: {
        opacity: 0,
        x: "-50%",
        y: -10,
        transition: { duration: 0.16 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 160, damping: 24 },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.16 } },
};

function MagneticButton({ children, className, onClick, disabled, "aria-label": ariaLabel }: {
    children: React.ReactNode;
    className: string;
    onClick?: () => void;
    disabled?: boolean;
    "aria-label"?: string;
}) {
    return (
        <motion.button
            className={className}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            whileTap={{ scale: 0.97 }}
        >
            {children}
        </motion.button>
    );
}

function QuoteSkeleton() {
    return (
        <div className="skeleton-stage">
            <div className="skeleton-wrapper">
                <div className="skeleton-pill" />
                <div className="skeleton-text">
                    <div className="skeleton-line" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line--sm" />
                </div>
                <div className="skeleton-attr">
                    <div className="skeleton-rule" />
                    <div className="skeleton-author" />
                </div>
                <div className="skeleton-actions">
                    <div className="skeleton-btn skeleton-btn--ghost" />
                    <div className="skeleton-btn skeleton-btn--primary" />
                </div>
            </div>
        </div>
    );
}

export { QuoteSkeleton };

export default function QuoteDisplay({ quote, isLoading, onNext, onShare }: QuoteDisplayProps) {
    return (
        <main>
            <div className="quote-stage">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={quote.id}
                        className="quote-wrapper"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Dateline pill */}
                        <motion.div className="quote-dateline" variants={itemVariants}>
                            {formatDateline(quote.date)}
                        </motion.div>

                        {/* Quote text — word-by-word stagger */}
                        <motion.blockquote
                            className="quote-text"
                            variants={containerVariants}
                            aria-label={quote.text}
                        >
                            <motion.span
                                aria-hidden="true"
                                className="quote-mark-bg"
                                variants={quoteMarkVariants}
                            >
                                {"\u201C"}
                            </motion.span>
                            <span aria-hidden="true">
                                {splitWords(quote.text).map((wordSpan, i) => (
                                    <motion.span
                                        key={i}
                                        className="quote-word"
                                        style={{ display: "inline-block", marginRight: "0.28em" }}
                                        variants={wordVariants}
                                    >
                                        {quote.text.split(" ")[i]}
                                    </motion.span>
                                ))}
                            </span>
                        </motion.blockquote>

                        {/* Attribution */}
                        <motion.div className="quote-attribution" variants={itemVariants}>
                            <motion.span
                                className="quote-rule"
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 0.3 }}
                                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                                style={{ width: 28, transformOrigin: "left" }}
                            />
                            <span className="quote-author">— {quote.author}</span>
                            {quote.context && (
                                <span className="quote-context">{quote.context}</span>
                            )}
                        </motion.div>

                        {/* Action row */}
                        <motion.div className="quote-actions" variants={itemVariants}>
                            {/* Share — ghost */}
                            <MagneticButton
                                className="q-btn q-btn--ghost"
                                onClick={onShare}
                                aria-label="Share this quote"
                            >
                                <span style={{ display: "inline-flex", position: "relative", zIndex: 1 }}>
                                    <Share2 size={13} strokeWidth={1.5} aria-hidden="true" />
                                </span>
                                <span>Share</span>
                            </MagneticButton>

                            {/* Another thought — primary */}
                            <MagneticButton
                                className="q-btn q-btn--primary"
                                onClick={onNext}
                                disabled={isLoading}
                                aria-label="Show another quote"
                            >
                                <span>Another thought</span>
                                <motion.span
                                    animate={{ x: isLoading ? [0, 4, 0] : 0 }}
                                    transition={{ repeat: isLoading ? Infinity : 0, duration: 0.7 }}
                                    style={{ display: "inline-flex", position: "relative", zIndex: 1 }}
                                >
                                    <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
                                </motion.span>
                            </MagneticButton>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
