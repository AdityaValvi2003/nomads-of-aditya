import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../../src/lib/prisma";
import { getSession } from "../../../src/lib/auth";

export default async function AdminJourneysPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const journeys = await prisma.journey.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">

          <div>
            <Link
              href="/admin"
              className="text-sm text-white/40 transition hover:text-white"
            >
              ← Dashboard
            </Link>

            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/30">
              Content Manager
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              Journeys
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/40">
              Create, edit and manage the stories that appear on
              Nomads of Aditya.
            </p>
          </div>

          <Link
            href="/admin/journeys/new"
            className="inline-flex w-fit items-center rounded-xl bg-[#D99A3D] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e5aa4d]"
          >
            + New Journey
          </Link>

        </div>

        {/* JOURNEY LIST */}

        <section className="mt-10">

          {journeys.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">

              <p className="text-xs uppercase tracking-[0.3em] text-white/25">
                No journeys
              </p>

              <h2 className="mt-4 text-2xl font-medium">
                Your story starts here.
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
                Create your first journey and start building
                the story behind it.
              </p>

              <Link
                href="/admin/journeys/new"
                className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Create First Journey
              </Link>

            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border border-white/10">

              {/* TABLE HEADER */}

              <div className="hidden grid-cols-[70px_1fr_180px_130px_120px] gap-6 border-b border-white/10 bg-white/[0.02] px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/25 md:grid">

                <div>#</div>
                <div>Journey</div>
                <div>Location</div>
                <div>Status</div>
                <div className="text-right">
                  Action
                </div>

              </div>

              {/* JOURNEYS */}

              {journeys.map((journey, index) => (

                <div
                  key={journey.id}
                  className="grid gap-5 border-b border-white/10 px-6 py-6 last:border-b-0 md:grid-cols-[70px_1fr_180px_130px_120px] md:items-center md:gap-6"
                >

                  {/* NUMBER */}

                  <div className="text-xs tracking-[0.15em] text-[#D99A3D]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* JOURNEY */}

                  <div className="min-w-0">

                    <h2 className="truncate text-lg font-medium">
                      {journey.title}
                    </h2>

                    {journey.shortIntro && (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-white/35">
                        {journey.shortIntro}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-white/20">
                      /journeys/{journey.slug}
                    </p>

                  </div>

                  {/* LOCATION */}

                  <div className="text-sm text-white/45">
                    <p>{journey.location}</p>
                    <p className="mt-1 text-xs text-white/25">
                      {journey.country}
                    </p>
                  </div>

                  {/* STATUS */}

                  <div>

                    <span
                      className={[
                        "inline-flex rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.15em]",
                        journey.status === "PUBLISHED"
                          ? "border-[#D99A3D]/50 text-[#D99A3D]"
                          : journey.status === "ARCHIVED"
                            ? "border-white/10 text-white/30"
                            : "border-white/15 text-white/50",
                      ].join(" ")}
                    >
                      {journey.status}
                    </span>

                  </div>

                  {/* ACTION */}

                  <div className="md:text-right">

                    <Link
                      href={`/admin/journeys/${journey.id}`}
                      className="inline-flex rounded-lg border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.1em] text-white/50 transition hover:border-[#D99A3D] hover:text-[#D99A3D]"
                    >
                      Edit
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}