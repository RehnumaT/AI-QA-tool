import React, { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Badge, TextInput, Button } from "../components/ui.jsx";
import { MODE_META } from "../lib/docs.js";
import { relTime } from "../lib/utils.js";
import { STATUS_COLORS, withAlpha, DISPLAY_FONT, MONO_FONT, MUTED, BORDER } from "../theme.js";

export function RecordsView({ modeKey, docs, loaded, selectedId, onSelect, onNew, onDelete, EditorComponent, editorProps }) {
  const [search, setSearch] = useState("");
  const meta = MODE_META[modeKey];
  const filtered = docs.filter((d) => {
    if (!search.trim()) return true;
    const hay = (d.title + " " + (d.notes || "") + " " + (d.charter || "")).toLowerCase();
    return hay.includes(search.toLowerCase());
  });
  const selectedDoc = docs.find((d) => d.id === selectedId) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 19, flexShrink: 0, color: meta.accent }}>{meta.label}</div>
        <div style={{ position: "relative", flex: 1, maxWidth: 260 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: 12, color: MUTED }} />
          <TextInput placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 30, fontSize: 13 }} />
        </div>
        <div style={{ flex: 1 }} />
        <Button icon={Plus} color={meta.accent} onClick={onNew}>
          New {meta.singular}
        </Button>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ width: 270, borderRight: `1px solid ${BORDER}`, overflowY: "auto", padding: 12 }}>
          {!loaded ? (
            <div style={{ fontSize: 12.5, color: MUTED, padding: 10 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ fontSize: 12.5, color: MUTED, padding: 10, lineHeight: 1.5 }}>
              No {meta.label.toLowerCase()} yet. Create one to get started.
            </div>
          ) : (
            filtered
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((d) => (
                <div
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  style={{
                    padding: "11px 12px",
                    borderRadius: 12,
                    marginBottom: 7,
                    cursor: "pointer",
                    background: selectedId === d.id ? withAlpha(meta.accent, 0.1) : "transparent",
                    border: `1.5px solid ${selectedId === d.id ? withAlpha(meta.accent, 0.4) : "transparent"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.title || "Untitled"}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(d.id);
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Badge text={d.status} color={STATUS_COLORS[d.status] || MUTED} />
                    <span style={{ fontSize: 10.5, color: MUTED, fontFamily: MONO_FONT }}>{relTime(d.updatedAt)}</span>
                  </div>
                </div>
              ))
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 26 }}>
          {!selectedDoc ? (
            <div style={{ color: MUTED, fontSize: 13.5, paddingTop: 40, textAlign: "center" }}>
              Select a {meta.singular.toLowerCase()} on the left, or create a new one.
            </div>
          ) : (
            <EditorComponent doc={selectedDoc} {...editorProps} />
          )}
        </div>
      </div>
    </div>
  );
}
