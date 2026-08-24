"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type JourneyInfo = {
  id: string;
  title: string;
};

type MediaUsage = {
  type:
    | "JOURNEY"
    | "JOURNEY_COVER"
    | "BLOG_COVER"
    | "CONTENT_BLOCK"
    | "ENCOUNTER";

  id: string;

  title?: string;

  blockType?: string;

  journeyId?: string;

  journeyTitle?: string;
};

type MediaItem = {
  id: string;

  url: string;

  thumbnailUrl: string | null;

  fileName: string;

  mimeType: string;

  width: number | null;

  height: number | null;

  fileSize: number | null;

  caption: string | null;

  altText: string | null;

  location: string | null;

  capturedDate: string | null;

  photographer: string;

  journeyId: string | null;

  journey: JourneyInfo | null;

  createdAt: string;

  updatedAt: string;

  usage: MediaUsage[];

  usageCount: number;

  isUsed: boolean;
};

type UsageFilter =
  | "All"
  | "Used"
  | "Unused"
  | "Journey"
  | "Blog"
  | "Content"
  | "Encounter";

type UploadForm = {
  file: File | null;

  altText: string;

  caption: string;

  location: string;

  photographer: string;

  capturedDate: string;

  journeyId: string;
};

type EditForm = {
  altText: string;

  caption: string;

  location: string;

  photographer: string;

  capturedDate: string;

  journeyId: string;
};

