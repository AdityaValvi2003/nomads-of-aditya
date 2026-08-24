"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Journey = {
  id: string;
  title: string;
  slug: string;
};

type MediaAsset = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  fileName?: string | null;
  altText?: string | null;
};

type Encounter = {
  id: string;
  title: string;
  shortIntro: string | null;
  story: unknown;
  featuredOnHomepage: boolean;
  journeyId: string;
  mediaId: string | null;

  journey?: Journey | null;
  media?: MediaAsset | null;
};

export default function EditEncounterPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [encounter, setEncounter] =
    useState<Encounter | null>(null);

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);

  const [title, setTitle] = useState("");
  const [shortIntro, setShortIntro] = useState("");
  const [journeyId, setJourneyId] = useState("");
  const [mediaId, setMediaId] = useState("");
  const [story, setStory] = useState("");
  const [featuredOnHomepage, setFeaturedOnHomepage] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD ENCOUNTER + JOURNEYS + MEDIA
  // ============================================================

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const [
          encounterResponse,
          journeysResponse,
          mediaResponse,
        ] = await Promise.all([
          fetch(`/api/admin/encounters/${id}`),
          fetch("/api/admin/journeys"),
          fetch("/api/admin/media"),
        ]);

        const encounterData =
          await encounterResponse.json();

        const journeysData =
          await journeysResponse.json();

        const mediaData =
          await mediaResponse.json();

        if (!encounterResponse.ok) {
          throw new Error(
            encounterData.error ||
              "Failed to load encounter."
          );
        }

        if (!journeysResponse.ok) {
          throw new Error(
            journeysData.error ||
              "Failed to load journeys."
          );
        }

        if (!mediaResponse.ok) {
          throw new Error(
            mediaData.error ||
              "Failed to load media."
          );
        }

        const loadedEncounter =
          encounterData as Encounter;

        setEncounter(loadedEncounter);

        setTitle(loadedEncounter.title || "");

        setShortIntro(
          loadedEncounter.shortIntro || ""
        );

        setJourneyId(
          loadedEncounter.journeyId || ""
        );

        setMediaId(
          loadedEncounter.mediaId || ""
        );

        setFeaturedOnHomepage(
          Boolean(
            loadedEncounter.featuredOnHomepage
          )
        );

        if (
          loadedEncounter.story &&
          typeof loadedEncounter.story === "object"
        ) {
          setStory(
            JSON.stringify(
              loadedEncounter.story,
              null,
              2
            )
          );
        } else {
          setStory("");
        }

        setJourneys(
          Array.isArray(journeysData)
            ? journeysData
            : journeysData.journeys || []
        );

        setMedia(
          Array.isArray(mediaData)
            ? mediaData
            : mediaData.media || []
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load encounter."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  // ============================================================
  // SAVE
  // ============================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let parsedStory: unknown = {};

      if (story.trim()) {
        try {
          parsedStory = JSON.parse(story);
        } catch {
          throw new Error(
            "Story must contain valid JSON."
          );
        }
      }

      const response = await fetch(
        `/api/admin/encounters/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            shortIntro,
            story: parsedStory,
            featuredOnHomepage,
            journeyId,
            mediaId: mediaId || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update encounter."
        );
      }

      setEncounter(data);

      setSuccess(
        "Encounter saved successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update encounter."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this encounter?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/encounters/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete encounter."
        );
      }

      router.push("/admin/encounters");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete encounter."
      );

      setDeleting(false);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-white/50">
            Loading encounter...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR / NOT FOUND
  // ============================================================

  if (!encounter) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/encounters")
            }
            className="mb-10 text-sm uppercase tracking-[0.2em] text-white/50 hover:text-white"
          >
            ← Encounters
          </button>

          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-red-300">
            {error || "Encounter not found."}
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push("/admin/encounters")
          }
          className="mb-8 text-sm uppercase tracking-[0.2em] text-white/50 transition hover:text-white"
        >
          ← Encounters
        </button>

        {/* HEADER */}

        <div className="mb-12">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#D99A3D]">
            Nomads of Aditya · Admin
          </p>

          <h1 className="font-serif text-5xl">
            Edit Encounter
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Update the people, conversations and
            moments discovered during your journey.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-8 rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm text-green-300">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-10"
        >
          {/* ================================================== */}
          {/* INFORMATION */}
          {/* ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
                01 · Information
              </p>

              <h2 className="font-serif text-3xl">
                What happened?
              </h2>
            </div>

            <div className="space-y-6">
              {/* TITLE */}

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">
                  Title *
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#D99A3D]"
                />
              </div>

              {/* SHORT INTRO */}

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">
                  Short Introduction
                </label>

                <textarea
                  value={shortIntro}
                  onChange={(event) =>
                    setShortIntro(event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#D99A3D]"
                />
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* JOURNEY */}
          {/* ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
                02 · Journey
              </p>

              <h2 className="font-serif text-3xl">
                Where did this happen?
              </h2>
            </div>

            <select
              value={journeyId}
              onChange={(event) =>
                setJourneyId(event.target.value)
              }
              required
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#D99A3D]"
            >
              <option value="">
                Select a journey
              </option>

              {journeys.map((journey) => (
                <option
                  key={journey.id}
                  value={journey.id}
                >
                  {journey.title}
                </option>
              ))}
            </select>
          </section>

          {/* ================================================== */}
          {/* MEDIA */}
          {/* ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
                03 · Photograph
              </p>

              <h2 className="font-serif text-3xl">
                Add a photograph
              </h2>

              <p className="mt-3 text-sm text-white/40">
                Select an image from your media
                library.
              </p>
            </div>

            <select
              value={mediaId}
              onChange={(event) =>
                setMediaId(event.target.value)
              }
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#D99A3D]"
            >
              <option value="">
                No photograph
              </option>

              {media.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.fileName ||
                    item.altText ||
                    item.id}
                </option>
              ))}
            </select>

            {/* PREVIEW */}

            {mediaId && (
              <div className="mt-6">
                {(() => {
                  const selectedMedia =
                    media.find(
                      (item) =>
                        item.id === mediaId
                    );

                  if (!selectedMedia) {
                    return null;
                  }

                  return (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={
                          selectedMedia.thumbnailUrl ||
                          selectedMedia.url
                        }
                        alt={
                          selectedMedia.altText ||
                          selectedMedia.fileName ||
                          "Encounter photograph"
                        }
                        className="max-h-[500px] w-full object-cover"
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </section>

          {/* ================================================== */}
          {/* STORY */}
          {/* ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
                04 · Story
              </p>

              <h2 className="font-serif text-3xl">
                The story
              </h2>

              <p className="mt-3 text-sm text-white/40">
                Story content is currently stored as
                structured JSON.
              </p>
            </div>

            <textarea
              value={story}
              onChange={(event) =>
                setStory(event.target.value)
              }
              rows={14}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-white/10 bg-black px-4 py-4 font-mono text-sm text-white outline-none transition focus:border-[#D99A3D]"
              placeholder='{
  "blocks": []
}'
            />
          </section>

          {/* ================================================== */}
          {/* HOMEPAGE */}
          {/* ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="flex items-center justify-between gap-8">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
                  05 · Homepage
                </p>

                <h2 className="font-serif text-2xl">
                  Feature this encounter
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  Show this encounter on the
                  homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFeaturedOnHomepage(
                    !featuredOnHomepage
                  )
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  featuredOnHomepage
                    ? "bg-[#D99A3D]"
                    : "bg-white/20"
                }`}
                aria-label="Toggle homepage feature"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    featuredOnHomepage
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* ================================================== */}
          {/* ACTIONS */}
          {/* ================================================== */}

          <div className="flex flex-col-reverse gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-500/30 px-6 py-3 text-sm uppercase tracking-[0.15em] text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete Encounter"}
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() =>
                  router.push("/admin/encounters")
                }
                className="rounded-lg border border-white/10 px-6 py-3 text-sm uppercase tracking-[0.15em] text-white/60 transition hover:border-white/30 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#D99A3D] px-8 py-3 text-sm uppercase tracking-[0.15em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Encounter"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}