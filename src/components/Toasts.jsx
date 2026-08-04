import React from "react";
import { GRADIENT_HERO, MONO_FONT } from "../theme.js";

export function ToastStack({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 18, right: 18, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: GRADIENT_HERO,
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(114, 9, 183, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "qa-toast-in 0.25s ease",
            minWidth: 220,
          }}
        >
          <span style={{ fontSize: 16 }}>{t.emoji || "✨"}</span>
          <span style={{ flex: 1 }}>{t.text}</span>
          {typeof t.xp === "number" && (
            <span style={{ fontFamily: MONO_FONT, fontSize: 11.5, background: "rgba(255,255,255,0.22)", padding: "2px 8px", borderRadius: 999 }}>
              +{t.xp} XP
            </span>
          )}
        </div>
      ))}
      <style>{`
        @keyframes qa-toast-in {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
