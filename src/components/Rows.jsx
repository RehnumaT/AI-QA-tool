import React from "react";
import { Trash2 } from "lucide-react";
import { TextInput, TextArea, Select, Badge } from "./ui.jsx";
import { MONO_FONT, MUTED, CORAL, BORDER } from "../theme.js";

const PRIORITY_COLOR = { P0: CORAL, P1: "#ffbe0b", P2: "#4361ee", P3: "#6b6f8a" };

export function TestCaseRow({ tc, onChange, onRemove, index }) {
  return (
    <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: 13, marginBottom: 10, background: "#fbfaff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: MONO_FONT, fontSize: 11.5, color: MUTED }}>TC-{String(index + 1).padStart(3, "0")}</span>
          {tc.source && <Badge text={tc.source} color="#7209b7" />}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Select value={tc.priority} onChange={(e) => onChange({ priority: e.target.value })} options={["P0", "P1", "P2", "P3"]} style={{ width: 76, padding: "4px 6px", fontSize: 12 }} />
          <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: CORAL }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <TextInput placeholder="Test case description" value={tc.description} onChange={(e) => onChange({ description: e.target.value })} style={{ marginBottom: 8 }} />
      <TextArea placeholder="Steps" value={tc.steps} onChange={(e) => onChange({ steps: e.target.value })} style={{ marginBottom: 8, minHeight: 50 }} />
      <TextArea placeholder="Expected result" value={tc.expected} onChange={(e) => onChange({ expected: e.target.value })} style={{ minHeight: 50 }} />
    </div>
  );
}

export function StepRow({ step, onChange, onRemove, index }) {
  return (
    <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: 13, marginBottom: 10, background: "#fbfaff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: MONO_FONT, fontSize: 11.5, color: MUTED }}>Step {index + 1}</span>
        <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: CORAL }}>
          <Trash2 size={14} />
        </button>
      </div>
      <TextInput placeholder="Action" value={step.action} onChange={(e) => onChange({ action: e.target.value })} style={{ marginBottom: 8 }} />
      <TextInput placeholder="Expected outcome" value={step.expected} onChange={(e) => onChange({ expected: e.target.value })} style={{ marginBottom: 8 }} />
      <TextInput placeholder="Notes (optional)" value={step.notes} onChange={(e) => onChange({ notes: e.target.value })} />
    </div>
  );
}

export { PRIORITY_COLOR };