export default function MediaPage() {
  const [media, setMedia] =
    useState<MediaItem[]>([]);

  const [journeys, setJourneys] =
    useState<JourneyInfo[]>([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState<UsageFilter>("All");

  const [selected, setSelected] =
    useState<MediaItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loadingJourneys, setLoadingJourneys] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [error, setError] =
    useState("");

  const [uploadError, setUploadError] =
    useState("");

  const [editError, setEditError] =
    useState("");

  const [showUpload, setShowUpload] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [uploadForm, setUploadForm] =
    useState<UploadForm>({
      file: null,
      altText: "",
      caption: "",
      location: "",
      photographer: "",
      capturedDate: "",
      journeyId: "",
    });

  const [editForm, setEditForm] =
    useState<EditForm>({
      altText: "",
      caption: "",
      location: "",
      photographer: "",
      capturedDate: "",
      journeyId: "",
    });

  /*
   * ==========================================================
   * LOAD
   * ==========================================================
   */

  useEffect(() => {
    loadMedia();
    loadJourneys();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        "/api/admin/media",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load media."
        );
      }

      setMedia(
        Array.isArray(data)
          ? data
          : []
      );
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

  async function loadJourneys() {
    try {
      setLoadingJourneys(true);

      const response =
        await fetch(
          "/api/admin/journeys",
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setJourneys(
          data.map((journey) => ({
            id: journey.id,
            title: journey.title,
          }))
        );
      }
    } catch {
      // Journey selection is optional.
    } finally {
      setLoadingJourneys(false);
    }
  }

  /*
   * ==========================================================
   * FILTERING
   * ==========================================================
   */

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      const matchesSearch =
        searchValue === "" ||
        item.fileName
          .toLowerCase()
          .includes(searchValue) ||
        (item.location || "")
          .toLowerCase()
          .includes(searchValue) ||
        (item.caption || "")
          .toLowerCase()
          .includes(searchValue) ||
        (item.altText || "")
          .toLowerCase()
          .includes(searchValue) ||
        (item.photographer || "")
          .toLowerCase()
          .includes(searchValue) ||
        (item.journey?.title || "")
          .toLowerCase()
          .includes(searchValue) ||
        item.usage.some(
          (usage) =>
            (usage.title || "")
              .toLowerCase()
              .includes(searchValue) ||
            (usage.journeyTitle || "")
              .toLowerCase()
              .includes(searchValue) ||
            (usage.blockType || "")
              .toLowerCase()
              .includes(searchValue)
        );

      let matchesCategory = true;

      if (category === "Used") {
        matchesCategory =
          item.isUsed;
      }

      if (category === "Unused") {
        matchesCategory =
          !item.isUsed;
      }

      if (category === "Journey") {
        matchesCategory =
          item.usage.some(
            (usage) =>
              usage.type ===
                "JOURNEY" ||
              usage.type ===
                "JOURNEY_COVER"
          );
      }

      if (category === "Blog") {
        matchesCategory =
          item.usage.some(
            (usage) =>
              usage.type ===
              "BLOG_COVER"
          );
      }

      if (category === "Content") {
        matchesCategory =
          item.usage.some(
            (usage) =>
              usage.type ===
              "CONTENT_BLOCK"
          );
      }

      if (category === "Encounter") {
        matchesCategory =
          item.usage.some(
            (usage) =>
              usage.type ===
              "ENCOUNTER"
          );
      }

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    media,
    search,
    category,
  ]);

  /*
   * ==========================================================
   * STATISTICS
   * ==========================================================
   */

  const totalMedia =
    media.length;

  const usedMedia =
    media.filter(
      (item) => item.isUsed
    ).length;

  const unusedMedia =
    media.filter(
      (item) => !item.isUsed
    ).length;

  /*
   * ==========================================================
   * FORMATTERS
   * ==========================================================
   */

  function formatFileSize(
    bytes: number | null
  ) {
    if (
      bytes === null ||
      bytes === undefined
    ) {
      return "Unknown size";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  function formatDimensions(
    width: number | null,
    height: number | null
  ) {
    if (!width || !height) {
      return "Dimensions unavailable";
    }

    return `${width} × ${height}`;
  }

  function formatMimeType(
    mimeType: string
  ) {
    if (!mimeType) {
      return "Unknown";
    }

    const parts =
      mimeType.split("/");

    if (parts.length === 2) {
      return parts[1].toUpperCase();
    }

    return mimeType.toUpperCase();
  }

  function formatDate(
    date: string | null
  ) {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /*
   * ==========================================================
   * USAGE HELPERS
   * ==========================================================
   */

  function getUsageLabel(
    usage: MediaUsage
  ) {
    switch (usage.type) {
      case "JOURNEY":
        return "Journey";

      case "JOURNEY_COVER":
        return "Journey Cover";

      case "BLOG_COVER":
        return "Blog Cover";

      case "CONTENT_BLOCK":
        return "Story Content";

      case "ENCOUNTER":
        return "Encounter";

      default:
        return "Usage";
    }
  }

  function getUsageDescription(
    usage: MediaUsage
  ) {
    switch (usage.type) {
      case "JOURNEY":
        return (
          usage.title ||
          "Journey"
        );

      case "JOURNEY_COVER":
        return (
          usage.title ||
          "Journey cover"
        );

      case "BLOG_COVER":
        return (
          usage.title ||
          "Blog cover"
        );

      case "CONTENT_BLOCK":
        if (
          usage.title
        ) {
          return usage.title;
        }

        if (
          usage.blockType
        ) {
          return usage.blockType;
        }

        return "Story content";

      case "ENCOUNTER":
        return (
          usage.title ||
          "Encounter"
        );

      default:
        return "Unknown";
    }
  }

  /*
   * ==========================================================
   * UPLOAD
   * ==========================================================
   */

  function openUploadModal() {
    setUploadError("");

    setUploadForm({
      file: null,
      altText: "",
      caption: "",
      location: "",
      photographer: "",
      capturedDate: "",
      journeyId: "",
    });

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }

    setShowUpload(true);
  }

  function closeUploadModal() {
    if (uploading) {
      return;
    }

    setShowUpload(false);

    setUploadError("");
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ||
      null;

    setUploadError("");

    if (!file) {
      setUploadForm(
        (current) => ({
          ...current,
          file: null,
        })
      );

      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setUploadError(
        "Only image files are allowed."
      );

      event.target.value = "";

      setUploadForm(
        (current) => ({
          ...current,
          file: null,
        })
      );

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setUploadError(
        "Image must be smaller than 10 MB."
      );

      event.target.value = "";

      setUploadForm(
        (current) => ({
          ...current,
          file: null,
        })
      );

      return;
    }

    setUploadForm(
      (current) => ({
        ...current,
        file,
      })
    );
  }

  async function uploadMedia(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setUploadError("");

    if (!uploadForm.file) {
      setUploadError(
        "Please select an image."
      );

      return;
    }

    if (
      !uploadForm.altText.trim()
    ) {
      setUploadError(
        "Please enter alt text."
      );

      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        uploadForm.file
      );

      formData.append(
        "altText",
        uploadForm.altText.trim()
      );

      formData.append(
        "caption",
        uploadForm.caption.trim()
      );

      formData.append(
        "location",
        uploadForm.location.trim()
      );

      formData.append(
        "photographer",
        uploadForm.photographer.trim()
      );

      formData.append(
        "capturedDate",
        uploadForm.capturedDate
      );

      formData.append(
        "journeyId",
        uploadForm.journeyId
      );

      const response =
        await fetch(
          "/api/admin/media",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to upload media."
        );
      }

      setMedia(
        (current) => [
          data,
          ...current,
        ]
      );

      setShowUpload(false);

      setUploadForm({
        file: null,
        altText: "",
        caption: "",
        location: "",
        photographer: "",
        capturedDate: "",
        journeyId: "",
      });

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload media."
      );
    } finally {
      setUploading(false);
    }
  }

  /*
   * ==========================================================
   * EDIT MEDIA
   * ==========================================================
   */

  function openEditModal(
    item: MediaItem
  ) {
    setEditError("");

    setEditForm({
      altText:
        item.altText || "",

      caption:
        item.caption || "",

      location:
        item.location || "",

      photographer:
        item.photographer || "",

      capturedDate:
        item.capturedDate
          ? item.capturedDate
              .split("T")[0]
          : "",

      journeyId:
        item.journeyId || "",
    });

    setEditing(true);
  }

  function closeEditModal() {
    if (savingEdit) {
      return;
    }

    setEditing(false);

    setEditError("");
  }

  async function saveMediaEdit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setEditError("");

    if (!selected) {
      return;
    }

    if (
      !editForm.altText.trim()
    ) {
      setEditError(
        "Alt text is required."
      );

      return;
    }

    try {
      setSavingEdit(true);

      const response =
        await fetch(
          "/api/admin/media",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: selected.id,

              altText:
                editForm.altText.trim(),

              caption:
                editForm.caption.trim(),

              location:
                editForm.location.trim(),

              photographer:
                editForm.photographer.trim(),

              capturedDate:
                editForm.capturedDate,

              journeyId:
                editForm.journeyId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update media."
        );
      }

      setMedia(
        (current) =>
          current.map(
            (item) =>
              item.id === data.id
                ? data
                : item
          )
      );

      setSelected(data);

      setEditing(false);
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update media."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  /*
   * ==========================================================
   * DELETE
   * ==========================================================
   */

  async function deleteMedia(
    item: MediaItem
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${item.fileName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);

      setError("");

      const response =
        await fetch(
          "/api/admin/media",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: item.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete media."
        );
      }

      setMedia(
        (current) =>
          current.filter(
            (mediaItem) =>
              mediaItem.id !==
              item.id
          )
      );

      if (
        selected?.id ===
        item.id
      ) {
        setSelected(null);
      }

      if (editing) {
        setEditing(false);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete media."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * ==========================================================
   * COPY URL
   * ==========================================================
   */

  async function copyUrl(
    url: string
  ) {
    try {
      await navigator.clipboard.writeText(
        url
      );

      window.alert(
        "Media URL copied."
      );
    } catch {
      window.alert(
        "Could not copy the URL."
      );
    }
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <>
      <style>{`
        .media-page {
          min-height: 100vh;
          padding: 150px 6vw 100px;
        }

        .media-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 40px;
          padding-bottom: 45px;
          border-bottom: 1px solid var(--line);
        }

        .media-header h1 {
          font: clamp(3rem, 7vw, 6.5rem) / .95 var(--serif);
          margin: 12px 0 18px;
        }

        .media-header p {
          color: var(--muted);
          max-width: 650px;
          margin: 0;
          line-height: 1.7;
        }

        .media-upload-button {
          padding: 14px 22px;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #15110b;
          font-size: .72rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
        }

        .media-upload-button:hover {
          background: var(--accent2);
        }

        .media-error {
          margin-top: 25px;
          padding: 15px 18px;
          border: 1px solid rgba(184, 92, 75, .4);
          background: rgba(184, 92, 75, .08);
          color: #d98c7c;
          font-size: .85rem;
        }

        .media-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 35px;
        }

        .media-stat {
          padding: 18px 20px;
          border: 1px solid var(--line);
          background: var(--panel);
        }

        .media-stat-label {
          color: var(--muted);
          font-size: .65rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .media-stat-value {
          font: 1.8rem var(--serif);
        }

        .media-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin: 45px 0 20px;
          flex-wrap: wrap;
        }

        .media-search {
          flex: 1;
          min-width: 260px;
        }

        .media-search input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--text);
          outline: none;
          font: inherit;
        }

        .media-search input:focus {
          border-color: var(--accent);
        }

        .media-filters {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .media-filter {
          padding: 10px 13px;
          border: 1px solid var(--line);
          color: var(--muted);
          background: transparent;
          cursor: pointer;
          font-size: .65rem;
          letter-spacing: .06em;
          text-transform: uppercase;
        }

        .media-filter:hover {
          color: var(--text);
          border-color: var(--accent);
        }

        .media-filter.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        .media-count {
          color: var(--muted);
          font-size: .78rem;
          margin-bottom: 20px;
        }

        .media-loading {
          padding: 100px 30px;
          text-align: center;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--muted);
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .media-card {
          border: 1px solid var(--line);
          background: var(--panel);
          overflow: hidden;
          transition:
            transform .25s ease,
            border-color .25s ease;
        }

        .media-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent);
        }

        .media-image {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #171714;
          cursor: pointer;
        }

        .media-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }

        .media-card:hover .media-image img {
          transform: scale(1.035);
        }

        .media-usage-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 9px;
          background: rgba(0,0,0,.78);
          border: 1px solid rgba(255,255,255,.12);
          color: white;
          font-size: .58rem;
          letter-spacing: .07em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }

        .media-usage-badge.used {
          color: var(--accent);
          border-color: rgba(217,154,61,.4);
        }

        .media-usage-badge.unused {
          color: rgba(255,255,255,.45);
        }

        .media-card-content {
          padding: 18px;
        }

        .media-card-name {
          font-weight: 700;
          font-size: .9rem;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .media-card-meta {
          color: var(--muted);
          font-size: .75rem;
          line-height: 1.7;
        }

        .media-journey {
          color: var(--accent);
        }

        .media-usage-summary {
          margin-top: 14px;
          padding-top: 13px;
          border-top: 1px solid var(--line);
        }

        .media-usage-title {
          color: var(--muted);
          font-size: .62rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .media-usage-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .media-usage-item {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
          color: var(--text);
          font-size: .68rem;
        }

        .media-usage-type {
          color: var(--accent);
          white-space: nowrap;
        }

        .media-usage-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--muted);
        }

        .media-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 15px;
        }

        .media-action {
          flex: 1;
          padding: 9px 8px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-size: .65rem;
          letter-spacing: .06em;
          text-transform: uppercase;
        }

        .media-action:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .media-action.delete:hover {
          border-color: #a94a3d;
          color: #a94a3d;
        }

        .media-action:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .media-empty {
          grid-column: 1 / -1;
          padding: 100px 30px;
          text-align: center;
          border: 1px solid var(--line);
          background: var(--panel);
        }

        .media-empty h2 {
          font: 2.5rem var(--serif);
          margin: 0 0 10px;
        }

        .media-empty p {
          color: var(--muted);
          margin: 0;
        }

        .media-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,.78);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
        }

        .media-modal {
          position: relative;
          width: min(900px, 100%);
          max-height: 90vh;
          overflow: auto;
          background: var(--panel);
          border: 1px solid var(--line);
        }

        .media-modal-image {
          width: 100%;
          max-height: 60vh;
          object-fit: contain;
          display: block;
          background: #0d0d0c;
        }

        .media-modal-content {
          padding: 28px;
        }

        .media-modal-content h2 {
          font: 2rem var(--serif);
          margin: 0 0 8px;
          word-break: break-word;
        }

        .media-modal-path {
          color: var(--muted);
          font-size: .8rem;
          word-break: break-all;
          margin-bottom: 20px;
        }

        .media-modal-info {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
          margin-top: 25px;
        }

        .media-modal-info-item {
          padding: 15px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,.02);
        }

        .media-modal-info-label {
          color: var(--muted);
          font-size: .65rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .media-modal-info-value {
          color: var(--text);
          font-size: .85rem;
          word-break: break-word;
        }

        .media-modal-usage {
          margin-top: 25px;
        }

        .media-modal-usage-title {
          color: var(--accent);
          font-size: .68rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .media-modal-usage-list {
          display: grid;
          gap: 8px;
        }

        .media-modal-usage-item {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 13px 15px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,.02);
        }

        .media-modal-usage-type {
          color: var(--accent);
          font-size: .68rem;
          text-transform: uppercase;
          letter-spacing: .06em;
          white-space: nowrap;
        }

        .media-modal-usage-name {
          color: var(--text);
          font-size: .8rem;
          text-align: right;
        }

        .media-modal-description {
          margin-top: 20px;
          padding: 18px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,.02);
        }

        .media-modal-description-label {
          color: var(--muted);
          font-size: .65rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .media-modal-description p {
          margin: 0;
          color: var(--text);
          font-size: .85rem;
          line-height: 1.7;
        }

        .media-modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 25px;
          flex-wrap: wrap;
        }

        .media-modal-button {
          padding: 11px 16px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--text);
          cursor: pointer;
          font-size: .7rem;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        .media-modal-button:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .media-modal-button.primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        .media-modal-button.primary:hover {
          background: var(--accent2);
        }

        .media-modal-button.danger {
          color: #d98c7c;
        }

        .media-modal-button.danger:hover {
          border-color: #a94a3d;
          color: #d98c7c;
        }

        .media-modal-button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .media-close {
          position: absolute;
          top: 15px;
          right: 18px;
          z-index: 5;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(0,0,0,.65);
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .media-close:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .upload-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,.82);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 25px;
        }

        .upload-modal {
          width: min(720px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          background: var(--panel);
          border: 1px solid var(--line);
          padding: 32px;
        }

        .upload-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 20px;
          margin-bottom: 30px;
        }

        .upload-header h2 {
          font: 2.2rem var(--serif);
          margin: 0 0 8px;
        }

        .upload-header p {
          color: var(--muted);
          margin: 0;
          font-size: .85rem;
        }

        .upload-close {
          width: 38px;
          height: 38px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--text);
          font-size: 1.3rem;
          cursor: pointer;
        }

        .upload-close:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .upload-close:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .upload-field {
          margin-bottom: 20px;
        }

        .upload-field label {
          display: block;
          margin-bottom: 8px;
          color: var(--muted);
          font-size: .7rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .upload-field input,
        .upload-field textarea,
        .upload-field select {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid var(--line);
          background: rgba(0,0,0,.2);
          color: var(--text);
          outline: none;
          font: inherit;
        }

        .upload-field textarea {
          min-height: 100px;
          resize: vertical;
        }

        .upload-field input:focus,
        .upload-field textarea:focus,
        .upload-field select:focus {
          border-color: var(--accent);
        }

        .upload-field select option {
          background: #171714;
          color: white;
        }

        .upload-file {
          padding: 25px;
          border: 1px dashed var(--line);
          background: rgba(255,255,255,.02);
          cursor: pointer;
        }

        .upload-file:hover {
          border-color: var(--accent);
        }

        .upload-file input {
          border: 0;
          padding: 0;
          background: transparent;
        }

        .upload-file-name {
          margin-top: 10px;
          color: var(--accent);
          font-size: .8rem;
          word-break: break-word;
        }

        .upload-error {
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid rgba(184, 92, 75, .4);
          background: rgba(184, 92, 75, .08);
          color: #d98c7c;
          font-size: .82rem;
        }

        .upload-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 30px;
        }

        .upload-button {
          padding: 13px 20px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--text);
          cursor: pointer;
          font-size: .7rem;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        .upload-button:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .upload-button.primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #15110b;
        }

        .upload-button.primary:hover {
          background: var(--accent2);
        }

        .upload-button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .edit-preview {
          margin-bottom: 25px;
          border: 1px solid var(--line);
          background: #0d0d0c;
        }

        .edit-preview img {
          width: 100%;
          max-height: 260px;
          object-fit: contain;
          display: block;
        }

        @media (max-width: 1100px) {
          .media-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .media-page {
            padding: 110px 7vw 70px;
          }

          .media-header {
            display: block;
          }

          .media-upload-button {
            margin-top: 25px;
          }

          .media-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .media-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .media-grid {
            grid-template-columns: 1fr;
          }

          .media-search {
            min-width: 100%;
          }

          .media-modal-info {
            grid-template-columns: 1fr;
          }

          .media-modal-usage-item {
            display: block;
          }

          .media-modal-usage-name {
            text-align: left;
            margin-top: 5px;
          }

          .upload-modal {
            padding: 22px;
          }
        }
      `}</style>

      <main className="media-page">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="media-header">

          <div>

            <span className="eyebrow">
              NOMADS OF ADITYA · MEDIA
            </span>

            <h1>
              Media Library
            </h1>

            <p>
              Every photograph used across
              your journeys, stories and
              destinations will live here.
            </p>

          </div>

          <button
            type="button"
            className="media-upload-button"
            onClick={
              openUploadModal
            }
          >
            + Upload Media
          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div className="media-error">
            {error}
          </div>
        )}

        {/* ====================================================
            STATS
        ==================================================== */}

        {!loading && (
          <div className="media-stats">

            <div className="media-stat">

              <div className="media-stat-label">
                Total Photographs
              </div>

              <div className="media-stat-value">
                {totalMedia}
              </div>

            </div>

            <div className="media-stat">

              <div className="media-stat-label">
                Currently Used
              </div>

              <div className="media-stat-value">
                {usedMedia}
              </div>

            </div>

            <div className="media-stat">

              <div className="media-stat-label">
                Unused
              </div>

              <div className="media-stat-value">
                {unusedMedia}
              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <div className="media-toolbar">

          <div className="media-search">

            <input
              type="text"
              placeholder="Search photographs, journeys, blogs..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="media-filters">

            {[
              "All",
              "Used",
              "Unused",
              "Journey",
              "Blog",
              "Content",
              "Encounter",
            ].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className={`media-filter ${
                    category === item
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCategory(
                      item as UsageFilter
                    )
                  }
                >
                  {item}
                </button>
              )
            )}

          </div>

        </div>

        {/* COUNT */}

        {!loading && (
          <div className="media-count">
            Showing{" "}
            {filteredMedia.length}{" "}
            {filteredMedia.length ===
            1
              ? "photograph"
              : "photographs"}
          </div>
        )}

        {/* ====================================================
            CONTENT
        ==================================================== */}

        {loading ? (

          <div className="media-loading">
            Loading media library...
          </div>

        ) : (

          <div className="media-grid">

            {filteredMedia.length ===
            0 ? (

              <div className="media-empty">

                <h2>
                  Nothing here yet.
                </h2>

                <p>
                  No media matches your
                  current search or filter.
                </p>

              </div>

            ) : (

              filteredMedia.map(
                (item) => (

                  <article
                    className="media-card"
                    key={item.id}
                  >

                    {/* IMAGE */}

                    <div
                      className="media-image"
                      onClick={() =>
                        setSelected(
                          item
                        )
                      }
                    >

                      <img
                        src={
                          item.thumbnailUrl ||
                          item.url
                        }
                        alt={
                          item.altText ||
                          item.fileName
                        }
                      />

                      <div
                        className={`media-usage-badge ${
                          item.isUsed
                            ? "used"
                            : "unused"
                        }`}
                      >
                        {item.isUsed
                          ? `${item.usageCount} ${
                              item.usageCount ===
                              1
                                ? "Use"
                                : "Uses"
                            }`
                          : "Unused"}
                      </div>

                    </div>

                    {/* CARD */}

                    <div className="media-card-content">

                      <div className="media-card-name">
                        {item.fileName}
                      </div>

                      <div className="media-card-meta">

                        {formatMimeType(
                          item.mimeType
                        )}

                        {" · "}

                        {formatDimensions(
                          item.width,
                          item.height
                        )}

                        <br />

                        {formatFileSize(
                          item.fileSize
                        )}

                        <br />

                        {item.journey ? (

                          <span className="media-journey">
                            Journey:{" "}
                            {
                              item.journey
                                .title
                            }
                          </span>

                        ) : (

                          <span>
                            No journey assigned
                          </span>

                        )}

                      </div>

                      {/* USAGE */}

                      {item.usage.length >
                        0 && (

                        <div className="media-usage-summary">

                          <div className="media-usage-title">
                            Used in
                          </div>

                          <div className="media-usage-list">

                            {item.usage
                              .slice(
                                0,
                                3
                              )
                              .map(
                                (
                                  usage
                                ) => (

                                  <div
                                    className="media-usage-item"
                                    key={`${usage.type}-${usage.id}`}
                                  >

                                    <span className="media-usage-type">
                                      {
                                        getUsageLabel(
                                          usage
                                        )
                                      }
                                    </span>

                                    <span className="media-usage-name">
                                      {
                                        getUsageDescription(
                                          usage
                                        )
                                      }
                                    </span>

                                  </div>

                                )
                              )}

                          </div>

                          {item.usage.length >
                            3 && (

                            <div
                              style={{
                                marginTop:
                                  "7px",
                                color:
                                  "var(--muted)",
                                fontSize:
                                  ".62rem",
                              }}
                            >
                              +
                              {item.usage.length -
                                3}{" "}
                              more
                            </div>

                          )}

                        </div>

                      )}

                      {/* ACTIONS */}

                      <div className="media-card-actions">

                        <button
                          type="button"
                          className="media-action"
                          onClick={() =>
                            setSelected(
                              item
                            )
                          }
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="media-action delete"
                          disabled={
                            deletingId ===
                            item.id
                          }
                          onClick={() =>
                            deleteMedia(
                              item
                            )
                          }
                        >
                          {deletingId ===
                          item.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )

            )}

          </div>

        )}

        {/* ====================================================
            VIEW MODAL
        ==================================================== */}

        {selected && !editing && (

          <div
            className="media-modal-backdrop"
            onClick={() =>
              setSelected(null)
            }
          >

            <div
              className="media-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="media-close"
                onClick={() =>
                  setSelected(null)
                }
                aria-label="Close"
              >
                ×
              </button>

              <img
                className="media-modal-image"
                src={selected.url}
                alt={
                  selected.altText ||
                  selected.fileName
                }
              />

              <div className="media-modal-content">

                <h2>
                  {selected.fileName}
                </h2>

                <div className="media-modal-path">
                  {selected.url}
                </div>

                {/* INFO */}

                <div className="media-modal-info">

                  <div className="media-modal-info-item">

                    <div className="media-modal-info-label">
                      File type
                    </div>

                    <div className="media-modal-info-value">
                      {formatMimeType(
                        selected.mimeType
                      )}
                    </div>

                  </div>

                  <div className="media-modal-info-item">

                    <div className="media-modal-info-label">
                      File size
                    </div>

                    <div className="media-modal-info-value">
                      {formatFileSize(
                        selected.fileSize
                      )}
                    </div>

                  </div>

                  <div className="media-modal-info-item">

                    <div className="media-modal-info-label">
                      Dimensions
                    </div>

                    <div className="media-modal-info-value">
                      {formatDimensions(
                        selected.width,
                        selected.height
                      )}
                    </div>

                  </div>

                  <div className="media-modal-info-item">

                    <div className="media-modal-info-label">
                      Uploaded
                    </div>

                    <div className="media-modal-info-value">
                      {formatDate(
                        selected.createdAt
                      )}
                    </div>

                  </div>

                  <div className="media-modal-info-item">

                    <div className="media-modal-info-label">
                      Photographer
                    </div>

                    <div className="media-modal-info-value">
                      {selected.photographer ||
                        "—"}
                    </div>

                  </div>

                  <div className="media-modal-info-item">

                    <div className="media-modal-info-label">
                      Location
                    </div>

                    <div className="media-modal-info-value">
                      {selected.location ||
                        "—"}
                    </div>

                  </div>

                  <div className="media-modal-info-item">

                    <div className="media-modal-info-label">
                      Captured
                    </div>

                    <div className="media-modal-info-value">
                      {formatDate(
                        selected.capturedDate
                      )}
                    </div>

                  </div>

                  <div className="media-modal-info-item">

                    <div className="media-modal-info-label">
                      Usage
                    </div>

                    <div className="media-modal-info-value">
                      {selected.isUsed
                        ? `${selected.usageCount} ${
                            selected.usageCount ===
                            1
                              ? "place"
                              : "places"
                          }`
                        : "Unused"}
                    </div>

                  </div>

                </div>

                {/* USAGE */}

                {selected.usage.length >
                0 ? (

                  <div className="media-modal-usage">

                    <div className="media-modal-usage-title">
                      Where this photograph
                      is being used
                    </div>

                    <div className="media-modal-usage-list">

                      {selected.usage.map(
                        (usage) => (

                          <div
                            className="media-modal-usage-item"
                            key={`${usage.type}-${usage.id}`}
                          >

                            <span className="media-modal-usage-type">
                              {getUsageLabel(
                                usage
                              )}
                            </span>

                            <span className="media-modal-usage-name">
                              {getUsageDescription(
                                usage
                              )}

                              {usage.blockType &&
                                usage.type ===
                                  "CONTENT_BLOCK" && (
                                  <>
                                    {" · "}
                                    {
                                      usage.blockType
                                    }
                                  </>
                                )}

                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                ) : (

                  <div className="media-modal-description">

                    <div className="media-modal-description-label">
                      Usage
                    </div>

                    <p>
                      This photograph is
                      currently not used
                      anywhere on the
                      website.
                    </p>

                  </div>

                )}

                {/* ALT */}

                {selected.altText && (
                  <div className="media-modal-description">

                    <div className="media-modal-description-label">
                      Alt text
                    </div>

                    <p>
                      {selected.altText}
                    </p>

                  </div>
                )}

                {/* CAPTION */}

                {selected.caption && (
                  <div className="media-modal-description">

                    <div className="media-modal-description-label">
                      Caption
                    </div>

                    <p>
                      {selected.caption}
                    </p>

                  </div>
                )}

                {/* ACTIONS */}

                <div className="media-modal-actions">

                  <button
                    type="button"
                    className="media-modal-button primary"
                    onClick={() =>
                      openEditModal(
                        selected
                      )
                    }
                  >
                    Edit Media
                  </button>

                  <button
                    type="button"
                    className="media-modal-button"
                    onClick={() =>
                      copyUrl(
                        selected.url
                      )
                    }
                  >
                    Copy URL
                  </button>

                  <button
                    type="button"
                    className="media-modal-button"
                    onClick={() =>
                      setSelected(
                        null
                      )
                    }
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="media-modal-button danger"
                    disabled={
                      deletingId ===
                      selected.id
                    }
                    onClick={() =>
                      deleteMedia(
                        selected
                      )
                    }
                  >
                    {deletingId ===
                    selected.id
                      ? "Deleting..."
                      : "Delete Media"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* ====================================================
            EDIT MEDIA MODAL
        ==================================================== */}

        {editing && selected && (

          <div
            className="upload-backdrop"
            onClick={
              closeEditModal
            }
          >

            <div
              className="upload-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="upload-header">

                <div>

                  <h2>
                    Edit Media
                  </h2>

                  <p>
                    Update the information
                    associated with this
                    photograph.
                  </p>

                </div>

                <button
                  type="button"
                  className="upload-close"
                  onClick={
                    closeEditModal
                  }
                  disabled={
                    savingEdit
                  }
                >
                  ×
                </button>

              </div>

              {/* PREVIEW */}

              <div className="edit-preview">

                <img
                  src={selected.url}
                  alt={
                    selected.altText ||
                    selected.fileName
                  }
                />

              </div>

              <form
                onSubmit={
                  saveMediaEdit
                }
              >

                {/* ALT TEXT */}

                <div className="upload-field">

                  <label>
                    Alt Text *
                  </label>

                  <input
                    type="text"
                    value={
                      editForm.altText
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          altText:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Describe what is visible in the photograph..."
                    disabled={
                      savingEdit
                    }
                  />

                </div>

                {/* CAPTION */}

                <div className="upload-field">

                  <label>
                    Caption
                  </label>

                  <textarea
                    value={
                      editForm.caption
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          caption:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Add a story or caption..."
                    disabled={
                      savingEdit
                    }
                  />

                </div>

                {/* LOCATION */}

                <div className="upload-field">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    value={
                      editForm.location
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          location:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Harishchandragad, Maharashtra"
                    disabled={
                      savingEdit
                    }
                  />

                </div>

                {/* PHOTOGRAPHER */}

                <div className="upload-field">

                  <label>
                    Photographer
                  </label>

                  <input
                    type="text"
                    value={
                      editForm.photographer
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          photographer:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Photographer name"
                    disabled={
                      savingEdit
                    }
                  />

                </div>

                {/* CAPTURE DATE */}

                <div className="upload-field">

                  <label>
                    Captured Date
                  </label>

                  <input
                    type="date"
                    value={
                      editForm.capturedDate
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          capturedDate:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    disabled={
                      savingEdit
                    }
                  />

                </div>

                {/* JOURNEY */}

                <div className="upload-field">

                  <label>
                    Journey
                  </label>

                  <select
                    value={
                      editForm.journeyId
                    }
                    onChange={(event) =>
                      setEditForm(
                        (current) => ({
                          ...current,
                          journeyId:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    disabled={
                      savingEdit ||
                      loadingJourneys
                    }
                  >

                    <option value="">
                      Unassigned
                    </option>

                    {journeys.map(
                      (
                        journey
                      ) => (
                        <option
                          key={
                            journey.id
                          }
                          value={
                            journey.id
                          }
                        >
                          {
                            journey.title
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ERROR */}

                {editError && (
                  <div className="upload-error">
                    {editError}
                  </div>
                )}

                {/* ACTIONS */}

                <div className="upload-actions">

                  <button
                    type="button"
                    className="upload-button"
                    onClick={
                      closeEditModal
                    }
                    disabled={
                      savingEdit
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="upload-button primary"
                    disabled={
                      savingEdit
                    }
                  >
                    {savingEdit
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

        {/* ====================================================
            UPLOAD MODAL
        ==================================================== */}

        {showUpload && (

          <div
            className="upload-backdrop"
            onClick={
              closeUploadModal
            }
          >

            <div
              className="upload-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="upload-header">

                <div>

                  <h2>
                    Upload Media
                  </h2>

                  <p>
                    Add a photograph to
                    your media library.
                  </p>

                </div>

                <button
                  type="button"
                  className="upload-close"
                  onClick={
                    closeUploadModal
                  }
                  disabled={
                    uploading
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={
                  uploadMedia
                }
              >

                {/* FILE */}

                <div className="upload-field">

                  <label>
                    Photograph *
                  </label>

                  <div className="upload-file">

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/*"
                      onChange={
                        handleFileChange
                      }
                      disabled={
                        uploading
                      }
                    />

                    {uploadForm.file && (
                      <div className="upload-file-name">
                        Selected:{" "}
                        {
                          uploadForm
                            .file
                            .name
                        }
                      </div>
                    )}

                  </div>

                </div>

                {/* ALT */}

                <div className="upload-field">

                  <label>
                    Alt Text *
                  </label>

                  <input
                    type="text"
                    value={
                      uploadForm.altText
                    }
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          altText:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Describe what is visible in the photograph..."
                    disabled={
                      uploading
                    }
                  />

                </div>

                {/* CAPTION */}

                <div className="upload-field">

                  <label>
                    Caption
                  </label>

                  <textarea
                    value={
                      uploadForm.caption
                    }
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          caption:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Add a story or caption..."
                    disabled={
                      uploading
                    }
                  />

                </div>

                {/* LOCATION */}

                <div className="upload-field">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    value={
                      uploadForm.location
                    }
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          location:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Harishchandragad, Maharashtra"
                    disabled={
                      uploading
                    }
                  />

                </div>

                {/* PHOTOGRAPHER */}

                <div className="upload-field">

                  <label>
                    Photographer
                  </label>

                  <input
                    type="text"
                    value={
                      uploadForm.photographer
                    }
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          photographer:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Photographer name"
                    disabled={
                      uploading
                    }
                  />

                </div>

                {/* CAPTURE DATE */}

                <div className="upload-field">

                  <label>
                    Captured Date
                  </label>

                  <input
                    type="date"
                    value={
                      uploadForm.capturedDate
                    }
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          capturedDate:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    disabled={
                      uploading
                    }
                  />

                </div>

                {/* JOURNEY */}

                <div className="upload-field">

                  <label>
                    Journey
                  </label>

                  <select
                    value={
                      uploadForm.journeyId
                    }
                    onChange={(event) =>
                      setUploadForm(
                        (current) => ({
                          ...current,
                          journeyId:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    disabled={
                      uploading ||
                      loadingJourneys
                    }
                  >

                    <option value="">
                      Unassigned
                    </option>

                    {journeys.map(
                      (
                        journey
                      ) => (
                        <option
                          key={
                            journey.id
                          }
                          value={
                            journey.id
                          }
                        >
                          {
                            journey.title
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* ERROR */}

                {uploadError && (
                  <div className="upload-error">
                    {
                      uploadError
                    }
                  </div>
                )}

                {/* ACTIONS */}

                <div className="upload-actions">

                  <button
                    type="button"
                    className="upload-button"
                    onClick={
                      closeUploadModal
                    }
                    disabled={
                      uploading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="upload-button primary"
                    disabled={
                      uploading
                    }
                  >
                    {uploading
                      ? "Uploading..."
                      : "Upload Photograph"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </main>
    </>
  );
}