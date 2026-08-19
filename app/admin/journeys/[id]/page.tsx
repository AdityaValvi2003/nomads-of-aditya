import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../../src/lib/prisma";
import { getSession } from "../../../../src/lib/auth";
import ContentBuilder from "./ContentBuilder";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function updateJourney(id: string, formData: FormData) {
  "use server";

  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const country = String(formData.get("country") || "").trim();

  const shortIntro = String(
    formData.get("shortIntro") || ""
  ).trim();

  const journeyDateValue = String(
    formData.get("journeyDate") || ""
  ).trim();

  const duration = String(
    formData.get("duration") || ""
  ).trim();

  const distance = String(
    formData.get("distance") || ""
  ).trim();

  const difficulty = String(
    formData.get("difficulty") || ""
  ).trim();

  const companions = String(
    formData.get("companions") || ""
  ).trim();

  const placesVisited = String(
    formData.get("placesVisited") || ""
  ).trim();

  const status = String(
    formData.get("status") || "DRAFT"
  );

  const isFeatured = formData.get("isFeatured") === "on";

  const seoTitle = String(
    formData.get("seoTitle") || ""
  ).trim();

  const seoDescription = String(
    formData.get("seoDescription") || ""
  ).trim();

  const canonicalUrl = String(
    formData.get("canonicalUrl") || ""
  ).trim();

  const ogTitle = String(
    formData.get("ogTitle") || ""
  ).trim();

  const ogDescription = String(
    formData.get("ogDescription") || ""
  ).trim();

  const noIndex = formData.get("noIndex") === "on";

  const noFollow = formData.get("noFollow") === "on";

  if (!title || !slug || !location || !country) {
    throw new Error("Title, slug, location and country are required.");
  }

  const existingJourney = await prisma.journey.findFirst({
    where: {
      slug,
      NOT: {
        id,
      },
    },
  });

  if (existingJourney) {
    throw new Error("Another journey already uses this slug.");
  }

  let journeyDate: Date | null = null;

  if (journeyDateValue) {
    journeyDate = new Date(`${journeyDateValue}T00:00:00`);

    if (Number.isNaN(journeyDate.getTime())) {
      throw new Error("Invalid journey date.");
    }
  }

  await prisma.journey.update({
    where: {
      id,
    },

    data: {
      title,
      slug,
      location,
      country,

      shortIntro: shortIntro || null,

      journeyDate,

      duration: duration || null,
      distance: distance || null,
      difficulty: difficulty || null,
      companions: companions || null,
      placesVisited: placesVisited || null,

      status: status as
        | "DRAFT"
        | "PUBLISHED"
        | "ARCHIVED",

      isFeatured,

      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      canonicalUrl: canonicalUrl || null,

      ogTitle: ogTitle || null,
      ogDescription: ogDescription || null,

      noIndex,
      noFollow,

      publishedAt:
        status === "PUBLISHED"
          ? new Date()
          : null,
    },
  });

  redirect(`/admin/journeys/${id}`);
}

