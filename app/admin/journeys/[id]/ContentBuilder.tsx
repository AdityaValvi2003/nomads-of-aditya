"use client";

import { useEffect, useState } from "react";

type GalleryImage = {
  url: string;
  alt: string;
  caption: string;
};

type ContentBlock = {
  id: string;
  type: string;
  position: number;
  data: Record<string, unknown>;
};

type Props = {
  journeyId: string;
};

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

export default function ContentBuilder({
  journeyId,
}: Props) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadBlocks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/journeys/${journeyId}/blocks`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load blocks."
        );
      }

      setBlocks(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load blocks."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlocks();
  }, [journeyId]);

  async function addBlock(type: string) {
    try {
      setSaving(true);
      setError("");

      let data: Record<string, unknown> = {};

      switch (type) {
        case "HEADING":
          data = {
            text: "New Heading",
          };
          break;

        case "SUBHEADING":
          data = {
            text: "New Subheading",
          };
          break;

        case "PARAGRAPH":
          data = {
            text: "Start writing your story here...",
          };
          break;

        case "QUOTE":
          data = {
            text: "Your quote goes here.",
            author: "",
          };
          break;

        case "DIVIDER":
          data = {};
          break;

        case "IMAGE":
          data = {
            url: "",
            alt: "",
            caption: "",
          };
          break;

        case "IMAGE_TEXT":
          data = {
            url: "",
            alt: "",
            text: "",
          };
          break;

        case "GALLERY":
          data = {
            images: [],
          };
          break;

        case "VIDEO":
          data = {
            url: "",
            caption: "",
          };
          break;

        case "LOCATION":
          data = {
            name: "",
            address: "",
            latitude: null,
            longitude: null,
          };
          break;

        case "JOURNEY_INFO":
          data = {
            duration: "",
            distance: "",
            difficulty: "",
          };
          break;

        case "ENCOUNTER":
          data = {
            title: "",
            text: "",
          };
          break;
      }

      const response = await fetch(
        `/api/admin/journeys/${journeyId}/blocks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            data,
          }),
        }
      );

      const newBlock = await response.json();

      if (!response.ok) {
        throw new Error(
          newBlock.error ||
            "Failed to create block."
        );
      }

      setBlocks((current) => [
        ...current,
        newBlock,
      ]);

      setShowMenu(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create block."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateBlock(
    blockId: string,
    data: Record<string, unknown>
  ) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/admin/journeys/${journeyId}/blocks`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blockId,
            data,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update block."
        );
      }

      setBlocks((current) =>
        current.map((block) =>
          block.id === blockId
            ? {
                ...block,
                data: result.data,
              }
            : block
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update block."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlock(blockId: string) {
    const confirmed = window.confirm(
      "Delete this content block?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/admin/journeys/${journeyId}/blocks`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blockId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete block."
        );
      }

      setBlocks((current) =>
        current.filter(
          (block) => block.id !== blockId
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete block."
      );
    } finally {
      setSaving(false);
    }
  }

  function updateLocalBlock(
    blockId: string,
    field: string,
    value: unknown
  ) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? {
              ...block,
              data: {
                ...block.data,
                [field]: value,
              },
            }
          : block
      )
    );
  }

  function getGalleryImages(
    block: ContentBlock
  ): GalleryImage[] {
    if (!Array.isArray(block.data.images)) {
      return [];
    }

    return block.data.images.map((image) => {
      if (
        typeof image === "object" &&
        image !== null
      ) {
        const item =
          image as Record<string, unknown>;

        return {
          url:
            typeof item.url === "string"
              ? item.url
              : "",
          alt:
            typeof item.alt === "string"
              ? item.alt
              : "",
          caption:
            typeof item.caption === "string"
              ? item.caption
              : "",
        };
      }

      return {
        url: "",
        alt: "",
        caption: "",
      };
    });
  }

  function updateGallery(
    blockId: string,
    images: GalleryImage[]
  ) {
    updateLocalBlock(
      blockId,
      "images",
      images
    );
  }

  function addGalleryImage(
    block: ContentBlock
  ) {
    const images = getGalleryImages(block);

    updateGallery(block.id, [
      ...images,
      {
        url: "",
        alt: "",
        caption: "",
      },
    ]);
  }

  function removeGalleryImage(
    block: ContentBlock,
    index: number
  ) {
    const images = getGalleryImages(block);

    updateGallery(
      block.id,
      images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  }

  function updateGalleryImage(
    block: ContentBlock,
    index: number,
    field: keyof GalleryImage,
    value: string
  ) {
    const images = getGalleryImages(block);

    const updatedImages = images.map(
      (image, imageIndex) =>
        imageIndex === index
          ? {
              ...image,
              [field]: value,
            }
          : image
    );

    updateGallery(
      block.id,
      updatedImages
    );
  }

  return (
    <section className="mt-10">

      {/* HEADER */}

      <div className="flex items-center justify-between gap-4">

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

        {/* ADD BLOCK */}

        <div className="relative shrink-0">

          <button
            type="button"
            onClick={() =>
              setShowMenu((value) => !value)
            }
            disabled={saving}
            className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Block
          </button>

          {showMenu && (
            <div className="absolute right-0 z-20 mt-3 max-h-[500px] w-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#151515] p-2 shadow-2xl">

              {BLOCK_TYPES.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() =>
                    addBlock(item.type)
                  }
                  disabled={saving}
                  className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-50"
                >
                  <p className="text-sm font-medium text-white">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    {item.description}
                  </p>
                </button>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">

          <p className="text-sm text-white/40">
            Loading content...
          </p>

        </div>

      ) : blocks.length === 0 ? (

        /* EMPTY STATE */

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

        /* BLOCKS */

        <div className="mt-8 space-y-4">

          {blocks.map((block, index) => (

            <div
              key={block.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >

              {/* BLOCK HEADER */}

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                    Block {index + 1}
                  </p>

                  <h4 className="mt-2 text-lg font-medium">
                    {
                      BLOCK_TYPES.find(
                        (item) =>
                          item.type === block.type
                      )?.label || block.type
                    }
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    deleteBlock(block.id)
                  }
                  disabled={saving}
                  className="text-sm text-red-400/70 transition hover:text-red-400 disabled:opacity-40"
                >
                  Delete
                </button>

              </div>

              {/* HEADING */}

              {block.type === "HEADING" && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm text-white/50">
                    Heading
                  </label>

                  <input
                    type="text"
                    value={
                      typeof block.data.text ===
                      "string"
                        ? block.data.text
                        : ""
                    }
                    onChange={(event) =>
                      updateLocalBlock(
                        block.id,
                        "text",
                        event.target.value
                      )
                    }
                    onBlur={() =>
                      updateBlock(
                        block.id,
                        block.data
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-xl text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Enter heading..."
                  />

                </div>
              )}

              {/* SUBHEADING */}

              {block.type === "SUBHEADING" && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm text-white/50">
                    Subheading
                  </label>

                  <input
                    type="text"
                    value={
                      typeof block.data.text ===
                      "string"
                        ? block.data.text
                        : ""
                    }
                    onChange={(event) =>
                      updateLocalBlock(
                        block.id,
                        "text",
                        event.target.value
                      )
                    }
                    onBlur={() =>
                      updateBlock(
                        block.id,
                        block.data
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-lg text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Enter subheading..."
                  />

                </div>
              )}

              {/* PARAGRAPH */}

              {block.type === "PARAGRAPH" && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm text-white/50">
                    Paragraph
                  </label>

                  <textarea
                    value={
                      typeof block.data.text ===
                      "string"
                        ? block.data.text
                        : ""
                    }
                    onChange={(event) =>
                      updateLocalBlock(
                        block.id,
                        "text",
                        event.target.value
                      )
                    }
                    onBlur={() =>
                      updateBlock(
                        block.id,
                        block.data
                      )
                    }
                    rows={7}
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-base leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                    placeholder="Write your story here..."
                  />

                </div>
              )}

              {/* QUOTE */}

              {block.type === "QUOTE" && (
                <div className="mt-6 space-y-5">

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Quote
                    </label>

                    <textarea
                      value={
                        typeof block.data.text ===
                        "string"
                          ? block.data.text
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "text",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      rows={5}
                      className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-lg leading-7 text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="Write the quote..."
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Author
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.author ===
                        "string"
                          ? block.data.author
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "author",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="Who said this?"
                    />

                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                    <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                      Preview
                    </p>

                    <blockquote className="mt-4 border-l-2 border-[#D99A3D] pl-5">

                      <p className="text-xl leading-8 text-white/80">
                        “
                        {typeof block.data.text ===
                        "string"
                          ? block.data.text
                          : "Your quote goes here."}
                        ”
                      </p>

                      {typeof block.data.author ===
                        "string" &&
                        block.data.author.trim() !==
                          "" && (
                          <p className="mt-4 text-sm text-white/40">
                            — {block.data.author}
                          </p>
                        )}

                    </blockquote>

                  </div>

                </div>
              )}

              {/* IMAGE */}

              {block.type === "IMAGE" && (
                <div className="mt-6 space-y-5">

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Image URL
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.url ===
                        "string"
                          ? block.data.url
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "url",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="https://example.com/image.jpg"
                    />

                  </div>

                  {typeof block.data.url ===
                    "string" &&
                    block.data.url.trim() !==
                      "" && (
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">

                        <img
                          src={block.data.url}
                          alt={
                            typeof block.data.alt ===
                            "string"
                              ? block.data.alt
                              : ""
                          }
                          className="max-h-[500px] w-full object-contain"
                        />

                      </div>
                    )}

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Alt text
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.alt ===
                        "string"
                          ? block.data.alt
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "alt",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="Describe the image..."
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Caption
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.caption ===
                        "string"
                          ? block.data.caption
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "caption",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                      placeholder="Optional image caption..."
                    />

                  </div>

                </div>
              )}

              {/* IMAGE + TEXT */}

              {block.type === "IMAGE_TEXT" && (
                <div className="mt-6 space-y-5">

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Image URL
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.url ===
                        "string"
                          ? block.data.url
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "url",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="https://example.com/image.jpg"
                    />

                  </div>

                  {typeof block.data.url ===
                    "string" &&
                    block.data.url.trim() !==
                      "" && (
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">

                        <img
                          src={block.data.url}
                          alt={
                            typeof block.data.alt ===
                            "string"
                              ? block.data.alt
                              : ""
                          }
                          className="max-h-[450px] w-full object-contain"
                        />

                      </div>
                    )}

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Alt text
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.alt ===
                        "string"
                          ? block.data.alt
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "alt",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="Describe the image..."
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Story text
                    </label>

                    <textarea
                      value={
                        typeof block.data.text ===
                        "string"
                          ? block.data.text
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "text",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      rows={7}
                      className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="Write the story that accompanies this image..."
                    />

                  </div>

                </div>
              )}

              {/* GALLERY */}

              {block.type === "GALLERY" && (
                <div className="mt-6 space-y-5">

                  {getGalleryImages(block).map(
                    (image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="rounded-2xl border border-white/10 bg-black/20 p-5"
                      >

                        <div className="flex items-center justify-between">

                          <p className="text-sm font-medium text-white/70">
                            Image {imageIndex + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeGalleryImage(
                                block,
                                imageIndex
                              )
                            }
                            className="text-xs text-red-400/70 hover:text-red-400"
                          >
                            Remove
                          </button>

                        </div>

                        <div className="mt-4">

                          <label className="mb-2 block text-xs text-white/40">
                            Image URL
                          </label>

                          <input
                            type="text"
                            value={image.url}
                            onChange={(event) =>
                              updateGalleryImage(
                                block,
                                imageIndex,
                                "url",
                                event.target.value
                              )
                            }
                            onBlur={() =>
                              updateBlock(
                                block.id,
                                block.data
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                            placeholder="https://example.com/image.jpg"
                          />

                        </div>

                        {image.url.trim() !==
                          "" && (
                          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black">

                            <img
                              src={image.url}
                              alt={image.alt}
                              className="max-h-[350px] w-full object-contain"
                            />

                          </div>
                        )}

                        <div className="mt-4">

                          <label className="mb-2 block text-xs text-white/40">
                            Alt text
                          </label>

                          <input
                            type="text"
                            value={image.alt}
                            onChange={(event) =>
                              updateGalleryImage(
                                block,
                                imageIndex,
                                "alt",
                                event.target.value
                              )
                            }
                            onBlur={() =>
                              updateBlock(
                                block.id,
                                block.data
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                            placeholder="Describe the image..."
                          />

                        </div>

                        <div className="mt-4">

                          <label className="mb-2 block text-xs text-white/40">
                            Caption
                          </label>

                          <input
                            type="text"
                            value={image.caption}
                            onChange={(event) =>
                              updateGalleryImage(
                                block,
                                imageIndex,
                                "caption",
                                event.target.value
                              )
                            }
                            onBlur={() =>
                              updateBlock(
                                block.id,
                                block.data
                              )
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                            placeholder="Optional caption..."
                          />

                        </div>

                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      addGalleryImage(block)
                    }
                    className="w-full rounded-xl border border-dashed border-white/15 px-4 py-4 text-sm text-white/50 transition hover:border-white/30 hover:text-white"
                  >
                    + Add another image
                  </button>

                  {getGalleryImages(block).length >
                    0 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      disabled={saving}
                      className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
                    >
                      Save Gallery
                    </button>
                  )}

                </div>
              )}

              {/* VIDEO */}

              {block.type === "VIDEO" && (
                <div className="mt-6 space-y-5">

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Video URL
                    </label>

                    <input
                      type="url"
                      value={
                        typeof block.data.url ===
                        "string"
                          ? block.data.url
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "url",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Caption
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.caption ===
                        "string"
                          ? block.data.caption
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "caption",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="Optional video caption..."
                    />

                  </div>

                  {typeof block.data.url ===
                    "string" &&
                    block.data.url.trim() !==
                      "" && (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-4">

                        <p className="text-xs text-white/30">
                          Video URL saved
                        </p>

                        <p className="mt-2 break-all text-sm text-white/50">
                          {block.data.url}
                        </p>

                      </div>
                    )}

                </div>
              )}

              {/* LOCATION */}

              {block.type === "LOCATION" && (
                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm text-white/50">
                      Location name
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.name ===
                        "string"
                          ? block.data.name
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "name",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="Harishchandragad"
                    />

                  </div>

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm text-white/50">
                      Address
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.address ===
                        "string"
                          ? block.data.address
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "address",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="Maharashtra, India"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={
                        typeof block.data.latitude ===
                        "number"
                          ? block.data.latitude
                          : ""
                      }
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        updateLocalBlock(
                          block.id,
                          "latitude",
                          value === ""
                            ? null
                            : Number(value)
                        );
                      }}
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="19.3887"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={
                        typeof block.data.longitude ===
                        "number"
                          ? block.data.longitude
                          : ""
                      }
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        updateLocalBlock(
                          block.id,
                          "longitude",
                          value === ""
                            ? null
                            : Number(value)
                        );
                      }}
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="73.7720"
                    />

                  </div>

                </div>
              )}

              {/* JOURNEY INFO */}

              {block.type === "JOURNEY_INFO" && (
                <div className="mt-6 grid gap-5 md:grid-cols-3">

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Duration
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.duration ===
                        "string"
                          ? block.data.duration
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "duration",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="2 days"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Distance
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.distance ===
                        "string"
                          ? block.data.distance
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "distance",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="18 km"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Difficulty
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.difficulty ===
                        "string"
                          ? block.data.difficulty
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "difficulty",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="Moderate"
                    />

                  </div>

                </div>
              )}

              {/* ENCOUNTER */}

              {block.type === "ENCOUNTER" && (
                <div className="mt-6 space-y-5">

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Person / Encounter
                    </label>

                    <input
                      type="text"
                      value={
                        typeof block.data.title ===
                        "string"
                          ? block.data.title
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "title",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="The shepherd I met on the trail"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm text-white/50">
                      Story
                    </label>

                    <textarea
                      value={
                        typeof block.data.text ===
                        "string"
                          ? block.data.text
                          : ""
                      }
                      onChange={(event) =>
                        updateLocalBlock(
                          block.id,
                          "text",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        updateBlock(
                          block.id,
                          block.data
                        )
                      }
                      rows={7}
                      className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-white/20 focus:border-white/30"
                      placeholder="Tell the story of this encounter..."
                    />

                  </div>

                </div>
              )}

              {/* DIVIDER */}

              {block.type === "DIVIDER" && (
                <div className="mt-6">

                  <div className="border-t border-white/10" />

                  <p className="mt-3 text-xs text-white/25">
                    Visual section separator.
                  </p>

                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </section>
  );
}