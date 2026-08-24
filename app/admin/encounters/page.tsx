"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Encounter = {
  id: string;
  title: string;
  shortIntro?: string | null;
  featuredOnHomepage: boolean;
  createdAt: string;
  updatedAt: string;

  journey: {
    id: string;
    title: string;
    slug: string;
  };

  media?: {
    id: string;
    url: string;
    thumbnailUrl?: string | null;
    fileName: string;
    altText?: string | null;
  } | null;
};

export default function EncountersAdminPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEncounters() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/encounters",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load encounters."
        );
      }

      setEncounters(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Load encounters error:",
        error
      );

      setError(
        "Failed to load encounters."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEncounters();
  }, []);

  const filteredEncounters =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return encounters;
      }

      return encounters.filter(
        (encounter) =>
          encounter.title
            .toLowerCase()
            .includes(value) ||
          encounter.journey.title
            .toLowerCase()
            .includes(value) ||
          (
            encounter.shortIntro ||
            ""
          )
            .toLowerCase()
            .includes(value)
      );
    }, [encounters, search]);

  const featuredCount =
    encounters.filter(
      (encounter) =>
        encounter.featuredOnHomepage
    ).length;

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-12 text-white md:px-10">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">

          <div>

            <Link
              href="/admin"
              className="text-xs uppercase tracking-[0.2em] text-white/30 transition hover:text-white"
            >
              ← Dashboard
            </Link>

            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/30">
              Nomads of Aditya · Admin
            </p>

            <h1 className="mt-3 font-serif text-5xl tracking-tight md:text-7xl">
              Encounters
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/40">
              The people, moments and unexpected
              stories discovered along your journeys.
            </p>

          </div>

          <Link
            href="/admin/encounters/new"
            className="inline-flex w-fit rounded-xl bg-[#D99A3D] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e5aa4d]"
          >
            + New Encounter
          </Link>

        </header>


        {/* STATS */}

        <section className="mt-8 grid gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

            <p className="text-xs uppercase tracking-[0.15em] text-white/30">
              Total Encounters
            </p>

            <p className="mt-4 font-serif text-4xl">
              {encounters.length
                .toString()
                .padStart(2, "0")}
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

            <p className="text-xs uppercase tracking-[0.15em] text-white/30">
              Featured
            </p>

            <p className="mt-4 font-serif text-4xl text-[#D99A3D]">
              {featuredCount
                .toString()
                .padStart(2, "0")}
            </p>

          </div>


          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

            <p className="text-xs uppercase tracking-[0.15em] text-white/30">
              Journeys Connected
            </p>

            <p className="mt-4 font-serif text-4xl">
              {
                new Set(
                  encounters.map(
                    (encounter) =>
                      encounter.journey.id
                  )
                ).size
                  .toString()
                  .padStart(2, "0")
              }
            </p>

          </div>

        </section>


        {/* SEARCH */}

        <section className="mt-10">

          <input
            type="text"
            placeholder="Search encounters, journeys..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/50"
          />

        </section>


        {/* CONTENT */}

        <section className="mt-6">

          {loading ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-20 text-center text-sm text-white/30">
              Loading encounters...
            </div>

          ) : error ? (

            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] px-6 py-10 text-center text-sm text-red-400">
              {error}
            </div>

          ) : filteredEncounters.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">

              <p className="text-xs uppercase tracking-[0.3em] text-white/25">
                No encounters
              </p>

              <h2 className="mt-4 font-serif text-3xl">
                Stories are waiting to be discovered.
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/30">
                Create your first encounter and
                connect it to one of your journeys.
              </p>

              <Link
                href="/admin/encounters/new"
                className="mt-7 inline-flex rounded-xl bg-[#D99A3D] px-5 py-3 text-sm font-medium text-black"
              >
                Create First Encounter
              </Link>

            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border border-white/10">

              {/* HEADER */}

              <div className="hidden grid-cols-[80px_1fr_220px_150px_150px] gap-6 border-b border-white/10 bg-white/[0.02] px-6 py-4 text-xs uppercase tracking-[0.15em] text-white/25 md:grid">

                <div>#</div>

                <div>Encounter</div>

                <div>Journey</div>

                <div>Created</div>

                <div className="text-right">
                  Action
                </div>

              </div>


              {/* ROWS */}

              {filteredEncounters.map(
                (
                  encounter,
                  index
                ) => (

                  <div
                    key={encounter.id}
                    className="grid gap-5 border-b border-white/10 px-6 py-6 last:border-b-0 md:grid-cols-[80px_1fr_220px_150px_150px] md:items-center md:gap-6"
                  >

                    {/* NUMBER */}

                    <div className="text-xs tracking-[0.15em] text-[#D99A3D]">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </div>


                    {/* ENCOUNTER */}

                    <div className="flex min-w-0 gap-4">

                      {encounter.media ? (

                        <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:block">

                          <img
                            src={
                              encounter.media
                                .thumbnailUrl ||
                              encounter.media.url
                            }
                            alt={
                              encounter.media
                                .altText ||
                              encounter.title
                            }
                            className="h-full w-full object-cover"
                          />

                        </div>

                      ) : null}


                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="truncate text-lg font-medium">
                            {encounter.title}
                          </h2>

                          {encounter.featuredOnHomepage && (
                            <span className="rounded-full border border-[#D99A3D]/40 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[#D99A3D]">
                              Featured
                            </span>
                          )}

                        </div>

                        {encounter.shortIntro && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/35">
                            {
                              encounter.shortIntro
                            }
                          </p>
                        )}

                      </div>

                    </div>


                    {/* JOURNEY */}

                    <div>

                      <p className="text-sm text-white/60">
                        {
                          encounter.journey
                            .title
                        }
                      </p>

                      <p className="mt-1 text-xs text-white/20">
                        /journeys/
                        {
                          encounter.journey
                            .slug
                        }
                      </p>

                    </div>


                    {/* DATE */}

                    <div className="text-xs text-white/30">
                      {formatDate(
                        encounter.createdAt
                      )}
                    </div>


                    {/* ACTION */}

                    <div className="flex justify-start md:justify-end">

                      <Link
                        href={`/admin/encounters/${encounter.id}`}
                        className="rounded-lg border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.1em] text-white/50 transition hover:border-[#D99A3D] hover:text-[#D99A3D]"
                      >
                        Edit
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* FOOTER */}

        {!loading &&
          !error &&
          filteredEncounters.length > 0 && (
            <div className="mt-6 flex justify-between text-xs text-white/20">

              <p>
                Showing{" "}
                {
                  filteredEncounters.length
                }{" "}
                {filteredEncounters.length === 1
                  ? "encounter"
                  : "encounters"}
              </p>

              <p>
                Nomads of Aditya
              </p>

            </div>
          )}

      </div>

    </main>
  );
}