export default async function EditJourneyPage({
  params,
}: PageProps) {
  const { id } = await params;

  const journey = await prisma.journey.findUnique({
    where: {
      id,
    },
  });

  if (!journey) {
    notFound();
  }

  const journeyDate = journey.journeyDate
    ? journey.journeyDate.toISOString().split("T")[0]
    : "";

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
          <header className="border-b border-white/10 px-6 py-5 md:px-10">

            <div className="flex items-center justify-between">

              <div>
                <Link
                  href="/admin/journeys"
                  className="text-sm text-white/40 transition hover:text-white"
                >
                  ← Back to Journeys
                </Link>

                <p className="mt-5 text-sm text-white/40">
                  Content management
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Edit Journey
                </h2>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-sm text-white/50">
                  {journey.status}
                </p>

                <p className="mt-1 text-xs text-white/25">
                  /{journey.slug}
                </p>
              </div>

            </div>

          </header>

          {/* Form */}
          <div className="p-6 md:p-10">

            <form
              action={updateJourney.bind(null, journey.id)}
              className="mx-auto max-w-5xl space-y-8"
            >

              {/* Basic information */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Step 1
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Basic information
                  </h3>

                  <p className="mt-2 text-sm text-white/40">
                    The basic information visitors will see about this journey.
                  </p>
                </div>

                <div className="mt-8 space-y-6">

                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Title *
                    </label>

                    <input
                      id="title"
                      name="title"
                      type="text"
                      defaultValue={journey.title}
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label
                      htmlFor="slug"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Slug *
                    </label>

                    <input
                      id="slug"
                      name="slug"
                      type="text"
                      defaultValue={journey.slug}
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />

                    <p className="mt-2 text-xs text-white/30">
                      Example: /journeys/harishchandragad
                    </p>
                  </div>

                  {/* Location */}
                  <div className="grid gap-6 md:grid-cols-2">

                    <div>
                      <label
                        htmlFor="location"
                        className="mb-2 block text-sm text-white/60"
                      >
                        Location *
                      </label>

                      <input
                        id="location"
                        name="location"
                        type="text"
                        defaultValue={journey.location}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="mb-2 block text-sm text-white/60"
                      >
                        Country *
                      </label>

                      <input
                        id="country"
                        name="country"
                        type="text"
                        defaultValue={journey.country}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                      />
                    </div>

                  </div>

                  {/* Intro */}
                  <div>
                    <label
                      htmlFor="shortIntro"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Short introduction
                    </label>

                    <textarea
                      id="shortIntro"
                      name="shortIntro"
                      rows={4}
                      defaultValue={journey.shortIntro ?? ""}
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                    />
                  </div>

                </div>

              </section>

              {/* Journey details */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Step 2
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Journey details
                  </h3>

                  <p className="mt-2 text-sm text-white/40">
                    Information about the actual trip.
                  </p>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">

                  {/* Date */}
                  <div>
                    <label
                      htmlFor="journeyDate"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Journey date
                    </label>

                    <input
                      id="journeyDate"
                      name="journeyDate"
                      type="date"
                      defaultValue={journeyDate}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label
                      htmlFor="duration"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Duration
                    </label>

                    <input
                      id="duration"
                      name="duration"
                      type="text"
                      defaultValue={journey.duration ?? ""}
                      placeholder="1 day"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                  {/* Distance */}
                  <div>
                    <label
                      htmlFor="distance"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Distance
                    </label>

                    <input
                      id="distance"
                      name="distance"
                      type="text"
                      defaultValue={journey.distance ?? ""}
                      placeholder="14 km"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label
                      htmlFor="difficulty"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Difficulty
                    </label>

                    <input
                      id="difficulty"
                      name="difficulty"
                      type="text"
                      defaultValue={journey.difficulty ?? ""}
                      placeholder="Moderate"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                  {/* Companions */}
                  <div>
                    <label
                      htmlFor="companions"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Companions
                    </label>

                    <input
                      id="companions"
                      name="companions"
                      type="text"
                      defaultValue={journey.companions ?? ""}
                      placeholder="Friends, solo, family..."
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                  {/* Places visited */}
                  <div>
                    <label
                      htmlFor="placesVisited"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Places visited
                    </label>

                    <input
                      id="placesVisited"
                      name="placesVisited"
                      type="text"
                      defaultValue={journey.placesVisited ?? ""}
                      placeholder="Fort, Kokan Kada, Tolar Khind"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                </div>

              </section>

              {/* Publishing */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Step 3
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Publishing
                  </h3>
                </div>

                <div className="mt-8 space-y-6">

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="status"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Status
                    </label>

                    <select
                      id="status"
                      name="status"
                      defaultValue={journey.status}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
                    >
                      <option value="DRAFT">
                        Draft
                      </option>

                      <option value="PUBLISHED">
                        Published
                      </option>

                      <option value="ARCHIVED">
                        Archived
                      </option>
                    </select>
                  </div>

                  {/* Featured */}
                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      name="isFeatured"
                      defaultChecked={journey.isFeatured}
                      className="h-4 w-4 accent-[#D99A3D]"
                    />

                    <span>
                      <span className="block text-sm text-white/70">
                        Feature this journey
                      </span>

                      <span className="mt-1 block text-xs text-white/30">
                        Show this journey in featured sections of the website.
                      </span>
                    </span>

                  </label>

                </div>

              </section>

              {/* SEO */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Step 4
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    SEO
                  </h3>

                  <p className="mt-2 text-sm text-white/40">
                    Search engine and social sharing settings.
                  </p>
                </div>

                <div className="mt-8 space-y-6">

                  {/* SEO title */}
                  <div>
                    <label
                      htmlFor="seoTitle"
                      className="mb-2 block text-sm text-white/60"
                    >
                      SEO title
                    </label>

                    <input
                      id="seoTitle"
                      name="seoTitle"
                      type="text"
                      defaultValue={journey.seoTitle ?? ""}
                      placeholder="Harishchandragad Trek - Nomads of Aditya"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                  {/* SEO description */}
                  <div>
                    <label
                      htmlFor="seoDescription"
                      className="mb-2 block text-sm text-white/60"
                    >
                      SEO description
                    </label>

                    <textarea
                      id="seoDescription"
                      name="seoDescription"
                      rows={3}
                      defaultValue={journey.seoDescription ?? ""}
                      placeholder="Explore my journey through Harishchandragad..."
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                  {/* Canonical */}
                  <div>
                    <label
                      htmlFor="canonicalUrl"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Canonical URL
                    </label>

                    <input
                      id="canonicalUrl"
                      name="canonicalUrl"
                      type="url"
                      defaultValue={journey.canonicalUrl ?? ""}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />
                  </div>

                  {/* OG title */}
                  <div>
                    <label
                      htmlFor="ogTitle"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Social sharing title
                    </label>

                    <input
                      id="ogTitle"
                      name="ogTitle"
                      type="text"
                      defaultValue={journey.ogTitle ?? ""}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                    />
                  </div>

                  {/* OG description */}
                  <div>
                    <label
                      htmlFor="ogDescription"
                      className="mb-2 block text-sm text-white/60"
                    >
                      Social sharing description
                    </label>

                    <textarea
                      id="ogDescription"
                      name="ogDescription"
                      rows={3}
                      defaultValue={journey.ogDescription ?? ""}
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                    />
                  </div>

                  {/* Robots */}
                  <div className="space-y-4 border-t border-white/10 pt-6">

                    <label className="flex cursor-pointer items-center gap-3">

                      <input
                        type="checkbox"
                        name="noIndex"
                        defaultChecked={journey.noIndex}
                        className="h-4 w-4 accent-[#D99A3D]"
                      />

                      <span className="text-sm text-white/60">
                        Tell search engines not to index this page
                      </span>

                    </label>

                    <label className="flex cursor-pointer items-center gap-3">

                      <input
                        type="checkbox"
                        name="noFollow"
                        defaultChecked={journey.noFollow}
                        className="h-4 w-4 accent-[#D99A3D]"
                      />

                      <span className="text-sm text-white/60">
                        Tell search engines not to follow links on this page
                      </span>

                    </label>

                  </div>

                </div>

              </section>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pb-10">

                <Link
                  href="/admin/journeys"
                  className="rounded-xl px-5 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="rounded-xl bg-[#D99A3D] px-6 py-3 text-sm font-medium text-black transition hover:bg-[#e5aa4d]"
                >
                  Save Changes
                </button>

              </div>

            </form>
            <ContentBuilder journeyId={journey.id} />

          </div>

        </section>

      </div>
    </main>
  );
}