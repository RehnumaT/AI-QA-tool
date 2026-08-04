import React from "react";
import { Download, Trash2 } from "lucide-react";
import { IconOnlyButton, Field, Select } from "./ui.jsx";
import { MODE_META, STATUS_OPTIONS } from "../lib/docs.js";
import { DISPLAY_FONT, INK, MUTED } from "../theme.js";

export function EditorHeader({ modeKey, doc, onChange, onDelete, onExport, extraFields }) {
  const meta = MODE_META[modeKey];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 12 }}>
        <input
          value={doc.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={`Untitled ${meta.singular.toLowerCase()}`}
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 21,
            border: "none",
            background: "transparent",
            outline: "none",
            flex: 1,
            color: INK,
          }}
        />
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <IconOnlyButton icon={Download} title="Export as Markdown" onClick={onExport} />
          <IconOnlyButton icon={Trash2} title="Delete" onClick={onDelete} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 170 }}>
          <Field label="Status">
            <Select value={doc.status} onChange={(e) => onChange({ status: e.target.value })} options={STATUS_OPTIONS[modeKey]} />
          </Field>
        </div>
        {extraFields}
      </div>
    </>
  );
}
