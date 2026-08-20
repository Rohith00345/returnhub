import React, { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { formatINR, formatReason } from "../utils/format";
import { DECISION_LABELS, formatTAT } from "../utils/decisionEngine";
import StatusBadge from "./StatusBadge";

export default function DecisionEngine({ returns }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(returns[0]?.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return returns.slice(0, 25);
    return returns
      .filter((r) => r.id.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q) || r.product.toLowerCase().includes(q))
      .slice(0, 25);
  }, [query, returns]);

  const selected = returns.find((r) => r.id === selectedId) || filtered[0];

  return (
    <div className="grid-2">
      <div className="card card-pad">
        <div className="section-title">Returns</div>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--faint)" }} aria-hidden="true" />
          <input
            aria-label="Search returns by ID, customer, or product"
            placeholder="Search by ID, customer, or product…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%", padding: "8px 10px 8px 30px", borderRadius: 7,
              border: "1px solid var(--border)", fontSize: 12.5,
            }}
          />
        </div>
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              style={{
                display: "block", width: "100%", textAlign: "left", border: "none",
                background: r.id === selected?.id ? "var(--blue-tint)" : "transparent",
                borderRadius: 7, padding: "9px 10px", marginBottom: 2, cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600 }}>
                <span>{r.id}</span>
                <span className="faint" style={{ fontWeight: 400 }}>{formatINR(r.orderValue)}</span>
              </div>
              <div className="faint" style={{ fontSize: 11 }}>{r.customerName} · {r.product}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="empty">No matching returns.</div>}
        </div>
      </div>

      {selected && (
        <div className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={16} color="var(--blue)" aria-hidden="true" />
            <div style={{ fontWeight: 700, fontSize: 14 }}>Return decision · {selected.id}</div>
          </div>

          <div className="kv-row"><span className="kv-label">Customer</span><span className="kv-value">{selected.customerName}</span></div>
          <div className="kv-row"><span className="kv-label">Order</span><span className="kv-value">{selected.product}</span></div>
          <div className="kv-row"><span className="kv-label">Order value</span><span className="kv-value">{formatINR(selected.orderValue)}</span></div>

          <div style={{ margin: "14px 0 8px", fontWeight: 700, fontSize: 12.5 }}>Signals</div>
          <div className="kv-row"><span className="kv-label">Customer trust</span><span className="kv-value">{Math.round(selected.trustScore * 100)}%</span></div>
          <div className="kv-row"><span className="kv-label">Category risk</span><span className="kv-value">{selected.categoryRisk}</span></div>
          <div className="kv-row"><span className="kv-label">Previous returns</span><span className="kv-value">{selected.previousReturns}</span></div>
          <div className="kv-row"><span className="kv-label">Days since delivery</span><span className="kv-value">{selected.daysSinceDelivery}</span></div>
          <div className="kv-row"><span className="kv-label">Return reason</span><span className="kv-value">{formatReason(selected.returnReason)}</span></div>
          <div className="kv-row"><span className="kv-label">Verification status</span><span className="kv-value">{selected.photoVerification}</span></div>

          <div style={{ margin: "16px 0 8px" }}>
            <div className="faint" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 6 }}>DECISION</div>
            <StatusBadge status={selected.resolutionPath} />
            <div className="faint" style={{ fontSize: 11, marginTop: 6 }}>
              Refund {formatINR(selected.refundAmount)} · estimated TAT {formatTAT(selected.refundTAT)}
            </div>
          </div>

          <div className="callout" style={{ background: "var(--blue-tint)", borderColor: "#c8dcfa" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue-dark)", marginBottom: 4 }}>WHY?</div>
            <div style={{ fontSize: 12.5 }}>{selected.reason}</div>
          </div>

          <div className="disclaimer" style={{ marginTop: 10 }}>
            {DECISION_LABELS[selected.resolutionPath]} · automated decisions can be reviewed when additional verification is required.
          </div>
        </div>
      )}
    </div>
  );
}
