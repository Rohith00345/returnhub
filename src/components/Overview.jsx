import React, { useMemo, useState } from "react";
import { ChevronDown, Zap, Truck, Clock } from "lucide-react";
import MetricCard from "./MetricCard";
import { formatTAT } from "../utils/decisionEngine";

const ROADMAP = [
  { tag: "V1 — MVP", items: ["Rule-based routing", "Customer return flow", "Agent verification", "Analytics"] },
  { tag: "V1.5", items: ["Photo verification", "Better fraud controls", "More detailed return signals"] },
  { tag: "V2", items: ["Risk scoring", "Historical behavior analysis"] },
  { tag: "V3", items: ["ML-based risk prediction"] },
  { tag: "V4", items: ["Automated logistics optimization"] },
];

const STORY = [
  ["Problem", "Returns create friction for customers and operational costs for e-commerce businesses."],
  ["Users", "Online shoppers filing returns, doorstep delivery agents, and the operations team managing refund risk."],
  ["Insight", "Not every return carries the same risk — treating them identically wastes verification effort on low-risk cases."],
  ["Product hypothesis", "If we automatically identify low-risk returns and resolve them without warehouse intervention, we can reduce refund turnaround time and operational costs while maintaining acceptable fraud levels."],
  ["Solution", "A rule-based decision engine that routes every return to instant refund, doorstep verification, or warehouse inspection based on trust, value, and category risk."],
  ["MVP", "Explainable rule-based routing, a customer return flow, an agent verification queue, and an operations dashboard."],
  ["Metrics", "North Star: % of eligible returns resolved without warehouse intervention, backed by customer, operations, risk, and business metrics."],
  ["Experiment", "Test whether automated routing for high-trust, low-risk returns lowers refund TAT without materially increasing fraudulent refunds."],
  ["Roadmap", "From rule-based MVP toward risk scoring, ML-based prediction, and logistics optimization — in that order, not before it's earned."],
];

export default function Overview({ returns }) {
  const [storyOpen, setStoryOpen] = useState(false);
  const stats = useMemo(() => {
    const total = returns.length || 1;
    const automated = returns.filter((r) => r.resolutionPath !== "WAREHOUSE_INSPECTION").length;
    const warehouse = total - automated;
    const avgTAT = returns.reduce((a, r) => a + r.refundTAT, 0) / total;
    return {
      automationRate: Math.round((automated / total) * 100),
      warehouseRate: Math.round((warehouse / total) * 100),
      avgTAT,
    };
  }, [returns]);

  return (
    <div>
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue-dark)", letterSpacing: "0.04em" }}>
          INTELLIGENT RETURN RESOLUTION
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 8px" }}>
          ReturnHub determines the safest and fastest way to resolve every return.
        </div>
        <div className="muted" style={{ fontSize: 13, maxWidth: 640 }}>
          Not every return needs a warehouse to touch it. ReturnHub routes each one — instantly, at the doorstep,
          or to inspection — based on customer trust, order value, and category risk, and explains why every time.
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <MetricCard icon={Zap} label="Automation rate" value={`${stats.automationRate}%`} sub="resolved without warehouse" color="#1e7a3a" />
        <MetricCard icon={Truck} label="Warehouse routing" value={`${stats.warehouseRate}%`} sub="high-risk / high-value" color="#c62828" />
        <MetricCard icon={Clock} label="Avg refund TAT" value={formatTAT(stats.avgTAT)} sub="vs 5-day manual baseline" color="#b76e00" />
        <div className="card card-pad" style={{ display: "flex", alignItems: "center" }}>
          <span className="disclaimer">All figures computed from this prototype's simulated dataset.</span>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <button
          onClick={() => setStoryOpen((v) => !v)}
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "space-between", display: "flex" }}
          aria-expanded={storyOpen}
        >
          <span style={{ fontWeight: 700, color: "var(--text)" }}>About this product</span>
          <ChevronDown size={14} style={{ transform: storyOpen ? "rotate(180deg)" : "none", transition: "transform 120ms" }} />
        </button>
        {storyOpen && (
          <div style={{ marginTop: 12 }}>
            {STORY.map(([label, text]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--blue-dark)" }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 13 }}>{text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="section-title">Product experiment</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          "High-trust customers with low-risk returns can receive automated refunds without materially increasing fraudulent refunds."
        </div>
        <div className="kv-row"><span className="kv-label">Control</span><span className="kv-value">Traditional manual return process</span></div>
        <div className="kv-row"><span className="kv-label">Treatment</span><span className="kv-value">ReturnHub automated routing</span></div>
        <div className="kv-row"><span className="kv-label">Primary metric</span><span className="kv-value">Refund turnaround time</span></div>
        <div className="kv-row"><span className="kv-label">Guardrail metric</span><span className="kv-value">Fraudulent refund rate</span></div>
        <div className="kv-row"><span className="kv-label">Secondary metric</span><span className="kv-value">Customer satisfaction</span></div>
        <div className="disclaimer" style={{ marginTop: 8 }}>
          This experiment has not been run. Design shown here; any results in Operations → Simulation Mode are simulated, not real trial data.
        </div>
      </div>

      <div className="card card-pad">
        <div className="section-title">Roadmap</div>
        <div className="grid-4">
          {ROADMAP.slice(0, 4).map((stage) => (
            <div key={stage.tag}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--blue-dark)", marginBottom: 6 }}>{stage.tag}</div>
              {stage.items.map((item) => (
                <div key={item} className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>
          <strong style={{ color: "var(--blue-dark)" }}>V4 —</strong> {ROADMAP[4].items[0]}
        </div>
      </div>
    </div>
  );
}
