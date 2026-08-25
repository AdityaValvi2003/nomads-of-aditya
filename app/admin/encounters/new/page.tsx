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

type StoryBlockType =
  | "paragraph"
  | "heading"
  | "subheading"
  | "quote"
  | "image"
  | "divider";

type StoryBlock = {
  id: string;
  type: StoryBlockType;
  text?: string;
  author?: string;
  mediaId?: string;
  url?: string;
  alt?: string;
  caption?: string;
};

function createBlock(
  type: StoryBlockType
): StoryBlock {
  return {
    id: crypto.randomUUID(),
    type,
  };
}

export default function NewEncounterPage() {
  const [title, setTitle] = useState("");
  const [shortIntro, setShortIntro] = useState("");

  const [storyBlocks, setStoryBlocks] =
    useState<StoryBlock[]>([
      createBlock("paragraph"),
    ]);

  const [journeyId, setJourneyId] = useState("");

  const [featuredOnHomepage, setFeaturedOnHomepage] =
    useState(false);

  const [journeys, setJourneys] =
    useState<Journey[]>([]);

  const [selectedMedia, setSelectedMedia] =
    useState<MediaAsset | null>(null);

  const [showMediaPicker, setShowMediaPicker] =
    useState(false);

  const [loadingJourneys, setLoadingJourneys] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ==========================================================
   * LOAD JOURNEYS
   * ==========================================================
   */

  useEffect(() => {
    async function loadJourneys() {
      try {
        setLoadingJourneys(true);
        setError("");

        const response =
          await fetch(
            "/api/admin/journeys",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

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

  /*
   * ==========================================================
   * STORY BLOCK HELPERS
   * ==========================================================
   */

  function updateBlock(
    id: string,
    updates: Partial<StoryBlock>
  ) {
    setStoryBlocks(
      (current) =>
        current.map((block) =>
          block.id === id
            ? {
              ...block,
              ...updates,
            }
            : block
        )
    );
  }

  function addBlock(
    type: StoryBlockType
  ) {
    setStoryBlocks(
      (current) => [
        ...current,
        createBlock(type),
      ]
    );
  }

  function deleteBlock(
    id: string
  ) {
    setStoryBlocks(
      (current) =>
        current.filter(
          (block) =>
            block.id !== id
        )
    );
  }

  function moveBlock(
    index: number,
    direction: "up" | "down"
  ) {
    setStoryBlocks(
      (current) => {
        const next = [...current];

        const target =
          direction === "up"
            ? index - 1
            : index + 1;

        if (
          target < 0 ||
          target >= next.length
        ) {
          return current;
        }

        const temp =
          next[index];

        next[index] =
          next[target];

        next[target] =
          temp;

        return next;
      }
    );
  }

  /*
   * ==========================================================
   * CREATE
   * ==========================================================
   */

  async function createEncounter() {
    try {
      setError("");

      if (!title.trim()) {
        setError(
          "Please enter an encounter title."
        );
        return;
      }

      if (!journeyId) {
        setError(
          "Please select a journey."
        );
        return;
      }

      const meaningfulBlocks =
        storyBlocks.filter(
          (block) =>
            block.type ===
            "divider" ||
            block.type ===
            "image" ||
            Boolean(
              block.text?.trim()
            )
        );

      if (
        meaningfulBlocks.length ===
        0
      ) {
        setError(
          "Please add some story content."
        );
        return;
      }

      setSaving(true);

      const story = {
        type: "document",
        content:
          storyBlocks.map(
            ({
              id,
              ...block
            }) => block
          ),
      };

      const response =
        await fetch(
          "/api/admin/encounters",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title:
                title.trim(),

              shortIntro:
                shortIntro.trim() ||
                null,

              story,

              featuredOnHomepage,

              journeyId,

              mediaId:
                selectedMedia?.id ||
                null,
            }),
          }
        );

      const data =
        await response.json();

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

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

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
            Capture the people,
            conversations and
            unexpected moments
            discovered during
            your journeys.
          </p>

        </header>

        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <section className="mt-10 space-y-8">

          {/* ==================================================
              INFORMATION
          ================================================== */}

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
                    setTitle(
                      event.target.value
                    )
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
                  value={
                    shortIntro
                  }
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

          {/* ==================================================
              JOURNEY
          ================================================== */}

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
              ) : journeys.length ===
                0 ? (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.03] px-4 py-4 text-sm text-yellow-400">
                  No journeys found.
                  Create a journey
                  first.
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
                        key={
                          journey.id
                        }
                        value={
                          journey.id
                        }
                      >
                        {journey.title}{" "}
                        ·{" "}
                        {
                          journey.location
                        }
                      </option>
                    )
                  )}
                </select>
              )}

            </div>

          </div>

          {/* ==================================================
              MEDIA
          ================================================== */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              03 · Photograph
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Give the encounter a face.
            </h2>

            <div className="mt-8">

              {selectedMedia ? (

                <div className="overflow-hidden rounded-2xl border border-white/10">

                  <img
                    src={selectedMedia.url}
                    alt={
                      selectedMedia.altText ||
                      selectedMedia.fileName
                    }
                    className="h-72 w-full object-cover"
                  />

                  <div className="flex items-center justify-between gap-4 p-4">

                    <div>
                      <p className="text-sm">
                        {
                          selectedMedia.fileName
                        }
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        Selected photograph
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
                  className="flex min-h-48 w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-sm text-white/30 transition hover:border-[#D99A3D]/50 hover:text-white/60"
                >
                  + Select Photograph
                </button>

              )}

            </div>

          </div>

          {/* ==================================================
              STORY
          ================================================== */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
                  04 · Story
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Tell the story.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/30">
                  Build the encounter
                  from individual
                  story blocks.
                </p>

              </div>

              <BlockToolbar
                onAdd={addBlock}
              />

            </div>

            <div className="mt-8 space-y-4">

              {storyBlocks.length ===
                0 ? (

                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">

                  <p className="text-sm text-white/30">
                    Your story is
                    empty.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      addBlock(
                        "paragraph"
                      )
                    }
                    className="mt-4 text-xs uppercase tracking-[0.15em] text-[#D99A3D]"
                  >
                    + Add paragraph
                  </button>

                </div>

              ) : (

                storyBlocks.map(
                  (
                    block,
                    index
                  ) => (
                    <StoryBlockEditor
                      key={block.id}
                      block={block}
                      index={index}
                      total={
                        storyBlocks.length
                      }
                      onUpdate={
                        updateBlock
                      }
                      onDelete={
                        deleteBlock
                      }
                      onMove={
                        moveBlock
                      }
                      onSelectMedia={() =>
                        setShowMediaPicker(
                          true
                        )
                      }
                    />
                  )
                )

              )}

            </div>

          </div>

          {/* ==================================================
              FEATURE
          ================================================== */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <div className="flex items-start gap-4">

              <input
                id="featured"
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

                <label
                  htmlFor="featured"
                  className="cursor-pointer text-sm font-medium"
                >
                  Feature this encounter
                </label>

                <p className="mt-1 text-sm leading-6 text-white/30">
                  Allow this encounter
                  to appear in the
                  homepage featured
                  encounters.
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              SAVE
          ================================================== */}

          <div className="flex flex-col justify-end gap-3 border-t border-white/10 pt-8 sm:flex-row">

            <Link
              href="/admin/encounters"
              className="rounded-xl border border-white/10 px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-white/50 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={
                createEncounter
              }
              disabled={saving}
              className="rounded-xl bg-[#D99A3D] px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-black transition hover:bg-[#e5aa50] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Encounter"}
            </button>

          </div>

        </section>

      </div>

      {/* ======================================================
          MEDIA PICKER
      ====================================================== */}

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

