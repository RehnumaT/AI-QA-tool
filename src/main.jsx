import React from "react";
import ReactDOM from "react-dom/client";
import QAStudio from "./App.jsx";

// Shim for window.storage, an API this component expects from its original
// hosting environment. Backed by localStorage so data persists across reloads.
window.storage = {
  async get(key) {
    const value = window.localStorage.getItem(key);
    return { value };
  },
  async set(key, value) {
    window.localStorage.setItem(key, value);
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QAStudio />
  </React.StrictMode>
);
