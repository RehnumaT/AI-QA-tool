import React from "react";
import { Plus } from "lucide-react";
import { EditorHeader } from "../../components/EditorShell.jsx";
import { Field, TextArea, Button } from "../../components/ui.jsx";
import { StepRow } from "../../components/Rows.jsx";
import { uid } from "../../lib/utils.js";

export function RunbookEditor({ doc, onChange, onDelete, onExport }) {
  function addStep() {
    onChange({ steps: [...(doc.steps || []), { id: uid(), action: "", expected: "", notes: "" }] });
  }
  function updateStep(id, patch) {
    onChange({ steps: doc.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }
  function removeStep(id) {
    onChange({ steps: doc.steps.filter((s) => s.id !== id) });
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <EditorHeader modeKey="runbook" doc={doc} onChange={onChange} onDelete={onDelete} onExport={onExport} />

      <Field label="Purpose">
        <TextArea value={doc.purpose} onChange={(e) => onChange({ purpose: e.target.value })} placeholder="When and why this runbook is used" />
      </Field>
      <Field label={`Steps (${(doc.steps || []).length})`}>
        {(doc.steps || []).map((s, i) => (
          <StepRow key={s.id} step={s} index={i} onChange={(patch) => updateStep(s.id, patch)} onRemove={() => removeStep(s.id)} />
        ))}
        <Button icon={Plus} ghost small onClick={addStep}>
          Add step
        </Button>
      </Field>
      <Field label="Notes">
        <TextArea value={doc.notes} onChange={(e) => onChange({ notes: e.target.value })} style={{ minHeight: 90 }} />
      </Field>
    </div>
  );
}
