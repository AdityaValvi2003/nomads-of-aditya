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
    <main className="dream-detail-page">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="dream-detail-hero">

        {destination.coverImage ? (

          <div className="dream-detail-hero-image">

            <img
              src={destination.coverImage}
              alt={destination.name}
            />

            <div className="dream-detail-hero-overlay" />

            <div className="dream-detail-hero-gradient" />

            <div className="dream-detail-hero-content">

              <Link
                href="/dream-destinations"
                className="dream-back-link"
              >
                ← Dream Destinations
              </Link>

              <p className="dream-detail-label">
                ONE DAY
              </p>

              <h1>
                {destination.name}
              </h1>

              <p className="dream-detail-country">
                {destination.country}
              </p>

              {destination.shortNote && (
                <p className="dream-detail-note">
                  {destination.shortNote}
                </p>
              )}

            </div>

          </div>

        ) : (

          <div className="dream-detail-no-image">

            <Link
              href="/dream-destinations"
              className="dream-back-link"
            >
              ← Dream Destinations
            </Link>

            <p className="dream-detail-label">
              ONE DAY
            </p>

            <h1>
              {destination.name}
            </h1>

            <p className="dream-detail-country">
              {destination.country}
            </p>

            {destination.shortNote && (
              <p className="lead">
                {destination.shortNote}
              </p>
            )}

          </div>

        )}

      </section>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <article className="dream-detail-content">

        <div className="dream-detail-grid">

          {/* LEFT INTRO */}

          <div>

            <span className="eyebrow">
              THE DREAM
            </span>

            <h2>
              Some places live in your
              imagination long before
              you reach them.
            </h2>

          </div>


          {/* RIGHT CONTENT */}

          <div className="dream-detail-sections">

            {/* WHY VISIT */}

            {destination.whyVisit && (

              <section>

                <span className="eyebrow">
                  WHY I WANT TO GO
                </span>

                <div className="dream-detail-text">
                  {destination.whyVisit}
                </div>

              </section>

            )}


            {/* INTERESTS */}

            {destination.interests && (

              <section className="dream-detail-section-bordered">

                <span className="eyebrow">
                  WHAT I WANT TO EXPERIENCE
                </span>

                <div className="dream-detail-text">
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

        <section className="dream-detail-visual">

          <figure>

            <img
              src={destination.coverImage}
              alt={destination.name}
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

      <section className="dream-detail-end">

        <p>
          NOMADS OF ADITYA
        </p>

      </section>


      {/* ===================================================
          PAGE STYLES
      =================================================== */}

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .dream-detail-page {
          min-height: 100vh;

          background: var(--bg);

          color: var(--text);
        }

        /* =====================================================
           HERO
        ===================================================== */

        .dream-detail-hero {
          position: relative;
        }

        .dream-detail-hero-image {
          position: relative;

          min-height: 75vh;

          overflow: hidden;
        }

        .dream-detail-hero-image > img {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .dream-detail-hero-overlay {
          position: absolute;

          inset: 0;

          background:
            rgba(0, 0, 0, 0.38);
        }

        .dream-detail-hero-gradient {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.88),
              rgba(0, 0, 0, 0.12) 70%,
              rgba(0, 0, 0, 0.2)
            );
        }

        .dream-detail-hero-content {
          position: relative;

          z-index: 2;

          min-height: 75vh;

          max-width: 1200px;

          margin: 0 auto;

          padding:
            0 6vw
            80px;

          display: flex;

          flex-direction: column;

          justify-content: flex-end;

          align-items: flex-start;
        }

        .dream-back-link {
          margin-bottom: 40px;

          color:
            rgba(255, 255, 255, 0.6);

          font-size: 0.68rem;

          letter-spacing: 0.15em;

          text-transform: uppercase;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .dream-back-link:hover {
          color:
            #ffffff;

          transform:
            translateX(3px);
        }

        .dream-detail-label {
          margin: 0;

          color:
            var(--accent2);

          font-size: 0.68rem;

          font-weight: 700;

          letter-spacing: 0.2em;

          text-transform: uppercase;
        }

        .dream-detail-hero h1 {
          max-width: 1100px;

          margin: 15px 0 15px;

          color:
            #f4f0e8;

          font:
            clamp(4rem, 8vw, 9rem) / 0.9
            var(--serif);

          font-weight: 400;

          letter-spacing:
            -0.04em;
        }

        .dream-detail-country {
          margin: 0;

          color:
            rgba(255, 255, 255, 0.65);

          font-size: 0.72rem;

          letter-spacing: 0.2em;

          text-transform: uppercase;
        }

        .dream-detail-note {
          max-width: 650px;

          margin: 25px 0 0;

          color:
            rgba(255, 255, 255, 0.72);

          font-size: 1rem;

          line-height: 1.75;
        }

        /* =====================================================
           NO IMAGE HERO
        ===================================================== */

        .dream-detail-no-image {
          max-width: 1200px;

          margin: 0 auto;

          padding:
            160px 6vw 100px;
        }

        .dream-detail-no-image .dream-back-link {
          display: inline-block;

          color: var(--muted);
        }

        .dream-detail-no-image
        .dream-back-link:hover {
          color: var(--accent);
        }

        .dream-detail-no-image h1 {
          max-width: 1000px;

          margin: 18px 0;

          color: var(--text);

          font:
            clamp(4rem, 8vw, 8rem) / 0.9
            var(--serif);

          font-weight: 400;
        }

        .dream-detail-no-image
        .dream-detail-country {
          color: var(--muted);
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .dream-detail-content {
          max-width: 1100px;

          margin: 0 auto;

          padding:
            120px 6vw 140px;
        }

        .dream-detail-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 0.8fr)
            minmax(0, 1.2fr);

          gap: 100px;
        }

        .dream-detail-grid h2 {
          max-width: 600px;

          margin: 20px 0 0;

          color: var(--text);

          font:
            clamp(2.5rem, 5vw, 5rem) / 1
            var(--serif);

          font-weight: 400;
        }

        .dream-detail-sections {
          display: flex;

          flex-direction: column;

          gap: 70px;
        }

        .dream-detail-section-bordered {
          padding-top: 40px;

          border-top:
            1px solid var(--line);
        }

        .dream-detail-text {
          max-width: 700px;

          margin-top: 25px;

          white-space: pre-line;

          color: var(--muted);

          font-size: 1.1rem;

          line-height: 1.95;
        }

        /* =====================================================
           VISUAL
        ===================================================== */

        .dream-detail-visual {
          padding:
            0 6vw 120px;
        }

        .dream-detail-visual figure {
          max-width: 1400px;

          margin: 0 auto;

          overflow: hidden;

          border:
            1px solid var(--line);
        }

        .dream-detail-visual img {
          display: block;

          width: 100%;

          max-height: 750px;

          object-fit: cover;
        }

        /* =====================================================
           END
        ===================================================== */

        .dream-detail-end {
          padding:
            60px 6vw;

          border-top:
            1px solid var(--line);

          text-align: center;
        }

        .dream-detail-end p {
          margin: 0;

          color: var(--muted);

          font-size: 0.68rem;

          letter-spacing: 0.3em;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 800px) {

          .dream-detail-hero-image,
          .dream-detail-hero-content {
            min-height: 78vh;
          }

          .dream-detail-hero-content {
            padding:
              0 7vw
              60px;
          }

          .dream-detail-hero h1 {
            font-size:
              clamp(3.4rem, 14vw, 6rem);
          }

          .dream-detail-content {
            padding:
              85px 7vw 90px;
          }

          .dream-detail-grid {
            grid-template-columns: 1fr;

            gap: 55px;
          }

          .dream-detail-grid h2 {
            font-size: 2.7rem;
          }

          .dream-detail-sections {
            gap: 50px;
          }

          .dream-detail-text {
            font-size: 1rem;
          }

          .dream-detail-visual {
            padding:
              0 7vw 80px;
          }

          .dream-detail-no-image {
            padding:
              120px 7vw 80px;
          }

          .dream-detail-no-image h1 {
            font-size:
              clamp(3.5rem, 14vw, 6rem);
          }

        }

      `}</style>

    </main>
  );
}