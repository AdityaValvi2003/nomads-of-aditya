"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  ["Journeys", "/journeys"],
  ["Blog", "/blog"],
  ["Dream Destinations", "/dream-destinations"],
  ["About Me", "/about"],
  ["Contact", "/contact"],
];

export default function Header() {
  const [dark, setDark] = useState(true);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  /*
   * =========================================================
   * LOAD SAVED THEME
   * =========================================================
   */

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    const shouldBeDark =
      savedTheme !== "light";

    setDark(shouldBeDark);

    document.documentElement.dataset.theme =
      shouldBeDark ? "dark" : "light";

    setMounted(true);
  }, []);

  /*
   * =========================================================
   * APPLY THEME
   * =========================================================
   */

  useEffect(() => {
    if (!mounted) return;

    const theme = dark ? "dark" : "light";

    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem(
      "theme",
      theme
    );
  }, [dark, mounted]);

  /*
   * =========================================================
   * SCROLL
   * =========================================================
   */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 24
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * =========================================================
   * THEME TOGGLE
   * =========================================================
   */

  function toggleTheme() {
    setDark((current) => !current);
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <header
      className={`site-header ${
        scrolled ? "scrolled" : ""
      }`}
    >
      {/* BRAND */}

      <Link
        className="brand"
        href="/"
      >
        NOMADS{" "}
        <span>OF ADITYA</span>
      </Link>

      {/* DESKTOP NAV */}

      <nav className="desktop-nav">
        {links.map(
          ([label, href]) => (
            <Link
              key={href}
              href={href}
            >
              {label}
            </Link>
          )
        )}

        <button
          type="button"
          aria-label={
            dark
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {dark ? "☼" : "☾"}
        </button>
      </nav>

      {/* MOBILE MENU BUTTON */}

      <button
        type="button"
        className="mobile-menu"
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        aria-label={
          open
            ? "Close menu"
            : "Open menu"
        }
      >
        {open ? "×" : "☰"}
      </button>

      {/* MOBILE PANEL */}

      {open && (
        <div className="mobile-panel">
          {links.map(
            ([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() =>
                  setOpen(false)
                }
              >
                {label}
              </Link>
            )
          )}

          <button
            type="button"
            onClick={toggleTheme}
          >
            {dark
              ? "Switch to Light"
              : "Switch to Dark"}
          </button>
        </div>
      )}
    </header>
  );
}