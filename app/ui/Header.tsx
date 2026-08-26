"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  ["Journeys", "/journeys"],
  ["Blog", "/blog"],
  ["Destinations", "/dream-destinations"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export default function Header() {
  const pathname = usePathname();

  const [dark, setDark] = useState(true);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    const shouldBeDark = savedTheme !== "light";

    setDark(shouldBeDark);

    document.documentElement.dataset.theme =
      shouldBeDark ? "dark" : "light";

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const theme = dark ? "dark" : "light";

    document.documentElement.dataset.theme = theme;

    localStorage.setItem("theme", theme);
  }, [dark, mounted]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function toggleTheme() {
    setDark((current) => !current);
  }

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={`site-header ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="nav-pill">

        {/* BRAND */}

        <Link
          href="/"
          className="nav-brand"
          aria-label="Nomads of Aditya home"
        >
          <span className="nav-brand-mark">
            N
          </span>

          <span className="nav-brand-text">
            NOMADS
            <span>OF ADITYA</span>
          </span>
        </Link>


        {/* DESKTOP NAV */}

        <nav
          className="desktop-nav"
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={
                isActive(href)
                  ? "active"
                  : ""
              }
            >
              {label}
            </Link>
          ))}
        </nav>


        {/* ACTIONS */}

        <div className="nav-actions">

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
            <span>
              {dark ? "☼" : "☾"}
            </span>
          </button>

          <Link
            href="/contact"
            className="nav-cta"
          >
            Get Started
          </Link>

        </div>


        {/* MOBILE */}

        <button
          type="button"
          className="mobile-menu"
          onClick={() =>
            setOpen((current) => !current)
          }
          aria-label={
            open
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={open}
        >
          {open ? "×" : "☰"}
        </button>

      </div>


      {/* MOBILE PANEL */}

      {open && (
        <div className="mobile-panel">

          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={
                isActive(href)
                  ? "active"
                  : ""
              }
              onClick={() =>
                setOpen(false)
              }
            >
              {label}
            </Link>
          ))}

          <div className="mobile-panel-actions">

            <button
              type="button"
              onClick={toggleTheme}
            >
              {dark
                ? "Switch to Light"
                : "Switch to Dark"}
            </button>

            <Link
              href="/contact"
              onClick={() =>
                setOpen(false)
              }
            >
              Get Started →
            </Link>

          </div>

        </div>
      )}
    </header>
  );
}
