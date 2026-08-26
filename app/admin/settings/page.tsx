"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Journey = {
  id: string;
  title: string;
  location?: string | null;
  country?: string | null;
  status?: string;
};

type Blog = {
  id: string;
  title: string;
  status?: string;
};

type Settings = {
  id: string;
  siteName: string;
  ownerName: string;
  defaultTheme: string;
  accentColor: string;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  journeyFeatureMode: "AUTOMATIC" | "MANUAL";
  featuredJourneyId: string | null;
  blogFeatureMode: "AUTOMATIC" | "MANUAL";
  featuredBlogId: string | null;
  aboutHeadline: string | null;
  aboutLead: string | null;
  aboutStoryTitle: string | null;
  aboutStoryLeft: string | null;
  aboutStoryRight: string | null;
  aboutPhilosophy: string | null;
  aboutFreedom: string | null;
  aboutExploration: string | null;
  aboutPeople: string | null;
  aboutGrowth: string | null;
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<Settings | null>(null);

  const [journeys, setJourneys] =
    useState<Journey[]>([]);

  const [blogs, setBlogs] =
    useState<Blog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const [
        settingsResponse,
        journeysResponse,
        blogsResponse,
      ] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/journeys"),
        fetch("/api/admin/blog"),
      ]);

      if (!settingsResponse.ok) {
        throw new Error(
          "Failed to load settings."
        );
      }

      const settingsData =
        await settingsResponse.json();

      const journeysData =
        journeysResponse.ok
          ? await journeysResponse.json()
          : [];

      const blogsData =
        blogsResponse.ok
          ? await blogsResponse.json()
          : [];

      setSettings(settingsData);

      /*
       * APIs may return either an array directly
       * or an object containing an array.
       */
      const journeyList =
        Array.isArray(journeysData)
          ? journeysData
          : journeysData.journeys ||
          journeysData.data ||
          [];

      const blogList =
        Array.isArray(blogsData)
          ? blogsData
          : blogsData.posts ||
          blogsData.blogs ||
          blogsData.data ||
          [];

      setJourneys(journeyList);
      setBlogs(blogList);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSetting<
    K extends keyof Settings
  >(
    key: K,
    value: Settings[K]
  ) {
    if (!settings) {
      return;
    }

    setSettings({
      ...settings,
      [key]: value,
    });

    setMessage("");
    setError("");
  }

  async function saveSettings() {
    if (!settings) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            siteName:
              settings.siteName,

            ownerName:
              settings.ownerName,

            defaultTheme:
              settings.defaultTheme,

            accentColor:
              settings.accentColor,

            heroHeadline:
              settings.heroHeadline,

            heroSubheadline:
              settings.heroSubheadline,

            journeyFeatureMode:
              settings.journeyFeatureMode,

            featuredJourneyId:
              settings.featuredJourneyId,

            blogFeatureMode:
              settings.blogFeatureMode,

            featuredBlogId:
              settings.featuredBlogId,

              aboutHeadline:
  settings.aboutHeadline,

aboutLead:
  settings.aboutLead,

aboutStoryTitle:
  settings.aboutStoryTitle,

aboutStoryLeft:
  settings.aboutStoryLeft,

aboutStoryRight:
  settings.aboutStoryRight,

aboutPhilosophy:
  settings.aboutPhilosophy,

aboutFreedom:
  settings.aboutFreedom,

aboutExploration:
  settings.aboutExploration,

aboutPeople:
  settings.aboutPeople,

aboutGrowth:
  settings.aboutGrowth,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to save settings."
        );
      }

      setSettings(data.settings);

      setMessage(
        "Settings saved successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-page settings-page">
        <style jsx global>{`
  .settings-page .admin-content {
    max-width: 1100px;
  }

  .settings-page .admin-section {
    margin-top: 48px;
    padding: 32px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.025);
  }

  .settings-page .admin-section-header {
    margin-bottom: 28px;
  }

  .settings-page .admin-section-header h3 {
    margin-top: 8px;
  }

  .settings-page .admin-section-header p {
    max-width: 650px;
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.42);
    line-height: 1.7;
  }

  .settings-page .admin-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .settings-page .admin-form-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .settings-page .admin-field {
    display: flex;
    flex-direction: column;
    gap: 9px;
    min-width: 0;
  }

  .settings-page .admin-field > span {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.42);
  }

  .settings-page .admin-field input,
  .settings-page .admin-field select,
  .settings-page .admin-field textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.045);
    color: white;
    padding: 13px 14px;
    font: inherit;
    outline: none;
    transition:
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .settings-page .admin-field input,
  .settings-page .admin-field select {
    height: 48px;
  }

  .settings-page .admin-field textarea {
    min-height: 120px;
    resize: vertical;
    line-height: 1.6;
  }

  .settings-page .admin-field input:focus,
  .settings-page .admin-field select:focus,
  .settings-page .admin-field textarea:focus {
    border-color: rgba(217, 154, 61, 0.65);
    background: rgba(255, 255, 255, 0.065);
  }

  .settings-page .admin-field input::placeholder,
  .settings-page .admin-field textarea::placeholder {
    color: rgba(255, 255, 255, 0.22);
  }

  .settings-page .admin-field select option {
    background: #171717;
    color: white;
  }

  .settings-page .status-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .settings-page .status-option {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    min-height: 92px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
    color: white;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      transform 0.2s ease;
  }

  .settings-page .status-option:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  .settings-page .status-option strong {
    font-size: 15px;
    font-weight: 500;
  }

  .settings-page .status-option small {
    color: rgba(255, 255, 255, 0.38);
    font-size: 13px;
  }

  .settings-page .status-option.active {
    border-color: rgba(217, 154, 61, 0.7);
    background: rgba(217, 154, 61, 0.08);
  }

  .settings-page .settings-color-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .settings-page .settings-color-row input[type="color"] {
    width: 52px;
    min-width: 52px;
    height: 48px;
    padding: 3px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
  }

  .settings-page .settings-color-row input[type="text"] {
    flex: 1;
  }

  .settings-page .settings-save {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .settings-page .settings-save-copy {
    max-width: 600px;
  }

  .settings-page .settings-save-copy p {
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.42);
    line-height: 1.6;
  }

  @media (max-width: 760px) {
    .settings-page .admin-section {
      padding: 22px;
    }

    .settings-page .admin-form-grid,
    .settings-page .status-options {
      grid-template-columns: 1fr;
    }

    .settings-page .settings-save {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`}</style>
        <div className="admin-content">
          <p>Loading settings...</p>
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="admin-page">
        <div className="admin-content">
          <p>
            Unable to load settings.
          </p>

          <button
            className="admin-button primary"
            onClick={loadSettings}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page settings-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-header">

        <div>
          <span className="admin-eyebrow">
            NOMADS OF ADITYA
          </span>

          <h1>
            Settings
          </h1>
        </div>

        <div className="admin-header-right">

          <Link
            href="/"
            className="admin-view-site"
          >
            View Website →
          </Link>

          <div className="admin-avatar">
            A
          </div>

        </div>

      </header>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav className="admin-navigation">

        <Link href="/admin">
          Dashboard
        </Link>

        <Link href="/admin/journeys">
          Journeys
        </Link>

        <Link href="/admin/blog">
          Blog
        </Link>

        <Link href="/admin/dream-destinations">
          Dream Destinations
        </Link>

        <Link href="/admin/encounters">
          Encounters
        </Link>

        <Link href="/admin/media">
          Media
        </Link>

        <Link href="/admin/contact">
          Contact Messages
        </Link>

        <Link href="/admin/settings">
          Settings
        </Link>

      </nav>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="admin-content">

        <div className="admin-intro">

          <span className="admin-eyebrow">
            SITE CONFIGURATION
          </span>

          <h2>
            Control your website.
          </h2>

          <p>
            Manage the identity, appearance and
            homepage content of Nomads of Aditya.
          </p>

        </div>


        {/* ===================================================
            MESSAGES
        =================================================== */}

        {message && (
          <div
            className="card"
            style={{
              borderColor:
                "rgba(80, 180, 100, .3)",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="card"
            style={{
              borderColor:
                "rgba(220, 80, 80, .4)",
            }}
          >
            {error}
          </div>
        )}


        {/* ===================================================
            SITE IDENTITY
        =================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>
              <span className="admin-eyebrow">
                IDENTITY
              </span>

              <h3>
                Site identity
              </h3>
            </div>

          </div>

          <div className="admin-form-grid">

            <label className="admin-field">
              <span>
                Site Name
              </span>

              <input
                value={settings.siteName}
                onChange={(event) =>
                  updateSetting(
                    "siteName",
                    event.target.value
                  )
                }
                placeholder="Nomads of Aditya"
              />
            </label>


            <label className="admin-field">
              <span>
                Owner Name
              </span>

              <input
                value={settings.ownerName}
                onChange={(event) =>
                  updateSetting(
                    "ownerName",
                    event.target.value
                  )
                }
                placeholder="Aditya Valvi"
              />
            </label>

          </div>

        </section>


        {/* ===================================================
            APPEARANCE
        =================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>
              <span className="admin-eyebrow">
                APPEARANCE
              </span>

              <h3>
                Visual identity
              </h3>
            </div>

          </div>

          <div className="admin-form-grid">

            <label className="admin-field">
              <span>
                Default Theme
              </span>

              <select
                value={settings.defaultTheme}
                onChange={(event) =>
                  updateSetting(
                    "defaultTheme",
                    event.target.value
                  )
                }
              >
                <option value="dark">
                  Dark
                </option>

                <option value="light">
                  Light
                </option>
              </select>
            </label>


            <label className="admin-field">
              <span>
                Accent Color
              </span>

              <div className="settings-color-row">

                <input
                  type="color"
                  value={
                    settings.accentColor
                  }
                  onChange={(event) =>
                    updateSetting(
                      "accentColor",
                      event.target.value
                    )
                  }
                  style={{
                    width: "52px",
                    height: "42px",
                    padding: "2px",
                    cursor: "pointer",
                  }}
                />

                <input
                  type="text"
                  value={
                    settings.accentColor
                  }
                  onChange={(event) =>
                    updateSetting(
                      "accentColor",
                      event.target.value
                    )
                  }
                  placeholder="#D99A3D"
                />

              </div>
            </label>

          </div>

        </section>


        {/* ===================================================
            HERO
        =================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>
              <span className="admin-eyebrow">
                HOMEPAGE HERO
              </span>

              <h3>
                First impression.
              </h3>

              <p>
                Control the headline visitors see
                when they land on your website.
              </p>
            </div>

          </div>

          <div className="admin-form-stack">

            <label className="admin-field">
              <span>
                Hero Headline
              </span>

              <input
                value={
                  settings.heroHeadline ||
                  ""
                }
                onChange={(event) =>
                  updateSetting(
                    "heroHeadline",
                    event.target.value
                  )
                }
                placeholder="Travel is where the story begins."
              />
            </label>


            <label className="admin-field">
              <span>
                Hero Subheadline
              </span>

              <textarea
                value={
                  settings.heroSubheadline ||
                  ""
                }
                onChange={(event) =>
                  updateSetting(
                    "heroSubheadline",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Stories, people and places from the road."
              />
            </label>

          </div>

        </section>


        {/* ===================================================
            FEATURED JOURNEY
        =================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>
              <span className="admin-eyebrow">
                FEATURED JOURNEY
              </span>

              <h3>
                Choose what leads the homepage.
              </h3>

              <p>
                Automatic mode selects the featured
                journey according to the site's
                existing homepage logic.
              </p>
            </div>

          </div>

          <div className="admin-form-stack">

            <div className="status-options">

              <button
                type="button"
                className={
                  settings.journeyFeatureMode ===
                    "AUTOMATIC"
                    ? "status-option active"
                    : "status-option"
                }
                onClick={() =>
                  updateSetting(
                    "journeyFeatureMode",
                    "AUTOMATIC"
                  )
                }
              >
                <strong>
                  Automatic
                </strong>

                <small>
                  Let the site choose.
                </small>
              </button>


              <button
                type="button"
                className={
                  settings.journeyFeatureMode ===
                    "MANUAL"
                    ? "status-option active"
                    : "status-option"
                }
                onClick={() =>
                  updateSetting(
                    "journeyFeatureMode",
                    "MANUAL"
                  )
                }
              >
                <strong>
                  Manual
                </strong>

                <small>
                  Choose a specific journey.
                </small>
              </button>

            </div>


            {settings.journeyFeatureMode ===
              "MANUAL" && (
                <label className="admin-field">

                  <span>
                    Featured Journey
                  </span>

                  <select
                    value={
                      settings.featuredJourneyId ||
                      ""
                    }
                    onChange={(event) =>
                      updateSetting(
                        "featuredJourneyId",
                        event.target.value ||
                        null
                      )
                    }
                  >
                    <option value="">
                      Select a journey
                    </option>

                    {journeys
                      .filter(
                        (journey) =>
                          journey.status ===
                          "PUBLISHED"
                      )
                      .map((journey) => (
                        <option
                          key={journey.id}
                          value={journey.id}
                        >
                          {journey.title}
                          {journey.location
                            ? ` — ${journey.location}`
                            : ""}
                        </option>
                      ))}
                  </select>

                </label>
              )}

          </div>

        </section>


        {/* ===================================================
            FEATURED BLOG
        =================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>
              <span className="admin-eyebrow">
                FEATURED BLOG
              </span>

              <h3>
                Choose the story to highlight.
              </h3>

              <p>
                Select automatic mode or manually
                choose a published blog post.
              </p>
            </div>

          </div>

          <div className="admin-form-stack">

            <div className="status-options">

              <button
                type="button"
                className={
                  settings.blogFeatureMode ===
                    "AUTOMATIC"
                    ? "status-option active"
                    : "status-option"
                }
                onClick={() =>
                  updateSetting(
                    "blogFeatureMode",
                    "AUTOMATIC"
                  )
                }
              >
                <strong>
                  Automatic
                </strong>

                <small>
                  Let the site choose.
                </small>
              </button>


              <button
                type="button"
                className={
                  settings.blogFeatureMode ===
                    "MANUAL"
                    ? "status-option active"
                    : "status-option"
                }
                onClick={() =>
                  updateSetting(
                    "blogFeatureMode",
                    "MANUAL"
                  )
                }
              >
                <strong>
                  Manual
                </strong>

                <small>
                  Choose a specific post.
                </small>
              </button>

            </div>


            {settings.blogFeatureMode ===
              "MANUAL" && (
                <label className="admin-field">

                  <span>
                    Featured Blog
                  </span>

                  <select
                    value={
                      settings.featuredBlogId ||
                      ""
                    }
                    onChange={(event) =>
                      updateSetting(
                        "featuredBlogId",
                        event.target.value ||
                        null
                      )
                    }
                  >
                    <option value="">
                      Select a blog post
                    </option>

                    {blogs
                      .filter(
                        (blog) =>
                          blog.status ===
                          "PUBLISHED"
                      )
                      .map((blog) => (
                        <option
                          key={blog.id}
                          value={blog.id}
                        >
                          {blog.title}
                        </option>
                      ))}
                  </select>

                </label>
              )}

          </div>

        </section>

        {/* =====================================================
          ABOUT PAGE
      ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>

              <span className="admin-eyebrow">
                ABOUT PAGE
              </span>

              <h3>
                Your story.
              </h3>

              <p>
                Edit the story, philosophy and principles
                displayed on your About page.
              </p>

            </div>

          </div>


          {/* =================================================
            INTRO
        ================================================= */}

          <div className="admin-form-stack">

            <div className="admin-field">

              <span>
                About Headline
              </span>

              <input
                value={
                  settings.aboutHeadline ?? ""
                }
                onChange={(event) =>
                  updateSetting(
                    "aboutHeadline",
                    event.target.value
                  )
                }
                placeholder="I'm Aditya. Still figuring it out."
              />

            </div>


            <div className="admin-field">

              <span>
                Introduction
              </span>

              <textarea
                value={
                  settings.aboutLead ?? ""
                }
                onChange={(event) =>
                  updateSetting(
                    "aboutLead",
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Tell visitors who you are and what this website is about."
              />

            </div>

          </div>


          {/* =================================================
            STORY
        ================================================= */}

          <div
            className="admin-section-header"
            style={{
              marginTop: 48,
            }}
          >

            <div>

              <span className="admin-eyebrow">
                STORY
              </span>

              <h3>
                The story behind the site.
              </h3>

            </div>

          </div>


          <div className="admin-form-stack">

            <div className="admin-field">

              <span>
                Story Title
              </span>

              <input
                value={
                  settings.aboutStoryTitle ?? ""
                }
                onChange={(event) =>
                  updateSetting(
                    "aboutStoryTitle",
                    event.target.value
                  )
                }
                placeholder="This isn't really a travel blog."
              />

            </div>


            <div className="admin-form-grid">

              <div className="admin-field">

                <span>
                  Story — Left Column
                </span>

                <textarea
                  value={
                    settings.aboutStoryLeft ?? ""
                  }
                  onChange={(event) =>
                    updateSetting(
                      "aboutStoryLeft",
                      event.target.value
                    )
                  }
                  rows={10}
                  placeholder="Write the first part of your story..."
                />

              </div>


              <div className="admin-field">

                <span>
                  Story — Right Column
                </span>

                <textarea
                  value={
                    settings.aboutStoryRight ?? ""
                  }
                  onChange={(event) =>
                    updateSetting(
                      "aboutStoryRight",
                      event.target.value
                    )
                  }
                  rows={10}
                  placeholder="Continue your story here..."
                />

              </div>

            </div>

          </div>


          {/* =================================================
            PHILOSOPHY
        ================================================= */}

          <div
            className="admin-section-header"
            style={{
              marginTop: 48,
            }}
          >

            <div>

              <span className="admin-eyebrow">
                PHILOSOPHY
              </span>

              <h3>
                What you believe.
              </h3>

            </div>

          </div>


          <div className="admin-form-stack">

            <div className="admin-field">

              <span>
                Philosophy
              </span>

              <textarea
                value={
                  settings.aboutPhilosophy ?? ""
                }
                onChange={(event) =>
                  updateSetting(
                    "aboutPhilosophy",
                    event.target.value
                  )
                }
                rows={6}
                placeholder="Write your philosophy..."
              />

            </div>

          </div>


          {/* =================================================
            PRINCIPLES
        ================================================= */}

          <div
            className="admin-section-header"
            style={{
              marginTop: 48,
            }}
          >

            <div>

              <span className="admin-eyebrow">
                PRINCIPLES
              </span>

              <h3>
                The four things you stand for.
              </h3>

            </div>

          </div>


          <div className="admin-form-grid">

            <div className="admin-field">

              <span>
                Freedom
              </span>

              <textarea
                value={
                  settings.aboutFreedom ?? ""
                }
                onChange={(event) =>
                  updateSetting(
                    "aboutFreedom",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Find the courage to choose your own direction."
              />

            </div>


            <div className="admin-field">

              <span>
                Exploration
              </span>

              <textarea
                value={
                  settings.aboutExploration ?? ""
                }
                onChange={(event) =>
                  updateSetting(
                    "aboutExploration",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Go see places, cultures and perspectives beyond your routine."
              />

            </div>


            <div className="admin-field">

              <span>
                People
              </span>

              <textarea
                value={
                  settings.aboutPeople ?? ""
                }
                onChange={(event) =>
                  updateSetting(
                    "aboutPeople",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Every stranger carries a story worth hearing."
              />

            </div>


            <div className="admin-field">

              <span>
                Growth
              </span>

              <textarea
                value={
                  settings.aboutGrowth ?? ""
                }
                onChange={(event) =>
                  updateSetting(
                    "aboutGrowth",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Your path can be slower and still be yours."
              />

            </div>

          </div>

        </section>
        {/* ===================================================
            SAVE
        =================================================== */}

        <section className="admin-section">

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <span className="admin-eyebrow">
                SAVE CHANGES
              </span>

              <p>
                Changes are stored in your
                database immediately after saving.
              </p>

            </div>

            <button
              type="button"
              className="admin-button primary"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Settings →"}
            </button>

          </div>

        </section>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="admin-footer">

        <span>
          NOMADS OF ADITYA
        </span>

        <span>
          Admin Console
        </span>

      </footer>

    </main>
  );
}