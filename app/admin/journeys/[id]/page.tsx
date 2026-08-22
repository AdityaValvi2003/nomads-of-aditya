import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../../src/lib/prisma";
import { getSession } from "../../../../src/lib/auth";
import ContentBuilder from "./ContentBuilder";
import CoverImageField from "./CoverImageField";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function updateJourney(
  id: string,
  formData: FormData
) {
  "use server";

  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const title = String(
    formData.get("title") || ""
  ).trim();

  const slug = String(
    formData.get("slug") || ""
  ).trim();

  const location = String(
    formData.get("location") || ""
  ).trim();

  const country = String(
    formData.get("country") || ""
  ).trim();

  const coverImage = String(
    formData.get("coverImage") || ""
  ).trim();

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

  const isFeatured =
    formData.get("isFeatured") === "on";

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

  const noIndex =
    formData.get("noIndex") === "on";

  const noFollow =
    formData.get("noFollow") === "on";

  if (
    !title ||
    !slug ||
    !location ||
    !country
  ) {
    throw new Error(
      "Title, slug, location and country are required."
    );
  }

  const existingJourney =
    await prisma.journey.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
    });

  if (existingJourney) {
    throw new Error(
      "Another journey already uses this slug."
    );
  }

  let journeyDate: Date | null = null;

  if (journeyDateValue) {
    journeyDate = new Date(
      `${journeyDateValue}T00:00:00`
    );

    if (
      Number.isNaN(
        journeyDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid journey date."
      );
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

      /*
       * COVER IMAGE
       *
       * Empty string becomes null so that
       * removing a cover image actually removes
       * it from the database.
       */
      coverImage: coverImage || null,

      shortIntro:
        shortIntro || null,

      journeyDate,

      duration:
        duration || null,

      distance:
        distance || null,

      difficulty:
        difficulty || null,

      companions:
        companions || null,

      placesVisited:
        placesVisited || null,

      status: status as
        | "DRAFT"
        | "PUBLISHED"
        | "ARCHIVED",

      isFeatured,

      seoTitle:
        seoTitle || null,

      seoDescription:
        seoDescription || null,

      canonicalUrl:
        canonicalUrl || null,

      ogTitle:
        ogTitle || null,

      ogDescription:
        ogDescription || null,

      noIndex,
      noFollow,

      publishedAt:
        status === "PUBLISHED"
          ? new Date()
          : null,
    },
  });

  redirect(
    `/admin/journeys/${id}`
  );
}

