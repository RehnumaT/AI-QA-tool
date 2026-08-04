import { ClipboardList, Wrench, Bug, Rocket, Compass } from "lucide-react";
import { uid } from "./utils.js";
import { TEAL, BLUE, CORAL, AMBER, PURPLE } from "../theme.js";

export const MODE_META = {
  testplan: { label: "Test Plans", singular: "Test Plan", icon: ClipboardList, accent: TEAL },
  runbook: { label: "Runbooks", singular: "Runbook", icon: Wrench, accent: BLUE },
  bug: { label: "Bug Reports", singular: "Bug Report", icon: Bug, accent: CORAL },
  release: { label: "Release Notes", singular: "Release", icon: Rocket, accent: AMBER },
  session: { label: "Explore Sessions", singular: "Session", icon: Compass, accent: PURPLE },
};

export const STATUS_OPTIONS = {
  testplan: ["Draft", "In Review", "Approved"],
  runbook: ["Draft", "Verified"],
  bug: ["Open", "In Progress", "Fixed", "Won't Fix", "Closed"],
  release: ["Draft", "Shipped"],
  session: ["Draft", "Active", "Completed"],
};

export function defaultDoc(modeKey) {
  const base = { id: uid(), title: "", notes: "", createdAt: Date.now(), updatedAt: Date.now() };
  switch (modeKey) {
    case "testplan":
      return { ...base, title: "New test plan", status: "Draft", objective: "", scope: "", testCases: [] };
    case "runbook":
      return { ...base, title: "New runbook", status: "Draft", purpose: "", steps: [] };
    case "bug":
      return {
        ...base,
        title: "New bug report",
        status: "Open",
        severity: "Medium",
        priority: "P2",
        environment: "",
        stepsToReproduce: "",
        expectedResult: "",
        actualResult: "",
      };
    case "release":
      return {
        ...base,
        title: "New release",
        status: "Draft",
        version: "",
        releaseDate: "",
        newFeatures: "",
        bugFixes: "",
        knownIssues: "",
      };
    case "session":
      return {
        ...base,
        title: "New exploratory session",
        status: "Draft",
        area: "",
        charter: "",
        timeBoxMinutes: 30,
        elapsedSeconds: 0,
        running: false,
        notes: [],
      };
    default:
      return base;
  }
}
