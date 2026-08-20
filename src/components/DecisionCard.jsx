import React, { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { formatINR } from "../utils/format";

const COPY = {
  INSTANT_REFUND: {
    tone: "callout-success",
    headline: "Instant refund approved",
    body: (amt) => `Your refund of ${formatINR(amt)} will be initiated immediately.`,
  },
  DOORSTEP_VERIFICATION: {
    tone: "callout-amber",
    headline: "You're eligible for doorstep verification",
    body: () => "An agent will verify the item at pickup. Your refund will be released after verification.",
  },
  WAREHOUSE_INSPECTION: {
    tone: "callout-danger",
    headline: "Warehouse inspection required",
    body: () => "Your item will be inspected before your refund is released.",
  },
};

export default function DecisionCard({ decision, refundAmount, reason, signals }) {
  const [showWhy, setShowWhy] = useState(false);
  const copy = COPY[decision];
  if (!copy) return null;

  return (
    <div className={`callout ${copy.tone}`}>
      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{copy.headline}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>{copy.body(refundAmount)}</div>

      <button
        onClick={() => setShowWhy((v) => !v)}
        className="btn btn-ghost"
        style={{ marginTop: 10, padding: "5px 10px", fontSize: 11.5 }}
      >
        <Info size={12} /> Why did ReturnHub make this decision?
        <ChevronDown size={12} style={{ transform: showWhy ? "rotate(180deg)" : "none", transition: "transform 120ms" }} />
      </button>

      {showWhy && (
        <div style={{ marginTop: 10, borderTop: "1px dashed rgba(0,0,0,0.12)", paddingTop: 10 }}>
          <div style={{ fontSize: 12, marginBottom: 8 }}>{reason}</div>
          {signals.map(([label, value]) => (
            <div key={label} className="kv-row">
              <span className="kv-label">{label}</span>
              <span className="kv-value">{value}</span>
            </div>
          ))}
          <div className="disclaimer" style={{ marginTop: 8 }}>
            Automated decisions can be reviewed when additional verification is required.
          </div>
        </div>
      )}
    </div>
  );
}
