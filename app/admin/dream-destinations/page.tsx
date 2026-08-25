"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DreamDestination = {
  id: string;
  name: string;
  country: string;
  coverImage: string | null;
  shortNote: string | null;
  whyVisit: string | null;
  interests: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function DreamDestinationsPage() {
  const [destinations, setDestinations] =
    useState<DreamDestination[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /* =========================================================
     LOAD
  ========================================================= */

  async function loadDestinations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/dream-destinations",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load dream destinations."
        );
      }

      setDestinations(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dream destinations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDestinations();
  }, []);

  /* =========================================================
     DELETE
  ========================================================= */

  async function deleteDestination(
    id: string,
    name: string
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response =
        await fetch(
          `/api/admin/dream-destinations/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete destination."
        );
      }

      setDestinations(
        (current) =>
          current.filter(
            (destination) =>
              destination.id !== id
          )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete destination."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="admin-page">
        <section className="admin-content">
          <div className="admin-intro">
            <span className="admin-eyebrow">
              DREAM DESTINATIONS
            </span>

            <h2>
              Loading...
            </h2>

            <p>
              Loading your dream destinations.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="admin-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-header">

        <div>

          <span className="admin-eyebrow">
            NOMADS OF ADITYA
          </span>

          <h1>
            Dream Destinations
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
          NAVIGATION
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

        <Link
          href="/admin/dream-destinations"
          className="active"
        >
          Dream Destinations
        </Link>

        <Link href="/admin/media">
          Media
        </Link>

        <Link href="/admin/settings">
          Settings
        </Link>

      </nav>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="admin-content">

        {/* ===================================================
            INTRO
        =================================================== */}

        <div className="admin-intro">

          <span className="admin-eyebrow">
            PLACES I HAVEN&apos;T SEEN YET
          </span>

          <h2>
            The places still calling.
          </h2>

          <p>
            Keep track of the destinations you
            want to experience someday.
          </p>

        </div>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-8 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* ===================================================
            TOP ACTION
        =================================================== */}

        <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">

          <div>

            <span className="admin-eyebrow">
              DESTINATION LIBRARY
            </span>

            <p className="mt-3 text-sm text-white/40">
              {destinations.length === 0
                ? "No destinations yet."
                : `${destinations.length} destination${
                    destinations.length === 1
                      ? ""
                      : "s"
                  } in your list.`}
            </p>

          </div>

          <Link
            href="/admin/dream-destinations/new"
            className="admin-button primary"
          >
            + New Destination
          </Link>

        </div>


        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {destinations.length === 0 ? (

          <div className="empty-content">

            <span className="admin-eyebrow">
              NOTHING HERE YET
            </span>

            <h3>
              Where do you want to go?
            </h3>

            <p>
              Add the first place to your dream
              destination list.
            </p>

            <Link
              href="/admin/dream-destinations/new"
              className="admin-button primary"
            >
              + Add Destination
            </Link>

          </div>

        ) : (

          /* =================================================
             DESTINATION TABLE
          ================================================= */

          <div className="admin-table">

            <div
              className="admin-table-header"
              style={{
                gridTemplateColumns:
                  "2fr 1fr 1fr 1fr",
              }}
            >

              <span>
                Destination
              </span>

              <span>
                Country
              </span>

              <span>
                Added
              </span>

              <span>
                Action
              </span>

            </div>


            {destinations.map(
              (destination) => (

                <div
                  className="admin-table-row"
                  key={destination.id}
                  style={{
                    gridTemplateColumns:
                      "2fr 1fr 1fr 1fr",
                  }}
                >

                  {/* DESTINATION */}

                  <div className="flex min-w-0 items-center gap-4">

                    {destination.coverImage ? (

                      <img
                        src={
                          destination.coverImage
                        }
                        alt={
                          destination.name
                        }
                        className="h-16 w-24 shrink-0 rounded-lg object-cover"
                      />

                    ) : (

                      <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider text-white/20">
                        No image
                      </div>

                    )}

                    <div className="min-w-0">

                      <strong>
                        {destination.name}
                      </strong>

                      {destination.shortNote && (
                        <p className="admin-table-description">
                          {
                            destination.shortNote
                          }
                        </p>
                      )}

                    </div>

                  </div>


                  {/* COUNTRY */}

                  <span>
                    {destination.country}
                  </span>


                  {/* DATE */}

                  <span>
                    {formatDate(
                      destination.createdAt
                    )}
                  </span>


                  {/* ACTIONS */}

                  <div className="admin-row-actions">

                    <Link
                      href={`/admin/dream-destinations/${destination.id}`}
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        deleteDestination(
                          destination.id,
                          destination.name
                        )
                      }
                      disabled={
                        deletingId ===
                        destination.id
                      }
                      className="border border-red-500/20 px-3 py-2 text-[0.68rem] uppercase tracking-[0.06em] text-red-400 transition hover:border-red-500/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deletingId ===
                      destination.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="admin-footer">

        <span>
          NOMADS OF ADITYA
        </span>

        <span>
          Dream Destination Library
        </span>

      </footer>

    </main>
  );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
  value: string
): string {
  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(value)
    );
  } catch {
    return value;
  }
}