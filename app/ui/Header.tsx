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
  const [siteName, setSiteName] =
    useState("Nomads of Aditya");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme =
          localStorage.getItem("theme");

        if (savedTheme === "dark" || savedTheme === "light") {
          const shouldBeDark =
            savedTheme === "dark";

          setDark(shouldBeDark);

          document.documentElement.dataset.theme =
            shouldBeDark ? "dark" : "light";

          return;
        }

        const response =
          await fetch("/api/settings");

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const defaultTheme =
          data.defaultTheme === "light"
            ? "light"
            : "dark";

        const shouldBeDark =
          defaultTheme === "dark";

        setDark(shouldBeDark);

        document.documentElement.dataset.theme =
          defaultTheme;
      } catch {
        // Keep dark theme fallback.
      } finally {
        setMounted(true);
      }
    }

    loadTheme();
  }, []);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response =
          await fetch("/api/settings");

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (data.siteName?.trim()) {
          setSiteName(
            data.siteName.trim()
          );
        }
      } catch {
        // Keep the fallback site name.
      }
    }

    loadSettings();
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
      className={`site-header ${scrolled ? "scrolled" : ""
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
            {siteName}
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
