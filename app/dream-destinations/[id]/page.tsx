import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "../../../src/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  const destination =
    await prisma.dreamDestination.findUnique({
      where: {
        id,
      },
    });

  if (!destination) {
    return {};
  }

  return {
    title: `${destination.name} · Dream Destinations`,
    description:
      destination.shortNote ||
      `A dream destination on Nomads of Aditya.`,
    openGraph: {
      title: destination.name,
      description:
        destination.shortNote ||
        `A dream destination on Nomads of Aditya.`,
      images: destination.coverImage
        ? [
            {
              url: destination.coverImage,
              alt: destination.name,
            },
          ]
        : undefined,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function DreamDestinationPage({
  params,
}: PageProps) {
  const { id } = await params;

  const destination =
    await prisma.dreamDestination.findUnique({
      where: {
        id,
      },
    });

  if (!destination) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative">

        {destination.coverImage ? (

          <div className="relative min-h-[75vh] overflow-hidden">

            <img
              src={destination.coverImage}
              alt={destination.name}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />

            <div className="relative flex min-h-[75vh] items-end">

              <div className="mx-auto w-full max-w-6xl px-6 pb-16 md:px-10 md:pb-24">

                <Link
                  href="/dream-destinations"
                  className="mb-10 inline-block text-xs uppercase tracking-[0.2em] text-white/50 transition hover:text-white"
                >
                  ← Dream Destinations
                </Link>

                <p className="text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
                  ONE DAY
                </p>

                <h1 className="mt-4 max-w-5xl font-serif text-6xl leading-[0.9] text-white md:text-8xl lg:text-[9rem]">
                  {destination.name}
                </h1>

                <p className="mt-6 text-sm uppercase tracking-[0.25em] text-white/60">
                  {destination.country}
                </p>

                {destination.shortNote && (
                  <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                    {destination.shortNote}
                  </p>
                )}

              </div>

            </div>

          </div>

        ) : (

          <div className="page pb-20">

            <Link
              href="/dream-destinations"
              className="text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
            >
              ← Dream Destinations
            </Link>

            <p className="mt-14 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
              ONE DAY
            </p>

            <h1 className="mt-5 max-w-5xl font-serif text-6xl leading-[0.9] md:text-8xl">
              {destination.name}
            </h1>

            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
              {destination.country}
            </p>

            {destination.shortNote && (
              <p className="lead mt-8">
                {destination.shortNote}
              </p>
            )}

          </div>

        )}

      </section>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <article className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-32">

        <div className="grid gap-20 md:grid-cols-[0.8fr_1.2fr]">

          {/* LEFT INTRO */}

          <div>

            <span className="eyebrow">
              THE DREAM
            </span>

            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
              Some places live in your
              imagination long before
              you reach them.
            </h2>

          </div>


          {/* RIGHT CONTENT */}

          <div className="space-y-16">

            {/* WHY VISIT */}

            {destination.whyVisit && (
              <section>

                <span className="eyebrow">
                  WHY I WANT TO GO
                </span>

                <div className="mt-6 whitespace-pre-line text-lg leading-9 text-[var(--muted)] md:text-xl md:leading-10">
                  {destination.whyVisit}
                </div>

              </section>
            )}


            {/* INTERESTS */}

            {destination.interests && (
              <section className="border-t border-[var(--line)] pt-10">

                <span className="eyebrow">
                  WHAT I WANT TO EXPERIENCE
                </span>

                <div className="mt-6 whitespace-pre-line text-lg leading-9 text-[var(--muted)] md:text-xl md:leading-10">
                  {destination.interests}
                </div>

              </section>
            )}

          </div>

        </div>

      </article>


      {/* ===================================================
          VISUAL BREAK
      =================================================== */}

      {destination.coverImage && (

        <section className="px-6 md:px-10">

          <figure className="mx-auto max-w-7xl overflow-hidden">

            <img
              src={destination.coverImage}
              alt={destination.name}
              className="max-h-[750px] w-full object-cover"
            />

          </figure>

        </section>

      )}


      {/* ===================================================
          CLOSING
      =================================================== */}

      <section className="journey-detail-closing">

        <span className="eyebrow">
          MAYBE SOMEDAY
        </span>

        <h2>
          One day this dream might
          become a journey.
        </h2>

        <p className="lead">
          Until then, it stays on the list —
          a reminder that there are still
          places waiting to be discovered.
        </p>

        <div className="actions">

          <Link
            href="/dream-destinations"
            className="btn primary"
          >
            All dream destinations →
          </Link>

          <Link
            href="/journeys"
            className="btn"
          >
            Explore my journeys →
          </Link>

        </div>

      </section>


      {/* ===================================================
          END
      =================================================== */}

      <section className="border-t border-[var(--line)] px-6 py-16 text-center">

        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          NOMADS OF ADITYA
        </p>

      </section>

    </main>
  );
}