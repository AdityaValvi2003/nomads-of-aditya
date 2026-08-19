import Link from "next/link";
import { prisma } from "../../../src/lib/prisma";

export default async function AdminJourneysPage() {
  const journeys = await prisma.journey.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-white/10 bg-[#0f0f0f] p-6 md:block">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">
              Nomads of Aditya
            </p>

            <h1 className="mt-3 text-xl font-semibold">
              Admin
            </h1>
          </div>

          <nav className="space-y-2">

            <Link
              href="/admin"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/journeys"
              className="block rounded-lg bg-white/10 px-4 py-3 text-sm"
            >
              Journeys
            </Link>

            <Link
              href="/admin/blogs"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Blogs
            </Link>

            <Link
              href="/admin/dream-destinations"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Dream Destinations
            </Link>

            <Link
              href="/admin/comments"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Comments
            </Link>

            <Link
              href="/admin/media"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Media
            </Link>

            <Link
              href="/admin/quotes"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Quotes
            </Link>

            <Link
              href="/admin/settings"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Settings
            </Link>

          </nav>

          <div className="mt-10">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full rounded-lg px-4 py-3 text-left text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                Log out
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1">

          {/* Header */}
          <header className="flex items-end justify-between border-b border-white/10 px-6 py-5 md:px-10">

            <div>
              <p className="text-sm text-white/40">
                Content management
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Journeys
              </h2>
            </div>

            <Link
              href="/admin/journeys/new"
              className="rounded-full bg-[#D99A3D] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e5aa4d]"
            >
              + New Journey
            </Link>

          </header>

          {/* Content */}
          <div className="p-6 md:p-10">

            {journeys.length === 0 ? (

              /* Empty state */
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">

                <p className="text-sm uppercase tracking-[0.25em] text-white/25">
                  Your story starts here
                </p>

                <h3 className="mt-4 text-2xl font-medium">
                  No journeys yet.
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                  Add your first journey and start building your travel
                  stories, memories and photographs.
                </p>

                <Link
                  href="/admin/journeys/new"
                  className="mt-6 inline-flex rounded-full bg-[#D99A3D] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e5aa4d]"
                >
                  + Add your first journey
                </Link>

              </div>

            ) : (

              /* Journey table */
              <div className="overflow-hidden rounded-2xl border border-white/10">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[800px]">

                    <thead className="border-b border-white/10 bg-white/[0.02]">

                      <tr className="text-left text-xs uppercase tracking-wider text-white/35">

                        <th className="px-5 py-4">
                          Journey
                        </th>

                        <th className="px-5 py-4">
                          Location
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="px-5 py-4">
                          Featured
                        </th>

                        <th className="px-5 py-4 text-right">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {journeys.map((journey) => (

                        <tr
                          key={journey.id}
                          className="border-b border-white/10 last:border-b-0 transition hover:bg-white/[0.02]"
                        >

                          {/* Journey */}
                          <td className="px-5 py-5">

                            <div>
                              <p className="font-medium">
                                {journey.title}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                /{journey.slug}
                              </p>
                            </div>

                          </td>

                          {/* Location */}
                          <td className="px-5 py-5">

                            <p className="text-sm text-white/70">
                              {journey.location}, {journey.country}
                            </p>

                          </td>

                          {/* Status */}
                          <td className="px-5 py-5">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                journey.status === "PUBLISHED"
                                  ? "bg-green-500/10 text-green-400"
                                  : journey.status === "ARCHIVED"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-white/10 text-white/60"
                              }`}
                            >
                              {journey.status}
                            </span>

                          </td>

                          {/* Featured */}
                          <td className="px-5 py-5">

                            <span className="text-sm text-white/50">
                              {journey.isFeatured ? "Yes" : "No"}
                            </span>

                          </td>

                          {/* Action */}
                          <td className="px-5 py-5 text-right">

                            <Link
                              href={`/admin/journeys/${journey.id}`}
                              className="text-sm text-[#D99A3D] transition hover:text-[#e5aa4d]"
                            >
                              Edit
                            </Link>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

          </div>

        </section>

      </div>
    </main>
  );
}