export function uid() {
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

export function relTime(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return min + "m ago";
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + "h ago";
  const day = Math.floor(hr / 24);
  if (day < 30) return day + "d ago";
  return new Date(ts).toLocaleDateString();
}

export function dateKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function stripHtml(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function docToMarkdown(modeKey, doc) {
  const lines = [`# ${doc.title || "Untitled"}`, "", `Status: ${doc.status}`, ""];
  if (modeKey === "testplan") {
    lines.push("## Objective", doc.objective || "-", "", "## Scope", doc.scope || "-", "", "## Test Cases", "");
    (doc.testCases || []).forEach((tc, i) => {
      lines.push(
        `### TC-${String(i + 1).padStart(3, "0")}: ${tc.description || "Untitled case"} (${tc.priority || "P2"})`,
        `**Steps:** ${tc.steps || "-"}`,
        `**Expected:** ${tc.expected || "-"}`,
        ""
      );
    });
  } else if (modeKey === "runbook") {
    lines.push("## Purpose", doc.purpose || "-", "", "## Steps", "");
    (doc.steps || []).forEach((s, i) => {
      lines.push(`${i + 1}. **${s.action || "-"}**`, `   Expected: ${s.expected || "-"}`, s.notes ? `   Notes: ${s.notes}` : "", "");
    });
  } else if (modeKey === "bug") {
    lines.push(
      `Severity: ${doc.severity} | Priority: ${doc.priority}`,
      "",
      "## Environment",
      doc.environment || "-",
      "",
      "## Steps to Reproduce",
      doc.stepsToReproduce || "-",
      "",
      "## Expected Result",
      doc.expectedResult || "-",
      "",
      "## Actual Result",
      doc.actualResult || "-"
    );
  } else if (modeKey === "release") {
    lines.push(
      `Version: ${doc.version || "-"} | Date: ${doc.releaseDate || "-"}`,
      "",
      "## New Features",
      doc.newFeatures || "-",
      "",
      "## Bug Fixes",
      doc.bugFixes || "-",
      "",
      "## Known Issues",
      doc.knownIssues || "-"
    );
  } else if (modeKey === "session") {
    lines.push(
      `Area under test: ${doc.area || "-"}`,
      `Time-box: ${doc.timeBoxMinutes || 0} min | Logged: ${Math.round((doc.elapsedSeconds || 0) / 60)} min`,
      "",
      "## Charter",
      doc.charter || "-",
      "",
      "## Session Notes",
      ""
    );
    (doc.notes || []).forEach((n) => {
      lines.push(`- **[${(n.tag || "note").toUpperCase()}]** ${n.text}`);
    });
  }
  if (doc.notes && modeKey !== "session") lines.push("", "## Notes", doc.notes);
  return lines.join("\n");
}
