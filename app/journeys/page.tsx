import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "../../src/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journeys | Nomads of Aditya",
  description:
    "Real journeys, places, people, photographs and stories from Aditya's road.",
};

export default async function Journeys() {
  const settings = await prisma.siteSettings.findFirst();

  /*
   * ---------------------------------------------------------
   * FEATURED JOURNEY
   *
   * MANUAL:
   * Use the journey selected in Site Settings.
   *
   * AUTOMATIC:
   * 1. Featured published journey
   * 2. Latest published journey
   * 3. Latest created journey
   * ---------------------------------------------------------
   */

  let featuredJourney = null;

  if (
    settings?.journeyFeatureMode === "MANUAL" &&
    settings.featuredJourneyId
  ) {
    featuredJourney = await prisma.journey.findFirst({
      where: {
        id: settings.featuredJourneyId,
        status: "PUBLISHED",
      },

      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        country: true,
        coverImage: true,
        shortIntro: true,
        journeyDate: true,
        duration: true,
        distance: true,
        difficulty: true,
        companions: true,
        placesVisited: true,
      },
    });
  }

  if (!featuredJourney) {
    featuredJourney = await prisma.journey.findFirst({
      where: {
        status: "PUBLISHED",
      },

      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        country: true,
        coverImage: true,
        shortIntro: true,
        journeyDate: true,
        duration: true,
        distance: true,
        difficulty: true,
        companions: true,
        placesVisited: true,
      },
    });
  }

  /*
   * ---------------------------------------------------------
   * ALL PUBLISHED JOURNEYS
   * ---------------------------------------------------------
   */

  const journeys = await prisma.journey.findMany({
    where: {
      status: "PUBLISHED",
    },

    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        publishedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],

    select: {
      id: true,
      title: true,
      slug: true,
      location: true,
      country: true,
      coverImage: true,
      shortIntro: true,
      journeyDate: true,
      duration: true,
      distance: true,
      difficulty: true,
      companions: true,
      placesVisited: true,
    },
  });

  /*
   * Don't show the featured journey a second time
   * in the archive.
   */

  const archiveJourneys = featuredJourney
    ? journeys.filter(
        (journey) =>
          journey.id !== featuredJourney?.id
      )
    : journeys;

  return (
    <main>
      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="page journey-intro">
        <span className="eyebrow">
          REAL TRIPS · REAL STORIES
        </span>

        <h1>My Journeys</h1>

        <p className="lead">
          Places I've actually been, people I've
          met, photographs I've collected and
          things I brought back with me.
        </p>
      </section>

      {/* =====================================================
          FEATURED JOURNEY
      ===================================================== */}

      {featuredJourney ? (
        <section className="journeys-feature">
          <div
            className="journeys-feature-image"
            style={
              featuredJourney.coverImage
                ? {
                    backgroundImage: `
                      linear-gradient(
                        90deg,
                        rgba(0, 0, 0, 0.88),
                        rgba(0, 0, 0, 0.35) 65%,
                        rgba(0, 0, 0, 0.15)
                      ),
                      linear-gradient(
                        0deg,
                        rgba(0, 0, 0, 0.9),
                        transparent 60%
                      ),
                      url("${featuredJourney.coverImage}")
                    `,
                  }
                : undefined
            }
          />

          <div className="journeys-feature-overlay">
            <span className="eyebrow">
              FEATURED JOURNEY ·{" "}
              {featuredJourney.location.toUpperCase()} ·{" "}
              {featuredJourney.country.toUpperCase()}
            </span>

            <h2>
              {featuredJourney.title}
            </h2>

            <p>
              {featuredJourney.shortIntro ||
                "A journey through places, people and moments that made the trip worth remembering."}
            </p>

            <Link
              className="btn primary"
              href={`/journeys/${featuredJourney.slug}`}
            >
              Explore journey →
            </Link>
          </div>
        </section>
      ) : (
        <section className="journeys-feature">
          <div className="journeys-feature-overlay">
            <span className="eyebrow">
              THE ROAD IS WAITING
            </span>

            <h2>
              Your first journey belongs here.
            </h2>

            <p>
              Publish a journey from the Admin
              panel and it will automatically
              appear here.
            </p>

            <Link
              className="btn primary"
              href="/admin/journeys"
            >
              Open Admin →
            </Link>
          </div>
        </section>
      )}

      {/* =====================================================
          JOURNEY ARCHIVE
      ===================================================== */}

      <section className="section journeys-list">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              THE ROAD SO FAR
            </span>

            <h2>
              Stories from the road.
            </h2>
          </div>

          <p className="lead">
            Every journey becomes a collection
            of photographs, places, people,
            memories and stories.
          </p>
        </div>

        {archiveJourneys.length > 0 ? (
          <div className="journey-grid">
            {archiveJourneys.map(
              (journey) => (
                <article
                  className="journey-card"
                  key={journey.id}
                >
                  <div
                    className="journey-card-image"
                    style={
                      journey.coverImage
                        ? {
                            backgroundImage: `
                              linear-gradient(
                                0deg,
                                rgba(0, 0, 0, 0.78),
                                transparent 60%
                              ),
                              url("${journey.coverImage}")
                            `,
                          }
                        : undefined
                    }
                  />

                  <div className="journey-card-content">
                    <span className="eyebrow">
                      {journey.location.toUpperCase()}{" "}
                      ·{" "}
                      {journey.country.toUpperCase()}
                    </span>

                    <h3>
                      {journey.title}
                    </h3>

                    <p>
                      {journey.shortIntro ||
                        "A story from the road — told through places, people and moments."}
                    </p>

                    <Link
                      className="btn"
                      href={`/journeys/${journey.slug}`}
                    >
                      Explore journey →
                    </Link>
                  </div>
                </article>
              )
            )}

            {/* Future journey placeholder */}

            <article className="journey-card journey-card-empty">
              <div className="journey-card-content">
                <span className="eyebrow">
                  STILL EXPLORING
                </span>

                <h3>
                  The map is still being filled.
                </h3>

                <p>
                  More journeys, photographs and
                  stories will appear here as the
                  road continues.
                </p>
              </div>
            </article>
          </div>
        ) : (
          <div className="journey-card journey-card-empty">
            <div className="journey-card-content">
              <span className="eyebrow">
                NO JOURNEYS YET
              </span>

              <h3>
                The road is waiting.
              </h3>

              <p>
                Publish your first journey from
                the Admin panel and it will appear
                here automatically.
              </p>

              <Link
                className="btn primary"
                href="/admin/journeys"
              >
                Add a journey →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          JOURNEY COUNT
      ===================================================== */}

      {journeys.length > 0 && (
        <section className="section">
          <div className="journey-facts">
            <div>
              <span className="eyebrow">
                JOURNEYS
              </span>

              <strong>
                {String(journeys.length).padStart(
                  2,
                  "0"
                )}
              </strong>
            </div>

            <div>
              <span className="eyebrow">
                FEATURED
              </span>

              <strong>
                {featuredJourney ? "01" : "00"}
              </strong>
            </div>

            <div>
              <span className="eyebrow">
                NEXT
              </span>

              <strong>
                ?
              </strong>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="journey-closing">
        <span className="eyebrow">
          STILL EXPLORING
        </span>

        <h2>
          There are still many roads left to
          take.
        </h2>

        <p className="lead">
          This is only the beginning. More
          places, people and stories will find
          their way here.
        </p>

        <div className="actions">
          <Link
            className="btn primary"
            href="/dream-destinations"
          >
            Dream destinations →
          </Link>

          <Link
            className="btn"
            href="/contact"
          >
            Let's connect →
          </Link>
        </div>
      </section>
    </main>
  );
}