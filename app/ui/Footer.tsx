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
            setSiteName(settings.siteName.trim());
          }

          if (settings.ownerName?.trim()) {
            setOwnerName(settings.ownerName.trim());
          }
        }

        if (socialLinksResponse.ok) {
          const data =
            await socialLinksResponse.json();

          if (Array.isArray(data.socialLinks)) {
            setSocialLinks(data.socialLinks);
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

  const productLinks = [
    ["Journeys", "/journeys"],
    ["Destinations", "/dream-destinations"],
    ["About Me", "/about"],
  ];

  const resourceLinks = [
    ["Blog", "/blog"],
    ["Contact", "/contact"],
  ];

  return (
    <footer className="site-footer">

      <div className="site-footer-card">

        {/* TOP */}

        <div className="site-footer-main">

          {/* BRAND */}

          <div className="site-footer-brand">

            <Link
              href="/"
              className="site-footer-logo"
              aria-label={`${siteName} home`}
            >
              <span className="site-footer-logo-mark">
                N
              </span>

              <span>
                {siteName}
              </span>
            </Link>

            <p>
              Places, people and moments —
              collected along the way.
            </p>

            {socialLinks.length > 0 && (
              <div className="site-footer-socials">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}

          </div>


          {/* PRODUCT */}

          <div className="site-footer-column">

            <span className="site-footer-heading">
              Product
            </span>

            {productLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
              >
                {label}
              </Link>
            ))}

          </div>


          {/* RESOURCES */}

          <div className="site-footer-column">

            <span className="site-footer-heading">
              Resources
            </span>

            {resourceLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
              >
                {label}
              </Link>
            ))}

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

        </div>


        {/* BOTTOM */}

        <div className="site-footer-bottom">

          <small>
            © {new Date().getFullYear()}{" "}
            {ownerName}. All rights reserved.
          </small>

        </div>

      </div>

    </footer>
  );
}
