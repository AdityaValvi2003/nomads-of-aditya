"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import MediaPicker, {
  type MediaAsset,
} from "../../../../src/components/admin/MediaPicker";

type Journey = {
  id: string;
  title: string;
  slug: string;
  location: string;
  country: string;
};

export default function NewEncounterPage() {
  const [title, setTitle] = useState("");
  const [shortIntro, setShortIntro] = useState("");
  const [story, setStory] = useState("");
  const [journeyId, setJourneyId] = useState("");
  const [featuredOnHomepage, setFeaturedOnHomepage] =
    useState(false);

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedMedia, setSelectedMedia] =
    useState<MediaAsset | null>(null);

  const [showMediaPicker, setShowMediaPicker] =
    useState(false);

  const [loadingJourneys, setLoadingJourneys] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD JOURNEYS
  // ============================================================

  useEffect(() => {
    async function loadJourneys() {
      try {
        setLoadingJourneys(true);
        setError("");

        const response = await fetch(
          "/api/admin/journeys",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load journeys."
          );
        }

        setJourneys(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Load journeys error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load journeys."
        );
      } finally {
        setLoadingJourneys(false);
      }
    }

    loadJourneys();
  }, []);

  // ============================================================
  // CREATE
  // ============================================================

  async function createEncounter() {
    try {
      setError("");

      if (!title.trim()) {
        setError("Please enter an encounter title.");
        return;
      }

      if (!journeyId) {
        setError("Please select a journey.");
        return;
      }

      if (!story.trim()) {
        setError("Please write the encounter story.");
        return;
      }

      setSaving(true);

      const response = await fetch(
        "/api/admin/encounters",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),

            shortIntro:
              shortIntro.trim() || null,

            story: {
              type: "document",
              content: [
                {
                  type: "paragraph",
                  text: story.trim(),
                },
              ],
            },

            featuredOnHomepage,

            journeyId,

            mediaId:
              selectedMedia?.id || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create encounter."
        );
      }

      window.location.href =
        `/admin/encounters/${data.id}`;

    } catch (error) {
      console.error(
        "Create encounter error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create encounter."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-12 text-white md:px-10">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <header className="border-b border-white/10 pb-8">

          <Link
            href="/admin/encounters"
            className="text-xs uppercase tracking-[0.2em] text-white/30 transition hover:text-white"
          >
            ← Encounters
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
            Nomads of Aditya · Admin
          </p>

          <h1 className="mt-3 font-serif text-5xl md:text-7xl">
            New Encounter
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
            Capture the people, conversations and
            unexpected moments discovered during
            your journeys.
          </p>

        </header>


        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* FORM */}

        <section className="mt-10 space-y-8">


          {/* BASIC INFORMATION */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              01 · Information
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              What happened?
            </h2>


            <div className="mt-8 space-y-6">

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  Title *
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="The chai seller who knew every traveller"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  Short Introduction
                </label>

                <textarea
                  value={shortIntro}
                  onChange={(event) =>
                    setShortIntro(
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="A short introduction to the encounter..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>

            </div>

          </div>


          {/* JOURNEY */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              02 · Journey
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Where did this happen?
            </h2>

            <div className="mt-8">

              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                Journey *
              </label>

              {loadingJourneys ? (

                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white/30">
                  Loading journeys...
                </div>

              ) : journeys.length === 0 ? (

                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.03] px-4 py-4 text-sm text-yellow-400">
                  No journeys found. Create a journey first.
                </div>

              ) : (

                <select
                  value={journeyId}
                  onChange={(event) =>
                    setJourneyId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-4 text-white outline-none focus:border-[#D99A3D]/60"
                >

                  <option value="">
                    Select a journey
                  </option>

                  {journeys.map(
                    (journey) => (
                      <option
                        key={journey.id}
                        value={journey.id}
                      >
                        {journey.title}
                        {" — "}
                        {journey.location},{" "}
                        {journey.country}
                      </option>
                    )
                  )}

                </select>

              )}

            </div>

          </div>


          {/* MEDIA */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              03 · Photograph
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Give the encounter a face.
            </h2>

            <p className="mt-3 text-sm text-white/30">
              Choose an existing photograph from
              your Media Library.
            </p>


            <div className="mt-8">

              {selectedMedia ? (

                <div className="overflow-hidden rounded-2xl border border-white/10">

                  <div className="aspect-[16/8] overflow-hidden bg-black">

                    <img
                      src={
                        selectedMedia.url
                      }
                      alt={
                        selectedMedia.altText ||
                        selectedMedia.fileName
                      }
                      className="h-full w-full object-cover"
                    />

                  </div>

                  <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-sm text-white/80">
                        {
                          selectedMedia.fileName
                        }
                      </p>

                      {selectedMedia.location && (
                        <p className="mt-1 text-xs text-white/30">
                          {
                            selectedMedia.location
                          }
                        </p>
                      )}

                    </div>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setShowMediaPicker(
                            true
                          )
                        }
                        className="rounded-lg border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.1em] text-white/50 hover:border-[#D99A3D] hover:text-[#D99A3D]"
                      >
                        Change
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMedia(
                            null
                          )
                        }
                        className="rounded-lg border border-red-500/20 px-4 py-2 text-xs uppercase tracking-[0.1em] text-red-400 hover:bg-red-500/10"
                      >
                        Remove
                      </button>

                    </div>

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
                  className="flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-center transition hover:border-[#D99A3D]/50 hover:bg-white/[0.02]"
                >

                  <span className="text-3xl text-white/20">
                    +
                  </span>

                  <span className="mt-3 text-sm text-white/50">
                    Select photograph
                  </span>

                  <span className="mt-1 text-xs text-white/20">
                    Choose from Media Library
                  </span>

                </button>

              )}

            </div>

          </div>


          {/* STORY */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              04 · Story
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Tell the story.
            </h2>

            <div className="mt-8">

              <textarea
                value={story}
                onChange={(event) =>
                  setStory(
                    event.target.value
                  )
                }
                rows={16}
                placeholder="Write what happened..."
                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-5 py-5 text-sm leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
              />

              <p className="mt-2 text-xs text-white/20">
                The rich story editor will replace
                this simple field in the next phase.
              </p>

            </div>

          </div>


          {/* FEATURED */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <label className="flex cursor-pointer items-start gap-4">

              <input
                type="checkbox"
                checked={
                  featuredOnHomepage
                }
                onChange={(event) =>
                  setFeaturedOnHomepage(
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4 accent-[#D99A3D]"
              />

              <div>

                <p className="text-sm text-white/80">
                  Feature this encounter
                </p>

                <p className="mt-1 text-xs leading-5 text-white/30">
                  Allow this encounter to appear
                  in the homepage featured encounters
                  section.
                </p>

              </div>

            </label>

          </div>


          {/* ACTIONS */}

          <div className="flex flex-col justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">

            <Link
              href="/admin/encounters"
              className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={createEncounter}
              disabled={
                saving ||
                loadingJourneys
              }
              className="rounded-xl bg-[#D99A3D] px-7 py-3 text-sm font-medium text-black transition hover:bg-[#e5aa4d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Creating..."
                : "Create Encounter"}
            </button>

          </div>

        </section>

      </div>


      {/* MEDIA PICKER */}

      {showMediaPicker && (
        <MediaPicker
          onClose={() =>
            setShowMediaPicker(false)
          }
          onSelect={(media) => {
            setSelectedMedia(media);
            setShowMediaPicker(false);
          }}
        />
      )}

    </main>
  );
}