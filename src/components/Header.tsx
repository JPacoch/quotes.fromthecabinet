"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface HeaderProps {
  currentPage?: "home" | "library" | "quote";
}

const BRAND_TEXT = "From the Cabinet";
const SCRAMBLE_CHARS = "abcdefghijklmnopqrstuvwxyz";

function subscribeTheme(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): "light" | "dark" {
  return "light";
}

export default function Header({ currentPage = "home" }: HeaderProps) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );
  const [brandLabel, setBrandLabel] = useState(BRAND_TEXT);
  const scrambleRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrambleRafRef.current !== null) {
        cancelAnimationFrame(scrambleRafRef.current);
      }
    };
  }, []);

  const handleBrandMouseEnter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (scrambleRafRef.current !== null) cancelAnimationFrame(scrambleRafRef.current);

    const start = performance.now();
    const duration = 360;

    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const lockedCount = Math.floor(progress * BRAND_TEXT.length);

      const next = BRAND_TEXT.split("")
        .map((char, idx) => {
          if (char === " " || idx < lockedCount) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");

      setBrandLabel(next);

      if (progress < 1) {
        scrambleRafRef.current = requestAnimationFrame(frame);
      } else {
        setBrandLabel(BRAND_TEXT);
        scrambleRafRef.current = null;
      }
    };

    scrambleRafRef.current = requestAnimationFrame(frame);
  };

  const handleBrandMouseLeave = () => {
    if (scrambleRafRef.current !== null) {
      cancelAnimationFrame(scrambleRafRef.current);
      scrambleRafRef.current = null;
    }
    setBrandLabel(BRAND_TEXT);
  };

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const applyTheme = () => {
      document.documentElement.setAttribute("data-theme", nextTheme);
      try {
        localStorage.setItem("cabinet-theme", nextTheme);
      } catch {
        // Ignore storage write errors in restricted browsing modes.
      }
    };

    const docWithVT = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (!docWithVT.startViewTransition || reducedMotion) {
      applyTheme();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = docWithVT.startViewTransition(() => {
      applyTheme();
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 640,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {
        // View transition interrupted or unsupported.
      });
  };

  return (
    <header className="site-header">
      <div className="wrap">
        <div className="col-wide">
          <div className="header-inner">
            <div className="header-left">
              <a
                href="https://fromthecabinet.com/"
                className="brand-mark"
                onMouseEnter={handleBrandMouseEnter}
                onMouseLeave={handleBrandMouseLeave}
                data-tooltip="fromthecabinet.com ↗"
                aria-label="From the Cabinet"
              >
                {brandLabel}
              </a>

              {(currentPage === "quote" || currentPage === "library") && (
                <>
                  <span className="header-crumb-sep" aria-hidden="true">
                    /
                  </span>
                  <Link href="/" className="header-crumb">
                    Quotes
                  </Link>
                </>
              )}
            </div>

            <nav className="header-nav" aria-label="Primary">
              <a
                href="https://fromthecabinet.com/writing/"
                className="nav-link nav-secondary"
                data-tooltip="fromthecabinet.com/writing ↗"
              >
                Writing ↗
              </a>

              <Link
                href="/"
                className={`nav-link${currentPage === "home" ? " nav-link--active" : ""}`}
                aria-current={currentPage === "home" ? "page" : undefined}
              >
                Quotes
              </Link>

              <a
                href="https://fromthecabinet.com/about/"
                className="nav-link nav-secondary"
                data-tooltip="fromthecabinet.com/about ↗"
              >
                About ↗
              </a>

              <button
                type="button"
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                data-tooltip={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                <svg
                  className="theme-toggle-icon"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
