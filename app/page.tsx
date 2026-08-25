import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "../src/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findFirst();

  return {
    title:
      settings?.siteName?.trim() ||
      "Nomads of Aditya",

    description:
      settings?.heroSubheadline?.trim() ||
      "Travel stories, journeys, people and moments from Aditya's road.",
  };
}

export default async function Home() {
  const settings =
    await prisma.siteSettings.findFirst();
  const [
    featuredJourney,
    blogs,
    destinations,
    featuredEncounters,
  ] = await Promise.all([
    getFeaturedJourney(settings),

    getFeaturedBlogs(settings),

    prisma.dreamDestination.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        name: true,
        country: true,
        coverImage: true,
        shortNote: true,
      },
    }),

    prisma.encounter.findMany({
      where: {
        featuredOnHomepage: true,

        journey: {
          status: "PUBLISHED",
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 3,

      select: {
        id: true,
        title: true,
        shortIntro: true,

        journey: {
          select: {
            title: true,
            slug: true,
          },
        },

        media: {
          select: {
            url: true,
            altText: true,
          },
        },
      },
    }),
  ]);

  const heroHeadline =
    settings?.heroHeadline?.trim() ||
    "Life is too short to live someone else's version of it.";

  const heroSubheadline =
    settings?.heroSubheadline?.trim() ||
    "I'm still figuring life out. These are the places, people and moments helping me along the way.";

  const ownerName =
    settings?.ownerName?.trim() ||
    "ADITYA";

  return (
    <main>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero">
        <div className="hero-img" />

        <div className="hero-content">
          <span className="eyebrow">
            HEY, I'M {ownerName}
          </span>

          <h1>{heroHeadline}</h1>

          <p>{heroSubheadline}</p>

          <div className="actions">
            <Link
              className="btn primary"
              href="/journeys"
            >
              Explore my journeys →
            </Link>

            <Link
              className="btn"
              href="/about"
            >
              About Aditya →
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          PHILOSOPHY
      ===================================================== */}

      <section className="section philosophy">
        <div>
          <span className="eyebrow">
            WHY I TRAVEL
          </span>

          <h2>
            Before you build your life, take
            the time to discover what you want
            it to be.
          </h2>
        </div>

        <div>
          <p className="philosophy-copy">
            I don't think life should become a
            race for money, possessions and a
            version of success someone else
            chose for us.
          </p>

          <div className="principles">
            <div className="principle">
              <strong>FREEDOM</strong>

              <p>
                Find the courage to choose your
                own direction.
              </p>
            </div>

            <div className="principle">
              <strong>EXPLORATION</strong>

              <p>
                Go see places, cultures and
                perspectives beyond your routine.
              </p>
            </div>

            <div className="principle">
              <strong>PEOPLE</strong>

              <p>
                Every stranger carries a story
                worth hearing.
              </p>
            </div>

            <div className="principle">
              <strong>GROWTH</strong>

              <p>
                Your path can be slower and still
                be yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          JOURNEYS
      ===================================================== */}

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              THE ROAD SO FAR
            </span>

            <h2>My Journeys</h2>
          </div>

          <Link
            className="btn"
            href="/journeys"
          >
            All journeys →
          </Link>
        </div>

        {featuredJourney ? (
          <div
            className="journey-feature"
            style={
              featuredJourney.coverImage
                ? {
                  backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.9), transparent 65%), url("${featuredJourney.coverImage}")`,
                  backgroundSize: "cover",
                  backgroundPosition:
                    "center",
                }
                : undefined
            }
          >
            <div className="journey-copy">
              <span className="eyebrow">
                FEATURED JOURNEY ·{" "}
                {featuredJourney.location.toUpperCase()}
              </span>

              <h3>
                {featuredJourney.title}
              </h3>

              <p>
                {featuredJourney.shortIntro ||
                  "Real trips, people, photographs and reflections — told as they happened."}
              </p>

              <Link
                className="btn primary"
                href={`/journeys/${featuredJourney.slug}`}
              >
                Explore journey →
              </Link>
            </div>
          </div>
        ) : (
          <div className="journey-feature">
            <div className="journey-copy">
              <span className="eyebrow">
                THE ROAD IS WAITING
              </span>

              <h3>
                Your next journey belongs here.
              </h3>

              <p>
                Publish a journey from the admin
                panel and it will appear here
                automatically.
              </p>

              <Link
                className="btn primary"
                href="/journeys"
              >
                Explore journeys →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          BLOG
      ===================================================== */}

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              FROM MY MIND
            </span>

            <h2>Blog</h2>
          </div>

          <Link
            className="btn"
            href="/blog"
          >
            All blogs →
          </Link>
        </div>

        {blogs.length > 0 ? (
          <div className="cards">
            {blogs.map(
              (blog, index) => (
                <article
                  className="card"
                  key={blog.id}
                >
                  {blog.coverImage ? (
                    <img
                      className="visual h-[220px] w-full object-cover"
                      src={blog.coverImage}
                      alt={blog.title}
                    />
                  ) : (
                    <div className="visual" />
                  )}

                  <span className="eyebrow">
                    THOUGHT{" "}
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <h3>
                    <Link
                      href={`/blog/${blog.slug}`}
                    >
                      {blog.title}
                    </Link>
                  </h3>

                  <p>
                    {blog.shortIntro ||
                      blog.subtitle ||
                      "Thoughts about freedom, people, travel and finding your own way."}
                  </p>
                </article>
              )
            )}
          </div>
        ) : (
          <div className="card">
            <span className="eyebrow">
              FROM MY MIND
            </span>

            <h3>
              The next story is still being
              written.
            </h3>

            <p>
              Published blog posts will appear
              here automatically.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
    DREAM DESTINATIONS
===================================================== */}

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              PLACES I HAVEN'T SEEN YET
            </span>

            <h2>Dream Destinations</h2>
          </div>

          <Link
            className="btn"
            href="/dream-destinations"
          >
            Explore all →
          </Link>
        </div>

        {destinations.length > 0 ? (
          <div className="destinations">
            {destinations.map((destination) => (
              <Link
                href={`/dream-destinations/${destination.id}`}
                className="destination group"
                key={destination.id}
                style={
                  destination.coverImage
                    ? {
                      backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.82), transparent 65%), url("${destination.coverImage}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                    : undefined
                }
              >
                <div>
                  <span className="eyebrow">
                    ONE DAY
                  </span>

                  <h3 className="transition group-hover:text-[#D99A3D]">
                    {destination.name}
                  </h3>

                  <p className="m-0 text-sm text-white/55">
                    {destination.country}
                  </p>

                  <span className="mt-3 inline-block text-xs uppercase tracking-[0.15em] text-white/40 transition group-hover:text-white/80">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <span className="eyebrow">
              ONE DAY
            </span>

            <h3>
              More places are waiting to be added.
            </h3>

            <p>
              Create dream destinations from the CMS
              and they will appear here automatically.
            </p>
          </div>
        )}
      </section>
      {/* =====================================================
          ENCOUNTERS
      ===================================================== */}

      <section className="section">
        <div className="encounter">
          <div>
            <span className="eyebrow">
              PEOPLE I'VE MET ALONG THE WAY
            </span>

            <h2>
              The conversations I never planned
              are often the ones I remember.
            </h2>
          </div>

          <div>
            {featuredEncounters.length >
              0 ? (
              <div className="space-y-8">
                {featuredEncounters.map(
                  (encounter) => (
                    <article
                      key={encounter.id}
                    >
                      {encounter.media
                        ?.url && (
                          <img
                            src={
                              encounter.media
                                .url
                            }
                            alt={
                              encounter.media
                                .altText ||
                              encounter.title
                            }
                            className="mb-5 max-h-64 w-full object-cover"
                          />
                        )}

                      <span className="eyebrow">
                        ENCOUNTER
                      </span>

                      <h3 className="mt-2 font-serif text-2xl">
                        {encounter.title}
                      </h3>

                      {encounter.shortIntro && (
                        <p className="text-[var(--muted)]">
                          {
                            encounter.shortIntro
                          }
                        </p>
                      )}

                      <Link
                        className="btn mt-3"
                        href={`/journeys/${encounter.journey.slug}/encounters/${encounter.id}`}
                      >
                        Read encounter →
                      </Link>
                    </article>
                  )
                )}
              </div>
            ) : (
              <>
                <p className="lead">
                  Some encounters last twenty
                  minutes. Some stay with you for
                  years. When a person has a story
                  worth sharing, it can live inside
                  a Journey — and sometimes make
                  its way here.
                </p>

                <Link
                  className="btn"
                  href="/journeys"
                >
                  Meet the stories →
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="closing">
        <span className="eyebrow">
          STILL FIGURING IT OUT.
        </span>

        <h2>
          The journey is still being written.
        </h2>

        <p className="lead">
          Maybe you don't need all the answers
          before you start. Maybe you just need
          to take the first step toward a life
          that feels like yours.
        </p>

        <div className="actions">
          <Link
            className="btn primary"
            href="/about"
          >
            Meet Aditya →
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

/* =========================================================
   FEATURED JOURNEY
========================================================= */

async function getFeaturedJourney(
  settings: {
    journeyFeatureMode:
    | "AUTOMATIC"
    | "MANUAL";

    featuredJourneyId:
    | string
    | null;
  } | null
) {
  /*
   * MANUAL MODE
   */

  if (
    settings?.journeyFeatureMode ===
    "MANUAL" &&
    settings.featuredJourneyId
  ) {
    const manualJourney =
      await prisma.journey.findFirst({
        where: {
          id: settings.featuredJourneyId,

          status: "PUBLISHED",
        },

        select: {
          title: true,
          slug: true,
          location: true,
          shortIntro: true,
          coverImage: true,
        },
      });

    if (manualJourney) {
      return manualJourney;
    }
  }

  /*
   * AUTOMATIC MODE
   *
   * Priority:
   *
   * 1. Featured journey
   * 2. Latest published journey
   * 3. Latest created journey
   */

  return prisma.journey.findFirst({
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
      title: true,
      slug: true,
      location: true,
      shortIntro: true,
      coverImage: true,
    },
  });
}

async function getFeaturedBlogs(
  settings: {
    blogFeatureMode: "AUTOMATIC" | "MANUAL";
    featuredBlogId: string | null;
  } | null
) {
  const select = {
    id: true,
    title: true,
    slug: true,
    subtitle: true,
    shortIntro: true,
    coverImage: true,
  };

  /*
   * MANUAL MODE
   */

  if (
    settings?.blogFeatureMode === "MANUAL" &&
    settings.featuredBlogId
  ) {
    const manualBlog = await prisma.blog.findFirst({
      where: {
        id: settings.featuredBlogId,
        status: "PUBLISHED",
      },
      select,
    });

    if (manualBlog) {
      const remainingBlogs = await prisma.blog.findMany({
        where: {
          status: "PUBLISHED",
          id: {
            not: manualBlog.id,
          },
        },
        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        take: 2,
        select,
      });

      return [manualBlog, ...remainingBlogs];
    }
  }

  /*
   * AUTOMATIC MODE
   *
   * Priority:
   *
   * 1. Featured blog
   * 2. Latest published blogs
   */

  const blogs = await prisma.blog.findMany({
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
    take: 3,
    select,
  });

  return blogs;
}