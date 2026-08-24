"use client";

import { useState } from "react";
import MediaPicker, {
  MediaAsset,
} from "./MediaPicker";

type StoryContentEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function StoryContentEditor({
  value,
  onChange,
}: StoryContentEditorProps) {
  const [showMediaPicker, setShowMediaPicker] =
    useState(false);

  function insertText(text: string) {
    onChange(
      value +
        (value.trim() ? "\n\n" : "") +
        text
    );
  }

  function handleSelectImage(
    media: MediaAsset
  ) {
    insertText(
      `[IMAGE:${media.url}]`
    );

    setShowMediaPicker(false);
  }

  return (
    <>
      <div className="editor-toolbar">

        <button
          className="toolbar-button"
          type="button"
          onClick={() =>
            insertText("# ")
          }
        >
          H1
        </button>

        <button
          className="toolbar-button"
          type="button"
          onClick={() =>
            insertText("## ")
          }
        >
          H2
        </button>

        <button
          className="toolbar-button"
          type="button"
          onClick={() =>
            insertText("**bold**")
          }
        >
          B
        </button>

        <button
          className="toolbar-button"
          type="button"
          onClick={() =>
            insertText("> ")
          }
        >
          Quote
        </button>

        <button
          className="toolbar-button"
          type="button"
          onClick={() =>
            insertText("---")
          }
        >
          Divider
        </button>

        <button
          className="toolbar-button"
          type="button"
          onClick={() =>
            setShowMediaPicker(true)
          }
        >
          Image
        </button>

      </div>

      <textarea
        className="editor-textarea"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={`Start writing your story...

Tell the story naturally.

Write about the road.
The people.
The places.
The things you noticed.

Use the toolbar above to add headings,
quotes, bold text, dividers and images.`}
      />

      {showMediaPicker && (
        <MediaPicker
          onClose={() =>
            setShowMediaPicker(false)
          }
          onSelect={handleSelectImage}
        />
      )}
    </>
  );
}