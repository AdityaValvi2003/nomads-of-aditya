import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "../../src/lib/auth";
import { prisma } from "../../src/lib/prisma";

export default async function AdminPage() {
  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  /*
  |--------------------------------------------------------------------------
  | DATABASE
  |--------------------------------------------------------------------------
  */

  const [
    totalJourneys,
    publishedJourneys,
    draftJourneys,
    recentJourneys,
  ] = await Promise.all([
    prisma.journey.count(),

    prisma.journey.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.journey.count({
      where: {
        status: "DRAFT",
      },
    }),

    prisma.journey.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        country: true,
        shortIntro: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <main className="admin-page">

      {/* =====================================================
          ADMIN HEADER
      ===================================================== */}

      <header className="admin-header">

        <div>
          <span className="admin-eyebrow">
            NOMADS OF ADITYA
          </span>

          <h1>
            Admin
          </h1>
        </div>

        <div className="admin-header-right">

          <Link
            href="/"
            className="admin-view-site"
          >
            View Website →
          </Link>

          <div className="admin-avatar">
            A
          </div>

        </div>

      </header>


      {/* =====================================================
          ADMIN NAVIGATION
      ===================================================== */}
<nav className="admin-navigation">

  <Link href="/admin">
    Dashboard
  </Link>

  <Link href="/admin/journeys">
    Journeys
  </Link>

  <Link href="/admin/blog">
    Blog
  </Link>

  <Link href="/admin/dream-destinations">
    Dream Destinations
  </Link>

  <Link href="/admin/encounters">
    Encounters
  </Link>

  <Link href="/admin/media">
    Media
  </Link>

  <Link href="/admin/contact">
    Contact Messages
  </Link>

  <Link href="/admin/settings">
    Settings
  </Link>

</nav>

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      <section className="admin-content">

        {/* ===================================================
            INTRO
        =================================================== */}

        <div className="admin-intro">

          <span className="admin-eyebrow">
            CONTROL CENTER
          </span>

          <h2>
            Welcome back.
          </h2>

          <p>
            Manage the stories, journeys and content
            that appear on Nomads of Aditya.
          </p>

        </div>


        {/* ===================================================
            STATS
        =================================================== */}

        <div className="admin-stats">

          <div className="admin-stat">

            <span>
              Journeys
            </span>

            <strong>
              {formatNumber(totalJourneys)}
            </strong>

            <p>
              Total travel stories
            </p>

          </div>


          <div className="admin-stat">

            <span>
              Published
            </span>

            <strong>
              {formatNumber(publishedJourneys)}
            </strong>

            <p>
              Stories visible on website
            </p>

          </div>


          <div className="admin-stat">

            <span>
              Drafts
            </span>

            <strong>
              {formatNumber(draftJourneys)}
            </strong>

            <p>
              Stories waiting to be published
            </p>

          </div>


          <div className="admin-stat">

            <span>
              Recent
            </span>

            <strong>
              {formatNumber(
                recentJourneys.length
              )}
            </strong>

            <p>
              Latest journeys
            </p>

          </div>

        </div>


        {/* ===================================================
            RECENT CONTENT
        =================================================== */}

        <div className="admin-section">

          <div className="admin-section-header">

            <div>

              <span className="admin-eyebrow">
                RECENT CONTENT
              </span>

              <h3>
                Your latest journeys
              </h3>

            </div>

            <Link
              href="/admin/journeys"
              className="admin-button"
            >
              Manage Journeys →
            </Link>

          </div>


          {recentJourneys.length === 0 ? (

            <div className="empty-content">

              <span className="admin-eyebrow">
                NO JOURNEYS
              </span>

              <h3>
                Your first journey starts here.
              </h3>

              <p>
                Create your first travel story and
                it will appear here automatically.
              </p>

              <Link
                href="/admin/journeys/new"
                className="admin-button primary"
              >
                + New Journey
              </Link>

            </div>

          ) : (

            <div className="admin-table">

              <div className="admin-table-header">

                <span>
                  Journey
                </span>

                <span>
                  Location
                </span>

                <span>
                  Status
                </span>

                <span>
                  Action
                </span>

              </div>


              {recentJourneys.map(
                (journey) => (

                  <div
                    className="admin-table-row"
                    key={journey.id}
                  >

                    <div>

                      <strong>
                        {journey.title}
                      </strong>

                      {journey.shortIntro && (
                        <p className="admin-table-description">
                          {journey.shortIntro}
                        </p>
                      )}

                    </div>


                    <span>
                      {journey.location}

                      {journey.country && (
                        <>
                          {" · "}
                          {journey.country}
                        </>
                      )}
                    </span>


                    <span
                      className={
                        journey.status ===
                        "PUBLISHED"
                          ? "status"
                          : "status draft"
                      }
                    >
                      {formatStatus(
                        journey.status
                      )}
                    </span>


                    <div className="admin-row-actions">

                      <Link
                        href={`/admin/journeys/${journey.id}`}
                      >
                        Edit
                      </Link>

                      {journey.status ===
                        "PUBLISHED" && (
                        <Link
                          href={`/journeys/${journey.slug}`}
                          target="_blank"
                        >
                          View ↗
                        </Link>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* ===================================================
            JOURNEY SUMMARY
        =================================================== */}

        <div className="admin-section">

          <div className="admin-section-header">

            <div>

              <span className="admin-eyebrow">
                JOURNEY LIBRARY
              </span>

              <h3>
                Manage your stories.
              </h3>

            </div>

            <Link
              href="/admin/journeys"
              className="admin-button"
            >
              View All →
            </Link>

          </div>


          <div className="journey-summary">

            <div className="journey-summary-item">

              <span>
                TOTAL
              </span>

              <strong>
                {formatNumber(
                  totalJourneys
                )}
              </strong>

              <p>
                Journeys in your database.
              </p>

            </div>


            <div className="journey-summary-item">

              <span>
                LIVE
              </span>

              <strong>
                {formatNumber(
                  publishedJourneys
                )}
              </strong>

              <p>
                Published journeys visible
                to visitors.
              </p>

            </div>


            <div className="journey-summary-item">

              <span>
                DRAFT
              </span>

              <strong>
                {formatNumber(
                  draftJourneys
                )}
              </strong>

              <p>
                Journeys still being prepared.
              </p>

            </div>

          </div>

        </div>


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <div className="admin-section">

          <div className="admin-section-header">

            <div>

              <span className="admin-eyebrow">
                QUICK ACTIONS
              </span>

              <h3>
                Create something new.
              </h3>

            </div>

          </div>


          <div className="quick-actions">

            <Link
              href="/admin/journeys/new"
              className="quick-action"
            >

              <span>
                01
              </span>

              <strong>
                New Journey
              </strong>

              <small>
                Write a new travel story
              </small>

            </Link>


            <Link
              href="/admin/blog"
              className="quick-action"
            >

              <span>
                02
              </span>

              <strong>
                New Blog Post
              </strong>

              <small>
                Share something from your mind
              </small>

            </Link>


            <Link
              href="/admin/dream-destinations"
              className="quick-action"
            >

              <span>
                03
              </span>

              <strong>
                New Destination
              </strong>

              <small>
                Add a place to your dream list
              </small>

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="admin-footer">

        <span>
          NOMADS OF ADITYA
        </span>

        <span>
          Admin Console
        </span>

      </footer>

    </main>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function formatNumber(
  value: number
): string {
  return value
    .toString()
    .padStart(2, "0");
}


function formatStatus(
  status: string
): string {
  return status === "PUBLISHED"
    ? "Published"
    : status === "DRAFT"
    ? "Draft"
    : status;
}