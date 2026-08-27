import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "../../../src/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type GalleryImage = {
  mediaId?: string;
  url: string;
  alt?: string;
  caption?: string;
};

type MediaAsset = {
  id: string;
  url: string;
  fileName: string;
  altText: string | null;
  caption: string | null;
};

type ContentBlock = {
  id: string;
  type: string;
  data: unknown;
  imageDisplay: string | null;
  media: MediaAsset | null;
};

/* =========================================================
   METADATA
========================================================= */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const journey = await prisma.journey.findUnique({
    where: {
      slug,
    },
  });

  if (!journey || journey.status !== "PUBLISHED") {
    return {};
  }

  const title =
    journey.seoTitle?.trim() ||
    journey.title;

  const description =
    journey.seoDescription?.trim() ||
    journey.shortIntro?.trim() ||
    `Explore ${journey.title} with Nomads of Aditya.`;

  const ogTitle =
    journey.ogTitle?.trim() ||
    title;

  const ogDescription =
    journey.ogDescription?.trim() ||
    description;

  const ogImage =
    journey.ogImage?.trim() ||
    journey.coverImage?.trim();

  return {
    title,
    description,

    alternates: journey.canonicalUrl?.trim()
      ? {
          canonical: journey.canonicalUrl.trim(),
        }
      : undefined,

    robots: {
      index: !journey.noIndex,
      follow: !journey.noFollow,
    },

    openGraph: {
      type: "article",
      title: ogTitle,
      description: ogDescription,

      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: journey.title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: ogImage
        ? "summary_large_image"
        : "summary",

      title: ogTitle,
      description: ogDescription,

      ...(ogImage
        ? {
            images: [ogImage],
          }
        : {}),
    },
  };
}
/* =========================================================
   PAGE
========================================================= */

