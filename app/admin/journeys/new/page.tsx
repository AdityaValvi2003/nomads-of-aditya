import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../../../src/lib/prisma";
import { getSession } from "../../../../src/lib/auth";

async function createJourney(formData: FormData) {
  "use server";

  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const shortIntro = String(formData.get("shortIntro") || "").trim();
  const statusValue = String(
  formData.get("status") || "DRAFT"
).trim();

if (
  statusValue !== "DRAFT" &&
  statusValue !== "PUBLISHED" &&
  statusValue !== "ARCHIVED"
) {
  throw new Error("Invalid journey status.");
}

const status =
  statusValue as "DRAFT" | "PUBLISHED" | "ARCHIVED";

  if (!title || !slug || !location || !country) {
    throw new Error("Required fields are missing.");
  }

  const existingJourney = await prisma.journey.findUnique({
    where: {
      slug,
    },
  });

  if (existingJourney) {
    throw new Error("A journey with this slug already exists.");
  }

  await prisma.journey.create({
    data: {
      title,
      slug,
      location,
      country,
      shortIntro: shortIntro || null,
      status,
authorId: session.userId,
publishedAt:
  status === "PUBLISHED"
    ? new Date()
    : null,
    },
  });

  redirect("/admin/journeys");
}

export default function NewJourneyPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">

        <div className="mb-10">
          <Link
            href="/admin/journeys"
            className="text-sm text-white/40 hover:text-white"
          >
            ← Back to Journeys
          </Link>

          <p className="mt-8 text-sm text-white/40">
            Content management
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            New Journey
          </h1>

          <p className="mt-2 text-white/40">
            Add a new place you've visited.
          </p>
        </div>

        <form
          action={createJourney}
          className="space-y-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
        >

          {/* Basic information */}
          <section>
            <h2 className="text-lg font-medium">
              Basic information
            </h2>

            <div className="mt-5 grid gap-5">

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
                  placeholder="My journey to Ladakh"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </div>

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
                  placeholder="ladakh-journey"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                />

                <p className="mt-2 text-xs text-white/30">
                  Used in the URL. Example: /journeys/ladakh-journey
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

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
                    placeholder="Leh"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
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
                    placeholder="India"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                  />
                </div>

              </div>

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
                  placeholder="A short introduction to this journey..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-white/20 focus:border-white/30"
                />
              </div>

            </div>
          </section>

          {/* Publishing */}
          <section className="border-t border-white/10 pt-8">
            <h2 className="text-lg font-medium">
              Publishing
            </h2>

            <div className="mt-5">

              <label
                htmlFor="status"
                className="mb-2 block text-sm text-white/60"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue="DRAFT"
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
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-8">

            <Link
              href="/admin/journeys"
              className="rounded-xl px-5 py-3 text-sm text-white/50 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/90"
            >
              Create Journey
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}