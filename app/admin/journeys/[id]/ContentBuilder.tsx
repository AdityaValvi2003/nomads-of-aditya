"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { DragEvent } from "react";
import MediaPicker from "./editor/MediaPicker";

type GalleryImage = {
  mediaId?: string;
  url: string;
  alt: string;
  caption: string;
};

type MediaAsset = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
  altText: string | null;
  caption: string | null;
  location: string | null;
};

type ContentBlock = {
  id: string;
  type: string;
  position: number;
  data: Record<string, unknown>;
  mediaId?: string | null;
  media?: MediaAsset | null;
};

type Props = {
  journeyId: string;
};

type SaveState =
  | "saved"
  | "saving"
  | "unsaved"
  | "error";

const BLOCK_TYPES = [
  {
    type: "HEADING",
    label: "Heading",
    description: "Large section heading",
  },
  {
    type: "SUBHEADING",
    label: "Subheading",
    description: "Smaller section heading",
  },
  {
    type: "PARAGRAPH",
    label: "Paragraph",
    description: "Normal story text",
  },
  {
    type: "QUOTE",
    label: "Quote",
    description: "Highlight a quote",
  },
  {
    type: "DIVIDER",
    label: "Divider",
    description: "Visual section separator",
  },
  {
    type: "IMAGE",
    label: "Image",
    description: "Single photograph",
  },
  {
    type: "IMAGE_TEXT",
    label: "Image + Text",
    description: "Photo with accompanying story",
  },
  {
    type: "GALLERY",
    label: "Gallery",
    description: "Multiple photographs",
  },
  {
    type: "VIDEO",
    label: "Video",
    description: "Video content",
  },
  {
    type: "LOCATION",
    label: "Location",
    description: "Location information",
  },
  {
    type: "JOURNEY_INFO",
    label: "Journey Info",
    description: "Trip information",
  },
  {
    type: "ENCOUNTER",
    label: "Encounter",
    description: "Person or memorable encounter",
  },
];

function getBlockLabel(type: string) {
  return (
    BLOCK_TYPES.find(
      (item) => item.type === type
    )?.label || type
  );
}

function getString(value: unknown) {
  return typeof value === "string"
    ? value
    : "";
}

function getNumber(value: unknown) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function createInitialData(
  type: string
): Record<string, unknown> {
  switch (type) {
    case "HEADING":
      return { text: "New Heading" };

    case "SUBHEADING":
      return { text: "New Subheading" };

    case "PARAGRAPH":
      return {
        text: "Start writing your story here...",
      };

    case "QUOTE":
      return {
        text: "Your quote goes here.",
        author: "",
      };

    case "IMAGE":
      return {
        url: "",
        alt: "",
        caption: "",
      };

    case "IMAGE_TEXT":
      return {
        url: "",
        alt: "",
        text: "",
      };

    case "GALLERY":
      return {
        images: [],
      };

    case "VIDEO":
      return {
        url: "",
        caption: "",
      };

    case "LOCATION":
      return {
        name: "",
        address: "",
        latitude: null,
        longitude: null,
      };

    case "JOURNEY_INFO":
      return {
        duration: "",
        distance: "",
        difficulty: "",
      };

    case "ENCOUNTER":
      return {
        title: "",
        text: "",
      };

    case "DIVIDER":
    default:
      return {};
  }
}

