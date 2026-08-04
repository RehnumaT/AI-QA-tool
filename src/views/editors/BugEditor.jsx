import React, { useMemo, useState } from "react";
import { Bot, Copy, Check } from "lucide-react";
import { EditorHeader } from "../../components/EditorShell.jsx";
import { Field, TextArea, TextInput, Select, ProgressBar, Button, Badge } from "../../components/ui.jsx";
import { analyzeBug } from "../../lib/ai.js";
import { docToMarkdown } from "../../lib/utils.js";
import { CORAL, AMBER, TEAL, MUTED } from "../../theme.js";

const COMPLETENESS_COLOR = (pct) => (pct >= 80 ? TEAL : pct >= 40 ? AMBER : CORAL);

export function BugEditor({ doc, onChange, onDelete, onExport, grantXp }) {
  const [copied, setCopied] = useState(false);
  const analysis = useMemo(() => analyzeBug(doc), [doc.title, doc.stepsToReproduce, doc.expectedResult, doc.actualResult, doc.environment]);

  const extraFields = (
    <>
      <div style={{ maxWidth: 140 }}>
        <Field label="Severity">
          <Select value={doc.severity} onChange={(e) => onChange({ severity: e.target.value })} options={["Low", "Medium", "High", "Critical"]} />
        </Field>
      </div>
      <div style={{ maxWidth: 110 }}>
        <Field label="Priority">
          <Select value={doc.priority} onChange={(e) => onChange({ priority: e.target.value })} options={["P0", "P1", "P2", "P3"]} />
        </Field>
      </div>
    </>
  );

  function applySuggestion() {
    onChange({ severity: analysis.suggestedSeverity, priority: analysis.suggestedPriority });
    grantXp("logBug", "Applied AI severity/priority suggestion");
  }

  function copyReport() {
    navigator.clipboard.writeText(docToMarkdown("bug", doc)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const suggestionMatches = analysis.suggestedSeverity === doc.severity && analysis.suggestedPriority === doc.priority;

  return (
    <div style={{ maxWidth: 760 }}>
      <EditorHeader modeKey="bug" doc={doc} onChange={onChange} onDelete={onDelete} onExport={onExport} extraFields={extraFields} />

      <div
        style={{
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
          background: "linear-gradient(135deg, #fff2f0, #fff8ec)",
          border: "1.5px solid #fbdcd4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: CORAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={14} color="#fff" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>AI Bug Report Assistant</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: MUTED, marginBottom: 5 }}>
            <span>Report completeness</span>
            <span>{analysis.completeness}%</span>
          </div>
          <ProgressBar pct={analysis.completeness} color={COMPLETENESS_COLOR(analysis.completeness)} />
          {analysis.missingFields.length > 0 && (
            <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
              Missing: {analysis.missingFields.join(", ")}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: MUTED }}>Suggested:</span>
          <Badge text={analysis.suggestedSeverity} color={CORAL} filled />
          <Badge text={analysis.suggestedPriority} color={AMBER} filled />
          {!suggestionMatches && (
            <Button small color={CORAL} onClick={applySuggestion}>
              Apply suggestion
            </Button>
          )}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8, fontStyle: "italic" }}>{analysis.reasoning}</div>

        <div style={{ marginTop: 12 }}>
          <Button small ghost icon={copied ? Check : Copy} onClick={copyReport}>
            {copied ? "Copied!" : "Copy polished report for devs"}
          </Button>
        </div>
      </div>

      <Field label="Environment">
        <TextInput value={doc.environment} onChange={(e) => onChange({ environment: e.target.value })} placeholder="Device, OS, app version, build" />
      </Field>
      <Field label="Steps to reproduce">
        <TextArea value={doc.stepsToReproduce} onChange={(e) => onChange({ stepsToReproduce: e.target.value })} />
      </Field>
      <Field label="Expected result">
        <TextArea value={doc.expectedResult} onChange={(e) => onChange({ expectedResult: e.target.value })} />
      </Field>
      <Field label="Actual result">
        <TextArea value={doc.actualResult} onChange={(e) => onChange({ actualResult: e.target.value })} />
      </Field>
      <Field label="Notes">
        <TextArea value={doc.notes} onChange={(e) => onChange({ notes: e.target.value })} style={{ minHeight: 90 }} />
      </Field>
    </div>
  );
}
