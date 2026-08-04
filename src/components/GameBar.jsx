import React from "react";
import { Flame, Sparkles } from "lucide-react";
import { levelFromXp } from "../lib/gamification.js";
import { GRADIENT_BAR, MONO_FONT, DISPLAY_FONT } from "../theme.js";

export function GameBar({ activity }) {
  const { level, into, needed } = levelFromXp(activity.xp || 0);
  const pct = Math.round((into / needed) * 100);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "8px 14px",
        borderRadius: 999,
        background: "#ffffff",
        border: "1.5px solid #e6e3f6",
        boxShadow: "0 2px 10px rgba(24,24,41,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={15} color="#7209b7" />
        <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 13.5 }}>Lvl {level}</span>
      </div>
      <div style={{ width: 90 }}>
        <div style={{ height: 7, borderRadius: 999, background: "#eeecfb", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: GRADIENT_BAR, borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>
      </div>
      <span style={{ fontFamily: MONO_FONT, fontSize: 10.5, color: "#6b6f8a" }}>
        {into}/{needed} XP
      </span>
      <div style={{ width: 1, height: 18, background: "#e6e3f6" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Flame size={15} color={activity.streak > 0 ? "#ff5964" : "#c3c1d9"} />
        <span style={{ fontFamily: MONO_FONT, fontSize: 12.5, fontWeight: 600, color: activity.streak > 0 ? "#181829" : "#9d9ab8" }}>
          {activity.streak || 0}d streak
        </span>
      </div>
    </div>
  );
}
