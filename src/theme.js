export const INK = "#181829";
export const MUTED = "#6b6f8a";
export const PAGE_BG = "#f2f0fb";
export const CARD = "#ffffff";
export const BORDER = "#e6e3f6";

export const GRADIENT_HERO = "linear-gradient(120deg, #4361ee 0%, #7209b7 55%, #f72585 100%)";
export const GRADIENT_BAR = "linear-gradient(90deg, #4cc9f0, #4361ee, #7209b7, #f72585, #ffbe0b)";

export const BLUE = "#4361ee";
export const PURPLE = "#7209b7";
export const PINK = "#f72585";
export const TEAL = "#06d6a0";
export const AMBER = "#ffbe0b";
export const CORAL = "#ff5964";
export const MINT = "#4cc9f0";

export const DISPLAY_FONT = "'Fredoka', 'Segoe UI', sans-serif";
export const BODY_FONT = "'Inter', 'Segoe UI', sans-serif";
export const MONO_FONT = "'JetBrains Mono', 'Courier New', monospace";

export const MODE_ACCENT = {
  testplan: TEAL,
  runbook: BLUE,
  bug: CORAL,
  release: AMBER,
  session: PURPLE,
};

export const STATUS_COLORS = {
  Draft: MUTED,
  "In Review": AMBER,
  Approved: TEAL,
  Verified: TEAL,
  Open: CORAL,
  "In Progress": AMBER,
  Fixed: TEAL,
  "Won't Fix": MUTED,
  Closed: MUTED,
  Shipped: TEAL,
  Active: BLUE,
  Completed: TEAL,
};

export function withAlpha(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
