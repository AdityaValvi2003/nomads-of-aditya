"use client";

import { useEffect, useState } from "react";

export type MediaAsset = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
  altText: string | null;
  caption: string | null;
  location: string | null;
};

type MediaPickerProps = {
  onClose: () => void;
  onSelect: (media: MediaAsset) => void;
};

export default function MediaPicker({
  onClose,
  onSelect,
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadMedia() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/media");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load media."
          );
        }

        setMedia(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load media."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMedia();
  }, []);

  const filteredMedia = media.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      item.fileName.toLowerCase().includes(query) ||
      item.altText?.toLowerCase().includes(query) ||
      item.caption?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D99A3D]">
              Media Library
            </p>

            <h3 className="mt-1 text-xl font-medium text-white">
              Select an image
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* SEARCH */}

        <div className="border-b border-white/10 p-5">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search photographs..."
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
          />
        </div>

        {/* CONTENT */}

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="py-16 text-center">
              <p className="text-sm text-white/40">
                Loading media...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            filteredMedia.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-white/40">
                  No photographs found.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredMedia.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMedia.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left transition hover:border-[#D99A3D]/60 hover:bg-white/[0.04]"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-black">
                      <img
                        src={item.url}
                        alt={
                          item.altText ||
                          item.fileName
                        }
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-4">
                      <p className="truncate text-sm font-medium text-white/80">
                        {item.fileName}
                      </p>

                      {item.location && (
                        <p className="mt-1 truncate text-xs text-white/30">
                          {item.location}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-[#D99A3D] opacity-0 transition group-hover:opacity-100">
                        Select image →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-between border-t border-white/10 p-5">
          <p className="text-xs text-white/30">
            {filteredMedia.length} photograph
            {filteredMedia.length === 1 ? "" : "s"}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}