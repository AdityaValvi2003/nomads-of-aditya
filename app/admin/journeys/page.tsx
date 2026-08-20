"use client";

import { useState } from "react";
import Link from "next/link";

type Journey = {
  id: number;
  title: string;
  location: string;
  type: string;
  status: "Published" | "Draft";
  date: string;
  description: string;
};

const initialJourneys: Journey[] = [
  {
    id: 1,
    title: "The road is always more than the destination.",
    location: "Maharashtra, India",
    type: "Road Journey",
    status: "Published",
    date: "20 Aug 2026",
    description:
      "A journey through roads, mountains, rain and unexpected moments.",
  },
];

export default function AdminJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>(initialJourneys);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    location: "",
    type: "Road Journey",
    date: "",
    description: "",
    status: "Draft" as "Published" | "Draft",
  });

  function resetForm() {
    setForm({
      title: "",
      location: "",
      type: "Road Journey",
      date: "",
      description: "",
      status: "Draft",
    });

    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(journey: Journey) {
    setForm({
      title: journey.title,
      location: journey.location,
      type: journey.type,
      date: journey.date,
      description: journey.description,
      status: journey.status,
    });

    setEditingId(journey.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim() || !form.location.trim()) {
      alert("Please enter a journey title and location.");
      return;
    }

    if (editingId !== null) {
      setJourneys((current) =>
        current.map((journey) =>
          journey.id === editingId
            ? {
                ...journey,
                title: form.title,
                location: form.location,
                type: form.type,
                date: form.date,
                description: form.description,
                status: form.status,
              }
            : journey
        )
      );
    } else {
      const newJourney: Journey = {
        id: Date.now(),
        title: form.title,
        location: form.location,
        type: form.type,
        date: form.date,
        description: form.description,
        status: form.status,
      };

      setJourneys((current) => [...current, newJourney]);
    }

    resetForm();
    setShowForm(false);
  }

  function deleteJourney(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this journey?"
    );

    if (!confirmed) return;

    setJourneys((current) =>
      current.filter((journey) => journey.id !== id)
    );
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
        }

        .journey-admin-button.primary {
          background: var(--accent);
          color: #15110b;
        }

        .journey-admin-button:hover {
          background: var(--accent);
          color: #15110b;
        }

        .journey-admin-list {
          border-top: 1px solid var(--line);
        }

        .journey-admin-row {
          display: grid;
          grid-template-columns: 90px 1.7fr 1fr .8fr .7fr 150px;
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

        @media (max-width: 1000px) {
          .journey-admin-row {
            grid-template-columns: 60px 1.5fr 1fr .8fr;
          }

          .journey-admin-row.header > :nth-child(5),
          .journey-admin-row.header > :nth-child(6),
          .journey-admin-row > :nth-child(5),
          .journey-admin-row > :nth-child(6) {
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
          .journey-admin-row > :nth-child(4) {
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
            <span className="eyebrow">CONTENT MANAGER</span>

            <h1>Journeys</h1>

            <p>
              Create, edit and manage the stories that appear on
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


        {/* JOURNEY LIST */}

        <div className="journey-admin-list">

          <div className="journey-admin-row header">

            <div>#</div>
            <div>Journey</div>
            <div>Location</div>
            <div>Type</div>
            <div>Status</div>
            <div>Actions</div>

          </div>


          {journeys.length === 0 ? (

            <div className="journey-empty">

              <h2>No journeys yet.</h2>

              <p>
                Your first journey will appear here once you create it.
              </p>

              <button
                className="journey-admin-button primary"
                onClick={openCreate}
              >
                Create First Journey
              </button>

            </div>

          ) : (

            journeys.map((journey, index) => (

              <div
                className="journey-admin-row"
                key={journey.id}
              >

                <div className="journey-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>

                  <div className="journey-title">
                    {journey.title}
                  </div>

                  <div className="journey-description">
                    {journey.description}
                  </div>

                </div>

                <div className="journey-meta">
                  {journey.location}
                </div>

                <div className="journey-meta">
                  {journey.type}
                </div>

                <div>

                  <span
                    className={`journey-status ${
                      journey.status === "Published"
                        ? "published"
                        : ""
                    }`}
                  >
                    {journey.status}
                  </span>

                </div>

                <div className="journey-row-actions">

                  <button
                    className="journey-row-action"
                    onClick={() => openEdit(journey)}
                  >
                    Edit
                  </button>

                  <button
                    className="journey-row-action delete"
                    onClick={() => deleteJourney(journey.id)}
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>


        {/* CREATE / EDIT FORM */}

        {showForm && (

          <div className="journey-form-overlay">

            <form
              className="journey-form"
              onSubmit={handleSubmit}
            >

              <div className="journey-form-header">

                <div>

                  <span className="eyebrow">
                    {editingId ? "EDIT JOURNEY" : "NEW JOURNEY"}
                  </span>

                  <h2>
                    {editingId
                      ? "Edit journey."
                      : "Create a journey."}
                  </h2>

                  <p>
                    Start with the basic information. We'll build
                    the complete story editor next.
                  </p>

                </div>

                <button
                  type="button"
                  className="journey-close"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  ×
                </button>

              </div>


              <div className="journey-form-grid">

                {/* TITLE */}

                <div className="journey-form-field full">

                  <label>
                    Journey title
                  </label>

                  <input
                    type="text"
                    placeholder="The road is always more than the destination."
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                      })
                    }
                  />

                </div>


                {/* LOCATION */}

                <div className="journey-form-field">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    placeholder="Maharashtra, India"
                    value={form.location}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        location: e.target.value,
                      })
                    }
                  />

                </div>


                {/* TYPE */}

                <div className="journey-form-field">

                  <label>
                    Journey type
                  </label>

                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value,
                      })
                    }
                  >

                    <option>
                      Road Journey
                    </option>

                    <option>
                      Trek
                    </option>

                    <option>
                      Backpacking
                    </option>

                    <option>
                      Weekend Escape
                    </option>

                    <option>
                      Solo Journey
                    </option>

                    <option>
                      Other
                    </option>

                  </select>

                </div>


                {/* DATE */}

                <div className="journey-form-field">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                  />

                </div>


                {/* STATUS */}

                <div className="journey-form-field">

                  <label>
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as
                          | "Published"
                          | "Draft",
                      })
                    }
                  >

                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Published">
                      Published
                    </option>

                  </select>

                </div>


                {/* DESCRIPTION */}

                <div className="journey-form-field full">

                  <label>
                    Short description
                  </label>

                  <textarea
                    placeholder="A short introduction to this journey..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                  />

                </div>

              </div>


              {/* FORM FOOTER */}

              <div className="journey-form-footer">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  {editingId
                    ? "Save Changes"
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