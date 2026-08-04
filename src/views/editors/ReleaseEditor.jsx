import React from "react";
import { EditorHeader } from "../../components/EditorShell.jsx";
import { Field, TextArea, TextInput } from "../../components/ui.jsx";

export function ReleaseEditor({ doc, onChange, onDelete, onExport }) {
  const extraFields = (
    <>
      <div style={{ maxWidth: 150 }}>
        <Field label="Version">
          <TextInput value={doc.version} onChange={(e) => onChange({ version: e.target.value })} placeholder="v1.2.0" />
        </Field>
      </div>
      <div style={{ maxWidth: 180 }}>
        <Field label="Release date">
          <TextInput type="date" value={doc.releaseDate} onChange={(e) => onChange({ releaseDate: e.target.value })} />
        </Field>
      </div>
    </>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      <EditorHeader modeKey="release" doc={doc} onChange={onChange} onDelete={onDelete} onExport={onExport} extraFields={extraFields} />
      <Field label="New features">
        <TextArea value={doc.newFeatures} onChange={(e) => onChange({ newFeatures: e.target.value })} />
      </Field>
      <Field label="Bug fixes">
        <TextArea value={doc.bugFixes} onChange={(e) => onChange({ bugFixes: e.target.value })} />
      </Field>
      <Field label="Known issues">
        <TextArea value={doc.knownIssues} onChange={(e) => onChange({ knownIssues: e.target.value })} />
      </Field>
      <Field label="Notes">
        <TextArea value={doc.notes} onChange={(e) => onChange({ notes: e.target.value })} style={{ minHeight: 90 }} />
      </Field>
    </div>
  );
}
