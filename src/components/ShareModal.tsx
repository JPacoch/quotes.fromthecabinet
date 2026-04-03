"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "./QuoteDisplay";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    quote: Quote;
}

export default function ShareModal({ isOpen, onClose, quote }: ShareModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch {
            console.error("Copy failed");
        }
    };

    const shareText = `"${quote.text}" — ${quote.author}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);

    const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <div
            ref={overlayRef}
            className={`modal-overlay${isOpen ? " active" : ""}`}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            aria-modal="true"
            role="dialog"
            aria-label="Share this quote"
        >
            <div className="modal-content">
                <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

                <h2 className="modal-title">Share this thought</h2>
                <p className="modal-subtitle">
                    &ldquo;{quote.text.length > 90 ? quote.text.slice(0, 90) + "…" : quote.text}&rdquo;
                </p>

                <div className="share-grid">
                    <a href={urls.twitter} target="_blank" rel="noopener noreferrer" className="share-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        X / Twitter
                    </a>

                    <a href={urls.facebook} target="_blank" rel="noopener noreferrer" className="share-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </a>

                    <a href={urls.linkedin} target="_blank" rel="noopener noreferrer" className="share-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                    </a>

                    <button className="share-btn share-btn-wide copy-btn" onClick={handleCopy}>
                        <AnimatePresence mode="wait">
                            {copied ? (
                                <motion.span
                                    key="check"
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.7, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                                    style={{ display: "inline-flex" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="copy"
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.7, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                                    style={{ display: "inline-flex" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                    </svg>
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {copied ? "Copied!" : "Copy URL"}
                    </button>
                </div>
            </div>
        </div>
    );
}
