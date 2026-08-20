"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BlogPost = {
  id: string | number;
  title: string;
  slug: string;
  subtitle?: string | null;
  shortIntro?: string | null;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  publishedAt?: string | null;
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPosts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/blog", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load blog posts."
        );
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load blog posts error:", error);

      setError("Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        post.title
          .toLowerCase()
          .includes(searchValue) ||
        post.slug
          .toLowerCase()
          .includes(searchValue) ||
        (post.subtitle || "")
          .toLowerCase()
          .includes(searchValue);

      const normalizedStatus =
        post.status.toUpperCase();

      const matchesFilter =
        filter === "All" ||
        (filter === "Published" &&
          normalizedStatus === "PUBLISHED") ||
        (filter === "Draft" &&
          normalizedStatus === "DRAFT") ||
        (filter === "Archived" &&
          normalizedStatus === "ARCHIVED");

      return matchesSearch && matchesFilter;
    });
  }, [posts, search, filter]);

  const publishedCount = posts.filter(
    (post) =>
      post.status.toUpperCase() === "PUBLISHED"
  ).length;

  const draftCount = posts.filter(
    (post) =>
      post.status.toUpperCase() === "DRAFT"
  ).length;

  const featuredCount = posts.filter(
    (post) => post.isFeatured
  ).length;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getStatusLabel(status: string) {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  }

  async function deletePost(id: string | number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog post?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/blog/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to delete blog post."
        );
        return;
      }

      await loadPosts();
    } catch (error) {
      console.error(
        "Delete blog post error:",
        error
      );

      alert(
        "Something went wrong while deleting the post."
      );
    }
  }

  return (
    <>
      <style>{`

        .blog-admin-page {
          min-height: 100vh;
          padding: 150px 6vw 100px;
        }

        .blog-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 40px;
          padding-bottom: 45px;
          border-bottom: 1px solid var(--line);
        }

        .blog-admin-header h1 {
          font: clamp(3rem, 7vw, 6.5rem) / .95 var(--serif);
          margin: 12px 0 18px;
        }

        .blog-admin-header p {
          max-width: 650px;
          color: var(--muted);
          margin: 0;
        }

        .new-post-button {
          display: inline-block;
          padding: 14px 22px;
          background: var(--accent);
          color: #15110b;
          border: 1px solid var(--accent);
          font-size: .72rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .new-post-button:hover {
          background: var(--accent2);
        }

        /* STATS */

        .blog-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 45px 0;
        }

        .blog-stat {
          padding: 24px;
          background: var(--panel);
          border: 1px solid var(--line);
        }

        .blog-stat span {
          display: block;
          color: var(--muted);
          font-size: .7rem;
          letter-spacing: .12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .blog-stat strong {
          display: block;
          font: 2.6rem var(--serif);
        }

        /* TOOLBAR */

        .blog-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .blog-search {
          flex: 1;
          min-width: 280px;
        }

        .blog-search input {
          width: 100%;
          padding: 14px 16px;
          background: var(--panel);
          border: 1px solid var(--line);
          color: var(--text);
          outline: none;
          font: inherit;
        }

        .blog-search input:focus {
          border-color: var(--accent);
        }

        .blog-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .blog-filter {
          padding: 11px 15px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-size: .68rem;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        .blog-filter:hover {
          border-color: var(--accent);
          color: var(--text);
        }

        .blog-filter.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        /* TABLE */

        .blog-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--line);
        }

        .blog-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .blog-table th {
          padding: 18px 20px;
          text-align: left;
          color: var(--accent);
          background: var(--panel);
          font-size: .66rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
          border-bottom: 1px solid var(--line);
        }

        .blog-table td {
          padding: 22px 20px;
          border-bottom: 1px solid var(--line);
          vertical-align: middle;
        }

        .blog-table tr:last-child td {
          border-bottom: 0;
        }

        .blog-table tbody tr:hover {
          background: rgba(255,255,255,.015);
        }

        .post-title {
          font: 1.45rem var(--serif);
          margin-bottom: 6px;
        }

        .post-excerpt {
          color: var(--muted);
          font-size: .78rem;
          max-width: 420px;
          line-height: 1.5;
        }

        .post-slug {
          color: var(--muted);
          font-size: .68rem;
          margin-top: 7px;
        }

        .post-category {
          color: var(--muted);
          font-size: .72rem;
        }

        .post-date {
          color: var(--muted);
          font-size: .72rem;
          white-space: nowrap;
        }

        .status {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border: 1px solid var(--line);
          font-size: .62rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .status.published {
          color: var(--accent);
          border-color: rgba(217,154,61,.4);
        }

        .status.draft {
          color: var(--muted);
        }

        .status.archived {
          color: #b95d50;
          border-color: rgba(185,93,80,.4);
        }

        .featured-mark {
          display: inline-block;
          margin-top: 7px;
          color: var(--accent);
          font-size: .6rem;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        /* ACTIONS */

        .post-actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .post-action {
          padding: 8px 10px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-size: .61rem;
          letter-spacing: .05em;
          text-transform: uppercase;
          text-decoration: none;
        }

        .post-action:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        .post-action.delete:hover {
          color: #b95d50;
          border-color: #b95d50;
        }

        /* EMPTY */

        .blog-empty {
          padding: 90px 30px;
          text-align: center;
          border: 1px solid var(--line);
          background: var(--panel);
        }

        .blog-empty h2 {
          font: 2.5rem var(--serif);
          margin: 0 0 10px;
        }

        .blog-empty p {
          color: var(--muted);
          margin: 0 0 25px;
        }

        .create-first-button {
          display: inline-block;
          padding: 13px 20px;
          background: var(--accent);
          color: #15110b;
          border: 1px solid var(--accent);
          font-size: .68rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .create-first-button:hover {
          background: var(--accent2);
        }

        /* ERROR */

        .blog-error {
          padding: 30px;
          border: 1px solid #b95d50;
          color: #b95d50;
          background: var(--panel);
        }

        /* LOADING */

        .blog-loading {
          padding: 90px 30px;
          text-align: center;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--muted);
        }

        @media (max-width: 1000px) {
          .blog-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 800px) {
          .blog-admin-page {
            padding: 110px 7vw 70px;
          }

          .blog-admin-header {
            display: block;
          }

          .new-post-button {
            display: inline-block;
            margin-top: 25px;
          }
        }

        @media (max-width: 520px) {
          .blog-stats {
            grid-template-columns: 1fr;
          }

          .blog-search {
            min-width: 100%;
          }
        }

      `}</style>

      <main className="blog-admin-page">

        {/* HEADER */}

        <header className="blog-admin-header">

          <div>

            <span className="eyebrow">
              NOMADS OF ADITYA · ADMIN
            </span>

            <h1>Blog</h1>

            <p>
              Write, edit and manage the thoughts,
              stories and ideas that become part of
              Nomads of Aditya.
            </p>

          </div>

          <Link
            href="/admin/blog/new"
            className="new-post-button"
          >
            + New Blog Post
          </Link>

        </header>


        {/* STATS */}

        <section className="blog-stats">

          <div className="blog-stat">
            <span>Total Posts</span>

            <strong>
              {posts.length
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>


          <div className="blog-stat">
            <span>Published</span>

            <strong>
              {publishedCount
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>


          <div className="blog-stat">
            <span>Drafts</span>

            <strong>
              {draftCount
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>


          <div className="blog-stat">
            <span>Featured</span>

            <strong>
              {featuredCount
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>

        </section>


        {/* TOOLBAR */}

        <div className="blog-toolbar">

          <div className="blog-search">

            <input
              type="text"
              placeholder="Search blog posts..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="blog-filters">

            {[
              "All",
              "Published",
              "Draft",
              "Archived",
            ].map((item) => (

              <button
                key={item}
                className={`blog-filter ${
                  filter === item
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>


        {/* CONTENT */}

        {loading ? (

          <div className="blog-loading">
            Loading blog posts...
          </div>

        ) : error ? (

          <div className="blog-error">
            {error}
          </div>

        ) : filteredPosts.length === 0 ? (

          <div className="blog-empty">

            <h2>
              No blog posts yet.
            </h2>

            <p>
              Create your first blog post
              to start building your journal.
            </p>

            <Link
              href="/admin/blog/new"
              className="create-first-button"
            >
              + Create First Post
            </Link>

          </div>

        ) : (

          <div className="blog-table-wrapper">

            <table className="blog-table">

              <thead>

                <tr>

                  <th>
                    Story
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Published
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredPosts.map(
                  (post) => {

                    const status =
                      post.status.toLowerCase();

                    return (

                      <tr key={post.id}>

                        <td>

                          <div className="post-title">
                            {post.title}
                          </div>

                          <div className="post-excerpt">
                            {post.shortIntro ||
                              "No description added."}
                          </div>

                          <div className="post-slug">
                            /blog/{post.slug}
                          </div>

                          {post.isFeatured && (

                            <div className="featured-mark">
                              ★ Featured
                            </div>

                          )}

                        </td>


                        <td>

                          <div className="post-category">
                            {post.subtitle ||
                              "Travel"}
                          </div>

                        </td>


                        <td>

                          <span
                            className={`status ${
                              status === "published"
                                ? "published"
                                : status === "archived"
                                ? "archived"
                                : "draft"
                            }`}
                          >
                            {getStatusLabel(
                              post.status
                            )}
                          </span>

                        </td>


                        <td>

                          <div className="post-date">

                            {formatDate(
                              post.publishedAt ||
                                post.createdAt
                            )}

                          </div>

                        </td>


                        <td>

                          <div className="post-actions">

                            <Link
                              href={`/admin/blog/${post.id}/edit`}
                              className="post-action"
                            >
                              Edit
                            </Link>

                            <button
                              className="post-action delete"
                              onClick={() =>
                                deletePost(
                                  post.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </main>
    </>
  );
}