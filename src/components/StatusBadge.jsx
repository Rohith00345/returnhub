import React from "react";
import { DECISION_LABELS } from "../utils/decisionEngine";

const META = {
  INSTANT_REFUND: { color: "#1e7a3a", bg: "#e9f7ee", label: DECISION_LABELS.INSTANT_REFUND },
  DOORSTEP_VERIFICATION: { color: "#b76e00", bg: "#fff6e5", label: DECISION_LABELS.DOORSTEP_VERIFICATION },
  WAREHOUSE_INSPECTION: { color: "#c62828", bg: "#fdeaea", label: DECISION_LABELS.WAREHOUSE_INSPECTION },
  COMPLETED: { color: "#1e7a3a", bg: "#e9f7ee", label: "Completed" },
  PENDING_VERIFICATION: { color: "#b76e00", bg: "#fff6e5", label: "Pending verification" },
  PENDING_WAREHOUSE: { color: "#c62828", bg: "#fdeaea", label: "Pending warehouse" },
  ESCALATED: { color: "#c62828", bg: "#fdeaea", label: "Escalated" },
  FAILED: { color: "#c62828", bg: "#fdeaea", label: "Failed" },
};

export default function StatusBadge({ status, label }) {
  const meta = META[status];
  if (!meta) return null;
  return (
    <span className="badge" style={{ color: meta.color, background: meta.bg }}>
      <span className="dot" style={{ background: meta.color }} />
      {label || meta.label}
    </span>
  );
}
