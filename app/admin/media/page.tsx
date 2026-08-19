"use client";

import { useEffect, useState } from "react";

type MediaAsset = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  caption: string | null;
  altText: string | null;
  location: string | null;
  createdAt: string;
  journey: {
    id: string;
    title: string;
  } | null;
};

export default function MediaPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");

  async function loadMedia() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/media"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load media."
        );
      }

      setMedia(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load media."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  async function addMedia(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/admin/media",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            url,
            fileName,
            mimeType: "image/jpeg",
            altText,
            caption,
            location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to add media."
        );
      }

      setMedia((current) => [
        data,
        ...current,
      ]);

      setUrl("");
      setFileName("");
      setAltText("");
      setCaption("");
      setLocation("");

      setShowForm(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add media."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedia(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this media item?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        "/api/admin/media",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete media."
        );
      }

      setMedia((current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete media."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">

        {/* HEADER */}

        <div className="flex items-start justify-between">

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Content management
            </p>

            <h1 className="mt-2 text-3xl font-medium">
              Media
            </h1>

            <p className="mt-2 text-sm text-white/40">
              Manage photographs and other media
              used across Nomads of Aditya.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm(
                (value) => !value
              )
            }
            className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            + Add Media
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ADD FORM */}

        {showForm && (
          <form
            onSubmit={addMedia}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Add media
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Add an image
              </h2>
            </div>

            <div className="mt-6 grid gap-5">

              {/* URL */}

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Image URL
                </label>

                <input
                  type="url"
                  value={url}
                  onChange={(event) =>
                    setUrl(
                      event.target.value
                    )
                  }
                  required
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              {/* FILE NAME */}

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  File name
                </label>

                <input
                  type="text"
                  value={fileName}
                  onChange={(event) =>
                    setFileName(
                      event.target.value
                    )
                  }
                  required
                  placeholder="harishchandragad.jpg"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              {/* ALT */}

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Alt text
                </label>

                <input
                  type="text"
                  value={altText}
                  onChange={(event) =>
                    setAltText(
                      event.target.value
                    )
                  }
                  placeholder="Describe the image..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                />

                <p className="mt-2 text-xs text-white/25">
                  Used for accessibility and SEO.
                </p>
              </div>

              {/* CAPTION */}

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Caption
                </label>

                <input
                  type="text"
                  value={caption}
                  onChange={(event) =>
                    setCaption(
                      event.target.value
                    )
                  }
                  placeholder="Optional caption..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Harishchandragad, Maharashtra"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-6 flex gap-3">

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Media"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:bg-white/5"
              >
                Cancel
              </button>

            </div>

          </form>
        )}

        {/* MEDIA */}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-sm text-white/40">
              Loading media...
            </p>
          </div>
        ) : media.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

            <p className="text-xs uppercase tracking-[0.25em] text-white/20">
              Media library
            </p>

            <h2 className="mt-4 text-xl font-medium">
              No media yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-white/35">
              Add your first image to start
              building your media library.
            </p>

          </div>
        ) : (

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {media.map((item) => (

              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              >

                {/* IMAGE */}

                <div className="aspect-[4/3] bg-black">

                  <img
                    src={item.url}
                    alt={
                      item.altText ||
                      item.fileName
                    }
                    className="h-full w-full object-cover"
                  />

                </div>

                {/* DETAILS */}

                <div className="p-5">

                  <p className="truncate text-sm font-medium">
                    {item.fileName}
                  </p>

                  {item.altText && (
                    <p className="mt-2 text-xs leading-5 text-white/40">
                      {item.altText}
                    </p>
                  )}

                  {item.location && (
                    <p className="mt-3 text-xs text-white/30">
                      {item.location}
                    </p>
                  )}

                  {item.journey && (
                    <p className="mt-2 text-xs text-white/30">
                      Journey:{" "}
                      {item.journey.title}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">

                    <p className="text-xs text-white/20">
                      {item.mimeType}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        deleteMedia(
                          item.id
                        )
                      }
                      className="text-xs text-red-400/70 transition hover:text-red-400"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}