export default async function JourneyPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const journey = await prisma.journey.findUnique({
    where: {
      slug,
    },

    include: {
      contentBlocks: {
        orderBy: {
          position: "asc",
        },

        include: {
          media: true,
        },
      },

      encounters: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          media: true,
        },
      },
    },
  });

  if (!journey) {
    notFound();
  }

  /*
   * ---------------------------------------------------------
   * PUBLIC VISIBILITY
   * ---------------------------------------------------------
   */

  if (journey.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="journey-detail-page min-h-screen">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative">

        {journey.coverImage ? (
          <div className="relative h-[70vh] min-h-[500px] overflow-hidden">

            <img
              src={journey.coverImage}
              alt={journey.title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/50" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-black/20" />

            <div className="relative flex h-full items-end">

              <div className="mx-auto w-full max-w-6xl px-6 pb-16 md:px-10 md:pb-20">

                <p className="text-sm uppercase tracking-[0.3em] journey-muted">
                  {journey.location},{" "}
                  {journey.country}
                </p>

                <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                  {journey.title}
                </h1>

                {journey.shortIntro && (
                  <p className="mt-6 max-w-2xl text-base leading-7 journey-muted md:text-lg">
                    {journey.shortIntro}
                  </p>
                )}

              </div>

            </div>

          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-6 pb-10 pt-20 md:px-10 md:pt-28">

            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              {journey.location},{" "}
              {journey.country}
            </p>

            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              {journey.title}
            </h1>

            {journey.shortIntro && (
              <p className="mt-6 max-w-2xl text-lg leading-8 journey-muted">
                {journey.shortIntro}
              </p>
            )}

          </div>
        )}

      </section>

      {/* =====================================================
          JOURNEY INFORMATION
      ===================================================== */}

      {(journey.journeyDate ||
        journey.duration ||
        journey.distance ||
        journey.difficulty ||
        journey.companions ||
        journey.placesVisited) && (
          <section className="border-y journey-border">

            <div className="mx-auto grid max-w-6xl gap-px bg-[var(--line)] md:grid-cols-3 lg:grid-cols-6">

              {journey.journeyDate && (
                <InfoItem
                  label="Date"
                  value={formatDate(
                    journey.journeyDate
                  )}
                />
              )}

              {journey.duration && (
                <InfoItem
                  label="Duration"
                  value={journey.duration}
                />
              )}

              {journey.distance && (
                <InfoItem
                  label="Distance"
                  value={journey.distance}
                />
              )}

              {journey.difficulty && (
                <InfoItem
                  label="Difficulty"
                  value={journey.difficulty}
                />
              )}

              {journey.companions && (
                <InfoItem
                  label="Companions"
                  value={journey.companions}
                />
              )}

              {journey.placesVisited && (
                <InfoItem
                  label="Places"
                  value={journey.placesVisited}
                />
              )}

            </div>

          </section>
        )}

      {/* =====================================================
          JOURNEY STORY
      ===================================================== */}

      <article className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">

        <div className="space-y-16">

          {journey.contentBlocks.map(
            (block) => (
              <ContentBlockRenderer
                key={block.id}
                block={block}
              />
            )
          )}

        </div>

      </article>

      {/* =====================================================
          ENCOUNTERS
      ===================================================== */}

      {journey.encounters.length > 0 && (
        <section className="border-t journey-border">

          <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">

            {/* SECTION INTRO */}

            <div className="mb-16">

              <p className="text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
                Encounters
              </p>

              <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
                People along the way.
              </h2>

              <p className="journey-subtle mt-5 max-w-2xl text-base leading-8">
                Some journeys are remembered for
                the places. Others are remembered
                for the people you meet.
              </p>

            </div>

            {/* ENCOUNTERS */}

            <div className="space-y-24">

              {journey.encounters.map(
                (encounter) => (
                  <article
                    key={encounter.id}
                    className="border-t journey-border pt-12"
                  >

                    {/* ENCOUNTER HEADER */}

                    <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">

                      <div>

                        <p className="text-xs uppercase tracking-[0.25em] journey-faint">
                          Encounter
                        </p>

                        <h3 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                          {encounter.title}
                        </h3>

                        {encounter.shortIntro && (
                          <p className="mt-5 text-base leading-7 journey-subtle">
                            {encounter.shortIntro}
                          </p>
                        )}

                      </div>

                      {/* MAIN PHOTOGRAPH */}

                      {encounter.media?.url && (
                        <figure>

                          <img
                            src={encounter.media.url}
                            alt={
                              encounter.media
                                .altText ||
                              encounter.title
                            }
                            className="max-h-[650px] w-full rounded-2xl object-cover"
                          />

                          {encounter.media.caption && (
                            <figcaption className="mt-3 text-center text-xs journey-faint">
                              {
                                encounter.media
                                  .caption
                              }
                            </figcaption>
                          )}

                        </figure>
                      )}

                    </div>

                    {/* STORY */}

                    <div className="mt-16">

                      <EncounterStoryRenderer
                        story={encounter.story}
                      />

                    </div>

                  </article>
                )
              )}

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <section className="border-t journey-border px-6 py-20 text-center">

        <p className="text-xs uppercase tracking-[0.3em] journey-faint">
          End of journey
        </p>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 journey-subtle">
          Every journey leaves something behind —
          a memory, a person, a place, or a story
          worth carrying forward.
        </p>

      </section>

    </main>
  );
}

/* =========================================================
   JOURNEY CONTENT BLOCK RENDERER
========================================================= */

function ContentBlockRenderer({
  block,
}: {
  block: ContentBlock;
}) {
  const data =
    block.data &&
      typeof block.data === "object"
      ? (block.data as Record<
        string,
        unknown
      >)
      : {};

  switch (block.type) {

    /* -------------------------------------------------------
       HEADING
    ------------------------------------------------------- */

    case "HEADING": {
      const text =
        getString(data.text);

      if (!text) {
        return null;
      }

      return (
        <section>

          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {text}
          </h2>

        </section>
      );
    }

    /* -------------------------------------------------------
       SUBHEADING
    ------------------------------------------------------- */

    case "SUBHEADING": {
      const text =
        getString(data.text);

      if (!text) {
        return null;
      }

      return (
        <section>

          <h3 className="text-2xl font-medium md:text-3xl">
            {text}
          </h3>

        </section>
      );
    }

    /* -------------------------------------------------------
       PARAGRAPH
    ------------------------------------------------------- */

    case "PARAGRAPH": {
      const text =
        getString(data.text);

      if (!text) {
        return null;
      }

      return (
        <section>

          <div className="max-w-3xl whitespace-pre-line text-lg leading-9 journey-muted md:text-xl md:leading-10">
            {text}
          </div>

        </section>
      );
    }

    /* -------------------------------------------------------
       QUOTE
    ------------------------------------------------------- */

    case "QUOTE": {
      const text =
        getString(data.text);

      const author =
        getString(data.author);

      if (!text) {
        return null;
      }

      return (
        <section className="py-6">

          <blockquote className="border-l-2 border-[#D99A3D] pl-6 md:pl-10">

            <p className="journey-quote-text text-2xl leading-10 md:text-4xl md:leading-[1.3]">
              “{text}”
            </p>

            {author && (
              <footer className="journey-author mt-5 text-sm">
                — {author}
              </footer>
            )}

          </blockquote>

        </section>
      );
    }

    /* -------------------------------------------------------
       DIVIDER
    ------------------------------------------------------- */

    case "DIVIDER":

      return (
        <div className="py-4">

          <div className="border-t journey-border" />

        </div>
      );

    /* -------------------------------------------------------
       IMAGE
    ------------------------------------------------------- */

    case "IMAGE": {
      const mediaUrl =
        block.media?.url ||
        getString(data.url);

      const alt =
        getString(data.alt) ||
        block.media?.altText ||
        block.media?.fileName ||
        "Journey image";

      const caption =
        getString(data.caption) ||
        block.media?.caption ||
        "";

      if (!mediaUrl) {
        return null;
      }

      return (
        <figure>

          <img
            src={mediaUrl}
            alt={alt}
            className="max-h-[750px] w-full rounded-2xl object-cover"
          />

          {caption && (
            <figcaption className="mt-3 text-center text-sm journey-faint">
              {caption}
            </figcaption>
          )}

        </figure>
      );
    }

    /* -------------------------------------------------------
       IMAGE + TEXT
    ------------------------------------------------------- */

    case "IMAGE_TEXT": {
      const mediaUrl =
        block.media?.url ||
        getString(data.url);

      const alt =
        getString(data.alt) ||
        block.media?.altText ||
        block.media?.fileName ||
        "Journey image";

      const text =
        getString(data.text);

      return (
        <section className="grid gap-8 md:grid-cols-2 md:items-center">

          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt={alt}
              className="w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="journey-placeholder aspect-[4/3] rounded-2xl border journey-border" />
          )}

          <div>

            {text && (
              <p className="journey-muted whitespace-pre-line text-lg leading-8">
                {text}
              </p>
            )}

          </div>

        </section>
      );
    }

    /* -------------------------------------------------------
       GALLERY
    ------------------------------------------------------- */

    case "GALLERY": {
      const images =
        getGalleryImages(
          data.images
        );

      if (images.length === 0) {
        return null;
      }

      return (
        <section>

          <div className="grid gap-4 sm:grid-cols-2">

            {images.map(
              (image, index) => {

                if (!image.url) {
                  return null;
                }

                return (
                  <figure
                    key={`gallery-${index}-${image.mediaId || image.url}`}
                    className={
                      index === 0 &&
                        images.length > 2
                        ? "sm:col-span-2"
                        : ""
                    }
                  >

                    <img
                      src={image.url}
                      alt={
                        image.alt ||
                        "Gallery image"
                      }
                      className="max-h-[650px] w-full rounded-2xl object-cover"
                    />

                    {image.caption && (
                      <figcaption className="mt-3 text-center text-sm journey-faint">
                        {image.caption}
                      </figcaption>
                    )}

                  </figure>
                );
              }
            )}

          </div>

        </section>
      );
    }

    default:
      return null;
  }
}