/* ============================================================
   BLOCK TOOLBAR
============================================================ */

function BlockToolbar({
  onAdd,
}: {
  onAdd: (
    type: StoryBlockType
  ) => void;
}) {
  const buttons: {
    type: StoryBlockType;
    label: string;
  }[] = [
      {
        type: "paragraph",
        label: "Paragraph",
      },
      {
        type: "heading",
        label: "Heading",
      },
      {
        type: "subheading",
        label: "Subheading",
      },
      {
        type: "quote",
        label: "Quote",
      },
      {
        type: "image",
        label: "Image",
      },
      {
        type: "divider",
        label: "Divider",
      },
    ];

  return (
    <div className="flex flex-wrap gap-2">

      {buttons.map(
        (button) => (
          <button
            key={button.type}
            type="button"
            onClick={() =>
              onAdd(
                button.type
              )
            }
            className="rounded-lg border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-white/40 transition hover:border-[#D99A3D]/50 hover:text-[#D99A3D]"
          >
            + {button.label}
          </button>
        )
      )}

    </div>
  );
}

/* ============================================================
   STORY BLOCK EDITOR
============================================================ */

function StoryBlockEditor({
  block,
  index,
  total,
  onUpdate,
  onDelete,
  onMove,
  onSelectMedia,
}: {
  block: StoryBlock;
  index: number;
  total: number;
  onUpdate: (
    id: string,
    updates: Partial<StoryBlock>
  ) => void;
  onDelete: (
    id: string
  ) => void;
  onMove: (
    index: number,
    direction: "up" | "down"
  ) => void;
  onSelectMedia: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20">

      {/* BLOCK HEADER */}

      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">

        <div className="flex items-center gap-3">

          <span className="text-[10px] uppercase tracking-[0.15em] text-[#D99A3D]">
            {block.type}
          </span>

          <span className="text-[10px] text-white/20">
            Block {index + 1}
          </span>

        </div>

        <div className="flex items-center gap-1">

          <button
            type="button"
            disabled={index === 0}
            onClick={() =>
              onMove(
                index,
                "up"
              )
            }
            className="rounded px-2 py-1 text-xs text-white/30 hover:text-white disabled:opacity-20"
          >
            ↑
          </button>

          <button
            type="button"
            disabled={
              index === total - 1
            }
            onClick={() =>
              onMove(
                index,
                "down"
              )
            }
            className="rounded px-2 py-1 text-xs text-white/30 hover:text-white disabled:opacity-20"
          >
            ↓
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(
                block.id
              )
            }
            className="ml-2 rounded px-2 py-1 text-xs text-red-400/60 hover:text-red-400"
          >
            Delete
          </button>

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-5">

        {block.type ===
          "paragraph" && (
            <textarea
              value={
                block.text || ""
              }
              onChange={(event) =>
                onUpdate(
                  block.id,
                  {
                    text:
                      event.target
                        .value,
                  }
                )
              }
              rows={6}
              placeholder="Write the story..."
              className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-base leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
            />
          )}

        {block.type ===
          "heading" && (
            <input
              value={
                block.text || ""
              }
              onChange={(event) =>
                onUpdate(
                  block.id,
                  {
                    text:
                      event.target
                        .value,
                  }
                )
              }
              placeholder="Section heading"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 font-serif text-2xl text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
            />
          )}

        {block.type ===
          "subheading" && (
            <input
              value={
                block.text || ""
              }
              onChange={(event) =>
                onUpdate(
                  block.id,
                  {
                    text:
                      event.target
                        .value,
                  }
                )
              }
              placeholder="Section subheading"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-xl text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
            />
          )}

        {block.type ===
          "quote" && (
            <div className="space-y-4">

              <textarea
                value={
                  block.text || ""
                }
                onChange={(event) =>
                  onUpdate(
                    block.id,
                    {
                      text:
                        event.target
                          .value,
                    }
                  )
                }
                rows={4}
                placeholder="Write the quote..."
                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-lg leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
              />

              <input
                value={
                  block.author || ""
                }
                onChange={(event) =>
                  onUpdate(
                    block.id,
                    {
                      author:
                        event.target
                          .value,
                    }
                  )
                }
                placeholder="Author (optional)"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
              />

            </div>
          )}

        {block.type ===
          "image" && (
            <div className="space-y-4">

              {block.url ? (

                <div className="overflow-hidden rounded-xl border border-white/10">

                  <img
                    src={block.url}
                    alt={
                      block.alt ||
                      "Story image"
                    }
                    className="h-64 w-full object-cover"
                  />

                </div>

              ) : (

                <button
                  type="button"
                  onClick={
                    onSelectMedia
                  }
                  className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-white/30 transition hover:border-[#D99A3D]/50 hover:text-white/60"
                >
                  + Select Story Image
                </button>

              )}

              {block.url && (
                <button
                  type="button"
                  onClick={
                    onSelectMedia
                  }
                  className="text-xs uppercase tracking-[0.15em] text-[#D99A3D]"
                >
                  Change image
                </button>
              )}

              <input
                value={
                  block.alt || ""
                }
                onChange={(event) =>
                  onUpdate(
                    block.id,
                    {
                      alt:
                        event.target
                          .value,
                    }
                  )
                }
                placeholder="Alt text"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
              />

              <input
                value={
                  block.caption ||
                  ""
                }
                onChange={(event) =>
                  onUpdate(
                    block.id,
                    {
                      caption:
                        event.target
                          .value,
                    }
                  )
                }
                placeholder="Caption (optional)"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
              />

            </div>
          )}

        {block.type ===
          "divider" && (
            <div className="py-6">

              <div className="border-t border-white/10" />

              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">
                Divider
              </p>

            </div>
          )}

      </div>

    </div>
  );
}