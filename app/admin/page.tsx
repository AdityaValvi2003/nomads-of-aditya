import { getSession } from "../../src/lib/auth";
import { prisma } from "../../src/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await getSession();

  const [
    journeyCount,
    blogCount,
    dreamDestinationCount,
    pendingCommentCount,
  ] = await Promise.all([
    prisma.journey.count(),
    prisma.blog.count(),
    prisma.dreamDestination.count(),
    prisma.comment.count({
      where: {
        status: "PENDING",
      },
    }),
  ]);

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
            <a
              href="/admin"
              className="block rounded-lg bg-white/10 px-4 py-3 text-sm"
            >
              Dashboard
            </a>

            <a
              href="/admin/journeys"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Journeys
            </a>

            <a
              href="/admin/blogs"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Blogs
            </a>

            <a
              href="/admin/dream-destinations"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Dream Destinations
            </a>

            <a
              href="/admin/comments"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Comments
            </a>

            <a
              href="/admin/media"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Media
            </a>

            <a
              href="/admin/quotes"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Quotes
            </a>

            <a
              href="/admin/settings"
              className="block rounded-lg px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Settings
            </a>
          </nav>

          <div className="mt-auto pt-10">
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

        {/* Main content */}
        <section className="flex-1">
          <header className="border-b border-white/10 px-6 py-5 md:px-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">
                  Admin dashboard
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Welcome back, Aditya.
                </h2>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-sm text-white/60">
                  {session?.email}
                </p>

                <p className="mt-1 text-xs uppercase tracking-wider text-white/30">
                  {session?.role}
                </p>
              </div>
            </div>
          </header>

          <div className="p-6 md:p-10">
            <div className="mb-10">
              <p className="max-w-2xl text-white/45">
                Your place to manage the stories, journeys and
                memories that make Nomads of Aditya.
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
  title="Journeys"
  value={String(journeyCount)}
  description="Places you've visited"
/>

<DashboardCard
  title="Blogs"
  value={String(blogCount)}
  description="Stories you've written"
/>

<DashboardCard
  title="Dreams"
  value={String(dreamDestinationCount)}
  description="Places still waiting"
/>

<DashboardCard
  title="Comments"
  value={String(pendingCommentCount)}
  description="Waiting for approval"
/>
            </div>

            {/* Quick actions */}
            <div className="mt-10">
              <h3 className="text-lg font-medium">
                Quick actions
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <a
                  href="/admin/journeys/new"
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
                >
                  <p className="text-sm text-white/35">
                    Create
                  </p>

                  <h4 className="mt-2 text-lg font-medium">
                    New Journey
                  </h4>

                  <p className="mt-2 text-sm text-white/40">
                    Add a place you've visited.
                  </p>
                </a>

                <a
                  href="/admin/blogs/new"
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
                >
                  <p className="text-sm text-white/35">
                    Write
                  </p>

                  <h4 className="mt-2 text-lg font-medium">
                    New Blog
                  </h4>

                  <p className="mt-2 text-sm text-white/40">
                    Tell a story from your journey.
                  </p>
                </a>

                <a
                  href="/admin/dream-destinations/new"
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
                >
                  <p className="text-sm text-white/35">
                    Dream
                  </p>

                  <h4 className="mt-2 text-lg font-medium">
                    Add Destination
                  </h4>

                  <p className="mt-2 text-sm text-white/40">
                    Add somewhere you want to visit.
                  </p>
                </a>
              </div>
            </div>

            {/* Empty state */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-white/25">
                Your story starts here
              </p>

              <h3 className="mt-4 text-2xl font-medium">
                No journeys yet.
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                Once you add your first journey, it will appear
                here along with the memories and photographs from
                the road.
              </p>

              <a
                href="/admin/journeys/new"
                className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Add your first journey
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-white/40">{title}</p>

      <p className="mt-3 text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-2 text-xs text-white/30">
        {description}
      </p>
    </div>
  );
}