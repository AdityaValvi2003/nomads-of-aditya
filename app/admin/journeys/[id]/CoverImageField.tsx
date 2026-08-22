"use client";

import { useState } from "react";
import MediaPicker, {
  MediaAsset,
} from "./editor/MediaPicker";

type CoverImageFieldProps = {
  initialImage: string | null;
};

export default function CoverImageField({
  initialImage,
}: CoverImageFieldProps) {
  const [image, setImage] = useState(initialImage);
  const [showPicker, setShowPicker] = useState(false);

  function handleSelect(media: MediaAsset) {
    setImage(media.url);
    setShowPicker(false);
  }

  function removeImage() {
    setImage(null);
  }

  return (
    <div className="space-y-5">

      {/* This gets submitted with the main Journey form */}
      <input
        type="hidden"
        name="coverImage"
        value={image ?? ""}
      />

      {image ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">

          <div className="relative aspect-[16/9] w-full">

            <img
              src={image}
              alt="Journey cover"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-16">

              <p className="text-sm text-white/70">
                Current cover image
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-xs text-white transition hover:border-[#D99A3D] hover:text-[#D99A3D]"
                >
                  Change
                </button>

                <button
                  type="button"
                  onClick={removeImage}
                  className="rounded-lg border border-red-500/30 bg-black/60 px-4 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
                >
                  Remove
                </button>

              </div>

            </div>

          </div>

        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 transition hover:border-[#D99A3D]/60 hover:bg-white/[0.03]"
        >
          <span className="text-4xl text-white/20">
            +
          </span>

          <span className="mt-4 text-sm text-white/60">
            Select cover image
          </span>

          <span className="mt-2 text-xs text-white/25">
            Choose a photograph from your Media Library
          </span>
        </button>
      )}

      {showPicker && (
        <MediaPicker
          onClose={() => setShowPicker(false)}
          onSelect={handleSelect}
        />
      )}

    </div>
  );
}