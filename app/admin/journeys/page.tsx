"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Journey = {
  id: string;
  title: string;
  slug: string;
  location: string;
  country: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  journeyDate: string | null;
  shortIntro: string | null;
  createdAt: string;
};

type FormState = {
  title: string;
  slug: string;
  location: string;
  country: string;
  journeyDate: string;
  shortIntro: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  location: "",
  country: "India",
  journeyDate: "",
  shortIntro: "",
  status: "DRAFT",
};

export default function AdminJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  useEffect(() => {
    loadJourneys();
  }, []);

  async function loadJourneys() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/journeys"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load journeys."
        );
      }

      setJourneys(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load journeys."
      );
    } finally {
      setLoading(false);
    }
  }

  function createSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function openCreate() {
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setForm(emptyForm);
  }

  function handleTitleChange(
    value: string
  ) {
    setForm((current) => ({
      ...current,
      title: value,
      slug:
        current.slug ===
        createSlug(current.title)
          ? createSlug(value)
          : current.slug,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.slug.trim() ||
      !form.location.trim() ||
      !form.country.trim()
    ) {
      setError(
        "Title, slug, location and country are required."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/admin/journeys",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            location: form.location,
            country: form.country,
            journeyDate:
              form.journeyDate,
            shortIntro:
              form.shortIntro,
            status: form.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create journey."
        );
      }

      setJourneys((current) => [
        data,
        ...current,
      ]);

      setShowForm(false);
      setForm(emptyForm);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create journey."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteJourney(
    journey: Journey
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${journey.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/admin/journeys/${journey.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete journey."
        );
      }

      setJourneys((current) =>
        current.filter(
          (item) =>
            item.id !== journey.id
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete journey."
      );
    }
  }

  function formatDate(
    date: string | null
  ) {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <style>{`
        .journey-admin-page {
          min-height: 100vh;
          padding: 150px 6vw 100px;
        }

        .journey-admin-top {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 40px;
          margin-bottom: 55px;
        }

        .journey-admin-heading h1 {
          font: clamp(3rem, 7vw, 6.5rem) / .95 var(--serif);
          margin: 12px 0 20px;
        }

        .journey-admin-heading p {
          color: var(--muted);
          max-width: 650px;
          margin: 0;
        }

        .journey-admin-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .journey-admin-button {
          border: 1px solid var(--accent);
          padding: 13px 20px;
          font-size: .75rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          background: transparent;
          color: var(--text);
          cursor: pointer;
          text-decoration: none;
        }

        .journey-admin-button.primary {
          background: var(--accent);
          color: #15110b;
        }

        .journey-admin-button:hover {
          background: var(--accent);
          color: #15110b;
        }

        .journey-error {
          margin-bottom: 25px;
          padding: 15px 18px;
          border: 1px solid rgba(184, 92, 75, .4);
          background: rgba(184, 92, 75, .08);
          color: #d98c7c;
          font-size: .85rem;
        }

        .journey-admin-list {
          border-top: 1px solid var(--line);
        }

        .journey-admin-row {
          display: grid;
          grid-template-columns: 70px 1.7fr 1fr .8fr .8fr 150px;
          gap: 25px;
          align-items: center;
          padding: 25px 0;
          border-bottom: 1px solid var(--line);
        }

        .journey-admin-row.header {
          color: var(--muted);
          font-size: .7rem;
          letter-spacing: .15em;
          text-transform: uppercase;
          padding: 15px 0;
        }

        .journey-number {
          color: var(--accent);
          font-size: .75rem;
          letter-spacing: .1em;
        }

        .journey-title {
          font: 1.45rem var(--serif);
          margin-bottom: 5px;
        }

        .journey-description {
          color: var(--muted);
          font-size: .88rem;
          max-width: 500px;
          line-height: 1.6;
        }

        .journey-meta {
          color: var(--muted);
          font-size: .85rem;
        }

        .journey-status {
          display: inline-block;
          padding: 7px 10px;
          border: 1px solid var(--line);
          font-size: .68rem;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .journey-status.published {
          color: var(--accent);
          border-color: var(--accent);
        }

        .journey-status.archived {
          color: #999;
        }

        .journey-row-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .journey-row-action {
          border: 1px solid var(--line);
          padding: 8px 11px;
          font-size: .68rem;
          text-transform: uppercase;
          letter-spacing: .06em;
          cursor: pointer;
          background: transparent;
          color: var(--text);
          text-decoration: none;
        }

        .journey-row-action:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .journey-row-action.delete:hover {
          border-color: #b85c4b;
          color: #b85c4b;
        }

        .journey-empty {
          padding: 80px 20px;
          text-align: center;
          border-bottom: 1px solid var(--line);
        }

        .journey-empty h2 {
          font: 2.5rem var(--serif);
          margin: 0 0 10px;
        }

        .journey-empty p {
          color: var(--muted);
        }

        .journey-loading {
          padding: 80px 20px;
          text-align: center;
          border-bottom: 1px solid var(--line);
          color: var(--muted);
        }

        .journey-form-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, .75);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow-y: auto;
          padding: 70px 20px;
        }

        .journey-form {
          width: min(900px, 100%);
          background: var(--panel);
          border: 1px solid var(--line);
          padding: 45px;
        }

        .journey-form-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 30px;
          margin-bottom: 40px;
        }

        .journey-form-header h2 {
          font: 3rem var(--serif);
          margin: 10px 0;
        }

        .journey-form-header p {
          color: var(--muted);
          margin: 0;
        }

        .journey-close {
          border: 1px solid var(--line);
          width: 40px;
          height: 40px;
          cursor: pointer;
          background: transparent;
          color: var(--text);
          font-size: 1.2rem;
        }

        .journey-close:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .journey-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .journey-form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .journey-form-field.full {
          grid-column: 1 / -1;
        }

        .journey-form-field label {
          font-size: .7rem;
          color: var(--accent);
          letter-spacing: .15em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .journey-form-field input,
        .journey-form-field textarea,
        .journey-form-field select {
          width: 100%;
          border: 1px solid var(--line);
          background: var(--bg);
          color: var(--text);
          padding: 14px 15px;
          outline: none;
          font: inherit;
        }

        .journey-form-field textarea {
          min-height: 150px;
          resize: vertical;
        }

        .journey-form-field input:focus,
        .journey-form-field textarea:focus,
        .journey-form-field select:focus {
          border-color: var(--accent);
        }

        .journey-form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 35px;
          padding-top: 25px;
          border-top: 1px solid var(--line);
        }

        .journey-form-footer button {
          padding: 13px 20px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--text);
          cursor: pointer;
          font-size: .75rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .journey-form-footer button.primary {
          background: var(--accent);
          color: #15110b;
          border-color: var(--accent);
        }

        .journey-form-footer button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .journey-slug-preview {
          color: var(--muted);
          font-size: .75rem;
          margin-top: 3px;
        }

        @media (max-width: 1100px) {
          .journey-admin-row {
            grid-template-columns: 60px 1.5fr 1fr .8fr 130px;
          }

          .journey-admin-row.header > :nth-child(5),
          .journey-admin-row > :nth-child(5) {
            display: none;
          }
        }

        @media (max-width: 850px) {
          .journey-admin-row {
            grid-template-columns: 55px 1.5fr 1fr 130px;
          }

          .journey-admin-row.header > :nth-child(3),
          .journey-admin-row > :nth-child(3) {
            display: none;
          }
        }

        @media (max-width: 700px) {
          .journey-admin-page {
            padding: 110px 7vw 70px;
          }

          .journey-admin-top {
            display: block;
          }

          .journey-admin-actions {
            margin-top: 25px;
          }

          .journey-admin-row {
            grid-template-columns: 45px 1fr;
            gap: 15px;
          }

          .journey-admin-row.header {
            display: none;
          }

          .journey-admin-row > :nth-child(3),
          .journey-admin-row > :nth-child(4),
          .journey-admin-row > :nth-child(5) {
            display: none;
          }

          .journey-row-actions {
            justify-content: flex-start;
            margin-top: 10px;
          }

          .journey-form {
            padding: 25px;
          }

          .journey-form-grid {
            grid-template-columns: 1fr;
          }

          .journey-form-field.full {
            grid-column: auto;
          }

          .journey-form-header h2 {
            font-size: 2.3rem;
          }
        }
      `}</style>

      <main className="journey-admin-page">

        {/* HEADER */}

        <div className="journey-admin-top">

          <div className="journey-admin-heading">

            <span className="eyebrow">
              CONTENT MANAGER
            </span>

            <h1>Journeys</h1>

            <p>
              Create, edit and manage the
              stories that appear on
              Nomads of Aditya.
            </p>

          </div>

          <div className="journey-admin-actions">

            <Link
              href="/admin"
              className="journey-admin-button"
            >
              ← Dashboard
            </Link>

            <button
              className="journey-admin-button primary"
              onClick={openCreate}
            >
              + New Journey
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="journey-error">
            {error}
          </div>
        )}

        {/* JOURNEY LIST */}

        <div className="journey-admin-list">

          <div className="journey-admin-row header">

            <div>#</div>
            <div>Journey</div>
            <div>Location</div>
            <div>Date</div>
            <div>Status</div>
            <div>Actions</div>

          </div>

          {loading ? (

            <div className="journey-loading">
              Loading journeys...
            </div>

          ) : journeys.length === 0 ? (

            <div className="journey-empty">

              <h2>
                No journeys yet.
              </h2>

              <p>
                Your first journey will
                appear here once you
                create it.
              </p>

              <button
                className="journey-admin-button primary"
                onClick={openCreate}
                style={{
                  marginTop: "25px",
                }}
              >
                Create First Journey
              </button>

            </div>

          ) : (

            journeys.map(
              (journey, index) => (

                <div
                  className="journey-admin-row"
                  key={journey.id}
                >

                  <div className="journey-number">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>

                  <div>

                    <div className="journey-title">
                      {journey.title}
                    </div>

                    <div className="journey-description">
                      {journey.shortIntro ||
                        "No introduction yet."}
                    </div>

                  </div>

                  <div className="journey-meta">
                    {journey.location}
                    <br />
                    {journey.country}
                  </div>

                  <div className="journey-meta">
                    {formatDate(
                      journey.journeyDate
                    )}
                  </div>

                  <div>

                    <span
                      className={`journey-status ${
                        journey.status ===
                        "PUBLISHED"
                          ? "published"
                          : journey.status ===
                            "ARCHIVED"
                          ? "archived"
                          : ""
                      }`}
                    >
                      {journey.status}
                    </span>

                  </div>

                  <div className="journey-row-actions">

                    <Link
                      href={`/admin/journeys/${journey.id}`}
                      className="journey-row-action"
                    >
                      Edit
                    </Link>

                    <button
                      className="journey-row-action delete"
                      onClick={() =>
                        deleteJourney(
                          journey
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )

          )}

        </div>

        {/* CREATE FORM */}

        {showForm && (

          <div className="journey-form-overlay">

            <form
              className="journey-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="journey-form-header">

                <div>

                  <span className="eyebrow">
                    NEW JOURNEY
                  </span>

                  <h2>
                    Create a journey.
                  </h2>

                  <p>
                    Add the basic information
                    for your new journey.
                  </p>

                </div>

                <button
                  type="button"
                  className="journey-close"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                >
                  ×
                </button>

              </div>

              <div className="journey-form-grid">

                {/* TITLE */}

                <div className="journey-form-field full">

                  <label>
                    Journey title *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="The road is always more than the destination."
                    value={
                      form.title
                    }
                    onChange={(event) =>
                      handleTitleChange(
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* SLUG */}

                <div className="journey-form-field full">

                  <label>
                    Slug *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="the-road-is-always-more-than-the-destination"
                    value={
                      form.slug
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          slug:
                            event.target.value
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              ),
                        })
                      )
                    }
                  />

                  <div className="journey-slug-preview">
                    /journeys/
                    {form.slug ||
                      "your-journey-slug"}
                  </div>

                </div>

                {/* LOCATION */}

                <div className="journey-form-field">

                  <label>
                    Location *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={
                      form.location
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          location:
                            event.target
                              .value,
                        })
                      )
                    }
                  />

                </div>

                {/* COUNTRY */}

                <div className="journey-form-field">

                  <label>
                    Country *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="India"
                    value={
                      form.country
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          country:
                            event.target
                              .value,
                        })
                      )
                    }
                  />

                </div>

                {/* DATE */}

                <div className="journey-form-field">

                  <label>
                    Journey date
                  </label>

                  <input
                    type="date"
                    value={
                      form.journeyDate
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          journeyDate:
                            event.target
                              .value,
                        })
                      )
                    }
                  />

                </div>

                {/* STATUS */}

                <div className="journey-form-field">

                  <label>
                    Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          status:
                            event.target
                              .value as
                              | "DRAFT"
                              | "PUBLISHED"
                              | "ARCHIVED",
                        })
                      )
                    }
                  >

                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                    <option value="ARCHIVED">
                      Archived
                    </option>

                  </select>

                </div>

                {/* INTRO */}

                <div className="journey-form-field full">

                  <label>
                    Short introduction
                  </label>

                  <textarea
                    placeholder="A short introduction to this journey..."
                    value={
                      form.shortIntro
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          shortIntro:
                            event.target
                              .value,
                        })
                      )
                    }
                  />

                </div>

              </div>

              {/* FOOTER */}

              <div className="journey-form-footer">

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
                    : "Create Journey"}
                </button>

              </div>

            </form>

          </div>

        )}

      </main>
    </>
  );
}