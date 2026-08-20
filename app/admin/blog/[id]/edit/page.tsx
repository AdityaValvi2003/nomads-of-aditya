"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BlogStatus = "Draft" | "Published";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: BlogStatus;
  featured: boolean;
  content: string;
  coverImage?: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  date?: string;
};

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();

  /*
   * IMPORTANT:
   * Prisma Blog.id is a STRING.
   *
   * Do NOT use Number(params.id).
   */
  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [post, setPost] = useState<BlogPost | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] =
    useState("Travel");
  const [content, setContent] = useState("");

  const [status, setStatus] =
    useState<BlogStatus>("Draft");

  const [featured, setFeatured] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD BLOG FROM DATABASE
  // ==========================================================

  useEffect(() => {
    if (!id) return;

    async function loadBlog() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/blog/${id}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ||
              "Failed to load blog post."
          );

          return;
        }

        const blog: BlogPost = data;

        setPost(blog);

        setTitle(blog.title || "");
        setSlug(blog.slug || "");
        setExcerpt(blog.excerpt || "");
        setCategory(
          blog.category || "Travel"
        );
        setContent(blog.content || "");

        setStatus(
          blog.status || "Draft"
        );

        setFeatured(
          Boolean(blog.featured)
        );
      } catch (error) {
        console.error(
          "Load blog error:",
          error
        );

        setError(
          "Something went wrong while loading the blog post."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBlog();
  }, [id]);


  // ==========================================================
  // SLUG
  // ==========================================================

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }


  function handleTitleChange(
    value: string
  ) {
    setTitle(value);
  }


  // ==========================================================
  // SAVE
  // ==========================================================

  async function handleSave(
    publishStatus?: BlogStatus
  ) {
    if (!id) {
      alert("Blog ID is missing.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a story title.");
      return;
    }

    if (!slug.trim()) {
      alert("Please enter a URL slug.");
      return;
    }

    const finalStatus =
      publishStatus || status;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/blog/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),

            slug: slug.trim(),

            subtitle: category,

            shortIntro:
              excerpt.trim(),

            status: finalStatus,

            isFeatured: featured,

            content,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to save blog post."
        );

        return;
      }

      setStatus(finalStatus);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
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


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <>
        <style>{`

          .loading-page {
            min-height: 100vh;
            padding: 180px 8vw;
          }

          .loading-page h1 {
            font:
              clamp(3rem, 7vw, 6rem)
              / .95
              var(--serif);

            margin: 15px 0;
          }

          .loading-page p {
            color: var(--muted);
          }

        `}</style>

        <main className="loading-page">

          <span className="eyebrow">
            BLOG · ADMIN
          </span>

          <h1>
            Loading story...
          </h1>

          <p>
            Loading the story from the database.
          </p>

        </main>
      </>
    );
  }


  // ==========================================================
  // NOT FOUND / ERROR
  // ==========================================================

  if (!post || error) {
    return (
      <>
        <style>{`

          .not-found {
            min-height: 100vh;
            padding: 180px 8vw;
          }

          .not-found h1 {
            font:
              clamp(3rem, 7vw, 6rem)
              / .95
              var(--serif);

            margin: 15px 0;
          }

          .not-found p {
            color: var(--muted);
            margin-bottom: 30px;
          }

          .back-button {
            display: inline-block;
            padding: 13px 18px;
            border: 1px solid var(--accent);
            background: var(--accent);
            color: #15110b;
            font-size: .7rem;
            letter-spacing: .08em;
            text-transform: uppercase;
          }

        `}</style>

        <main className="not-found">

          <span className="eyebrow">
            BLOG · ADMIN
          </span>

          <h1>
            Story not found.
          </h1>

          <p>
            {error ||
              "The blog post you're trying to edit doesn't exist."}
          </p>

          <Link
            href="/admin/blog"
            className="back-button"
          >
            ← Back to Blog
          </Link>

        </main>
      </>
    );
  }


  // ==========================================================
  // EDIT PAGE
  // ==========================================================

  return (
    <>
      <style>{`

        .edit-page {
          min-height: 100vh;
          padding: 150px 6vw 100px;
        }

        .edit-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 40px;
          padding-bottom: 35px;
          border-bottom: 1px solid var(--line);
        }

        .edit-header h1 {
          font:
            clamp(3rem, 6vw, 6rem)
            / .95
            var(--serif);

          margin: 12px 0;
        }

        .edit-header p {
          color: var(--muted);
          margin: 0;
        }

        .edit-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .edit-button {
          display: inline-block;
          padding: 13px 18px;
          border: 1px solid var(--line);
          color: var(--text);
          background: transparent;
          cursor: pointer;
          font-size: .68rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .edit-button:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .edit-button.primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        .edit-button.primary:hover {
          background: var(--accent2);
        }

        .edit-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .edit-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            330px;

          gap: 35px;
          margin-top: 45px;
          align-items: start;
        }

        .edit-main {
          min-width: 0;
        }

        .edit-sidebar {
          position: sticky;
          top: 110px;
        }

        .edit-field {
          margin-bottom: 28px;
        }

        .edit-label {
          display: block;
          color: var(--accent);
          font-size: .68rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .edit-input,
        .edit-select,
        .edit-textarea {
          width: 100%;
          background: var(--panel);
          color: var(--text);
          border: 1px solid var(--line);
          outline: none;
          font: inherit;
        }

        .edit-input {
          padding: 16px 18px;
        }

        .edit-input.title-input {
          font:
            clamp(2rem, 4vw, 4rem)
            / 1.05
            var(--serif);

          padding: 22px;
        }

        .edit-input:focus,
        .edit-select:focus,
        .edit-textarea:focus {
          border-color: var(--accent);
        }

        .edit-textarea {
          min-height: 500px;
          resize: vertical;
          padding: 22px;
          line-height: 1.8;
        }

        .edit-textarea.excerpt {
          min-height: 130px;
        }

        .slug-row {
          display: flex;
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
        }

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

        .sidebar-card {
          background: var(--panel);
          border: 1px solid var(--line);
          margin-bottom: 18px;
        }

        .sidebar-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--line);
        }

        .sidebar-header span {
          color: var(--accent);
          font-size: .67rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .sidebar-body {
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

        .edit-select {
          padding: 12px;
        }

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
          font:
            1.4rem
            var(--serif);

          margin-bottom: 6px;
        }

        .preview {
          margin-top: 45px;
          padding-top: 40px;
          border-top: 1px solid var(--line);
        }

        .preview-label {
          color: var(--accent);
          font-size: .68rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .preview-title {
          font:
            clamp(2.5rem, 5vw, 5rem)
            / .95
            var(--serif);

          margin: 12px 0 20px;
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
          box-shadow:
            0 15px 40px rgba(0,0,0,.35);
        }

        @media (max-width: 950px) {

          .edit-layout {
            grid-template-columns: 1fr;
          }

          .edit-sidebar {
            position: static;
          }

        }

        @media (max-width: 700px) {

          .edit-page {
            padding: 110px 7vw 70px;
          }

          .edit-header {
            display: block;
          }

          .edit-actions {
            margin-top: 25px;
          }

          .slug-prefix {
            display: none;
          }

          .edit-input.title-input {
            font-size: 2rem;
          }

        }

      `}</style>


      <main className="edit-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="edit-header">

          <div>

            <span className="eyebrow">
              NOMADS OF ADITYA · BLOG · EDIT
            </span>

            <h1>
              Edit Story
            </h1>

            <p>
              Update your story and keep
              the journey moving.
            </p>

          </div>


          <div className="edit-actions">

            <Link
              href="/admin/blog"
              className="edit-button"
            >
              ← Back to Blog
            </Link>


            <button
              type="button"
              className="edit-button"
              disabled={saving}
              onClick={() =>
                handleSave()
              }
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>


            <button
              type="button"
              className="edit-button primary"
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


        {/* ==================================================
            EDITOR
        ================================================== */}

        <div className="edit-layout">


          {/* ==================================================
              MAIN
          ================================================== */}

          <section className="edit-main">


            {/* TITLE */}

            <div className="edit-field">

              <label className="edit-label">
                Story Title
              </label>

              <input
                className="edit-input title-input"
                value={title}
                onChange={(e) =>
                  handleTitleChange(
                    e.target.value
                  )
                }
              />

            </div>


            {/* SLUG */}

            <div className="edit-field">

              <label className="edit-label">
                URL Slug
              </label>

              <div className="slug-row">

                <div className="slug-prefix">
                  /blog/
                </div>

                <input
                  className="edit-input"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      generateSlug(
                        e.target.value
                      )
                    )
                  }
                />

              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="edit-field">

              <label className="edit-label">
                Short Description
              </label>

              <textarea
                className="edit-textarea excerpt"
                value={excerpt}
                onChange={(e) =>
                  setExcerpt(
                    e.target.value
                  )
                }
              />

            </div>


            {/* CONTENT */}

            <div className="edit-field">

              <label className="edit-label">
                Story Content
              </label>


              <div className="editor-toolbar">

                <button
                  type="button"
                  className="toolbar-button"
                  onClick={() =>
                    setContent(
                      (current) =>
                        current +
                        "\n\n# "
                    )
                  }
                >
                  H1
                </button>


                <button
                  type="button"
                  className="toolbar-button"
                  onClick={() =>
                    setContent(
                      (current) =>
                        current +
                        "\n\n## "
                    )
                  }
                >
                  H2
                </button>


                <button
                  type="button"
                  className="toolbar-button"
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
                  type="button"
                  className="toolbar-button"
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
                  type="button"
                  className="toolbar-button"
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
                  type="button"
                  className="toolbar-button"
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
                className="edit-textarea"
                value={content}
                onChange={(e) =>
                  setContent(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ==================================================
                PREVIEW
            ================================================== */}

            <section className="preview">

              <div className="preview-label">
                Story Preview
              </div>


              <h2 className="preview-title">
                {title}
              </h2>


              <p className="preview-excerpt">
                {excerpt}
              </p>


              <div className="preview-content">
                {content}
              </div>

            </section>

          </section>


          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside className="edit-sidebar">


            {/* PUBLISHING */}

            <div className="sidebar-card">

              <div className="sidebar-header">

                <span>
                  Publishing
                </span>

              </div>


              <div className="sidebar-body">


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
                    className="edit-select"
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

              <div className="sidebar-header">

                <span>
                  Homepage
                </span>

              </div>


              <div className="sidebar-body">

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


            {/* COVER */}

            <div className="sidebar-card">

              <div className="sidebar-header">

                <span>
                  Cover Image
                </span>

              </div>


              <div className="sidebar-body">

                <div className="cover-placeholder">

                  <div>

                    <strong>
                      Media Library
                    </strong>

                    Cover image selection
                    will be connected to
                    your Media Library.

                  </div>

                </div>

              </div>

            </div>


            {/* DETAILS */}

            <div className="sidebar-card">

              <div className="sidebar-header">

                <span>
                  Story Details
                </span>

              </div>


              <div className="sidebar-body">


                <div className="sidebar-field">

                  <label className="sidebar-label">
                    Author
                  </label>

                  <strong>
                    {post.author?.name ||
                      "Aditya"}
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
                          .filter(Boolean)
                          .length /
                          200
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