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
    journey.shortIntro ||
    `Explore ${journey.title} with Nomads of Aditya.`;

  const metadata: Metadata = {
    title,
    description,
    alternates: journey.canonicalUrl
      ? {
          canonical: journey.canonicalUrl,
        }
      : undefined,
    robots: {
      index: !journey.noIndex,
      follow: !journey.noFollow,
    },
    openGraph: {
      title:
        journey.ogTitle?.trim() ||
        title,
      description:
        journey.ogDescription?.trim() ||
        description,
      type: "article",
      images: journey.coverImage
        ? [
            {
              url: journey.coverImage,
              alt: journey.title,
            },
          ]
        : undefined,
    },
  };

  return metadata;
}

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
  |--------------------------------------------------------------------------
  | PUBLIC VISIBILITY
  |--------------------------------------------------------------------------
  */

  if (journey.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">

      {/* =========================================================
          HERO
      ========================================================= */}

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

                <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                  {journey.location},{" "}
                  {journey.country}
                </p>

                <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                  {journey.title}
                </h1>

                {journey.shortIntro && (
                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
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
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                {journey.shortIntro}
              </p>
            )}

          </div>
        )}

      </section>

      {/* =========================================================
          JOURNEY INFO
      ========================================================= */}

      {(journey.journeyDate ||
        journey.duration ||
        journey.distance ||
        journey.difficulty ||
        journey.companions ||
        journey.placesVisited) && (
        <section className="border-y border-white/10">

          <div className="mx-auto grid max-w-6xl gap-px bg-white/10 md:grid-cols-3 lg:grid-cols-6">

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

      {/* =========================================================
          STORY
      ========================================================= */}

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

      {/* =========================================================
          ENCOUNTERS
      ========================================================= */}

      {journey.encounters.length > 0 && (
        <section className="border-t border-white/10">

          <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">

            <p className="text-xs uppercase tracking-[0.3em] text-white/30">
              Encounters
            </p>

            <h2 className="mt-3 text-3xl font-medium md:text-4xl">
              People along the way
            </h2>

            <div className="mt-10 grid gap-8 md:grid-cols-2">

              {journey.encounters.map(
                (encounter) => (
                  <div
                    key={encounter.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >

                    {encounter.media?.url && (
                      <img
                        src={
                          encounter.media.url
                        }
                        alt={
                          encounter.media
                            .altText ||
                          encounter.title
                        }
                        className="h-80 w-full object-cover"
                      />
                    )}

                    <div className="p-6">

                      <h3 className="text-xl font-medium">
                        {encounter.title}
                      </h3>

                      {encounter.shortIntro && (
                        <p className="mt-3 text-sm leading-6 text-white/50">
                          {
                            encounter.shortIntro
                          }
                        </p>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </section>
      )}

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <section className="border-t border-white/10 px-6 py-20 text-center">

        <p className="text-xs uppercase tracking-[0.3em] text-white/25">
          End of journey
        </p>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/40">
          Every journey leaves something behind — a memory,
          a person, a place, or a story worth carrying forward.
        </p>

      </section>

    </main>
  );
}

/* =========================================================
   CONTENT BLOCK RENDERER
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

    /* ---------------------------------------------------------
       HEADING
    --------------------------------------------------------- */

    case "HEADING": {
      const text = getString(data.text);

      if (!text) return null;

      return (
        <section>
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {text}
          </h2>
        </section>
      );
    }

    /* ---------------------------------------------------------
       SUBHEADING
    --------------------------------------------------------- */

    case "SUBHEADING": {
      const text = getString(data.text);

      if (!text) return null;

      return (
        <section>
          <h3 className="text-2xl font-medium md:text-3xl">
            {text}
          </h3>
        </section>
      );
    }

    /* ---------------------------------------------------------
       PARAGRAPH
    --------------------------------------------------------- */

    case "PARAGRAPH": {
      const text = getString(data.text);

      if (!text) return null;

      return (
        <section>
          <div className="max-w-3xl whitespace-pre-line text-lg leading-9 text-white/70 md:text-xl md:leading-10">
            {text}
          </div>
        </section>
      );
    }

    /* ---------------------------------------------------------
       QUOTE
    --------------------------------------------------------- */

    case "QUOTE": {
      const text = getString(data.text);
      const author = getString(data.author);

      if (!text) return null;

      return (
        <section className="py-6">

          <blockquote className="border-l-2 border-[#D99A3D] pl-6 md:pl-10">

            <p className="text-2xl leading-10 text-white/85 md:text-4xl md:leading-[1.3]">
              “{text}”
            </p>

            {author && (
              <footer className="mt-5 text-sm text-white/40">
                — {author}
              </footer>
            )}

          </blockquote>

        </section>
      );
    }

    /* ---------------------------------------------------------
       DIVIDER
    --------------------------------------------------------- */

    case "DIVIDER":

      return (
        <div className="py-4">
          <div className="border-t border-white/10" />
        </div>
      );

    /* ---------------------------------------------------------
       IMAGE
    --------------------------------------------------------- */

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
            <figcaption className="mt-3 text-center text-sm text-white/35">
              {caption}
            </figcaption>
          )}

        </figure>
      );
    }

    /* ---------------------------------------------------------
       IMAGE + TEXT
    --------------------------------------------------------- */

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
            <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-white/[0.03]" />
          )}

          <div>

            {text && (
              <p className="whitespace-pre-line text-lg leading-8 text-white/65">
                {text}
              </p>
            )}

          </div>

        </section>
      );
    }

    /* ---------------------------------------------------------
       GALLERY
    --------------------------------------------------------- */

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
                      className="h-full max-h-[650px] min-h-[250px] w-full rounded-2xl object-cover"
                    />

                    {image.caption && (
                      <figcaption className="mt-2 text-sm text-white/35">
                        {
                          image.caption
                        }
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

    /* ---------------------------------------------------------
       VIDEO
    --------------------------------------------------------- */

    case "VIDEO": {
      const url = getString(data.url);
      const caption = getString(data.caption);

      if (!url) return null;

      return (
        <figure>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">

            <video
              src={url}
              controls
              playsInline
              className="max-h-[700px] w-full"
            />

          </div>

          {caption && (
            <figcaption className="mt-3 text-center text-sm text-white/35">
              {caption}
            </figcaption>
          )}

        </figure>
      );
    }

    /* ---------------------------------------------------------
       LOCATION
    --------------------------------------------------------- */

    case "LOCATION": {
      const name = getString(data.name);
      const address =
        getString(data.address);

      const latitude =
        getNumber(data.latitude);

      const longitude =
        getNumber(data.longitude);

      if (!name && !address) {
        return null;
      }

      return (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

          <p className="text-xs uppercase tracking-[0.25em] text-white/30">
            Location
          </p>

          {name && (
            <h3 className="mt-3 text-2xl font-medium">
              {name}
            </h3>
          )}

          {address && (
            <p className="mt-2 text-white/50">
              {address}
            </p>
          )}

          {latitude !== null &&
            longitude !== null && (
              <p className="mt-5 text-xs text-white/30">
                {latitude}, {longitude}
              </p>
            )}

        </section>
      );
    }

    /* ---------------------------------------------------------
       JOURNEY INFO
    --------------------------------------------------------- */

    case "JOURNEY_INFO": {
      const duration =
        getString(data.duration);

      const distance =
        getString(data.distance);

      const difficulty =
        getString(data.difficulty);

      if (
        !duration &&
        !distance &&
        !difficulty
      ) {
        return null;
      }

      return (
        <section>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">

            <JourneyInfoItem
              label="Duration"
              value={duration}
            />

            <JourneyInfoItem
              label="Distance"
              value={distance}
            />

            <JourneyInfoItem
              label="Difficulty"
              value={difficulty}
            />

          </div>

        </section>
      );
    }

    /* ---------------------------------------------------------
       ENCOUNTER
    --------------------------------------------------------- */

    case "ENCOUNTER": {
      const title =
        getString(data.title);

      const text =
        getString(data.text);

      if (!title && !text) {
        return null;
      }

      return (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

          <p className="text-xs uppercase tracking-[0.25em] text-white/30">
            Encounter
          </p>

          {title && (
            <h3 className="mt-4 text-2xl font-medium">
              {title}
            </h3>
          )}

          {text && (
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-white/60">
              {text}
            </p>
          )}

        </section>
      );
    }

    default:
      return null;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function getString(
  value: unknown
): string {
  return typeof value === "string"
    ? value
    : "";
}

function getNumber(
  value: unknown
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function getGalleryImages(
  value: unknown
): GalleryImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        typeof item === "object" &&
        item !== null
    )
    .map((item) => {
      const image =
        item as Record<
          string,
          unknown
        >;

      return {
        mediaId:
          getString(image.mediaId) ||
          undefined,

        url: getString(image.url),

        alt: getString(image.alt),

        caption:
          getString(
            image.caption
          ),
      };
    })
    .filter(
      (image) =>
        image.url !== ""
    );
}

function formatDate(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#111111] p-5 md:p-6">

      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-sm text-white/70">
        {value}
      </p>

    </div>
  );
}

function JourneyInfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#111111] p-5 md:p-6">

      <p className="text-xs uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-base text-white/70">
        {value || "—"}
      </p>

    </div>
  );
}