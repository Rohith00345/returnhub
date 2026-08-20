import React, { useMemo } from "react";
import { Target } from "lucide-react";
import { formatINR } from "../utils/format";
import { formatTAT } from "../utils/decisionEngine";

function MetricRow({ label, value, tag }) {
  return (
    <div className="kv-row">
      <span className="kv-label">{label}</span>
      <span className="kv-value" style={{ color: tag ? "var(--faint)" : "var(--text)", fontStyle: tag ? "italic" : "normal", fontWeight: tag ? 500 : 700 }}>
        {tag || value}
      </span>
    </div>
  );
}

export default function AnalyticsPage({ returns }) {
  const stats = useMemo(() => {
    const total = returns.length || 1;
    const automated = returns.filter((r) => r.resolutionPath !== "WAREHOUSE_INSPECTION").length;
    const warehouse = total - automated;
    const avgTAT = returns.reduce((a, r) => a + r.refundTAT, 0) / total;
    const fraudFlags = returns.filter((r) => r.photoVerification === "FAILED").length;
    return {
      northStar: Math.round((automated / total) * 100),
      automationRate: Math.round((automated / total) * 100),
      warehouseRate: Math.round((warehouse / total) * 100),
      avgTAT,
      fraudRate: Math.round((fraudFlags / total) * 1000) / 10,
      refundLiability: returns.reduce((a, r) => a + r.refundAmount, 0),
    };
  }, [returns]);

  return (
    <div>
      <div className="card card-pad" style={{ marginBottom: 16, background: "var(--blue-tint)", borderColor: "#c8dcfa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Target size={16} color="var(--blue-dark)" aria-hidden="true" />
          <div style={{ fontWeight: 700, fontSize: 12, color: "var(--blue-dark)" }}>NORTH STAR METRIC</div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>% of eligible returns resolved without warehouse intervention</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "var(--blue-dark)" }}>{stats.northStar}%</div>
        <div className="disclaimer">Computed from this prototype's simulated dataset — not a real operational result.</div>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="section-title">Customer metrics</div>
          <MetricRow label="Return completion rate" tag="To validate" />
          <MetricRow label="Refund TAT" value={formatTAT(stats.avgTAT)} />
          <MetricRow label="Customer satisfaction" tag="Research required" />
          <MetricRow label="Return abandonment" tag="To validate" />
        </div>
        <div className="card card-pad">
          <div className="section-title">Operations metrics</div>
          <MetricRow label="Automation rate" value={`${stats.automationRate}%`} />
          <MetricRow label="Agent verification time" tag="To validate" />
          <MetricRow label="Warehouse routing rate" value={`${stats.warehouseRate}%`} />
          <MetricRow label="Cost per return" tag="Hypothesis — see Operations" />
        </div>
        <div className="card card-pad">
          <div className="section-title">Risk metrics</div>
          <MetricRow label="Fraud flag rate" value={`${stats.fraudRate}%`} />
          <MetricRow label="False approvals" tag="Research required" />
          <MetricRow label="False rejections" tag="Research required" />
          <MetricRow label="High-risk returns" value={`${stats.warehouseRate}%`} />
        </div>
        <div className="card card-pad">
          <div className="section-title">Business metrics</div>
          <MetricRow label="Processing cost" tag="Hypothesis — see Operations" />
          <MetricRow label="Estimated savings" tag="Hypothesis — see Operations" />
          <MetricRow label="Refund liability" value={formatINR(stats.refundLiability)} />
          <MetricRow label="Repeat purchase impact" tag="To validate" />
        </div>
      </div>

      <div className="disclaimer" style={{ marginTop: 12, display: "block" }}>
        Values shown as numbers are computed directly from this prototype's simulated dataset. Everything marked
        "To validate," "Research required," or "Hypothesis" has not been measured and should not be treated as a claim.
      </div>
    </div>
  );
}
