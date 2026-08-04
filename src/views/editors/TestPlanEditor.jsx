import React, { useState } from "react";
import { Plus, Sparkles, Wand2 } from "lucide-react";
import { EditorHeader } from "../../components/EditorShell.jsx";
import { Field, TextArea, Button, Badge } from "../../components/ui.jsx";
import { TestCaseRow, PRIORITY_COLOR } from "../../components/Rows.jsx";
import { uid } from "../../lib/utils.js";
import { generateTestCases } from "../../lib/ai.js";
import { GRADIENT_HERO, MONO_FONT, PURPLE } from "../../theme.js";

export function TestPlanEditor({ doc, onChange, onDelete, onExport, grantXp }) {
  const [featureDesc, setFeatureDesc] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [picked, setPicked] = useState({});

  function addTestCase() {
    onChange({ testCases: [...(doc.testCases || []), { id: uid(), description: "", steps: "", expected: "", priority: "P2" }] });
  }
  function updateTestCase(id, patch) {
    onChange({ testCases: doc.testCases.map((tc) => (tc.id === id ? { ...tc, ...patch } : tc)) });
  }
  function removeTestCase(id) {
    onChange({ testCases: doc.testCases.filter((tc) => tc.id !== id) });
  }

  function runAssistant() {
    const result = generateTestCases(featureDesc);
    setSuggestions(result);
    setPicked(Object.fromEntries(result.cases.map((c) => [c.id, true])));
  }

  function addSelectedSuggestions() {
    const chosen = suggestions.cases.filter((c) => picked[c.id]);
    if (!chosen.length) return;
    onChange({ testCases: [...(doc.testCases || []), ...chosen.map(({ source, ...rest }) => rest)] });
    grantXp("generateTestCases", `Added ${chosen.length} AI-suggested test case${chosen.length > 1 ? "s" : ""}`);
    setSuggestions(null);
    setFeatureDesc("");
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <EditorHeader modeKey="testplan" doc={doc} onChange={onChange} onDelete={onDelete} onExport={onExport} />

      <Field label="Objective">
        <TextArea value={doc.objective} onChange={(e) => onChange({ objective: e.target.value })} placeholder="What this test plan verifies" />
      </Field>
      <Field label="Scope">
        <TextArea value={doc.scope} onChange={(e) => onChange({ scope: e.target.value })} placeholder="In scope / out of scope" />
      </Field>

      <div
        style={{
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
          background: "linear-gradient(135deg, #f4f0ff, #fdf0f8)",
          border: "1.5px solid #e6d9fb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: GRADIENT_HERO, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>AI Test Case Copilot</div>
        </div>
        <TextArea
          value={featureDesc}
          onChange={(e) => setFeatureDesc(e.target.value)}
          placeholder="Describe the feature (e.g. 'user login with email and password, includes forgot-password flow')"
          style={{ marginBottom: 10, minHeight: 60, background: "#fff" }}
        />
        <Button icon={Wand2} color={PURPLE} small onClick={runAssistant} disabled={!featureDesc.trim()}>
          Suggest test cases
        </Button>

        {suggestions && (
          <div style={{ marginTop: 14 }}>
            {suggestions.matchedDomains.length > 0 && (
              <div style={{ fontSize: 12, color: "#6b6f8a", marginBottom: 8 }}>
                Recognized: {suggestions.matchedDomains.map((d) => (
                  <span key={d} style={{ marginRight: 6, display: "inline-block" }}>
                    <Badge text={d} color={PURPLE} />
                  </span>
                ))}
              </div>
            )}
            {suggestions.cases.map((c) => (
              <label
                key={c.id}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 10,
                  background: "#fff",
                  marginBottom: 6,
                  cursor: "pointer",
                  border: "1px solid #ece7fb",
                }}
              >
                <input type="checkbox" checked={!!picked[c.id]} onChange={(e) => setPicked((p) => ({ ...p, [c.id]: e.target.checked }))} style={{ marginTop: 3 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.description}</span>
                    <Badge text={c.priority} color={PRIORITY_COLOR[c.priority] || "#6b6f8a"} filled />
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6f8a" }}>{c.expected}</div>
                </div>
              </label>
            ))}
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <Button small color={PURPLE} onClick={addSelectedSuggestions}>
                Add selected to plan
              </Button>
              <Button small ghost onClick={() => setSuggestions(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>

      <Field label={`Test cases (${(doc.testCases || []).length})`}>
        {(doc.testCases || []).map((tc, i) => (
          <TestCaseRow key={tc.id} tc={tc} index={i} onChange={(patch) => updateTestCase(tc.id, patch)} onRemove={() => removeTestCase(tc.id)} />
        ))}
        <Button icon={Plus} ghost small onClick={addTestCase}>
          Add test case
        </Button>
      </Field>

      <Field label="Notes">
        <TextArea value={doc.notes} onChange={(e) => onChange({ notes: e.target.value })} style={{ minHeight: 90 }} />
      </Field>
    </div>
  );
}