/* =========================================================
   ENCOUNTER STORY RENDERER
========================================================= */

function EncounterStoryRenderer({
  story,
}: {
  story: unknown;
}) {
  if (
    !story ||
    typeof story !== "object"
  ) {
    return null;
  }

  const document =
    story as {
      type?: string;
      content?: unknown;
    };

  if (
    !Array.isArray(
      document.content
    )
  ) {
    return null;
  }

  return (
    <div className="space-y-14">

      {document.content.map(
        (rawBlock, index) => {

          if (
            !rawBlock ||
            typeof rawBlock !==
            "object"
          ) {
            return null;
          }

          const block =
            rawBlock as Record<
              string,
              unknown
            >;

          const type =
            getString(block.type);

          const text =
            getString(block.text);

          const author =
            getString(block.author);

          const url =
            getString(block.url);

          const alt =
            getString(block.alt) ||
            "Encounter image";

          const caption =
            getString(
              block.caption
            );

          /* -------------------------------------------------
             PARAGRAPH
          ------------------------------------------------- */

          if (
            type === "paragraph"
          ) {
            if (!text) {
              return null;
            }

            return (
              <p
                key={`encounter-${index}`}
                className="max-w-3xl whitespace-pre-line text-lg leading-9 journey-muted md:text-xl md:leading-10"
              >
                {text}
              </p>
            );
          }

          /* -------------------------------------------------
             HEADING
          ------------------------------------------------- */

          if (
            type === "heading"
          ) {
            if (!text) {
              return null;
            }

            return (
              <h4
                key={`encounter-${index}`}
                className="max-w-3xl font-serif text-3xl leading-tight md:text-5xl"
              >
                {text}
              </h4>
            );
          }

          /* -------------------------------------------------
             SUBHEADING
          ------------------------------------------------- */

          if (
            type === "subheading"
          ) {
            if (!text) {
              return null;
            }

            return (
              <h5
                key={`encounter-${index}`}
                className="max-w-3xl text-2xl font-medium leading-tight md:text-3xl"
              >
                {text}
              </h5>
            );
          }

          /* -------------------------------------------------
             QUOTE
          ------------------------------------------------- */

          if (
            type === "quote"
          ) {
            if (!text) {
              return null;
            }

            return (
              <blockquote
                key={`encounter-${index}`}
                className="max-w-4xl border-l-2 border-[#D99A3D] pl-6 md:pl-10"
              >

                <p className="journey-quote-text font-serif text-2xl leading-10 md:text-4xl md:leading-[1.35]">
                  “{text}”
                </p>

                {author && (
                  <footer className="mt-5 text-sm journey-faint">
                    — {author}
                  </footer>
                )}

              </blockquote>
            );
          }

          /* -------------------------------------------------
             IMAGE
          ------------------------------------------------- */

          if (
            type === "image"
          ) {
            if (!url) {
              return null;
            }

            return (
              <figure
                key={`encounter-${index}`}
              >

                <img
                  src={url}
                  alt={alt}
                  className="max-h-[750px] w-full rounded-2xl object-cover"
                />

                {caption && (
                  <figcaption className="mt-3 text-center text-sm journey-faint">
                    {caption}
                  </figcaption>
                )}

              </figure>
            );
          }

          /* -------------------------------------------------
             DIVIDER
          ------------------------------------------------- */

          if (
            type === "divider"
          ) {
            return (
              <div
                key={`encounter-${index}`}
                className="py-4"
              >

                <div className="border-t journey-border" />

              </div>
            );
          }

          return null;
        }
      )}

    </div>
  );
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
    <div className="journey-surface px-5 py-6">

      <p className="journey-faint text-[10px] uppercase tracking-[0.2em]">
        {label}
      </p>

      <p className="journey-muted mt-2 text-sm">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
  value: Date | string
) {
  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date(value)
    );
  } catch {
    return String(value);
  }
}

/* =========================================================
   GET STRING
========================================================= */

function getString(
  value: unknown
): string {
  return typeof value === "string"
    ? value
    : "";
}

/* =========================================================
   GALLERY PARSER
========================================================= */

function getGalleryImages(
  value: unknown
): GalleryImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const images: GalleryImage[] = [];

  for (const item of value) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const image =
      item as Record<
        string,
        unknown
      >;

    const url =
      getString(image.url);

    if (!url) {
      continue;
    }

    const galleryImage: GalleryImage = {
      url,
    };

    const mediaId =
      getString(image.mediaId);

    const alt =
      getString(image.alt);

    const caption =
      getString(image.caption);

    if (mediaId) {
      galleryImage.mediaId =
        mediaId;
    }

    if (alt) {
      galleryImage.alt = alt;
    }

    if (caption) {
      galleryImage.caption =
        caption;
    }

    images.push(galleryImage);
  }

  return images;
}