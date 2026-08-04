import React from "react";
import { Plus, AlertTriangle, ShieldCheck, ShieldAlert, Clock3 } from "lucide-react";
import { Card, Badge, ProgressBar } from "../components/ui.jsx";
import { MODE_META } from "../lib/docs.js";
import { relTime } from "../lib/utils.js";
import { GRADIENT_HERO, MONO_FONT, DISPLAY_FONT, MUTED, CORAL, AMBER, TEAL, withAlpha } from "../theme.js";

const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"];
const SEVERITY_COLOR = { Critical: CORAL, High: AMBER, Medium: "#4361ee", Low: MUTED };

function computeRisk(data) {
  const openBugs = (data.bug || []).filter((b) => !["Fixed", "Closed", "Won't Fix"].includes(b.status));
  const critHigh = openBugs.filter((b) => b.severity === "Critical" || b.severity === "High").length;
  const staleTestPlans = (data.testplan || []).filter((t) => t.status !== "Approved" && Date.now() - t.updatedAt > 14 * 86400000).length;
  const score = Math.max(0, Math.min(100, 100 - critHigh * 14 - staleTestPlans * 6));
  const level = score >= 75 ? "Low" : score >= 45 ? "Medium" : "High";
  const color = level === "Low" ? TEAL : level === "Medium" ? AMBER : CORAL;
  return { score, level, color, critHigh, staleTestPlans, openBugs };
}

export function DashboardView({ data, onOpenMode, onNew }) {
  const risk = computeRisk(data);
  const severityCounts = SEVERITY_ORDER.map((s) => ({ s, n: (data.bug || []).filter((b) => b.severity === s && !["Fixed", "Closed", "Won't Fix"].includes(b.status)).length }));
  const maxSeverity = Math.max(1, ...severityCounts.map((c) => c.n));
  const activeSessions = (data.session || []).filter((s) => s.status !== "Completed");

  return (
    <div style={{ padding: 30 }}>
      <div
        style={{
          background: GRADIENT_HERO,
          borderRadius: 20,
          padding: "26px 30px",
          color: "#fff",
          marginBottom: 24,
          boxShadow: "0 12px 30px rgba(114, 9, 183, 0.25)",
        }}
      >
        <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 26, marginBottom: 6 }}>QA Studio</div>
        <div style={{ fontSize: 14, opacity: 0.9, maxWidth: 520 }}>
          Your gamified QA workspace — generate test cases, triage bugs with an AI copilot, run exploratory missions, and keep an eye on release risk.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14, marginBottom: 24 }}>
        {Object.keys(MODE_META).map((key) => {
          const meta = MODE_META[key];
          const docs = data[key] || [];
          const latest = docs.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0];
          const Icon = meta.icon;
          return (
            <Card key={key} onClick={() => onOpenMode(key)} style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: withAlpha(meta.accent, 0.14), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={meta.accent} />
                </div>
                <span style={{ fontFamily: MONO_FONT, fontSize: 22, fontWeight: 700, color: "#181829" }}>{docs.length}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{meta.label}</div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, minHeight: 16 }}>
                {latest ? `Last: ${latest.title || "Untitled"} · ${relTime(latest.updatedAt)}` : "No documents yet"}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNew(key);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: meta.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 700, padding: 0 }}
              >
                <Plus size={13} /> New {meta.singular.toLowerCase()}
              </button>
            </Card>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {risk.level === "Low" ? <ShieldCheck size={18} color={risk.color} /> : <ShieldAlert size={18} color={risk.color} />}
            <div style={{ fontWeight: 700, fontSize: 15 }}>Release risk</div>
            <div style={{ flex: 1 }} />
            <Badge text={`${risk.level} risk`} color={risk.color} filled />
          </div>
          <ProgressBar pct={risk.score} color={risk.color} height={10} />
          <div style={{ fontSize: 12, color: MUTED, marginTop: 8, marginBottom: 16 }}>Risk score: {risk.score}/100</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {risk.critHigh > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <AlertTriangle size={14} color={CORAL} />
                {risk.critHigh} open Critical/High severity bug{risk.critHigh > 1 ? "s" : ""}
              </div>
            )}
            {risk.staleTestPlans > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <Clock3 size={14} color={AMBER} />
                {risk.staleTestPlans} test plan{risk.staleTestPlans > 1 ? "s" : ""} stale (14+ days, not approved)
              </div>
            )}
            {risk.critHigh === 0 && risk.staleTestPlans === 0 && (
              <div style={{ fontSize: 13, color: MUTED }}>No major risk signals detected. Nice work.</div>
            )}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Open bugs by severity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {severityCounts.map(({ s, n }) => (
              <div key={s}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: SEVERITY_COLOR[s], fontWeight: 600 }}>{s}</span>
                  <span style={{ fontFamily: MONO_FONT, color: MUTED }}>{n}</span>
                </div>
                <ProgressBar pct={(n / maxSeverity) * 100} color={SEVERITY_COLOR[s]} height={7} />
              </div>
            ))}
          </div>
          {activeSessions.length > 0 && (
            <div style={{ marginTop: 18, fontSize: 12.5, color: MUTED }}>
              {activeSessions.length} exploratory session{activeSessions.length > 1 ? "s" : ""} in progress
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
