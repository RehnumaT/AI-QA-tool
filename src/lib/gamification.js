import { dateKey } from "./utils.js";

export const XP_PER_LEVEL = 150;

export const XP_REWARDS = {
  createDoc: 5,
  approveOrShip: 15,
  logBug: 8,
  fixBug: 12,
  finishSession: 20,
  logSessionNote: 3,
  generateTestCases: 6,
};

export function levelFromXp(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, needed: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

export function defaultActivity() {
  return { xp: 0, streak: 0, lastActiveDate: null };
}

export function applyActivity(prev, points) {
  const today = dateKey();
  let streak = prev.streak || 0;
  if (prev.lastActiveDate === today) {
    // same day, streak unchanged
  } else if (prev.lastActiveDate) {
    const yesterday = dateKey(Date.now() - 86400000);
    streak = prev.lastActiveDate === yesterday ? streak + 1 : 1;
  } else {
    streak = 1;
  }
  const prevLevel = levelFromXp(prev.xp || 0).level;
  const xp = (prev.xp || 0) + points;
  const newLevel = levelFromXp(xp).level;
  return {
    next: { xp, streak, lastActiveDate: today },
    leveledUp: newLevel > prevLevel,
    newLevel,
  };
}
