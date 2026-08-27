"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
};

export default function Footer() {
  const [siteName, setSiteName] =
    useState("Nomads of Aditya");

  const [ownerName, setOwnerName] =
    useState("Aditya Valvi");

  const [socialLinks, setSocialLinks] =
    useState<SocialLink[]>([]);

  useEffect(() => {
    async function loadFooterData() {
      try {
        const [
          settingsResponse,
          socialLinksResponse,
        ] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/social-links"),
        ]);

        if (settingsResponse.ok) {
          const settings =
            await settingsResponse.json();

          if (settings.siteName?.trim()) {
            setSiteName(
              settings.siteName.trim()
            );
          }

          if (settings.ownerName?.trim()) {
            setOwnerName(
              settings.ownerName.trim()
            );
          }
        }

        if (socialLinksResponse.ok) {
          const data =
            await socialLinksResponse.json();

          if (
            Array.isArray(
              data.socialLinks
            )
          ) {
            setSocialLinks(
              data.socialLinks
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load footer data:",
          error
        );
      }
    }

    loadFooterData();
  }, []);

  return (
    <footer>
      <div>
        <span className="eyebrow">
          {siteName.toUpperCase()}
        </span>

        <h2>
          Keep exploring.
        </h2>

        <p>
          Places, people and moments —
          collected along the way.
        </p>
      </div>

      <div className="footer-links">
        <Link href="/journeys">
          Journeys
        </Link>

        <Link href="/blog">
          Blog
        </Link>

        <Link href="/about">
          About Me
        </Link>

        <Link href="/contact">
          Contact
        </Link>

        {socialLinks.map((social) => (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.label}
          </a>
        ))}
      </div>

      <small>
        © {new Date().getFullYear()}{" "}
        {ownerName}
      </small>
    </footer>
  );
}