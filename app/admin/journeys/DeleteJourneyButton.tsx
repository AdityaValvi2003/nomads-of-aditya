"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteJourneyButtonProps = {
  journeyId: string;
  journeyTitle: string;
};

export default function DeleteJourneyButton({
  journeyId,
  journeyTitle,
}: DeleteJourneyButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${journeyTitle}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/journeys/${journeyId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete journey."
        );
      }

      router.push("/admin/journeys");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete journey."
      );

      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex rounded-lg border border-red-500/30 px-4 py-2 text-xs uppercase tracking-[0.1em] text-red-400 transition hover:border-red-500/60 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="max-w-xs text-right text-xs leading-5 text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}