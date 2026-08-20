import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Camera } from "lucide-react";
import { formatINR, formatReason } from "../utils/format";

const CHECKLIST_ITEMS = [
  "Product matches order",
  "Serial number matches",
  "Item condition verified",
  "Accessories present",
  "Packaging verified",
];

function ChecklistRow({ returnItem, onApprove, onEscalate }) {
  const [checked, setChecked] = useState(() => CHECKLIST_ITEMS.map(() => false));
  const allChecked = checked.every(Boolean);
  const [feedback, setFeedback] = useState(null);

  function toggle(i) {
    setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));
  }

  function approve() {
    if (!allChecked) return;
    setFeedback("approved");
    onApprove(returnItem.id);
  }

  function escalate() {
    setFeedback("escalated");
    onEscalate(returnItem.id);
  }

  if (feedback === "approved") {
    return (
      <div className="card card-pad" style={{ marginBottom: 10 }}>
        <div className="callout callout-success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={16} color="#1e7a3a" aria-hidden="true" />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Approved — refund of {formatINR(returnItem.refundAmount)} released.</span>
        </div>
      </div>
    );
  }
  if (feedback === "escalated") {
    return (
      <div className="card card-pad" style={{ marginBottom: 10 }}>
        <div className="callout callout-danger" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color="#c62828" aria-hidden="true" />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Escalated to warehouse inspection.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-pad" style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{returnItem.id}</div>
          <div className="faint" style={{ fontSize: 11.5 }}>
            Customer: {returnItem.customerName} · {returnItem.product}
          </div>
          <div className="faint" style={{ fontSize: 11.5 }}>
            Value: {formatINR(returnItem.orderValue)} · Reason: {formatReason(returnItem.returnReason)}
          </div>
        </div>
        <span className="muted" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
          <Camera size={13} aria-hidden="true" /> photo on file
        </span>
      </div>

      <div className="divider" />

      <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>VERIFICATION CHECKLIST</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {CHECKLIST_ITEMS.map((item, i) => (
          <label key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, cursor: "pointer" }}>
            <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} />
            {item}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn-danger-outline" onClick={escalate}>Escalate to warehouse</button>
        <button className="btn btn-success" disabled={!allChecked} onClick={approve}>
          Approve &amp; refund
        </button>
      </div>
    </div>
  );
}

export default function AgentApp({ queue, onApprove, onEscalate }) {
  return (
    <div>
      <div className="section-title">Doorstep verification queue</div>
      {queue.length === 0 && <div className="card empty">Nothing awaiting doorstep verification.</div>}
      {queue.map((r) => (
        <ChecklistRow key={r.id} returnItem={r} onApprove={onApprove} onEscalate={onEscalate} />
      ))}
    </div>
  );
}
