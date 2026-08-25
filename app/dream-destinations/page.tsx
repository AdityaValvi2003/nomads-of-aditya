import Link from "next/link";

import { prisma } from "../../src/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DreamDestinationsPage() {
  const destinations =
    await prisma.dreamDestination.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="page">

        <div className="max-w-5xl">

          <span className="eyebrow">
            PLACES I HAVEN'T SEEN YET
          </span>

          <h1 className="mt-5">
            Dream Destinations
          </h1>

          <p className="lead mt-8">
            Some places become part of your story
            before you've ever been there. These
            are the places I want to see, experience
            and eventually write about.
          </p>

        </div>

      </section>


      {/* =====================================================
          DESTINATIONS
      ===================================================== */}

      <section className="section pt-0">

        {destinations.length === 0 ? (

          <div className="card">

            <span className="eyebrow">
              ONE DAY
            </span>

            <h2 className="mt-4">
              The list is still being written.
            </h2>

            <p>
              Dream destinations added from the
              admin panel will appear here.
            </p>

            <Link
              href="/"
              className="btn mt-5"
            >
              Back home →
            </Link>

          </div>

        ) : (

          <div className="space-y-8">

            {destinations.map(
              (destination, index) => (

                <Link
                  key={destination.id}
                  href={`/dream-destinations/${destination.id}`}
                  className="group block"
                >

                  <article
                    className="relative min-h-[520px] overflow-hidden border border-[var(--line)] bg-[var(--panel)]"
                  >

                    {/* IMAGE */}

                    {destination.coverImage ? (

                      <img
                        src={
                          destination.coverImage
                        }
                        alt={
                          destination.name
                        }
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                      />

                    ) : (

                      <div className="absolute inset-0 bg-[var(--panel)]" />

                    )}


                    {/* OVERLAY */}

                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />


                    {/* CONTENT */}

                    <div className="relative flex min-h-[520px] items-end p-7 md:p-12">

                      <div className="max-w-3xl">

                        <div className="flex items-center gap-4">

                          <span className="eyebrow text-white/70">
                            ONE DAY
                          </span>

                          <span className="text-xs text-white/35">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                        </div>

                        <h2 className="mt-4 font-serif text-5xl leading-[0.95] text-white md:text-7xl lg:text-8xl">
                          {destination.name}
                        </h2>

                        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-white/60">
                          {destination.country}
                        </p>

                        {destination.shortNote && (
                          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                            {
                              destination.shortNote
                            }
                          </p>
                        )}

                        <div className="mt-7">

                          <span className="inline-block border border-white/30 px-5 py-3 text-xs uppercase tracking-[0.12em] text-white/70 transition group-hover:border-[#D99A3D] group-hover:bg-[#D99A3D] group-hover:text-black">
                            Explore destination →
                          </span>

                        </div>

                      </div>

                    </div>

                  </article>

                </Link>

              )
            )}

          </div>

        )}

      </section>


      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="journey-closing">

        <span className="eyebrow">
          THE LIST WILL KEEP GROWING
        </span>

        <h2>
          There are still too many places
          left to see.
        </h2>

        <p className="lead">
          Maybe someday these destinations
          will stop being dreams and become
          journeys.
        </p>

        <div className="actions">

          <Link
            href="/journeys"
            className="btn primary"
          >
            Explore my journeys →
          </Link>

          <Link
            href="/"
            className="btn"
          >
            Back home →
          </Link>

        </div>

      </section>

    </main>
  );
}