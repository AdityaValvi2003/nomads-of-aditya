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
    <main className="dream-page">

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="page dream-intro">

        <div className="dream-intro-inner">

          <span className="eyebrow">
            PLACES I HAVEN'T SEEN YET
          </span>

          <h1>
            Dream Destinations
          </h1>

          <p className="lead">
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

      <section className="section dream-destinations">

        {destinations.length === 0 ? (

          <div className="card dream-empty">

            <span className="eyebrow">
              ONE DAY
            </span>

            <h2>
              The list is still being written.
            </h2>

            <p>
              Dream destinations added from the
              admin panel will appear here.
            </p>

            <Link
              href="/"
              className="btn"
            >
              Back home →
            </Link>

          </div>

        ) : (

          <div className="dream-list">

            {destinations.map(
              (destination, index) => (

                <Link
                  key={destination.id}
                  href={`/dream-destinations/${destination.id}`}
                  className="dream-card-link"
                >

                  <article className="dream-card">

                    {/* IMAGE */}

                    {destination.coverImage ? (

                      <img
                        src={destination.coverImage}
                        alt={destination.name}
                        className="dream-card-image"
                      />

                    ) : (

                      <div className="dream-card-image dream-card-placeholder" />

                    )}


                    {/* OVERLAY */}

                    <div className="dream-card-overlay" />


                    {/* CONTENT */}

                    <div className="dream-card-content">

                      <div className="dream-card-top">

                        <span className="dream-card-label">
                          ONE DAY
                        </span>

                        <span className="dream-card-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                      </div>

                      <div>

                        <h2>
                          {destination.name}
                        </h2>

                        <p className="dream-country">
                          {destination.country}
                        </p>

                        {destination.shortNote && (
                          <p className="dream-note">
                            {destination.shortNote}
                          </p>
                        )}

                        <span className="dream-explore">
                          Explore destination →
                        </span>

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

      <section className="journey-closing dream-closing">

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


      {/* =====================================================
          PAGE STYLES
      ===================================================== */}

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .dream-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
        }

        /* =====================================================
           INTRO
        ===================================================== */

        .dream-intro {
          padding-top: 160px;
          padding-bottom: 80px;
        }

        .dream-intro-inner {
          max-width: 900px;
        }

        .dream-intro h1 {
          margin: 20px 0 25px;

          color: var(--text);

          font:
            clamp(3.5rem, 7vw, 7rem) / 0.95
            var(--serif);

          font-weight: 400;

          letter-spacing: -0.035em;
        }

        .dream-intro .lead {
          max-width: 680px;
        }

        /* =====================================================
           DESTINATION LIST
        ===================================================== */

        .dream-destinations {
          padding-top: 0;
        }

        .dream-list {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* =====================================================
           DESTINATION CARD
        ===================================================== */

        .dream-card-link {
          display: block;
          text-decoration: none;
        }

        .dream-card {
          position: relative;

          min-height: 520px;

          overflow: hidden;

          border:
            1px solid var(--line);

          background:
            var(--panel);
        }

        .dream-card-image {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform 0.7s ease;
        }

        .dream-card-link:hover
        .dream-card-image {
          transform:
            scale(1.025);
        }

        .dream-card-placeholder {
          background:
            linear-gradient(
              135deg,
              var(--panel),
              var(--bg)
            );
        }

        /* =====================================================
           IMAGE OVERLAY
        ===================================================== */

        .dream-card-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.82),
              rgba(0, 0, 0, 0.38) 65%,
              rgba(0, 0, 0, 0.08)
            ),
            linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.82),
              transparent 65%
            );

          pointer-events: none;
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .dream-card-content {
          position: relative;

          z-index: 1;

          min-height: 520px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          padding: 32px;
        }

        .dream-card-top {
          display: flex;

          align-items: center;

          justify-content: space-between;
        }

        .dream-card-label {
          color: var(--accent);

          font-size: 0.68rem;

          font-weight: 700;

          letter-spacing: 0.15em;

          text-transform: uppercase;
        }

        .dream-card-number {
          color:
            rgba(255, 255, 255, 0.45);

          font-size: 0.72rem;

          letter-spacing: 0.12em;
        }

        /* =====================================================
           TITLE
        ===================================================== */

        .dream-card-content h2 {
          max-width: 900px;

          margin: 0 0 12px;

          color: #f4f0e8;

          font:
            clamp(3rem, 7vw, 7rem) / 0.92
            var(--serif);

          font-weight: 400;

          letter-spacing: -0.035em;
        }

        .dream-country {
          margin: 0;

          color:
            rgba(255, 255, 255, 0.65);

          font-size: 0.72rem;

          letter-spacing: 0.2em;

          text-transform: uppercase;
        }

        .dream-note {
          max-width: 650px;

          margin: 20px 0 0;

          color:
            rgba(255, 255, 255, 0.72);

          font-size: 1rem;

          line-height: 1.75;
        }

        /* =====================================================
           EXPLORE
        ===================================================== */

        .dream-explore {
          display: inline-block;

          margin-top: 25px;

          padding:
            12px 17px;

          border:
            1px solid
            rgba(255, 255, 255, 0.35);

          color:
            rgba(255, 255, 255, 0.82);

          font-size: 0.68rem;

          letter-spacing: 0.1em;

          text-transform: uppercase;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .dream-card-link:hover
        .dream-explore {
          background:
            var(--accent);

          border-color:
            var(--accent);

          color:
            #15110b;
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .dream-empty {
          padding: 55px;
        }

        .dream-empty h2 {
          margin:
            15px 0;

          font:
            clamp(2.3rem, 5vw, 4.5rem) / 1
            var(--serif);

          font-weight: 400;
        }

        .dream-empty p {
          max-width: 550px;

          color: var(--muted);

          margin-bottom: 25px;
        }

        /* =====================================================
           CLOSING
        ===================================================== */

        .dream-closing {
          margin-top: 40px;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .dream-intro {
            padding-top: 115px;
            padding-bottom: 55px;
          }

          .dream-intro h1 {
            font-size:
              clamp(3.2rem, 14vw, 5rem);
          }

          .dream-card {
            min-height: 500px;
          }

          .dream-card-content {
            min-height: 500px;
            padding: 25px;
          }

          .dream-card-content h2 {
            font-size:
              clamp(3rem, 13vw, 5rem);
          }

          .dream-note {
            font-size: 0.92rem;
          }

          .dream-empty {
            padding: 35px 25px;
          }

        }

      `}</style>

    </main>
  );
}