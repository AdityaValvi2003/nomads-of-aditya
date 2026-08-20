"use client";

import Link from "next/link";
import { useState } from "react";

export default function JourneyEditor() {
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");

  const [form, setForm] = useState({
    title: "The road is always more than the destination.",
    location: "Maharashtra · India",
    heroDescription:
      "A journey through roads, mountains, rain and unexpected moments.",

    beginningEyebrow: "THE BEGINNING",
    beginningTitle:
      "Sometimes you leave without knowing exactly what you're looking for.",
    beginningText:
      "Some journeys begin with a destination. Others begin with a simple feeling that you need to get away for a while.\n\nThis was one of those journeys.",

    roadEyebrow: "ON THE ROAD",
    roadTitle: "The road started becoming the destination.",
    roadText:
      "The further I travelled, the less important the original plan seemed to become.\n\nRoads disappeared into the mountains. Clouds moved across the hills. Rain came and went without warning.\n\nAnd somewhere between one turn and the next, I stopped thinking about where I was supposed to be going.",

    quote:
      "Sometimes the best part of a journey is forgetting where you planned to go.",

    peopleEyebrow: "THE PEOPLE",
    peopleTitle: "The places matter. The people matter more.",
    peopleText:
      "One of the things I love about travelling is how quickly strangers can become part of a memory.\n\nA conversation at a roadside stop. Someone pointing toward a better road. A smile from someone you'll probably never meet again.\n\nThese small moments rarely make it onto a map, but somehow they become the parts of a journey that stay with you.",

    peopleQuote:
      "You remember the feeling long after you forget the route.",

    broughtEyebrow: "WHAT I BROUGHT BACK",
    broughtTitle: "Not souvenirs. Perspective.",
    broughtText:
      "Every journey leaves something behind.\n\nSometimes it is a photograph. Sometimes a story. Sometimes just a different way of looking at something you thought you already understood.\n\nI came back with more questions than answers. And honestly, I think that's a good thing.",

    memories: "Roads · Mountains · People",
    type: "Road Journey",

    closingEyebrow: "UNTIL THE NEXT ROAD",
    closingTitle: "The journey continues.",
    closingText:
      "There are still places I've never seen, roads I've never taken and stories I haven't written yet.",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveDraft() {
    setStatus("Draft");
    alert("Journey saved as draft.");
  }

  function publishJourney() {
    setStatus("Published");
    alert("Journey published.");
  }

  return (
    <>
      <style>{`
        .editor-page {
          min-height: 100vh;
          padding: 140px 6vw 100px;
        }

        .editor-top {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 40px;
          padding-bottom: 45px;
          border-bottom: 1px solid var(--line);
        }

        .editor-heading h1 {
          font: clamp(3rem, 7vw, 6.5rem) / .95 var(--serif);
          margin: 12px 0 18px;
        }

        .editor-heading p {
          color: var(--muted);
          max-width: 650px;
          margin: 0;
        }

        .editor-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .editor-button {
          padding: 13px 19px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--text);
          font-size: .72rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .editor-button:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .editor-button.primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        .editor-button.primary:hover {
          background: var(--accent2);
          color: #15110b;
        }

        .editor-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          color: var(--muted);
          font-size: .72rem;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .editor-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
        }

        .editor-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 850px);
          gap: 70px;
          max-width: 1250px;
          margin: 70px auto 0;
        }

        .editor-sidebar {
          position: sticky;
          top: 110px;
          align-self: start;
        }

        .editor-sidebar-title {
          color: var(--accent);
          font-size: .7rem;
          letter-spacing: .16em;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .editor-sidebar a {
          display: block;
          padding: 9px 0;
          color: var(--muted);
          font-size: .84rem;
          border-bottom: 1px solid transparent;
        }

        .editor-sidebar a:hover {
          color: var(--text);
        }

        .editor-main {
          min-width: 0;
        }

        .editor-section {
          padding: 55px 0;
          border-bottom: 1px solid var(--line);
          scroll-margin-top: 100px;
        }

        .editor-section:first-child {
          padding-top: 0;
        }

        .editor-section-heading {
          margin-bottom: 35px;
        }

        .editor-section-heading h2 {
          font: clamp(2rem, 4vw, 3.5rem) / 1 var(--serif);
          margin: 10px 0;
        }

        .editor-section-heading p {
          color: var(--muted);
          max-width: 650px;
          margin: 0;
        }

        .editor-field {
          margin-bottom: 25px;
        }

        .editor-field:last-child {
          margin-bottom: 0;
        }

        .editor-field label {
          display: block;
          color: var(--accent);
          font-size: .7rem;
          letter-spacing: .15em;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 9px;
        }

        .editor-field input,
        .editor-field textarea,
        .editor-field select {
          width: 100%;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--text);
          padding: 15px 16px;
          outline: none;
          font: inherit;
        }

        .editor-field input {
          min-height: 50px;
        }

        .editor-field textarea {
          min-height: 190px;
          resize: vertical;
          line-height: 1.7;
        }

        .editor-field input:focus,
        .editor-field textarea:focus,
        .editor-field select:focus {
          border-color: var(--accent);
        }

        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .editor-grid .full {
          grid-column: 1 / -1;
        }

        .editor-image-box {
          border: 1px dashed var(--line);
          min-height: 220px;
          background:
            linear-gradient(
              135deg,
              rgba(217,154,61,.06),
              transparent
            ),
            var(--panel);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 30px;
        }

        .editor-image-box strong {
          font: 1.7rem var(--serif);
          margin-bottom: 8px;
        }

        .editor-image-box p {
          color: var(--muted);
          margin: 0 0 20px;
          font-size: .9rem;
        }

        .editor-image-button {
          border: 1px solid var(--accent);
          color: var(--accent);
          padding: 10px 16px;
          background: transparent;
          cursor: pointer;
          font-size: .7rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .editor-quote {
          border-left: 3px solid var(--accent);
          padding: 25px;
          background: var(--panel);
        }

        .editor-quote textarea {
          min-height: 120px;
          border: 0;
          background: transparent;
          padding: 0;
          font: 1.5rem / 1.35 var(--serif);
        }

        .editor-quote textarea:focus {
          border: 0;
        }

        .editor-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .editor-bottom {
          padding: 50px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .editor-bottom-note {
          color: var(--muted);
          font-size: .85rem;
        }

        .editor-bottom-actions {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .editor-layout {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .editor-sidebar {
            position: static;
            display: flex;
            gap: 15px;
            overflow-x: auto;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--line);
          }

          .editor-sidebar-title {
            display: none;
          }

          .editor-sidebar a {
            white-space: nowrap;
            border: 1px solid var(--line);
            padding: 8px 12px;
          }
        }

        @media (max-width: 700px) {
          .editor-page {
            padding: 110px 7vw 70px;
          }

          .editor-top {
            display: block;
          }

          .editor-actions {
            margin-top: 25px;
          }

          .editor-grid,
          .editor-meta {
            grid-template-columns: 1fr;
          }

          .editor-grid .full {
            grid-column: auto;
          }

          .editor-bottom {
            display: block;
          }

          .editor-bottom-actions {
            margin-top: 20px;
          }

          .editor-bottom-actions .editor-button {
            flex: 1;
          }
        }
      `}</style>

      <main className="editor-page">

        {/* TOP HEADER */}

        <div className="editor-top">

          <div className="editor-heading">

            <span className="eyebrow">
              JOURNEY EDITOR
            </span>

            <h1>Edit Journey</h1>

            <p>
              Build the complete story that visitors will
              experience on your journey page.
            </p>

            <div className="editor-status">

              <span className="editor-status-dot" />

              {status}

            </div>

          </div>

          <div className="editor-actions">

            <Link
              href="/admin/journeys"
              className="editor-button"
            >
              ← All Journeys
            </Link>

            <button
              className="editor-button"
              onClick={saveDraft}
            >
              Save Draft
            </button>

            <button
              className="editor-button primary"
              onClick={publishJourney}
            >
              Publish Journey
            </button>

          </div>

        </div>


        <div className="editor-layout">

          {/* SIDEBAR */}

          <aside className="editor-sidebar">

            <div className="editor-sidebar-title">
              Story Sections
            </div>

            <a href="#hero">
              01 · Hero
            </a>

            <a href="#beginning">
              02 · Beginning
            </a>

            <a href="#road">
              03 · On the Road
            </a>

            <a href="#quote">
              04 · Quote
            </a>

            <a href="#people">
              05 · People
            </a>

            <a href="#brought">
              06 · Brought Back
            </a>

            <a href="#details">
              07 · Details
            </a>

            <a href="#closing">
              08 · Closing
            </a>

          </aside>


          {/* MAIN EDITOR */}

          <div className="editor-main">

            {/* HERO */}

            <section
              className="editor-section"
              id="hero"
            >

              <div className="editor-section-heading">

                <span className="eyebrow">
                  01 · HERO
                </span>

                <h2>Set the first impression.</h2>

                <p>
                  This is the opening section visitors see
                  when they enter the journey.
                </p>

              </div>


              <div className="editor-field">

                <label>
                  Journey title
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    updateField("title", e.target.value)
                  }
                />

              </div>


              <div className="editor-grid">

                <div className="editor-field">

                  <label>
                    Location
                  </label>

                  <input
                    value={form.location}
                    onChange={(e) =>
                      updateField("location", e.target.value)
                    }
                  />

                </div>


                <div className="editor-field">

                  <label>
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as
                          | "Draft"
                          | "Published"
                      )
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

              </div>


              <div className="editor-field">

                <label>
                  Hero description
                </label>

                <textarea
                  value={form.heroDescription}
                  onChange={(e) =>
                    updateField(
                      "heroDescription",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Hero image
                </label>

                <div className="editor-image-box">

                  <strong>
                    Journey Hero Image
                  </strong>

                  <p>
                    The main photograph displayed behind
                    the journey title.
                  </p>

                  <button
                    type="button"
                    className="editor-image-button"
                    onClick={() =>
                      alert(
                        "Image upload will be connected next."
                      )
                    }
                  >
                    Choose Image
                  </button>

                </div>

              </div>

            </section>


            {/* BEGINNING */}

            <section
              className="editor-section"
              id="beginning"
            >

              <div className="editor-section-heading">

                <span className="eyebrow">
                  02 · THE BEGINNING
                </span>

                <h2>How did the journey begin?</h2>

                <p>
                  Introduce the reason behind the trip and
                  give the reader a reason to keep going.
                </p>

              </div>


              <div className="editor-field">

                <label>
                  Eyebrow
                </label>

                <input
                  value={form.beginningEyebrow}
                  onChange={(e) =>
                    updateField(
                      "beginningEyebrow",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Section title
                </label>

                <input
                  value={form.beginningTitle}
                  onChange={(e) =>
                    updateField(
                      "beginningTitle",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Story
                </label>

                <textarea
                  value={form.beginningText}
                  onChange={(e) =>
                    updateField(
                      "beginningText",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Beginning image
                </label>

                <div className="editor-image-box">

                  <strong>
                    Story Photograph
                  </strong>

                  <p>
                    Add a photograph to accompany this
                    part of the story.
                  </p>

                  <button
                    type="button"
                    className="editor-image-button"
                    onClick={() =>
                      alert(
                        "Image upload will be connected next."
                      )
                    }
                  >
                    Choose Image
                  </button>

                </div>

              </div>

            </section>


            {/* ON THE ROAD */}

            <section
              className="editor-section"
              id="road"
            >

              <div className="editor-section-heading">

                <span className="eyebrow">
                  03 · ON THE ROAD
                </span>

                <h2>Tell the actual journey.</h2>

                <p>
                  This is the main body of the travel story.
                </p>

              </div>


              <div className="editor-field">

                <label>
                  Eyebrow
                </label>

                <input
                  value={form.roadEyebrow}
                  onChange={(e) =>
                    updateField(
                      "roadEyebrow",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Section title
                </label>

                <input
                  value={form.roadTitle}
                  onChange={(e) =>
                    updateField(
                      "roadTitle",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Story
                </label>

                <textarea
                  value={form.roadText}
                  onChange={(e) =>
                    updateField(
                      "roadText",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Road photographs
                </label>

                <div className="editor-image-box">

                  <strong>
                    Journey Gallery
                  </strong>

                  <p>
                    Multiple photographs will eventually
                    be supported here.
                  </p>

                  <button
                    type="button"
                    className="editor-image-button"
                    onClick={() =>
                      alert(
                        "Gallery upload will be connected next."
                      )
                    }
                  >
                    Add Photographs
                  </button>

                </div>

              </div>

            </section>


            {/* QUOTE */}

            <section
              className="editor-section"
              id="quote"
            >

              <div className="editor-section-heading">

                <span className="eyebrow">
                  04 · FEATURED QUOTE
                </span>

                <h2>Give the journey a thought.</h2>

                <p>
                  A short statement that visually breaks
                  the story.
                </p>

              </div>


              <div className="editor-quote">

                <textarea
                  value={form.quote}
                  onChange={(e) =>
                    updateField(
                      "quote",
                      e.target.value
                    )
                  }
                />

              </div>

            </section>


            {/* PEOPLE */}

            <section
              className="editor-section"
              id="people"
            >

              <div className="editor-section-heading">

                <span className="eyebrow">
                  05 · THE PEOPLE
                </span>

                <h2>Who did you meet?</h2>

                <p>
                  Travel isn't only about places. Capture
                  the people and conversations that stayed
                  with you.
                </p>

              </div>


              <div className="editor-field">

                <label>
                  Eyebrow
                </label>

                <input
                  value={form.peopleEyebrow}
                  onChange={(e) =>
                    updateField(
                      "peopleEyebrow",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Section title
                </label>

                <input
                  value={form.peopleTitle}
                  onChange={(e) =>
                    updateField(
                      "peopleTitle",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Story
                </label>

                <textarea
                  value={form.peopleText}
                  onChange={(e) =>
                    updateField(
                      "peopleText",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  People photograph
                </label>

                <div className="editor-image-box">

                  <strong>
                    People / Encounter Image
                  </strong>

                  <p>
                    Add a photograph connected to the
                    people in this journey.
                  </p>

                  <button
                    type="button"
                    className="editor-image-button"
                    onClick={() =>
                      alert(
                        "Image upload will be connected next."
                      )
                    }
                  >
                    Choose Image
                  </button>

                </div>

              </div>


              <div className="editor-quote">

                <textarea
                  value={form.peopleQuote}
                  onChange={(e) =>
                    updateField(
                      "peopleQuote",
                      e.target.value
                    )
                  }
                />

              </div>

            </section>


            {/* BROUGHT BACK */}

            <section
              className="editor-section"
              id="brought"
            >

              <div className="editor-section-heading">

                <span className="eyebrow">
                  06 · WHAT I BROUGHT BACK
                </span>

                <h2>What did the journey leave behind?</h2>

                <p>
                  The reflection at the end of the
                  experience.
                </p>

              </div>


              <div className="editor-field">

                <label>
                  Eyebrow
                </label>

                <input
                  value={form.broughtEyebrow}
                  onChange={(e) =>
                    updateField(
                      "broughtEyebrow",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Section title
                </label>

                <input
                  value={form.broughtTitle}
                  onChange={(e) =>
                    updateField(
                      "broughtTitle",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Reflection
                </label>

                <textarea
                  value={form.broughtText}
                  onChange={(e) =>
                    updateField(
                      "broughtText",
                      e.target.value
                    )
                  }
                />

              </div>

            </section>


            {/* DETAILS */}

            <section
              className="editor-section"
              id="details"
            >

              <div className="editor-section-heading">

                <span className="eyebrow">
                  07 · JOURNEY DETAILS
                </span>

                <h2>Give the story some context.</h2>

                <p>
                  These details appear near the end of
                  the journey.
                </p>

              </div>


              <div className="editor-meta">

                <div className="editor-field">

                  <label>
                    Location
                  </label>

                  <input
                    value={form.location}
                    onChange={(e) =>
                      updateField(
                        "location",
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="editor-field">

                  <label>
                    Journey type
                  </label>

                  <input
                    value={form.type}
                    onChange={(e) =>
                      updateField(
                        "type",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>


              <div className="editor-field">

                <label>
                  Memories
                </label>

                <input
                  value={form.memories}
                  onChange={(e) =>
                    updateField(
                      "memories",
                      e.target.value
                    )
                  }
                />

              </div>

            </section>


            {/* CLOSING */}

            <section
              className="editor-section"
              id="closing"
            >

              <div className="editor-section-heading">

                <span className="eyebrow">
                  08 · CLOSING
                </span>

                <h2>End the story, not the journey.</h2>

                <p>
                  The final section sends the reader back
                  into the rest of the website.
                </p>

              </div>


              <div className="editor-field">

                <label>
                  Eyebrow
                </label>

                <input
                  value={form.closingEyebrow}
                  onChange={(e) =>
                    updateField(
                      "closingEyebrow",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Closing title
                </label>

                <input
                  value={form.closingTitle}
                  onChange={(e) =>
                    updateField(
                      "closingTitle",
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="editor-field">

                <label>
                  Closing text
                </label>

                <textarea
                  value={form.closingText}
                  onChange={(e) =>
                    updateField(
                      "closingText",
                      e.target.value
                    )
                  }
                />

              </div>

            </section>


            {/* BOTTOM ACTIONS */}

            <div className="editor-bottom">

              <div className="editor-bottom-note">

                Current status: <strong>{status}</strong>

              </div>

              <div className="editor-bottom-actions">

                <button
                  className="editor-button"
                  onClick={saveDraft}
                >
                  Save Draft
                </button>

                <button
                  className="editor-button primary"
                  onClick={publishJourney}
                >
                  Publish Journey
                </button>

              </div>

            </div>

          </div>

        </div>

      </main>
    </>
  );
}