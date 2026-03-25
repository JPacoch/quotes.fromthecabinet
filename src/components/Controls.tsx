"use client";

import { motion } from "framer-motion";
import { Share2, RefreshCw } from "lucide-react";

interface ControlsProps {
    onNext: () => void;
    onShare: () => void;
    isLoading: boolean;
}

export default function Controls({ onNext, onShare, isLoading }: ControlsProps) {
    return (
        <motion.div
            className="quote-controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
        >
            <button
                className="button secondary"
                onClick={onShare}
            >
                <Share2 size={16} strokeWidth={1.5} />
                Share
            </button>

            <button
                className="button"
                onClick={onNext}
                disabled={isLoading}
            >
                <motion.span
                    animate={{ rotate: isLoading ? 360 : 0 }}
                    transition={{ repeat: isLoading ? Infinity : 0, ease: "linear", duration: 1 }}
                    style={{ display: "inline-flex" }}
                >
                    <RefreshCw size={16} strokeWidth={1.5} />
                </motion.span>
                Next Random Quote
            </button>
        </motion.div>
    );
}