export default function ContentBuilder({
  journeyId,
}: Props) {
  const [blocks, setBlocks] = useState<
    ContentBlock[]
  >([]);

  const [showMenu, setShowMenu] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [savingOrder, setSavingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saveState, setSaveState] =
    useState<SaveState>("saved");

  const [draggedBlockId, setDraggedBlockId] =
    useState<string | null>(null);

  const [dragOverBlockId, setDragOverBlockId] =
    useState<string | null>(null);

  const [
    mediaPickerBlockId,
    setMediaPickerBlockId,
  ] = useState<string | null>(null);

  const [galleryPicker, setGalleryPicker] =
    useState<{
      blockId: string;
      imageIndex: number;
    } | null>(null);

  const saveTimers =
    useRef<
      Map<string, ReturnType<typeof setTimeout>>
    >(new Map());

  /*
  |--------------------------------------------------------------------------
  | Latest request version per block
  |--------------------------------------------------------------------------
  */

  const requestVersions =
    useRef<Map<string, number>>(
      new Map()
    );

  /*
  |--------------------------------------------------------------------------
  | Latest data waiting to be saved
  |--------------------------------------------------------------------------
  */

  const pendingData =
    useRef<
      Map<
        string,
        {
          data: Record<string, unknown>;
          mediaId?: string | null;
        }
      >
    >(new Map());

  const blocksRef =
    useRef<ContentBlock[]>([]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  const loadBlocks = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/journeys/${journeyId}/blocks`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load blocks."
          );
        }

        setBlocks(data);
        blocksRef.current = data;

        pendingData.current.clear();

        setSaveState("saved");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load blocks."
        );

        setSaveState("error");
      } finally {
        setLoading(false);
      }
    },
    [journeyId]
  );

  useEffect(() => {
    void loadBlocks();

    return () => {
      saveTimers.current.forEach(
        (timer) => clearTimeout(timer)
      );

      saveTimers.current.clear();
      pendingData.current.clear();
    };
  }, [loadBlocks]);

  /*
  |--------------------------------------------------------------------------
  | SAVE BLOCK
  |--------------------------------------------------------------------------
  */

  const saveBlock = useCallback(
    async (
      blockId: string,
      data: Record<string, unknown>,
      mediaId?: string | null
    ) => {
      const currentVersion =
        (requestVersions.current.get(
          blockId
        ) || 0) + 1;

      requestVersions.current.set(
        blockId,
        currentVersion
      );

      try {
        setSaving(true);
        setSaveState("saving");
        setError("");

        const response = await fetch(
          `/api/admin/journeys/${journeyId}/blocks`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              blockId,
              data,
              ...(mediaId !== undefined
                ? {
                    mediaId,
                  }
                : {}),
            }),
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to save changes."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Ignore stale response.
        |--------------------------------------------------------------------------
        */

        if (
          requestVersions.current.get(
            blockId
          ) !== currentVersion
        ) {
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | If another change was queued while this request
        | was running, don't mark the block as completely saved.
        |--------------------------------------------------------------------------
        */

        const pending =
          pendingData.current.get(
            blockId
          );

        if (pending) {
          return;
        }

        setBlocks((current) =>
          current.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  data:
                    result.data ??
                    data,
                  media:
                    result.media ??
                    block.media,
                  mediaId:
                    result.media?.id ??
                    (mediaId !== undefined
                      ? mediaId
                      : block.mediaId),
                }
              : block
          )
        );

        setSaveState("saved");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to save changes."
        );

        setSaveState("error");
      } finally {
        setSaving(false);
      }
    },
    [journeyId]
  );

  /*
  |--------------------------------------------------------------------------
  | AUTOSAVE
  |--------------------------------------------------------------------------
  */

  const scheduleSave = useCallback(
    (
      blockId: string,
      data: Record<string, unknown>,
      mediaId?: string | null
    ) => {
      const existingTimer =
        saveTimers.current.get(
          blockId
        );

      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      pendingData.current.set(
        blockId,
        {
          data,
          mediaId,
        }
      );

      setSaveState("unsaved");

      const timer = setTimeout(() => {
        saveTimers.current.delete(
          blockId
        );

        const pending =
          pendingData.current.get(
            blockId
          );

        if (!pending) {
          return;
        }

        pendingData.current.delete(
          blockId
        );

        void saveBlock(
          blockId,
          pending.data,
          pending.mediaId
        );
      }, 800);

      saveTimers.current.set(
        blockId,
        timer
      );
    },
    [saveBlock]
  );

  /*
  |--------------------------------------------------------------------------
  | LOCAL UPDATE
  |--------------------------------------------------------------------------
  */

  function updateLocalBlock(
    blockId: string,
    field: string,
    value: unknown
  ) {
    const current =
      blocksRef.current;

    const block =
      current.find(
        (item) =>
          item.id === blockId
      );

    if (!block) {
      return;
    }

    const updatedData = {
      ...block.data,
      [field]: value,
    };

    const updated =
      current.map((item) =>
        item.id === blockId
          ? {
              ...item,
              data: updatedData,
            }
          : item
      );

    blocksRef.current = updated;
    setBlocks(updated);

    scheduleSave(
      blockId,
      updatedData,
      block.mediaId
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ADD BLOCK
  |--------------------------------------------------------------------------
  */

  async function addBlock(type: string) {
    try {
      setSaving(true);
      setSaveState("saving");
      setError("");

      const response = await fetch(
        `/api/admin/journeys/${journeyId}/blocks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            type,
            data: createInitialData(type),
          }),
        }
      );

      const newBlock =
        await response.json();

      if (!response.ok) {
        throw new Error(
          newBlock.error ||
            "Failed to create block."
        );
      }

      setBlocks((current) => {
        const updated = [
          ...current,
          newBlock,
        ];

        blocksRef.current = updated;

        return updated;
      });

      setShowMenu(false);
      setSaveState("saved");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create block."
      );

      setSaveState("error");
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DUPLICATE BLOCK
  |--------------------------------------------------------------------------
  */

  async function duplicateBlock(
    blockId: string
  ) {
    try {
      setSaving(true);
      setSaveState("saving");
      setError("");

      /*
      |--------------------------------------------------------------------------
      | Flush pending autosave for this block first.
      |--------------------------------------------------------------------------
      */

      const timer =
        saveTimers.current.get(
          blockId
        );

      if (timer) {
        clearTimeout(timer);
        saveTimers.current.delete(
          blockId
        );
      }

      const pending =
        pendingData.current.get(
          blockId
        );

      if (pending) {
        pendingData.current.delete(
          blockId
        );

        await saveBlock(
          blockId,
          pending.data,
          pending.mediaId
        );
      }

      const response = await fetch(
        `/api/admin/journeys/${journeyId}/blocks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            duplicateOfBlockId:
              blockId,
          }),
        }
      );

      const duplicated =
        await response.json();

      if (!response.ok) {
        throw new Error(
          duplicated.error ||
            "Failed to duplicate block."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Reload from server.
      |
      | This is intentional.
      | The server owns the final positions.
      |--------------------------------------------------------------------------
      */

      await loadBlocks();

      setSaveState("saved");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to duplicate block."
      );

      setSaveState("error");
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE BLOCK
  |--------------------------------------------------------------------------
  */

  async function deleteBlock(
    blockId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this content block?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setSaveState("saving");
      setError("");

      const timer =
        saveTimers.current.get(
          blockId
        );

      if (timer) {
        clearTimeout(timer);
        saveTimers.current.delete(
          blockId
        );
      }

      pendingData.current.delete(
        blockId
      );

      const response = await fetch(
        `/api/admin/journeys/${journeyId}/blocks`,
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            blockId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete block."
        );
      }

      await loadBlocks();

      setSaveState("saved");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete block."
      );

      setSaveState("error");
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | MEDIA
  |--------------------------------------------------------------------------
  */

  async function selectMedia(
    blockId: string,
    media: MediaAsset
  ) {
    const block =
      blocksRef.current.find(
        (item) =>
          item.id === blockId
      );

    if (!block) {
      return;
    }

    const updatedData = {
      ...block.data,
      url: media.url,
      alt:
        getString(block.data.alt)
          .trim() !== ""
          ? getString(block.data.alt)
          : media.altText || "",
      caption:
        getString(
          block.data.caption
        ).trim() !== ""
          ? getString(
              block.data.caption
            )
          : media.caption || "",
    };

    const updated =
      blocksRef.current.map((item) =>
        item.id === blockId
          ? {
              ...item,
              data: updatedData,
              media,
              mediaId: media.id,
            }
          : item
      );

    blocksRef.current = updated;
    setBlocks(updated);

    setMediaPickerBlockId(null);

    /*
    |--------------------------------------------------------------------------
    | Media selection is an immediate save.
    |--------------------------------------------------------------------------
    */

    const timer =
      saveTimers.current.get(
        blockId
      );

    if (timer) {
      clearTimeout(timer);
      saveTimers.current.delete(
        blockId
      );
    }

    pendingData.current.delete(
      blockId
    );

    await saveBlock(
      blockId,
      updatedData,
      media.id
    );
  }

  async function removeSelectedMedia(
    blockId: string
  ) {
    const block =
      blocksRef.current.find(
        (item) =>
          item.id === blockId
      );

    if (!block) {
      return;
    }

    const updatedData = {
      ...block.data,
      url: "",
    };

    const updated =
      blocksRef.current.map((item) =>
        item.id === blockId
          ? {
              ...item,
              data: updatedData,
              media: null,
              mediaId: null,
            }
          : item
      );

    blocksRef.current = updated;
    setBlocks(updated);

    const timer =
      saveTimers.current.get(
        blockId
      );

    if (timer) {
      clearTimeout(timer);
      saveTimers.current.delete(
        blockId
      );
    }

    pendingData.current.delete(
      blockId
    );

    await saveBlock(
      blockId,
      updatedData,
      null
    );
  }

  /*
  |--------------------------------------------------------------------------
  | GALLERY HELPERS
  |--------------------------------------------------------------------------
  */

  function getGalleryImages(
    block: ContentBlock
  ): GalleryImage[] {
    if (
      !Array.isArray(
        block.data.images
      )
    ) {
      return [];
    }

    return block.data.images.map(
      (image: unknown) => {
        if (
          typeof image ===
            "object" &&
          image !== null
        ) {
          const item =
            image as Record<
              string,
              unknown
            >;

          return {
            mediaId:
              typeof item.mediaId ===
              "string"
                ? item.mediaId
                : undefined,
            url:
              getString(item.url),
            alt:
              getString(item.alt),
            caption:
              getString(
                item.caption
              ),
          };
        }

        return {
          url: "",
          alt: "",
          caption: "",
        };
      }
    );
  }

  function updateGalleryLocal(
    blockId: string,
    images: GalleryImage[]
  ) {
    const block =
      blocksRef.current.find(
        (item) =>
          item.id === blockId
      );

    if (!block) {
      return;
    }

    const updatedData = {
      ...block.data,
      images,
    };

    const updated =
      blocksRef.current.map((item) =>
        item.id === blockId
          ? {
              ...item,
              data: updatedData,
            }
          : item
      );

    blocksRef.current = updated;
    setBlocks(updated);

    scheduleSave(
      blockId,
      updatedData,
      block.mediaId
    );
  }

  async function selectGalleryMedia(
    blockId: string,
    imageIndex: number,
    media: MediaAsset
  ) {
    const block =
      blocksRef.current.find(
        (item) =>
          item.id === blockId
      );

    if (!block) {
      return;
    }

    const images =
      getGalleryImages(block);

    if (!images[imageIndex]) {
      return;
    }

    const updatedImages =
      images.map(
        (image, index) =>
          index === imageIndex
            ? {
                ...image,
                mediaId: media.id,
                url: media.url,
                alt:
                  image.alt.trim() !==
                  ""
                    ? image.alt
                    : media.altText ||
                      "",
                caption:
                  image.caption.trim() !==
                  ""
                    ? image.caption
                    : media.caption ||
                      "",
              }
            : image
      );

    const updatedData = {
      ...block.data,
      images: updatedImages,
    };

    const updated =
      blocksRef.current.map((item) =>
        item.id === blockId
          ? {
              ...item,
              data: updatedData,
            }
          : item
      );

    blocksRef.current = updated;
    setBlocks(updated);

    setGalleryPicker(null);

    const timer =
      saveTimers.current.get(
        blockId
      );

    if (timer) {
      clearTimeout(timer);
      saveTimers.current.delete(
        blockId
      );
    }

    pendingData.current.delete(
      blockId
    );

    await saveBlock(
      blockId,
      updatedData
    );
  }

  async function removeGalleryMedia(
    blockId: string,
    imageIndex: number
  ) {
    const block =
      blocksRef.current.find(
        (item) =>
          item.id === blockId
      );

    if (!block) {
      return;
    }

    const images =
      getGalleryImages(block);

    const updatedImages =
      images.map(
        (image, index) =>
          index === imageIndex
            ? {
                ...image,
                mediaId: undefined,
                url: "",
              }
            : image
      );

    const updatedData = {
      ...block.data,
      images: updatedImages,
    };

    const updated =
      blocksRef.current.map((item) =>
        item.id === blockId
          ? {
              ...item,
              data: updatedData,
            }
          : item
      );

    blocksRef.current = updated;
    setBlocks(updated);

    const timer =
      saveTimers.current.get(
        blockId
      );

    if (timer) {
      clearTimeout(timer);
      saveTimers.current.delete(
        blockId
      );
    }

    pendingData.current.delete(
      blockId
    );

    await saveBlock(
      blockId,
      updatedData
    );
  }

  function addGalleryImage(
    block: ContentBlock
  ) {
    const images =
      getGalleryImages(block);

    const newIndex =
      images.length;

    const updatedImages = [
      ...images,
      {
        url: "",
        alt: "",
        caption: "",
      },
    ];

    updateGalleryLocal(
      block.id,
      updatedImages
    );

    setGalleryPicker({
      blockId: block.id,
      imageIndex: newIndex,
    });
  }

  function removeGalleryImage(
    block: ContentBlock,
    index: number
  ) {
    const images =
      getGalleryImages(block);

    const updatedImages =
      images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

    updateGalleryLocal(
      block.id,
      updatedImages
    );
  }

  function updateGalleryImage(
    block: ContentBlock,
    index: number,
    field:
      | "alt"
      | "caption",
    value: string
  ) {
    const images =
      getGalleryImages(block);

    const updatedImages =
      images.map(
        (image, imageIndex) =>
          imageIndex === index
            ? {
                ...image,
                [field]: value,
              }
            : image
      );

    updateGalleryLocal(
      block.id,
      updatedImages
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DRAG AND DROP
  |--------------------------------------------------------------------------
  */

  function handleDragStart(
    event: DragEvent<HTMLDivElement>,
    blockId: string
  ) {
    setDraggedBlockId(blockId);

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      blockId
    );
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
    blockId: string
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    if (
      draggedBlockId &&
      draggedBlockId !== blockId
    ) {
      setDragOverBlockId(blockId);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    const currentTarget =
      event.currentTarget;

    const relatedTarget =
      event.relatedTarget as
        | Node
        | null;

    if (
      relatedTarget &&
      currentTarget.contains(
        relatedTarget
      )
    ) {
      return;
    }

    setDragOverBlockId(null);
  }

  async function handleDrop(
    event: DragEvent<HTMLDivElement>,
    targetBlockId: string
  ) {
    event.preventDefault();

    const sourceBlockId =
      event.dataTransfer.getData(
        "text/plain"
      ) || draggedBlockId;

    setDraggedBlockId(null);
    setDragOverBlockId(null);

    if (
      !sourceBlockId ||
      sourceBlockId === targetBlockId
    ) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Do not allow reorder while an autosave is pending.
    | Flush pending saves first.
    |--------------------------------------------------------------------------
    */

    for (const [
      blockId,
      pending,
    ] of pendingData.current.entries()) {
      const timer =
        saveTimers.current.get(
          blockId
        );

      if (timer) {
        clearTimeout(timer);
        saveTimers.current.delete(
          blockId
        );
      }

      pendingData.current.delete(
        blockId
      );

      await saveBlock(
        blockId,
        pending.data,
        pending.mediaId
      );
    }

    const current =
      [...blocksRef.current];

    const sourceIndex =
      current.findIndex(
        (block) =>
          block.id ===
          sourceBlockId
      );

    const targetIndex =
      current.findIndex(
        (block) =>
          block.id ===
          targetBlockId
      );

    if (
      sourceIndex === -1 ||
      targetIndex === -1
    ) {
      return;
    }

    const reordered =
      [...current];

    const [
      movedBlock,
    ] = reordered.splice(
      sourceIndex,
      1
    );

    reordered.splice(
      targetIndex,
      0,
      movedBlock
    );

    const normalized =
      reordered.map(
        (block, index) => ({
          ...block,
          position: index,
        })
      );

    blocksRef.current =
      normalized;

    setBlocks(normalized);

    await saveBlockOrder(
      normalized
    );
  }

  function handleDragEnd() {
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  }

  async function saveBlockOrder(
    orderedBlocks: ContentBlock[]
  ) {
    try {
      setSavingOrder(true);
      setSaveState("saving");
      setError("");

      const response = await fetch(
        `/api/admin/journeys/${journeyId}/blocks`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reorder: true,
            blocks:
              orderedBlocks.map(
                (
                  block,
                  index
                ) => ({
                  id: block.id,
                  position: index,
                })
              ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save block order."
        );
      }

      if (
        Array.isArray(
          data.blocks
        )
      ) {
        setBlocks(
          data.blocks
        );

        blocksRef.current =
          data.blocks;
      }

      setSaveState("saved");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save block order."
      );

      setSaveState("error");

      await loadBlocks();
    } finally {
      setSavingOrder(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE STATUS
  |--------------------------------------------------------------------------
  */

  function renderSaveStatus() {
    if (saveState === "saving") {
      return (
        <span className="text-[#D99A3D]">
          Saving...
        </span>
      );
    }

    if (saveState === "unsaved") {
      return (
        <span className="text-white/40">
          Unsaved changes
        </span>
      );
    }

    if (saveState === "error") {
      return (
        <span className="text-red-400">
          Save failed
        </span>
      );
    }

    return (
      <span className="text-white/30">
        Saved
      </span>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <section className="mt-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/25">
            Story
          </p>

          <h3 className="mt-2 text-xl font-medium">
            Journey Content
          </h3>

          <p className="mt-2 text-sm text-white/40">
            Build your journey using different content blocks.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-xs sm:block">
            {renderSaveStatus()}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowMenu(
                  (value) => !value
                )
              }
              disabled={
                saving ||
                savingOrder
              }
              className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Block
            </button>

            {showMenu && (
              <div className="absolute right-0 z-30 mt-3 max-h-[500px] w-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#151515] p-2 shadow-2xl">
                {BLOCK_TYPES.map(
                  (item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() =>
                        addBlock(
                          item.type
                        )
                      }
                      disabled={
                        saving ||
                        savingOrder
                      }
                      className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-50"
                    >
                      <p className="text-sm font-medium text-white">
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs text-white/35">
                        {
                          item.description
                        }
                      </p>
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs sm:hidden">
        {renderSaveStatus()}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading &&
        blocks.length > 1 && (
          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3 text-xs text-white/30">
            <span className="text-white/50">
              Tip:
            </span>{" "}
            Drag blocks using the handle to change
            the order of your story.
          </div>
        )}

      {loading ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-white/40">
            Loading content...
          </p>
        </div>
      ) : blocks.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-white/20">
            Your story starts here
          </p>

          <h4 className="mt-4 text-xl font-medium">
            No content blocks yet
          </h4>

          <p className="mx-auto mt-2 max-w-md text-sm text-white/35">
            Start building your journey by adding a heading,
            paragraph, image, quote or another content block.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {blocks.map(
            (block, index) => (
              <div
                key={block.id}
                draggable
                onDragStart={(event) =>
                  handleDragStart(
                    event,
                    block.id
                  )
                }
                onDragOver={(event) =>
                  handleDragOver(
                    event,
                    block.id
                  )
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={(event) =>
                  handleDrop(
                    event,
                    block.id
                  )
                }
                onDragEnd={
                  handleDragEnd
                }
                className={`rounded-2xl border bg-white/[0.02] p-6 transition-all ${
                  draggedBlockId ===
                  block.id
                    ? "scale-[0.99] border-[#D99A3D]/50 opacity-50"
                    : dragOverBlockId ===
                      block.id
                    ? "border-[#D99A3D] bg-[#D99A3D]/5"
                    : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(
                          event,
                          block.id
                        )
                      }
                      className="mt-1 flex cursor-grab touch-none flex-col gap-1 rounded-lg border border-white/10 px-2 py-2 text-white/25 transition hover:border-white/20 hover:text-white/60 active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      {Array.from({
                        length: 6,
                      }).map(
                        (_, dot) => (
                          <span
                            key={dot}
                            className="block h-1 w-1 rounded-full bg-current"
                          />
                        )
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                        Block{" "}
                        {index + 1}
                      </p>

                      <h4 className="mt-2 text-lg font-medium">
                        {getBlockLabel(
                          block.type
                        )}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        duplicateBlock(
                          block.id
                        )
                      }
                      disabled={
                        saving ||
                        savingOrder
                      }
                      className="text-sm text-white/40 transition hover:text-white disabled:opacity-40"
                    >
                      Duplicate
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteBlock(
                          block.id
                        )
                      }
                      disabled={
                        saving ||
                        savingOrder
                      }
                      className="text-sm text-red-400/70 transition hover:text-red-400 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {block.type ===
                  "HEADING" && (
                  <TextField
                    label="Heading"
                    value={getString(
                      block.data.text
                    )}
                    placeholder="Enter heading..."
                    inputClassName="text-xl"
                    onChange={(value) =>
                      updateLocalBlock(
                        block.id,
                        "text",
                        value
                      )
                    }
                  />
                )}

                {block.type ===
                  "SUBHEADING" && (
                  <TextField
                    label="Subheading"
                    value={getString(
                      block.data.text
                    )}
                    placeholder="Enter subheading..."
                    inputClassName="text-lg"
                    onChange={(value) =>
                      updateLocalBlock(
                        block.id,
                        "text",
                        value
                      )
                    }
                  />
                )}

                {block.type ===
                  "PARAGRAPH" && (
                  <TextAreaField
                    label="Paragraph"
                    value={getString(
                      block.data.text
                    )}
                    placeholder="Write your story here..."
                    rows={7}
                    onChange={(value) =>
                      updateLocalBlock(
                        block.id,
                        "text",
                        value
                      )
                    }
                  />
                )}

                {block.type ===
                  "QUOTE" && (
                  <div className="mt-6 space-y-5">
                    <TextAreaField
                      label="Quote"
                      value={getString(
                        block.data.text
                      )}
                      placeholder="Write the quote..."
                      rows={5}
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "text",
                          value
                        )
                      }
                    />

                    <TextField
                      label="Author"
                      value={getString(
                        block.data.author
                      )}
                      placeholder="Who said this?"
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "author",
                          value
                        )
                      }
                    />

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                        Preview
                      </p>

                      <blockquote className="mt-4 border-l-2 border-[#D99A3D] pl-5">
                        <p className="text-xl leading-8 text-white/80">
                          “
                          {getString(
                            block.data
                              .text
                          ) ||
                            "Your quote goes here."}
                          ”
                        </p>

                        {getString(
                          block.data
                            .author
                        ).trim() !==
                          "" && (
                          <p className="mt-4 text-sm text-white/40">
                            —{" "}
                            {getString(
                              block
                                .data
                                .author
                            )}
                          </p>
                        )}
                      </blockquote>
                    </div>
                  </div>
                )}

                {block.type ===
                  "IMAGE" && (
                  <ImageEditor
                    block={block}
                    saving={
                      saving
                    }
                    onSelect={() =>
                      setMediaPickerBlockId(
                        block.id
                      )
                    }
                    onRemove={() =>
                      removeSelectedMedia(
                        block.id
                      )
                    }
                    onChange={(
                      field,
                      value
                    ) =>
                      updateLocalBlock(
                        block.id,
                        field,
                        value
                      )
                    }
                  />
                )}

                {block.type ===
                  "IMAGE_TEXT" && (
                  <ImageTextEditor
                    block={block}
                    saving={
                      saving
                    }
                    onSelect={() =>
                      setMediaPickerBlockId(
                        block.id
                      )
                    }
                    onRemove={() =>
                      removeSelectedMedia(
                        block.id
                      )
                    }
                    onChange={(
                      field,
                      value
                    ) =>
                      updateLocalBlock(
                        block.id,
                        field,
                        value
                      )
                    }
                  />
                )}

                {block.type ===
                  "GALLERY" && (
                  <GalleryEditor
                    block={block}
                    saving={
                      saving
                    }
                    getImages={() =>
                      getGalleryImages(
                        block
                      )
                    }
                    onAdd={() =>
                      addGalleryImage(
                        block
                      )
                    }
                    onRemove={(
                      index
                    ) =>
                      removeGalleryImage(
                        block,
                        index
                      )
                    }
                    onSelect={(
                      index
                    ) =>
                      setGalleryPicker(
                        {
                          blockId:
                            block.id,
                          imageIndex:
                            index,
                        }
                      )
                    }
                    onRemoveMedia={(
                      index
                    ) =>
                      removeGalleryMedia(
                        block.id,
                        index
                      )
                    }
                    onChange={(
                      index,
                      field,
                      value
                    ) =>
                      updateGalleryImage(
                        block,
                        index,
                        field,
                        value
                      )
                    }
                  />
                )}

                {block.type ===
                  "VIDEO" && (
                  <div className="mt-6 space-y-5">
                    <TextField
                      label="Video URL"
                      value={getString(
                        block.data
                          .url
                      )}
                      placeholder="https://..."
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "url",
                          value
                        )
                      }
                    />

                    <TextField
                      label="Caption"
                      value={getString(
                        block.data
                          .caption
                      )}
                      placeholder="Optional video caption..."
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "caption",
                          value
                        )
                      }
                    />
                  </div>
                )}

                {block.type ===
                  "LOCATION" && (
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <TextField
                        label="Location name"
                        value={getString(
                          block.data
                            .name
                        )}
                        placeholder="Harishchandragad"
                        onChange={(value) =>
                          updateLocalBlock(
                            block.id,
                            "name",
                            value
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <TextField
                        label="Address"
                        value={getString(
                          block.data
                            .address
                        )}
                        placeholder="Maharashtra, India"
                        onChange={(value) =>
                          updateLocalBlock(
                            block.id,
                            "address",
                            value
                          )
                        }
                      />
                    </div>

                    <NumberField
                      label="Latitude"
                      value={getNumber(
                        block.data
                          .latitude
                      )}
                      placeholder="19.3887"
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "latitude",
                          value
                        )
                      }
                    />

                    <NumberField
                      label="Longitude"
                      value={getNumber(
                        block.data
                          .longitude
                      )}
                      placeholder="73.7720"
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "longitude",
                          value
                        )
                      }
                    />
                  </div>
                )}

                {block.type ===
                  "JOURNEY_INFO" && (
                  <div className="mt-6 grid gap-5 md:grid-cols-3">
                    <TextField
                      label="Duration"
                      value={getString(
                        block.data
                          .duration
                      )}
                      placeholder="2 days"
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "duration",
                          value
                        )
                      }
                    />

                    <TextField
                      label="Distance"
                      value={getString(
                        block.data
                          .distance
                      )}
                      placeholder="18 km"
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "distance",
                          value
                        )
                      }
                    />

                    <TextField
                      label="Difficulty"
                      value={getString(
                        block.data
                          .difficulty
                      )}
                      placeholder="Moderate"
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "difficulty",
                          value
                        )
                      }
                    />
                  </div>
                )}

                {block.type ===
                  "ENCOUNTER" && (
                  <div className="mt-6 space-y-5">
                    <TextField
                      label="Person / Encounter"
                      value={getString(
                        block.data
                          .title
                      )}
                      placeholder="The shepherd I met on the trail"
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "title",
                          value
                        )
                      }
                    />

                    <TextAreaField
                      label="Story"
                      value={getString(
                        block.data
                          .text
                      )}
                      placeholder="Tell the story of this encounter..."
                      rows={7}
                      onChange={(value) =>
                        updateLocalBlock(
                          block.id,
                          "text",
                          value
                        )
                      }
                    />
                  </div>
                )}

                {block.type ===
                  "DIVIDER" && (
                  <div className="mt-6">
                    <div className="border-t border-white/10" />
                    <p className="mt-3 text-xs text-white/25">
                      Visual section separator.
                    </p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {mediaPickerBlockId && (
        <MediaPicker
          onClose={() =>
            setMediaPickerBlockId(
              null
            )
          }
          onSelect={(media) =>
            selectMedia(
              mediaPickerBlockId,
              media
            )
          }
        />
      )}

      {galleryPicker && (
        <MediaPicker
          onClose={() =>
            setGalleryPicker(null)
          }
          onSelect={(media) =>
            selectGalleryMedia(
              galleryPicker.blockId,
              galleryPicker.imageIndex,
              media
            )
          }
        />
      )}
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| REUSABLE TEXT FIELD
|--------------------------------------------------------------------------
*/

function TextField({
  label,
  value,
  placeholder,
  inputClassName = "",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  inputClassName?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-6">
      <label className="mb-2 block text-sm text-white/50">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className={`w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-white/30 ${inputClassName}`}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | null;
  placeholder?: string;
  onChange: (
    value: number | null
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/50">
        {label}
      </label>

      <input
        type="number"
        step="any"
        value={
          value === null
            ? ""
            : value
        }
        onChange={(event) => {
          const raw =
            event.target.value;

          onChange(
            raw === ""
              ? null
              : Number(raw)
          );
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-6">
      <label className="mb-2 block text-sm text-white/50">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-base leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| IMAGE EDITOR
|--------------------------------------------------------------------------
*/

function ImageEditor({
  block,
  saving,
  onSelect,
  onRemove,
  onChange,
}: {
  block: ContentBlock;
  saving: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onChange: (
    field: string,
    value: string
  ) => void;
}) {
  return (
    <div className="mt-6 space-y-5">
      {block.media ? (
        <div className="overflow-hidden rounded-2xl border border-[#D99A3D]/30 bg-black/40">
          <img
            src={block.media.url}
            alt={
              block.media.altText ||
              "Selected image"
            }
            className="max-h-[500px] w-full object-contain"
          />

          <div className="border-t border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              Selected from Media Library
            </p>

            <p className="mt-2 text-sm text-white/60">
              {block.media.fileName}
            </p>

            <button
              type="button"
              onClick={onRemove}
              disabled={saving}
              className="mt-3 text-xs text-red-400/70 hover:text-red-400"
            >
              Remove image
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
          <p className="text-sm text-white/40">
            No image selected
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onSelect}
        disabled={saving}
        className="w-full rounded-xl bg-[#D99A3D] px-5 py-4 text-sm font-medium text-black transition hover:bg-[#e5aa4d] disabled:opacity-50"
      >
        {block.media
          ? "Change Image"
          : "Select from Media Library"}
      </button>

      <TextField
        label="Alt text"
        value={getString(
          block.data.alt
        )}
        placeholder="Describe the image..."
        onChange={(value) =>
          onChange(
            "alt",
            value
          )
        }
      />

      <TextField
        label="Caption"
        value={getString(
          block.data.caption
        )}
        placeholder="Optional image caption..."
        onChange={(value) =>
          onChange(
            "caption",
            value
          )
        }
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| IMAGE + TEXT EDITOR
|--------------------------------------------------------------------------
*/

function ImageTextEditor({
  block,
  saving,
  onSelect,
  onRemove,
  onChange,
}: {
  block: ContentBlock;
  saving: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onChange: (
    field: string,
    value: string
  ) => void;
}) {
  return (
    <div className="mt-6 space-y-5">
      {block.media ? (
        <div className="overflow-hidden rounded-2xl border border-[#D99A3D]/30 bg-black/40">
          <img
            src={block.media.url}
            alt={
              block.media.altText ||
              "Selected image"
            }
            className="max-h-[450px] w-full object-contain"
          />

          <div className="border-t border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#D99A3D]">
              Selected from Media Library
            </p>

            <p className="mt-2 text-sm text-white/60">
              {block.media.fileName}
            </p>

            <button
              type="button"
              onClick={onRemove}
              disabled={saving}
              className="mt-3 text-xs text-red-400/70 hover:text-red-400"
            >
              Remove image
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
          <p className="text-sm text-white/40">
            No image selected
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onSelect}
        disabled={saving}
        className="w-full rounded-xl bg-[#D99A3D] px-5 py-4 text-sm font-medium text-black transition hover:bg-[#e5aa4d] disabled:opacity-50"
      >
        {block.media
          ? "Change Image"
          : "Select from Media Library"}
      </button>

      <TextField
        label="Alt text"
        value={getString(
          block.data.alt
        )}
        placeholder="Describe the image..."
        onChange={(value) =>
          onChange(
            "alt",
            value
          )
        }
      />

      <TextAreaField
        label="Story text"
        value={getString(
          block.data.text
        )}
        placeholder="Write the story that accompanies this image..."
        rows={7}
        onChange={(value) =>
          onChange(
            "text",
            value
          )
        }
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| GALLERY EDITOR
|--------------------------------------------------------------------------
*/

function GalleryEditor({
  block,
  saving,
  getImages,
  onAdd,
  onRemove,
  onSelect,
  onRemoveMedia,
  onChange,
}: {
  block: ContentBlock;
  saving: boolean;
  getImages: () => GalleryImage[];
  onAdd: () => void;
  onRemove: (
    index: number
  ) => void;
  onSelect: (
    index: number
  ) => void;
  onRemoveMedia: (
    index: number
  ) => void;
  onChange: (
    index: number,
    field:
      | "alt"
      | "caption",
    value: string
  ) => void;
}) {
  const images =
    getImages();

  return (
    <div className="mt-6 space-y-5">
      {images.map(
        (
          image,
          imageIndex
        ) => (
          <div
            key={`${image.mediaId || "empty"}-${imageIndex}`}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/70">
                Image{" "}
                {imageIndex + 1}
              </p>

              <button
                type="button"
                onClick={() =>
                  onRemove(
                    imageIndex
                  )
                }
                disabled={saving}
                className="text-xs text-red-400/70 hover:text-red-400 disabled:opacity-40"
              >
                Remove
              </button>
            </div>

            {image.url ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-[#D99A3D]/30 bg-black">
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    "Gallery image"
                  }
                  className="max-h-[350px] w-full object-contain"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                <p className="text-sm text-white/40">
                  No image selected
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                onSelect(
                  imageIndex
                )
              }
              disabled={saving}
              className="mt-4 w-full rounded-xl bg-[#D99A3D] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e5aa4d] disabled:opacity-50"
            >
              {image.mediaId
                ? "Change Image"
                : "Select from Media Library"}
            </button>

            {image.mediaId && (
              <button
                type="button"
                onClick={() =>
                  onRemoveMedia(
                    imageIndex
                  )
                }
                disabled={saving}
                className="mt-2 w-full rounded-xl border border-red-500/20 px-4 py-3 text-xs text-red-400/70 transition hover:bg-red-500/5 hover:text-red-400 disabled:opacity-50"
              >
                Remove selected image
              </button>
            )}

            <TextField
              label="Alt text"
              value={image.alt}
              placeholder="Describe the image..."
              onChange={(value) =>
                onChange(
                  imageIndex,
                  "alt",
                  value
                )
              }
            />

            <TextField
              label="Caption"
              value={
                image.caption
              }
              placeholder="Optional caption..."
              onChange={(value) =>
                onChange(
                  imageIndex,
                  "caption",
                  value
                )
              }
            />
          </div>
        )
      )}

      <button
        type="button"
        onClick={onAdd}
        disabled={saving}
        className="w-full rounded-xl border border-dashed border-white/15 px-4 py-4 text-sm text-white/50 transition hover:border-[#D99A3D]/50 hover:text-white disabled:opacity-50"
      >
        + Add image from Media Library
      </button>
    </div>
  );
}