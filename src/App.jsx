import React, { useEffect, useRef, useState, useCallback } from "react";
import { Home, Upload, Sparkles } from "lucide-react";
import { loadJSON, saveJSON } from "./lib/storage.js";
import { defaultDoc, MODE_META } from "./lib/docs.js";
import { uid } from "./lib/utils.js";
import { defaultActivity, applyActivity, XP_REWARDS } from "./lib/gamification.js";
import { GameBar } from "./components/GameBar.jsx";
import { ToastStack } from "./components/Toasts.jsx";
import { RecordsView } from "./views/RecordsView.jsx";
import { DashboardView } from "./views/DashboardView.jsx";
import { TestPlanEditor } from "./views/editors/TestPlanEditor.jsx";
import { RunbookEditor } from "./views/editors/RunbookEditor.jsx";
import { BugEditor } from "./views/editors/BugEditor.jsx";
import { ReleaseEditor } from "./views/editors/ReleaseEditor.jsx";
import { SessionEditor } from "./views/editors/SessionEditor.jsx";
import { downloadText, docToMarkdown } from "./lib/utils.js";
import { PAGE_BG, BORDER, DISPLAY_FONT, MONO_FONT, MUTED, INK, GRADIENT_HERO, withAlpha } from "./theme.js";

const EDITORS = {
  testplan: TestPlanEditor,
  runbook: RunbookEditor,
  bug: BugEditor,
  release: ReleaseEditor,
  session: SessionEditor,
};

