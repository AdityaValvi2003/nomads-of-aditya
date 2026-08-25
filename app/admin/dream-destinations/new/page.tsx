"use client";

import Link from "next/link";
import { useState } from "react";

import MediaPicker, {
  type MediaAsset,
} from "../../../../src/components/admin/MediaPicker";

export default function NewDreamDestinationPage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [shortNote, setShortNote] = useState("");
  const [whyVisit, setWhyVisit] = useState("");
  const [interests, setInterests] = useState("");

  const [selectedMedia, setSelectedMedia] =
    useState<MediaAsset | null>(null);

  const [showMediaPicker, setShowMediaPicker] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     CREATE
  ========================================================= */

  async function createDestination() {
    try {
      setError("");

      if (!name.trim()) {
        setError(
          "Please enter a destination name."
        );
        return;
      }

      if (!country.trim()) {
        setError(
          "Please enter a country."
        );
        return;
      }

      setSaving(true);

      const response =
        await fetch(
          "/api/admin/dream-destinations",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: name.trim(),
              country: country.trim(),

              coverImage:
                selectedMedia?.url ||
                null,

              shortNote:
                shortNote.trim() ||
                null,

              whyVisit:
                whyVisit.trim() ||
                null,

              interests:
                interests.trim() ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create destination."
        );
      }

      window.location.href =
        `/admin/dream-destinations/${data.id}`;
    } catch (error) {
      console.error(
        "Create destination error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create destination."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#0b0b0a] px-6 py-12 text-white md:px-10">

      <div className="mx-auto max-w-5xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="border-b border-white/10 pb-8">

          <Link
            href="/admin/dream-destinations"
            className="text-xs uppercase tracking-[0.2em] text-white/30 transition hover:text-white"
          >
            ← Dream Destinations
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
            Nomads of Aditya · Admin
          </p>

          <h1 className="mt-3 font-serif text-5xl md:text-7xl">
            New Destination
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
            Add a place you haven't visited yet,
            but hope to see someday.
          </p>

        </header>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* ===================================================
            FORM
        =================================================== */}

        <section className="mt-10 space-y-8">

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              01 · Destination
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Where do you want to go?
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              {/* NAME */}

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  Destination *
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Patagonia"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>


              {/* COUNTRY */}

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  Country *
                </label>

                <input
                  value={country}
                  onChange={(event) =>
                    setCountry(
                      event.target.value
                    )
                  }
                  placeholder="Argentina / Chile"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>

            </div>


            {/* SHORT NOTE */}

            <div className="mt-6">

              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                Short Note
              </label>

              <textarea
                value={shortNote}
                onChange={(event) =>
                  setShortNote(
                    event.target.value
                  )
                }
                rows={3}
                placeholder="A short thought about why this place is on your list..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
              />

            </div>

          </div>


          {/* =================================================
              PHOTOGRAPH
          ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              02 · Photograph
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Give the destination a face.
            </h2>

            <div className="mt-8">

              {selectedMedia ? (

                <div className="overflow-hidden rounded-2xl border border-white/10">

                  <img
                    src={selectedMedia.url}
                    alt={
                      selectedMedia.altText ||
                      selectedMedia.fileName ||
                      name ||
                      "Destination photograph"
                    }
                    className="h-80 w-full object-cover"
                  />

                  <div className="flex items-center justify-between gap-4 p-4">

                    <div>

                      <p className="text-sm">
                        {
                          selectedMedia.fileName ||
                          "Selected photograph"
                        }
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        Selected from Media Library
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMedia(
                          null
                        )
                      }
                      className="text-xs uppercase tracking-[0.15em] text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ) : (

                <button
                  type="button"
                  onClick={() =>
                    setShowMediaPicker(
                      true
                    )
                  }
                  className="flex min-h-52 w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-sm text-white/30 transition hover:border-[#D99A3D]/50 hover:text-white/60"
                >
                  + Select Photograph
                </button>

              )}

            </div>

          </div>


          {/* =================================================
              STORY
          ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              03 · The Dream
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Why is this place calling?
            </h2>

            <div className="mt-8 space-y-6">

              {/* WHY VISIT */}

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  Why Visit
                </label>

                <textarea
                  value={whyVisit}
                  onChange={(event) =>
                    setWhyVisit(
                      event.target.value
                    )
                  }
                  rows={6}
                  placeholder="What makes you want to experience this place?"
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-base leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>


              {/* INTERESTS */}

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  What Interests You
                </label>

                <textarea
                  value={interests}
                  onChange={(event) =>
                    setInterests(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Mountains, hiking, culture, food, photography..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-base leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>

            </div>

          </div>


          {/* =================================================
              SAVE
          ================================================= */}

          <div className="flex flex-col justify-end gap-3 border-t border-white/10 pt-8 sm:flex-row">

            <Link
              href="/admin/dream-destinations"
              className="rounded-xl border border-white/10 px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-white/50 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={
                createDestination
              }
              disabled={saving}
              className="rounded-xl bg-[#D99A3D] px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-black transition hover:bg-[#e5aa50] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Destination"}
            </button>

          </div>

        </section>

      </div>


      {/* =====================================================
          MEDIA PICKER
      ===================================================== */}

      {showMediaPicker && (
        <MediaPicker
          onSelect={(media) => {
            setSelectedMedia(
              media
            );

            setShowMediaPicker(
              false
            );
          }}
          onClose={() =>
            setShowMediaPicker(
              false
            )
          }
        />
      )}

    </main>
  );
}