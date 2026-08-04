import React, { useEffect, useState } from "react";
import { Play, Pause, Flag, Bug, Lightbulb, HelpCircle, CheckCircle2, Send, ArrowRightCircle } from "lucide-react";
import { EditorHeader } from "../../components/EditorShell.jsx";
import { Field, TextArea, TextInput, Button, ProgressBar, Badge } from "../../components/ui.jsx";
import { uid, formatDuration, relTime } from "../../lib/utils.js";
import { PURPLE, TEAL, CORAL, AMBER, MUTED, MONO_FONT, DISPLAY_FONT } from "../../theme.js";

const TAGS = {
  bug: { label: "Bug", icon: Bug, color: CORAL },
  idea: { label: "Idea", icon: Lightbulb, color: AMBER },
  question: { label: "Question", icon: HelpCircle, color: PURPLE },
  pass: { label: "Passed", icon: CheckCircle2, color: TEAL },
};

export function SessionEditor({ doc, onChange, onDelete, onExport, grantXp, onConvertToBug }) {
  const [tick, setTick] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [noteTag, setNoteTag] = useState("idea");

  useEffect(() => {
    if (!doc.running) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [doc.running]);

  const liveElapsed = doc.running && doc.startedAt ? (doc.elapsedSeconds || 0) + (Date.now() - doc.startedAt) / 1000 : doc.elapsedSeconds || 0;
  const timeBoxSeconds = (doc.timeBoxMinutes || 30) * 60;
  const pct = timeBoxSeconds ? Math.min(100, (liveElapsed / timeBoxSeconds) * 100) : 0;

  function start() {
    onChange({ running: true, startedAt: Date.now(), status: "Active" });
  }
  function pause() {
    onChange({ running: false, startedAt: null, elapsedSeconds: liveElapsed });
  }
  function complete() {
    onChange({ running: false, startedAt: null, elapsedSeconds: liveElapsed, status: "Completed" });
    grantXp("finishSession", `Completed exploratory session "${doc.title || "Untitled"}"`);
  }

  function addNote() {
    if (!noteText.trim()) return;
    const note = { id: uid(), ts: Date.now(), tag: noteTag, text: noteText.trim() };
    onChange({ notes: [note, ...(doc.notes || [])] });
    grantXp("logSessionNote");
    setNoteText("");
  }

  function convert(note) {
    onConvertToBug(note.text, doc);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <EditorHeader modeKey="session" doc={doc} onChange={onChange} onDelete={onDelete} onExport={onExport} />

      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <Field label="Area under test">
            <TextInput value={doc.area} onChange={(e) => onChange({ area: e.target.value })} placeholder="e.g. Checkout flow" />
          </Field>
        </div>
        <div style={{ width: 140 }}>
          <Field label="Time-box (min)">
            <TextInput type="number" min={5} value={doc.timeBoxMinutes} onChange={(e) => onChange({ timeBoxMinutes: Number(e.target.value) || 0 })} />
          </Field>
        </div>
      </div>

      <Field label="Charter / mission goal">
        <TextArea value={doc.charter} onChange={(e) => onChange({ charter: e.target.value })} placeholder="What are you exploring and why? e.g. 'Explore checkout under flaky network conditions'" />
      </Field>

      <div
        style={{
          borderRadius: 16,
          padding: 20,
          marginBottom: 22,
          background: "linear-gradient(135deg, #f4f0ff, #eefaf7)",
          border: "1.5px solid #e6d9fb",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: MONO_FONT, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>
          {doc.status === "Completed" ? "Mission complete" : doc.running ? "Mission in progress" : "Ready to launch"}
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 40, marginBottom: 12, color: "#181829" }}>{formatDuration(liveElapsed)}</div>
        <div style={{ maxWidth: 320, margin: "0 auto 16px" }}>
          <ProgressBar pct={pct} color={pct >= 100 ? CORAL : PURPLE} height={10} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {doc.status !== "Completed" && !doc.running && (
            <Button icon={Play} color={PURPLE} onClick={start}>
              {liveElapsed > 0 ? "Resume" : "Start session"}
            </Button>
          )}
          {doc.status !== "Completed" && doc.running && (
            <Button icon={Pause} ghost onClick={pause}>
              Pause
            </Button>
          )}
          {doc.status !== "Completed" && (
            <Button icon={Flag} color={TEAL} onClick={complete}>
              Complete mission
            </Button>
          )}
        </div>
      </div>

      <Field label={`Session notes (${(doc.notes || []).length})`}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {Object.entries(TAGS).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setNoteTag(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 999,
                border: `1.5px solid ${noteTag === key ? t.color : "#e6e3f6"}`,
                background: noteTag === key ? t.color : "#fff",
                color: noteTag === key ? "#fff" : "#6b6f8a",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <TextInput
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Log an observation..."
          />
          <Button icon={Send} small onClick={addNote}>
            Log
          </Button>
        </div>

        {(doc.notes || []).map((n) => {
          const tagInfo = TAGS[n.tag] || TAGS.idea;
          return (
            <div key={n.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 10px", borderRadius: 10, background: "#fbfaff", marginBottom: 6 }}>
              <Badge text={tagInfo.label} color={tagInfo.color} filled />
              <div style={{ flex: 1, fontSize: 13.5 }}>{n.text}</div>
              {n.tag === "bug" && (
                <button onClick={() => convert(n)} title="Convert to bug report" style={{ background: "none", border: "none", cursor: "pointer", color: CORAL, display: "flex" }}>
                  <ArrowRightCircle size={16} />
                </button>
              )}
              <span style={{ fontSize: 10.5, color: MUTED, fontFamily: MONO_FONT, flexShrink: 0 }}>{relTime(n.ts)}</span>
            </div>
          );
        })}
      </Field>
    </div>
  );
}