const EMPTY_DATA = { testplan: [], runbook: [], bug: [], release: [], session: [] };
const MODE_KEYS = ["testplan", "runbook", "bug", "release", "session"];

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(EMPTY_DATA);
  const [activity, setActivity] = useState(defaultActivity());
  const [mode, setMode] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(MODE_KEYS.map((m) => loadJSON(m, [])));
      const act = await loadJSON("activity", defaultActivity());
      if (!cancelled) {
        const next = { ...EMPTY_DATA };
        MODE_KEYS.forEach((m, i) => (next[m] = results[i]));
        setData(next);
        setActivity(act);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushToast = useCallback((toast) => {
    const id = uid();
    setToasts((t) => [...t, { id, ...toast }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const grantXp = useCallback(
    (key, message) => {
      const points = XP_REWARDS[key] || 0;
      setActivity((prev) => {
        const { next, leveledUp, newLevel } = applyActivity(prev, points);
        saveJSON("activity", next);
        if (points > 0) pushToast({ text: message || "Nice work!", xp: points, emoji: "✨" });
        if (leveledUp) setTimeout(() => pushToast({ text: `Level up! You're now level ${newLevel}`, emoji: "🎉" }), 400);
        return next;
      });
    },
    [pushToast]
  );

  function persist(modeKey, docs) {
    saveJSON(modeKey, docs);
  }

  function createDoc(modeKey) {
    const doc = defaultDoc(modeKey);
    setData((prev) => {
      const next = { ...prev, [modeKey]: [doc, ...prev[modeKey]] };
      persist(modeKey, next[modeKey]);
      return next;
    });
    setSelectedId(doc.id);
    setMode(modeKey);
    grantXp("createDoc", `New ${MODE_META[modeKey].singular.toLowerCase()} started`);
  }

  function updateDoc(modeKey, id, patch) {
    setData((prev) => {
      const prevDoc = prev[modeKey].find((d) => d.id === id);
      const next = {
        ...prev,
        [modeKey]: prev[modeKey].map((d) => (d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d)),
      };
      persist(modeKey, next[modeKey]);
      if (prevDoc && patch.status && patch.status !== prevDoc.status) {
        if (modeKey === "bug" && patch.status === "Fixed") grantXp("fixBug", "Bug marked fixed");
        else if (patch.status === "Approved" || patch.status === "Shipped") grantXp("approveOrShip", `${MODE_META[modeKey].singular} ${patch.status.toLowerCase()}`);
      }
      return next;
    });
  }

  function deleteDoc(modeKey, id) {
    setData((prev) => {
      const next = { ...prev, [modeKey]: prev[modeKey].filter((d) => d.id !== id) };
      persist(modeKey, next[modeKey]);
      return next;
    });
    if (selectedId === id) setSelectedId(null);
  }

  function convertNoteToBug(text, sessionDoc) {
    const doc = {
      ...defaultDoc("bug"),
      title: `Found during exploratory session: ${sessionDoc.title || "Untitled"}`,
      stepsToReproduce: text,
      environment: sessionDoc.area ? `Area: ${sessionDoc.area}` : "",
      notes: `Discovered while exploring "${sessionDoc.charter || sessionDoc.title}".`,
    };
    setData((prev) => {
      const next = { ...prev, bug: [doc, ...prev.bug] };
      persist("bug", next.bug);
      return next;
    });
    setSelectedId(doc.id);
    setMode("bug");
    grantXp("logBug", "Converted session finding into a bug report");
  }

  function handleFileImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      const modeKey = mode === "home" ? "testplan" : mode;
      const doc = { ...defaultDoc(modeKey), title: file.name.replace(/\.[^/.]+$/, ""), notes: content };
      setData((prev) => {
        const next = { ...prev, [modeKey]: [doc, ...prev[modeKey]] };
        persist(modeKey, next[modeKey]);
        return next;
      });
      setSelectedId(doc.id);
      setMode(modeKey);
      grantXp("createDoc", "Imported document from file");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const EditorComponent = mode !== "home" ? EDITORS[mode] : null;

  return (
    <div style={{ background: "transparent", padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus, select:focus { border-color: #7209b7 !important; box-shadow: 0 0 0 3px rgba(114,9,183,0.12); }
        ::placeholder { color: #a6a2c2; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <ToastStack toasts={toasts} />

      <div
        style={{
          maxWidth: 1220,
          margin: "0 auto",
          minHeight: 640,
          background: PAGE_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          fontFamily: "'Inter', sans-serif",
          color: INK,
        }}
      >
        <div style={{ width: 208, background: "#ffffff", borderRight: `1px solid ${BORDER}`, padding: "20px 14px", display: "flex", flexDirection: "column" }}>
          <div
            onClick={() => {
              setMode("home");
              setSelectedId(null);
            }}
            style={{ cursor: "pointer", marginBottom: 20, paddingLeft: 4, display: "flex", alignItems: "center", gap: 8 }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 9, background: GRADIENT_HERO, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 16.5, letterSpacing: "-0.01em" }}>QA Studio</div>
            </div>
          </div>

          <NavItem active={mode === "home"} icon={Home} label="Dashboard" onClick={() => { setMode("home"); setSelectedId(null); }} />

          <div style={{ height: 10 }} />

          {MODE_KEYS.map((key) => (
            <NavItem
              key={key}
              active={mode === key}
              icon={MODE_META[key].icon}
              label={MODE_META[key].label}
              count={data[key]?.length || 0}
              accent={MODE_META[key].accent}
              onClick={() => { setMode(key); setSelectedId(null); }}
            />
          ))}

          <div style={{ flex: 1 }} />

          <input ref={fileInputRef} type="file" accept=".txt,.md,.markdown" style={{ display: "none" }} onChange={handleFileImport} />
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${BORDER}`, background: "transparent", color: MUTED, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
          >
            <Upload size={13} /> Import file
          </button>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 22px", display: "flex", justifyContent: "flex-end", borderBottom: `1px solid ${BORDER}`, background: "#fdfcff" }}>
            <GameBar activity={activity} />
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            {mode === "home" ? (
              <DashboardView data={data} onOpenMode={(m) => setMode(m)} onNew={createDoc} />
            ) : (
              <RecordsView
                modeKey={mode}
                docs={data[mode] || []}
                loaded={loaded}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onNew={() => createDoc(mode)}
                onDelete={(id) => deleteDoc(mode, id)}
                EditorComponent={EditorComponent}
                editorProps={{
                  onChange: (patch) => updateDoc(mode, selectedId, patch),
                  onDelete: () => deleteDoc(mode, selectedId),
                  onExport: () => {
                    const doc = (data[mode] || []).find((d) => d.id === selectedId);
                    if (doc) downloadText(`${(doc.title || "document").replace(/\s+/g, "-").toLowerCase()}.md`, docToMarkdown(mode, doc));
                  },
                  grantXp,
                  onConvertToBug: convertNoteToBug,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ active, icon: Icon, label, onClick, count, accent }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 10px",
        borderRadius: 10,
        cursor: "pointer",
        marginBottom: 3,
        background: active ? withAlpha(accent || "#7209b7", 0.12) : "transparent",
      }}
    >
      <Icon size={15} color={active ? accent || INK : MUTED} />
      <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? INK : MUTED, flex: 1 }}>{label}</span>
      {typeof count === "number" && <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: MUTED }}>{count}</span>}
    </div>
  );
}
