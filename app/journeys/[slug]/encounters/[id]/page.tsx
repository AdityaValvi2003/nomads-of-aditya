import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "../../../../../src/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

type StoryBlock = {
  type?: string;
  text?: string;
  [key: string]: unknown;
};

type EncounterStory = {
  type?: string;
  content?: StoryBlock[];
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, id } = await params;

  const encounter = await prisma.encounter.findFirst({
    where: {
      id,
      journey: {
        slug,
        status: "PUBLISHED",
      },
    },
    include: {
      journey: {
        select: {
          title: true,
        },
      },
      media: {
        select: {
          url: true,
          altText: true,
        },
      },
    },
  });

  if (!encounter) {
    return {};
  }

  const description =
    encounter.shortIntro?.trim() ||
    `An encounter from ${encounter.journey.title}.`;

  return {
    title: `${encounter.title} · ${encounter.journey.title}`,
    description,

    openGraph: {
      title: encounter.title,
      description,
      type: "article",

      images: encounter.media?.url
        ? [
            {
              url: encounter.media.url,
              alt:
                encounter.media.altText ||
                encounter.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function EncounterPage({
  params,
}: PageProps) {
  const { slug, id } = await params;

  const encounter = await prisma.encounter.findFirst({
    where: {
      id,

      journey: {
        slug,
        status: "PUBLISHED",
      },
    },

    include: {
      journey: {
        select: {
          id: true,
          title: true,
          slug: true,
          location: true,
          country: true,
        },
      },

      media: {
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          fileName: true,
          altText: true,
          caption: true,
        },
      },
    },
  });

  if (!encounter) {
    notFound();
  }

  const story =
    encounter.story &&
    typeof encounter.story === "object"
      ? (encounter.story as EncounterStory)
      : null;

  const storyBlocks =
    Array.isArray(story?.content)
      ? story.content
      : [];

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative">

        {encounter.media?.url ? (
          <div className="relative h-[65vh] min-h-[480px] overflow-hidden">

            <img
              src={encounter.media.url}
              alt={
                encounter.media.altText ||
                encounter.title
              }
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-black/20" />

            <div className="relative flex h-full items-end">

              <div className="mx-auto w-full max-w-5xl px-6 pb-14 md:px-10 md:pb-20">

                <Link
                  href={`/journeys/${encounter.journey.slug}`}
                  className="inline-block text-xs uppercase tracking-[0.25em] text-white/50 transition hover:text-white"
                >
                  ← {encounter.journey.title}
                </Link>

                <p className="mt-10 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
                  Encounter
                </p>

                <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                  {encounter.title}
                </h1>

                {encounter.shortIntro && (
                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                    {encounter.shortIntro}
                  </p>
                )}

              </div>

            </div>

          </div>
        ) : (
          <div className="mx-auto max-w-5xl px-6 pb-16 pt-20 md:px-10 md:pt-28">

            <Link
              href={`/journeys/${encounter.journey.slug}`}
              className="text-xs uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
            >
              ← {encounter.journey.title}
            </Link>

            <p className="mt-12 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
              Encounter
            </p>

            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              {encounter.title}
            </h1>

            {encounter.shortIntro && (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                {encounter.shortIntro}
              </p>
            )}

          </div>
        )}

      </section>

      {/* =====================================================
          LOCATION
      ===================================================== */}

      <section className="border-y border-white/10">

        <div className="mx-auto grid max-w-5xl md:grid-cols-3">

          <InfoItem
            label="Journey"
            value={encounter.journey.title}
          />

          <InfoItem
            label="Location"
            value={encounter.journey.location}
          />

          <InfoItem
            label="Country"
            value={encounter.journey.country}
          />

        </div>

      </section>

      {/* =====================================================
          STORY
      ===================================================== */}

      <article className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-28">

        <p className="mb-8 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
          The encounter
        </p>

        <div className="space-y-8">

          {storyBlocks.length > 0 ? (
            storyBlocks.map(
              (block, index) => (
                <StoryBlockRenderer
                  key={`story-${index}`}
                  block={block}
                />
              )
            )
          ) : (
            <p className="text-lg text-white/40">
              This encounter does not have
              a story yet.
            </p>
          )}

        </div>

      </article>

      {/* =====================================================
          IMAGE CAPTION
      ===================================================== */}

      {encounter.media?.caption && (
        <section className="mx-auto max-w-5xl px-6 pb-20 md:px-10">

          <p className="text-center text-sm text-white/30">
            {encounter.media.caption}
          </p>

        </section>
      )}

      {/* =====================================================
          BACK TO JOURNEY
      ===================================================== */}

      <section className="border-t border-white/10 px-6 py-20 text-center">

        <p className="text-xs uppercase tracking-[0.3em] text-white/25">
          Part of the journey
        </p>

        <h2 className="mt-4 text-2xl font-medium">
          {encounter.journey.title}
        </h2>

        <Link
          href={`/journeys/${encounter.journey.slug}`}
          className="mt-8 inline-block border border-white/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white/60 transition hover:border-[#D99A3D] hover:text-[#D99A3D]"
        >
          ← Back to journey
        </Link>

      </section>

    </main>
  );
}

/* =========================================================
   STORY BLOCK
========================================================= */

function StoryBlockRenderer({
  block,
}: {
  block: StoryBlock;
}) {
  if (!block || typeof block !== "object") {
    return null;
  }

  const type =
    typeof block.type === "string"
      ? block.type
      : "paragraph";

  const text =
    typeof block.text === "string"
      ? block.text
      : "";

  if (!text.trim()) {
    return null;
  }

  switch (type) {
    case "paragraph":
      return (
        <p className="whitespace-pre-line text-lg leading-9 text-white/70 md:text-xl md:leading-10">
          {text}
        </p>
      );

    case "heading":
      return (
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {text}
        </h2>
      );

    case "subheading":
      return (
        <h3 className="text-2xl font-medium md:text-3xl">
          {text}
        </h3>
      );

    case "quote":
      return (
        <blockquote className="border-l-2 border-[#D99A3D] pl-6 md:pl-10">

          <p className="text-2xl leading-10 text-white/85 md:text-4xl md:leading-[1.3]">
            “{text}”
          </p>

        </blockquote>
      );

    default:
      return (
        <p className="whitespace-pre-line text-lg leading-9 text-white/70 md:text-xl md:leading-10">
          {text}
        </p>
      );
  }
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/10 px-6 py-6 md:border-r md:border-b-0 md:px-8">

      <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-sm text-white/70">
        {value || "—"}
      </p>

    </div>
  );
}