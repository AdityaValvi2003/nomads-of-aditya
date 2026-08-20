"use client";

import { useMemo, useState } from "react";

type MediaItem = {
  id: number;
  name: string;
  path: string;
  type: string;
  dimensions: string;
  size: string;
  category: string;
  featured: boolean;
};

const initialMedia: MediaItem[] = [
  {
    id: 1,
    name: "aditya-hero.jpeg",
    path: "/images/aditya-hero.jpeg",
    type: "JPEG",
    dimensions: "1920 × 1280",
    size: "2.4 MB",
    category: "Journey",
    featured: true,
  },
  {
    id: 2,
    name: "mountain-road.jpeg",
    path: "/images/aditya-hero.jpeg",
    type: "JPEG",
    dimensions: "1920 × 1280",
    size: "2.4 MB",
    category: "Journey",
    featured: false,
  },
  {
    id: 3,
    name: "monsoon-road.jpeg",
    path: "/images/aditya-hero.jpeg",
    type: "JPEG",
    dimensions: "1920 × 1280",
    size: "2.4 MB",
    category: "Journey",
    featured: false,
  },
];

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [media, search, category]);

  function deleteMedia(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this media item?"
    );

    if (!confirmed) return;

    setMedia((current) =>
      current.filter((item) => item.id !== id)
    );

    if (selected?.id === id) {
      setSelected(null);
    }
  }

  function toggleFeatured(id: number) {
    setMedia((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              featured: !item.featured,
            }
          : item
      )
    );
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path);

    alert("Image path copied.");
  }

  function uploadPlaceholder() {
    alert(
      "Real image uploading will be connected when we add the storage/database layer."
    );
  }

  return (
    <>
      <style>{`

        .media-page {
          min-height: 100vh;
          padding: 150px 6vw 100px;
        }

        .media-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 40px;
          padding-bottom: 45px;
          border-bottom: 1px solid var(--line);
        }

        .media-header h1 {
          font: clamp(3rem, 7vw, 6.5rem) / .95 var(--serif);
          margin: 12px 0 18px;
        }

        .media-header p {
          color: var(--muted);
          max-width: 650px;
          margin: 0;
        }

        .media-upload-button {
          padding: 14px 22px;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #15110b;
          font-size: .72rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
        }

        .media-upload-button:hover {
          background: var(--accent2);
        }

        .media-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin: 45px 0 30px;
          flex-wrap: wrap;
        }

        .media-search {
          flex: 1;
          min-width: 260px;
        }

        .media-search input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--text);
          outline: none;
          font: inherit;
        }

        .media-search input:focus {
          border-color: var(--accent);
        }

        .media-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .media-filter {
          padding: 11px 15px;
          border: 1px solid var(--line);
          color: var(--muted);
          background: transparent;
          cursor: pointer;
          font-size: .72rem;
          letter-spacing: .06em;
          text-transform: uppercase;
        }

        .media-filter:hover {
          color: var(--text);
          border-color: var(--accent);
        }

        .media-filter.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        .media-count {
          color: var(--muted);
          font-size: .78rem;
          margin-bottom: 20px;
        }

        .media-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .media-card {
          border: 1px solid var(--line);
          background: var(--panel);
          overflow: hidden;
          transition:
            transform .25s ease,
            border-color .25s ease;
        }

        .media-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent);
        }

        .media-image {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #171714;
          cursor: pointer;
        }

        .media-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }

        .media-card:hover .media-image img {
          transform: scale(1.035);
        }

        .media-featured {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 9px;
          background: var(--accent);
          color: #15110b;
          font-size: .62rem;
          letter-spacing: .1em;
          font-weight: 700;
        }

        .media-card-content {
          padding: 18px;
        }

        .media-card-name {
          font-weight: 700;
          font-size: .9rem;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .media-card-meta {
          color: var(--muted);
          font-size: .75rem;
          line-height: 1.6;
        }

        .media-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 15px;
        }

        .media-action {
          flex: 1;
          padding: 9px 8px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-size: .65rem;
          letter-spacing: .06em;
          text-transform: uppercase;
        }

        .media-action:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .media-action.delete:hover {
          border-color: #a94a3d;
          color: #a94a3d;
        }

        .media-empty {
          grid-column: 1 / -1;
          padding: 100px 30px;
          text-align: center;
          border: 1px solid var(--line);
          background: var(--panel);
        }

        .media-empty h2 {
          font: 2.5rem var(--serif);
          margin: 0 0 10px;
        }

        .media-empty p {
          color: var(--muted);
          margin: 0;
        }

        .media-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,.78);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
        }

        .media-modal {
          width: min(900px, 100%);
          max-height: 90vh;
          overflow: auto;
          background: var(--panel);
          border: 1px solid var(--line);
        }

        .media-modal-image {
          width: 100%;
          max-height: 60vh;
          object-fit: contain;
          display: block;
          background: #0d0d0c;
        }

        .media-modal-content {
          padding: 28px;
        }

        .media-modal-content h2 {
          font: 2rem var(--serif);
          margin: 0 0 8px;
        }

        .media-modal-path {
          color: var(--muted);
          font-size: .8rem;
          word-break: break-all;
          margin-bottom: 20px;
        }

        .media-modal-actions {
          display: flex;
          gap: 10px;
        }

        .media-modal-button {
          padding: 11px 16px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--text);
          cursor: pointer;
          font-size: .7rem;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        .media-modal-button.primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        .media-close {
          position: absolute;
          top: 25px;
          right: 30px;
          color: white;
          font-size: 1.6rem;
          cursor: pointer;
          background: transparent;
          border: 0;
        }

        @media (max-width: 1100px) {
          .media-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .media-page {
            padding: 110px 7vw 70px;
          }

          .media-header {
            display: block;
          }

          .media-upload-button {
            margin-top: 25px;
          }

          .media-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .media-grid {
            grid-template-columns: 1fr;
          }

          .media-search {
            min-width: 100%;
          }
        }

      `}</style>


      <main className="media-page">

        {/* HEADER */}

        <header className="media-header">

          <div>

            <span className="eyebrow">
              NOMADS OF ADITYA · MEDIA
            </span>

            <h1>Media Library</h1>

            <p>
              Every photograph used across your journeys,
              stories and destinations will live here.
            </p>

          </div>

          <button
            className="media-upload-button"
            onClick={uploadPlaceholder}
          >
            + Upload Media
          </button>

        </header>


        {/* TOOLBAR */}

        <div className="media-toolbar">

          <div className="media-search">

            <input
              type="text"
              placeholder="Search photographs..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="media-filters">

            {[
              "All",
              "Journey",
              "Blog",
              "Destination",
            ].map((item) => (

              <button
                key={item}
                className={`media-filter ${
                  category === item
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>


        <div className="media-count">

          Showing {filteredMedia.length}{" "}
          {filteredMedia.length === 1
            ? "photograph"
            : "photographs"}

        </div>


        {/* MEDIA GRID */}

        <div className="media-grid">

          {filteredMedia.length === 0 ? (

            <div className="media-empty">

              <h2>
                Nothing here yet.
              </h2>

              <p>
                Try another search or upload a new
                photograph.
              </p>

            </div>

          ) : (

            filteredMedia.map((item) => (

              <article
                className="media-card"
                key={item.id}
              >

                <div
                  className="media-image"
                  onClick={() =>
                    setSelected(item)
                  }
                >

                  <img
                    src={item.path}
                    alt={item.name}
                  />

                  {item.featured && (

                    <span className="media-featured">
                      FEATURED
                    </span>

                  )}

                </div>


                <div className="media-card-content">

                  <div className="media-card-name">
                    {item.name}
                  </div>

                  <div className="media-card-meta">

                    {item.type}
                    {" · "}
                    {item.dimensions}
                    <br />

                    {item.size}
                    {" · "}
                    {item.category}

                  </div>


                  <div className="media-card-actions">

                    <button
                      className="media-action"
                      onClick={() =>
                        setSelected(item)
                      }
                    >
                      View
                    </button>

                    <button
                      className="media-action"
                      onClick={() =>
                        toggleFeatured(item.id)
                      }
                    >
                      {item.featured
                        ? "Unfeature"
                        : "Feature"}
                    </button>

                    <button
                      className="media-action delete"
                      onClick={() =>
                        deleteMedia(item.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>

            ))

          )}

        </div>


        {/* IMAGE MODAL */}

        {selected && (

          <div
            className="media-modal-backdrop"
            onClick={() =>
              setSelected(null)
            }
          >

            <button
              className="media-close"
              onClick={() =>
                setSelected(null)
              }
            >
              ×
            </button>


            <div
              className="media-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <img
                className="media-modal-image"
                src={selected.path}
                alt={selected.name}
              />


              <div className="media-modal-content">

                <h2>
                  {selected.name}
                </h2>

                <div className="media-modal-path">
                  {selected.path}
                </div>


                <div className="media-card-meta">

                  Type: {selected.type}
                  <br />

                  Dimensions: {selected.dimensions}
                  <br />

                  Size: {selected.size}
                  <br />

                  Category: {selected.category}

                </div>


                <div className="media-modal-actions">

                  <button
                    className="media-modal-button primary"
                    onClick={() =>
                      copyPath(selected.path)
                    }
                  >
                    Copy Image Path
                  </button>

                  <button
                    className="media-modal-button"
                    onClick={() =>
                      setSelected(null)
                    }
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </main>
    </>
  );
}