import React, { useState, useRef } from "react";
import { Tag, X, Plus } from "lucide-react";

export default function TagEditor({ tags, onChange }) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const addTag = (value) => {
    const clean = value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!clean || tags.includes(clean) || tags.length >= 15) return;
    onChange([...tags, clean]);
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 mb-4 min-h-[28px] cursor-text ${focused ? "" : ""}`}
      onClick={() => inputRef.current?.focus()}
    >
      <Tag size={13} className="text-text-muted flex-shrink-0" />
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 bg-accent-purple/10 text-accent-purple border border-accent-purple/25 text-xs px-2 py-0.5 rounded-full"
        >
          #{tag}
          <button
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            className="hover:text-accent-red transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); if (input) addTag(input); }}
        placeholder={tags.length === 0 ? "Add tags… (press Enter)" : ""}
        className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-xs text-text-secondary placeholder-text-muted"
      />
    </div>
  );
}