export default async function EditJourneyPage({
  params,
}: PageProps) {
  const { id } = await params;

  const journey =
    await prisma.journey.findUnique({
      where: {
        id,
      },
    });

  if (!journey) {
    notFound();
  }

  const journeyDate =
    journey.journeyDate
      ? journey.journeyDate
          .toISOString()
          .split("T")[0]
      : "";

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">

      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

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
              href="/admin/blog"
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

            <form
              action="/api/auth/logout"
              method="POST"
            >

              <button
                type="submit"
                className="w-full rounded-lg px-4 py-3 text-left text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                Log out
              </button>

            </form>

          </div>

        </aside>


        {/* =====================================================
            MAIN
        ====================================================== */}

        <section className="flex-1">


          {/* ===================================================
              HEADER
          ==================================================== */}

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


              <div className="flex items-center gap-4">

                {journey.status ===
                  "PUBLISHED" && (
                  <Link
                    href={`/journeys/${journey.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden rounded-xl border border-[#D99A3D]/40 px-4 py-2.5 text-sm text-[#D99A3D] transition hover:border-[#D99A3D] hover:bg-[#D99A3D]/10 sm:block"
                  >
                    View Public Journey ↗
                  </Link>
                )}

                <div className="hidden text-right sm:block">

                  <p className="text-sm text-white/50">
                    {journey.status}
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    /journeys/
                    {journey.slug}
                  </p>

                </div>

              </div>

            </div>

          </header>


          {/* ===================================================
              FORM
          ==================================================== */}

          <div className="p-6 md:p-10">

            <form
              action={updateJourney.bind(
                null,
                journey.id
              )}
              className="mx-auto max-w-5xl space-y-8"
            >


              {/* =================================================
                  STEP 1 — BASIC INFORMATION
              ================================================== */}

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


                  {/* TITLE */}

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
                      defaultValue={
                        journey.title
                      }
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />

                  </div>


                  {/* SLUG */}

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
                      defaultValue={
                        journey.slug
                      }
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />

                    <p className="mt-2 text-xs text-white/30">
                      Example:
                      /journeys/harishchandragad
                    </p>

                  </div>


                  {/* LOCATION / COUNTRY */}

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
                        defaultValue={
                          journey.location
                        }
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
                        defaultValue={
                          journey.country
                        }
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                      />

                    </div>

                  </div>


                  {/* SHORT INTRO */}

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
                      defaultValue={
                        journey.shortIntro ??
                        ""
                      }
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                    />

                  </div>

                </div>

              </section>


              {/* =================================================
                  COVER IMAGE — NEW
              ================================================== */}

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Step 2
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Cover image
                  </h3>

                  <p className="mt-2 text-sm text-white/40">
                    Choose the main photograph for this journey.
                    This image will be used as the journey cover.
                  </p>

                </div>

                <div className="mt-8">

                  <CoverImageField
                    initialImage={
                      journey.coverImage
                    }
                  />

                </div>

              </section>


              {/* =================================================
                  JOURNEY DETAILS
              ================================================== */}

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Step 3
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Journey details
                  </h3>

                  <p className="mt-2 text-sm text-white/40">
                    Information about the actual trip.
                  </p>

                </div>


                <div className="mt-8 grid gap-6 md:grid-cols-2">


                  {/* DATE */}

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
                      defaultValue={
                        journeyDate
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/30"
                    />

                  </div>


                  {/* DURATION */}

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
                      defaultValue={
                        journey.duration ??
                        ""
                      }
                      placeholder="1 day"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />

                  </div>


                  {/* DISTANCE */}

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
                      defaultValue={
                        journey.distance ??
                        ""
                      }
                      placeholder="14 km"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />

                  </div>


                  {/* DIFFICULTY */}

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
                      defaultValue={
                        journey.difficulty ??
                        ""
                      }
                      placeholder="Moderate"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />

                  </div>


                  {/* COMPANIONS */}

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
                      defaultValue={
                        journey.companions ??
                        ""
                      }
                      placeholder="Friends, solo, family..."
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20"
                    />

                  </div>


                  {/* PLACES */}

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
                      defaultValue={
                        journey.placesVisited ??
                        ""
                      }
                      placeholder="Fort, Kokan Kada, Tolar Khind"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20"
                    />

                  </div>

                </div>

              </section>


              {/* =================================================
                  PUBLISHING
              ================================================== */}

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Step 4
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Publishing
                  </h3>

                </div>


                <div className="mt-8 space-y-6">


                  {/* STATUS */}

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
                      defaultValue={
                        journey.status
                      }
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


                  {/* FEATURED */}

                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      name="isFeatured"
                      defaultChecked={
                        journey.isFeatured
                      }
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


              {/* =================================================
                  SEO
              ================================================== */}

              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-white/25">
                    Step 5
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    SEO
                  </h3>

                  <p className="mt-2 text-sm text-white/40">
                    Search engine and social sharing settings.
                  </p>

                </div>


                <div className="mt-8 space-y-6">


                  {/* SEO TITLE */}

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
                      defaultValue={
                        journey.seoTitle ??
                        ""
                      }
                      placeholder="Harishchandragad Trek - Nomads of Aditya"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                    />

                  </div>


                  {/* SEO DESCRIPTION */}

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
                      defaultValue={
                        journey.seoDescription ??
                        ""
                      }
                      placeholder="Explore my journey through Harishchandragad..."
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20"
                    />

                  </div>


                  {/* CANONICAL */}

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
                      defaultValue={
                        journey.canonicalUrl ??
                        ""
                      }
                      placeholder="https://..."
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20"
                    />

                  </div>


                  {/* OG TITLE */}

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
                      defaultValue={
                        journey.ogTitle ??
                        ""
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                    />

                  </div>


                  {/* OG DESCRIPTION */}

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
                      defaultValue={
                        journey.ogDescription ??
                        ""
                      }
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                    />

                  </div>


                  {/* ROBOTS */}

                  <div className="space-y-4 border-t border-white/10 pt-6">

                    <label className="flex cursor-pointer items-center gap-3">

                      <input
                        type="checkbox"
                        name="noIndex"
                        defaultChecked={
                          journey.noIndex
                        }
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
                        defaultChecked={
                          journey.noFollow
                        }
                        className="h-4 w-4 accent-[#D99A3D]"
                      />

                      <span className="text-sm text-white/60">
                        Tell search engines not to follow links on this page
                      </span>

                    </label>

                  </div>

                </div>

              </section>


              {/* =================================================
                  ACTIONS
              ================================================== */}

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


            {/* =================================================
                CONTENT BUILDER
            ================================================== */}

            <div className="mx-auto max-w-5xl">

              <ContentBuilder
                journeyId={journey.id}
              />

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}