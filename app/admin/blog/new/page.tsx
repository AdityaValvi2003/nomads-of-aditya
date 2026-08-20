"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBlogPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Travel");
  const [content, setContent] = useState("");
  const [status, setStatus] =
    useState<"Draft" | "Published">("Draft");
  const [featured, setFeatured] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSave(
    publishStatus: "Draft" | "Published" = "Draft"
  ) {
    if (!title.trim()) {
      alert("Please enter a story title.");
      return;
    }

    if (!slug.trim()) {
      alert("Please enter a URL slug.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          subtitle: category,
          shortIntro: excerpt.trim(),
          status: publishStatus,
          isFeatured: featured,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to save blog post."
        );
        return;
      }

      setStatus(publishStatus);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
        router.push("/admin/blog");
        router.refresh();
      }, 800);
    } catch (error) {
      console.error(
        "Save blog error:",
        error
      );

      alert(
        "Something went wrong while saving the blog post."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`

        .editor-page {
          min-height: 100vh;
          padding: 150px 6vw 100px;
        }

        /* HEADER */

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 40px;
          padding-bottom: 35px;
          border-bottom: 1px solid var(--line);
        }

        .editor-header h1 {
          font: clamp(3rem, 6vw, 6rem) / .95 var(--serif);
          margin: 12px 0;
        }

        .editor-header p {
          color: var(--muted);
          margin: 0;
        }

        .editor-header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .editor-button {
          padding: 13px 18px;
          border: 1px solid var(--line);
          color: var(--text);
          background: transparent;
          cursor: pointer;
          font-size: .68rem;
          letter-spacing: .08em;
          text-transform: uppercase;
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
        }

        .editor-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        /* LAYOUT */

        .editor-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 35px;
          margin-top: 45px;
          align-items: start;
        }

        .editor-main {
          min-width: 0;
        }

        .editor-sidebar {
          position: sticky;
          top: 110px;
        }

        /* FIELD */

        .editor-field {
          margin-bottom: 28px;
        }

        .editor-label {
          display: block;
          color: var(--accent);
          font-size: .68rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .editor-input,
        .editor-select,
        .editor-textarea {
          width: 100%;
          background: var(--panel);
          color: var(--text);
          border: 1px solid var(--line);
          outline: none;
          font: inherit;
        }

        .editor-input {
          padding: 16px 18px;
          font-size: 1rem;
        }

        .editor-input.title-input {
          font: clamp(2rem, 4vw, 4rem) / 1.05 var(--serif);
          padding: 22px;
        }

        .editor-input:focus,
        .editor-select:focus,
        .editor-textarea:focus {
          border-color: var(--accent);
        }

        .editor-textarea {
          min-height: 500px;
          resize: vertical;
          padding: 22px;
          line-height: 1.8;
        }

        .slug-row {
          display: flex;
          align-items: stretch;
        }

        .slug-prefix {
          display: flex;
          align-items: center;
          padding: 0 14px;
          background: var(--bg);
          border: 1px solid var(--line);
          border-right: 0;
          color: var(--muted);
          font-size: .8rem;
          white-space: nowrap;
        }

        .slug-row .editor-input {
          min-width: 0;
        }

        .character-count {
          text-align: right;
          margin-top: 6px;
          color: var(--muted);
          font-size: .68rem;
        }

        /* TOOLBAR */

        .editor-toolbar {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          padding: 10px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-bottom: 0;
        }

        .toolbar-button {
          padding: 8px 11px;
          border: 1px solid transparent;
          color: var(--muted);
          background: transparent;
          cursor: pointer;
          font-size: .72rem;
          font-weight: 700;
        }

        .toolbar-button:hover {
          color: var(--accent);
          border-color: var(--line);
        }

        /* SIDEBAR */

        .sidebar-card {
          background: var(--panel);
          border: 1px solid var(--line);
          margin-bottom: 18px;
        }

        .sidebar-card-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--line);
        }

        .sidebar-card-header span {
          color: var(--accent);
          font-size: .67rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .sidebar-card-body {
          padding: 20px;
        }

        .sidebar-field {
          margin-bottom: 20px;
        }

        .sidebar-field:last-child {
          margin-bottom: 0;
        }

        .sidebar-label {
          display: block;
          color: var(--muted);
          font-size: .68rem;
          margin-bottom: 8px;
        }

        .editor-select {
          padding: 12px;
        }

        /* STATUS */

        .status-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .status-option {
          padding: 12px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-size: .68rem;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .status-option.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        /* FEATURED */

        .featured-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .featured-copy strong {
          display: block;
          font-size: .82rem;
          margin-bottom: 4px;
        }

        .featured-copy span {
          color: var(--muted);
          font-size: .68rem;
          line-height: 1.4;
        }

        .toggle {
          width: 44px;
          height: 24px;
          border: 1px solid var(--line);
          border-radius: 30px;
          padding: 3px;
          background: var(--bg);
          cursor: pointer;
          flex-shrink: 0;
        }

        .toggle-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--muted);
          transition: .2s;
        }

        .toggle.active {
          background: var(--accent);
          border-color: var(--accent);
        }

        .toggle.active .toggle-dot {
          background: #15110b;
          transform: translateX(18px);
        }

        /* COVER */

        .cover-placeholder {
          min-height: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 1px dashed var(--line);
          color: var(--muted);
          padding: 25px;
          font-size: .75rem;
          line-height: 1.6;
        }

        .cover-placeholder strong {
          display: block;
          color: var(--text);
          font-family: var(--serif);
          font-size: 1.4rem;
          margin-bottom: 6px;
        }

        /* SAVE NOTICE */

        .save-notice {
          position: fixed;
          right: 30px;
          bottom: 30px;
          z-index: 100;
          padding: 14px 20px;
          background: var(--accent);
          color: #15110b;
          font-size: .72rem;
          letter-spacing: .06em;
          text-transform: uppercase;
          box-shadow: 0 15px 40px rgba(0,0,0,.35);
        }

        /* PREVIEW */

        .preview-box {
          margin-top: 40px;
          border-top: 1px solid var(--line);
          padding-top: 40px;
        }

        .preview-label {
          color: var(--accent);
          font-size: .68rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .preview-title {
          font: clamp(2.5rem, 5vw, 5rem) / .95 var(--serif);
          margin: 10px 0 20px;
        }

        .preview-excerpt {
          color: var(--muted);
          max-width: 700px;
          font-size: 1.05rem;
          margin-bottom: 35px;
        }

        .preview-content {
          white-space: pre-wrap;
          max-width: 800px;
          line-height: 1.9;
          color: #d8d2c8;
        }

        @media (max-width: 950px) {
          .editor-layout {
            grid-template-columns: 1fr;
          }

          .editor-sidebar {
            position: static;
          }
        }

        @media (max-width: 700px) {
          .editor-page {
            padding: 110px 7vw 70px;
          }

          .editor-header {
            display: block;
          }

          .editor-header-actions {
            margin-top: 25px;
          }

          .slug-prefix {
            display: none;
          }

          .editor-input.title-input {
            font-size: 2rem;
          }
        }

      `}</style>

      <main className="editor-page">

        {/* HEADER */}

        <header className="editor-header">

          <div>

            <span className="eyebrow">
              NOMADS OF ADITYA · BLOG
            </span>

            <h1>New Story</h1>

            <p>
              Write something worth remembering.
            </p>

          </div>

          <div className="editor-header-actions">

            <Link
              href="/admin/blog"
              className="editor-button"
            >
              ← Back to Blog
            </Link>

            <button
              className="editor-button"
              disabled={saving}
              onClick={() =>
                handleSave("Draft")
              }
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              className="editor-button primary"
              disabled={saving}
              onClick={() =>
                handleSave("Published")
              }
            >
              {saving
                ? "Publishing..."
                : "Publish"}
            </button>

          </div>

        </header>


        {/* EDITOR */}

        <div className="editor-layout">

          {/* MAIN */}

          <section className="editor-main">

            {/* TITLE */}

            <div className="editor-field">

              <label className="editor-label">
                Story Title
              </label>

              <input
                className="editor-input title-input"
                value={title}
                onChange={(e) =>
                  handleTitleChange(
                    e.target.value
                  )
                }
                placeholder="Give your story a name..."
              />

            </div>


            {/* SLUG */}

            <div className="editor-field">

              <label className="editor-label">
                URL Slug
              </label>

              <div className="slug-row">

                <div className="slug-prefix">
                  /blog/
                </div>

                <input
                  className="editor-input"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      generateSlug(
                        e.target.value
                      )
                    )
                  }
                  placeholder="your-story-slug"
                />

              </div>

            </div>


            {/* EXCERPT */}

            <div className="editor-field">

              <label className="editor-label">
                Short Description
              </label>

              <textarea
                className="editor-textarea"
                style={{
                  minHeight: "130px",
                }}
                value={excerpt}
                onChange={(e) =>
                  setExcerpt(
                    e.target.value
                  )
                }
                placeholder="A short description that appears on the Blog page..."
              />

              <div className="character-count">
                {excerpt.length} characters
              </div>

            </div>


            {/* CONTENT */}

            <div className="editor-field">

              <label className="editor-label">
                Story Content
              </label>

              <div className="editor-toolbar">

                <button
                  className="toolbar-button"
                  type="button"
                  onClick={() =>
                    setContent(
                      (current) =>
                        current + "\n\n# "
                    )
                  }
                >
                  H1
                </button>

                <button
                  className="toolbar-button"
                  type="button"
                  onClick={() =>
                    setContent(
                      (current) =>
                        current + "\n\n## "
                    )
                  }
                >
                  H2
                </button>

                <button
                  className="toolbar-button"
                  type="button"
                  onClick={() =>
                    setContent(
                      (current) =>
                        current +
                        "\n\n**bold**"
                    )
                  }
                >
                  B
                </button>

                <button
                  className="toolbar-button"
                  type="button"
                  onClick={() =>
                    setContent(
                      (current) =>
                        current +
                        "\n\n> "
                    )
                  }
                >
                  Quote
                </button>

                <button
                  className="toolbar-button"
                  type="button"
                  onClick={() =>
                    setContent(
                      (current) =>
                        current +
                        "\n\n---\n\n"
                    )
                  }
                >
                  Divider
                </button>

                <button
                  className="toolbar-button"
                  type="button"
                  onClick={() =>
                    setContent(
                      (current) =>
                        current +
                        "\n\n[Image]\n\n"
                    )
                  }
                >
                  Image
                </button>

              </div>

              <textarea
                className="editor-textarea"
                value={content}
                onChange={(e) =>
                  setContent(
                    e.target.value
                  )
                }
                placeholder={`Start writing your story...

Tell the story naturally.

Write about the road.
The people.
The places.
The things you noticed.

This editor will later become a proper rich-text editor connected to the database.`}
              />

            </div>


            {/* PREVIEW */}

            <section className="preview-box">

              <div className="preview-label">
                Live Preview
              </div>

              <div className="preview-title">
                {title ||
                  "Your story title"}
              </div>

              <div className="preview-excerpt">
                {excerpt ||
                  "Your short description will appear here."}
              </div>

              <div className="preview-content">
                {content ||
                  "Your story content will appear here as you write."}
              </div>

            </section>

          </section>


          {/* SIDEBAR */}

          <aside className="editor-sidebar">

            {/* PUBLISH */}

            <div className="sidebar-card">

              <div className="sidebar-card-header">
                <span>
                  Publishing
                </span>
              </div>

              <div className="sidebar-card-body">

                <div className="sidebar-field">

                  <label className="sidebar-label">
                    Status
                  </label>

                  <div className="status-options">

                    <button
                      type="button"
                      className={`status-option ${
                        status === "Draft"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setStatus("Draft")
                      }
                    >
                      Draft
                    </button>

                    <button
                      type="button"
                      className={`status-option ${
                        status ===
                        "Published"
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setStatus(
                          "Published"
                        )
                      }
                    >
                      Published
                    </button>

                  </div>

                </div>


                <div className="sidebar-field">

                  <label className="sidebar-label">
                    Category
                  </label>

                  <select
                    className="editor-select"
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                  >

                    <option>
                      Travel
                    </option>

                    <option>
                      Thoughts
                    </option>

                    <option>
                      People
                    </option>

                    <option>
                      Photography
                    </option>

                    <option>
                      Life
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* FEATURED */}

            <div className="sidebar-card">

              <div className="sidebar-card-header">
                <span>
                  Homepage
                </span>
              </div>

              <div className="sidebar-card-body">

                <div className="featured-toggle">

                  <div className="featured-copy">

                    <strong>
                      Featured Story
                    </strong>

                    <span>
                      Show this story in
                      featured sections.
                    </span>

                  </div>

                  <button
                    type="button"
                    className={`toggle ${
                      featured
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setFeatured(
                        !featured
                      )
                    }
                  >
                    <div className="toggle-dot" />
                  </button>

                </div>

              </div>

            </div>


            {/* COVER IMAGE */}

            <div className="sidebar-card">

              <div className="sidebar-card-header">
                <span>
                  Cover Image
                </span>
              </div>

              <div className="sidebar-card-body">

                <div className="cover-placeholder">

                  <div>

                    <strong>
                      No image selected
                    </strong>

                    Cover image upload will
                    be connected to the
                    Media Library next.

                  </div>

                </div>

              </div>

            </div>


            {/* DETAILS */}

            <div className="sidebar-card">

              <div className="sidebar-card-header">
                <span>
                  Story Details
                </span>
              </div>

              <div className="sidebar-card-body">

                <div className="sidebar-field">

                  <label className="sidebar-label">
                    Author
                  </label>

                  <strong>
                    Aditya
                  </strong>

                </div>


                <div className="sidebar-field">

                  <label className="sidebar-label">
                    Reading Time
                  </label>

                  <strong>

                    {Math.max(
                      1,
                      Math.ceil(
                        content
                          .trim()
                          .split(/\s+/)
                          .filter(
                            Boolean
                          ).length / 200
                      )
                    )}{" "}
                    min read

                  </strong>

                </div>


                <div className="sidebar-field">

                  <label className="sidebar-label">
                    Current Status
                  </label>

                  <strong>
                    {status}
                  </strong>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>


      {/* SAVE NOTICE */}

      {saved && (

        <div className="save-notice">
          Changes saved
        </div>

      )}

    </>
  );
}