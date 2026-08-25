"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import MediaPicker, {
  type MediaAsset,
} from "../../../../src/components/admin/MediaPicker";

type Destination = {
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

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditDreamDestinationPage({
  params,
}: PageProps) {
  const [id, setId] = useState("");

  const [destination, setDestination] =
    useState<Destination | null>(null);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [shortNote, setShortNote] =
    useState("");
  const [whyVisit, setWhyVisit] =
    useState("");
  const [interests, setInterests] =
    useState("");

  const [coverImage, setCoverImage] =
    useState<string | null>(null);

  const [selectedMedia, setSelectedMedia] =
    useState<MediaAsset | null>(null);

  const [showMediaPicker, setShowMediaPicker] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =========================================================
     GET ID
  ========================================================= */

  useEffect(() => {
    async function getParams() {
      const resolvedParams =
        await params;

      setId(resolvedParams.id);
    }

    getParams();
  }, [params]);

  /* =========================================================
     LOAD DESTINATION
  ========================================================= */

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadDestination() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/admin/dream-destinations/${id}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load destination."
          );
        }

        setDestination(data);

        setName(data.name || "");
        setCountry(data.country || "");
        setShortNote(
          data.shortNote || ""
        );
        setWhyVisit(
          data.whyVisit || ""
        );
        setInterests(
          data.interests || ""
        );
        setCoverImage(
          data.coverImage || null
        );
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load destination."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDestination();
  }, [id]);

  /* =========================================================
     SAVE
  ========================================================= */

  async function saveDestination() {
    try {
      setError("");
      setSuccess("");

      if (!name.trim()) {
        setError(
          "Please enter a destination name."
        );
        return;
      }

      if (!country.trim()) {
        setError(
          "Please enter a country."
        );
        return;
      }

      setSaving(true);

      const response =
        await fetch(
          `/api/admin/dream-destinations/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: name.trim(),
              country: country.trim(),

              coverImage:
                selectedMedia?.url ??
                coverImage ??
                null,

              shortNote:
                shortNote.trim() ||
                null,

              whyVisit:
                whyVisit.trim() ||
                null,

              interests:
                interests.trim() ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save destination."
        );
      }

      setDestination(data);

      setCoverImage(
        data.coverImage || null
      );

      setSelectedMedia(null);

      setSuccess(
        "Destination saved successfully."
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save destination."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function deleteDestination() {
    const confirmed =
      window.confirm(
        `Delete "${name}" permanently?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
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

      window.location.href =
        "/admin/dream-destinations";
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete destination."
      );

      setDeleting(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0a] px-6 py-20 text-white md:px-10">

        <div className="mx-auto max-w-5xl">

          <span className="text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
            DREAM DESTINATIONS
          </span>

          <h1 className="mt-4 font-serif text-5xl md:text-7xl">
            Loading...
          </h1>

        </div>

      </main>
    );
  }

  /* =========================================================
     ERROR / NOT FOUND
  ========================================================= */

  if (!destination) {
    return (
      <main className="min-h-screen bg-[#0b0b0a] px-6 py-20 text-white md:px-10">

        <div className="mx-auto max-w-5xl">

          <span className="text-xs uppercase tracking-[0.3em] text-red-400">
            ERROR
          </span>

          <h1 className="mt-4 font-serif text-5xl md:text-7xl">
            Destination not found.
          </h1>

          {error && (
            <p className="mt-6 text-white/50">
              {error}
            </p>
          )}

          <Link
            href="/admin/dream-destinations"
            className="mt-8 inline-block border border-white/10 px-5 py-3 text-xs uppercase tracking-[0.15em] text-white/60 transition hover:border-[#D99A3D] hover:text-white"
          >
            ← Back to destinations
          </Link>

        </div>

      </main>
    );
  }

  /* =========================================================
     CURRENT IMAGE
  ========================================================= */

  const imageUrl =
    selectedMedia?.url ||
    coverImage;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#0b0b0a] px-6 py-12 text-white md:px-10">

      <div className="mx-auto max-w-5xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="border-b border-white/10 pb-8">

          <Link
            href="/admin/dream-destinations"
            className="text-xs uppercase tracking-[0.2em] text-white/30 transition hover:text-white"
          >
            ← Dream Destinations
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[#D99A3D]">
            Nomads of Aditya · Admin
          </p>

          <h1 className="mt-3 font-serif text-5xl md:text-7xl">
            {name || "Edit Destination"}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
            Update this place in your dream
            destination list.
          </p>

        </header>


        {/* ===================================================
            MESSAGES
        =================================================== */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-8 rounded-xl border border-[#D99A3D]/20 bg-[#D99A3D]/[0.04] px-5 py-4 text-sm text-[#D99A3D]">
            {success}
          </div>
        )}


        {/* ===================================================
            FORM
        =================================================== */}

        <section className="mt-10 space-y-8">

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              01 · Destination
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Where are you dreaming of going?
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              {/* NAME */}

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  Destination *
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Patagonia"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>


              {/* COUNTRY */}

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  Country *
                </label>

                <input
                  value={country}
                  onChange={(event) =>
                    setCountry(
                      event.target.value
                    )
                  }
                  placeholder="Argentina / Chile"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>

            </div>


            {/* SHORT NOTE */}

            <div className="mt-6">

              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                Short Note
              </label>

              <textarea
                value={shortNote}
                onChange={(event) =>
                  setShortNote(
                    event.target.value
                  )
                }
                rows={3}
                placeholder="A short thought about why this place is on your list..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
              />

            </div>

          </div>


          {/* =================================================
              PHOTOGRAPH
          ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              02 · Photograph
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              The image for this destination.
            </h2>

            <div className="mt-8">

              {imageUrl ? (

                <div className="overflow-hidden rounded-2xl border border-white/10">

                  <img
                    src={imageUrl}
                    alt={
                      name ||
                      "Destination photograph"
                    }
                    className="h-80 w-full object-cover"
                  />

                  <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-sm">
                        {selectedMedia?.fileName ||
                          "Current photograph"}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {selectedMedia
                          ? "New photograph selected"
                          : "Current destination photograph"}
                      </p>

                    </div>

                    <div className="flex gap-4">

                      <button
                        type="button"
                        onClick={() =>
                          setShowMediaPicker(
                            true
                          )
                        }
                        className="text-xs uppercase tracking-[0.15em] text-[#D99A3D] transition hover:text-[#f0b35a]"
                      >
                        Change
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(
                            null
                          );
                          setSelectedMedia(
                            null
                          );
                        }}
                        className="text-xs uppercase tracking-[0.15em] text-red-400 transition hover:text-red-300"
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                </div>

              ) : (

                <button
                  type="button"
                  onClick={() =>
                    setShowMediaPicker(
                      true
                    )
                  }
                  className="flex min-h-52 w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-sm text-white/30 transition hover:border-[#D99A3D]/50 hover:text-white/60"
                >
                  + Select Photograph
                </button>

              )}

            </div>

          </div>


          {/* =================================================
              DREAM
          ================================================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              03 · The Dream
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Why is this place calling?
            </h2>

            <div className="mt-8 space-y-6">

              {/* WHY VISIT */}

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  Why Visit
                </label>

                <textarea
                  value={whyVisit}
                  onChange={(event) =>
                    setWhyVisit(
                      event.target.value
                    )
                  }
                  rows={7}
                  placeholder="What makes you want to experience this place?"
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-base leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>


              {/* INTERESTS */}

              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/30">
                  What Interests You
                </label>

                <textarea
                  value={interests}
                  onChange={(event) =>
                    setInterests(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Mountains, hiking, culture, food, photography..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-base leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#D99A3D]/60"
                />

              </div>

            </div>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={
                deleteDestination
              }
              disabled={deleting || saving}
              className="text-left text-xs uppercase tracking-[0.15em] text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting
                ? "Deleting..."
                : "Delete Destination"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">

              <Link
                href="/admin/dream-destinations"
                className="rounded-xl border border-white/10 px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-white/50 transition hover:border-white/20 hover:text-white"
              >
                Cancel
              </Link>

              <button
                type="button"
                onClick={
                  saveDestination
                }
                disabled={
                  saving || deleting
                }
                className="rounded-xl bg-[#D99A3D] px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-black transition hover:bg-[#e5aa50] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </section>

      </div>


      {/* =====================================================
          MEDIA PICKER
      ===================================================== */}

      {showMediaPicker && (
        <MediaPicker
          onSelect={(media) => {
            setSelectedMedia(
              media
            );

            setShowMediaPicker(
              false
            );
          }}
          onClose={() =>
            setShowMediaPicker(
              false
            )
          }
        />
      )}

    </main>
  );
}