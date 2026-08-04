import React from "react";
import { BORDER, CARD, INK, MUTED, BODY_FONT, MONO_FONT, withAlpha } from "../theme.js";

export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        boxShadow: "0 2px 10px rgba(24, 24, 41, 0.04)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ text, color, filled }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontFamily: MONO_FONT,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: filled ? "#fff" : color,
        background: filled ? color : withAlpha(color, 0.12),
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

export function ProgressBar({ pct, color, height = 8, bg = "#eeecfb" }) {
  return (
    <div style={{ width: "100%", height, borderRadius: 999, background: bg, overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
          transition: "width 0.35s ease",
        }}
      />
    </div>
  );
}

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 11px",
  borderRadius: 10,
  border: `1.5px solid ${BORDER}`,
  background: "#fbfaff",
  color: INK,
  fontFamily: BODY_FONT,
  fontSize: 14,
  outline: "none",
};

export function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}

export function TextArea(props) {
  return <textarea {...props} style={{ ...inputStyle, resize: "vertical", minHeight: 70, fontFamily: BODY_FONT, ...(props.style || {}) }} />;
}

export function Select({ value, onChange, options, style }) {
  return (
    <select value={value} onChange={onChange} style={{ ...inputStyle, ...(style || {}) }}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: MONO_FONT, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>
        {label}
      </div>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

export function Button({ children, icon: Icon, onClick, color, ghost, small, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: small ? "6px 12px" : "9px 16px",
        borderRadius: 10,
        border: ghost ? `1.5px solid ${BORDER}` : "none",
        background: disabled ? "#d8d5ea" : ghost ? "transparent" : color || INK,
        color: ghost ? INK : "#fff",
        fontFamily: BODY_FONT,
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.1s ease, opacity 0.15s ease",
        boxShadow: ghost || disabled ? "none" : `0 3px 10px ${withAlpha(color || INK, 0.35)}`,
        ...style,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {Icon && <Icon size={small ? 14 : 16} />}
      {children}
    </button>
  );
}

export function IconOnlyButton({ icon: Icon, onClick, color, title, size = 16 }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ background: "none", border: "none", cursor: "pointer", color: color || MUTED, padding: 4, display: "flex" }}
    >
      <Icon size={size} />
    </button>
  );
}
