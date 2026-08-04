const PREFIX = "qa-studio-";

export async function loadJSON(key, fallback) {
  try {
    const r = await window.storage.get(PREFIX + key, false);
    return r && r.value ? JSON.parse(r.value) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveJSON(key, value) {
  window.storage.set(PREFIX + key, JSON.stringify(value), false).catch(() => {});
}
