import React, { useState } from "react";
import { PlayCircle, RotateCcw } from "lucide-react";
import { formatINR } from "../utils/format";
import { formatTAT } from "../utils/decisionEngine";
import { generateSimulatedBatch } from "../data/seedData";
import { MANUAL_COST_PER_RETURN, AUTOMATED_COST_PER_RETURN, MANUAL_TAT_HOURS } from "../utils/assumptions";

const BATCH_SIZE = 1000;

function summarize(batch) {
  const total = batch.length;
  const automated = batch.filter((r) => r.resolutionPath !== "WAREHOUSE_INSPECTION").length;
  const warehouse = total - automated;
  const avgTAT = batch.reduce((a, r) => a + r.refundTAT, 0) / total;
  const cost = automated * AUTOMATED_COST_PER_RETURN + warehouse * MANUAL_COST_PER_RETURN;
  return {
    total,
    automationRate: Math.round((automated / total) * 100),
    warehouseRate: Math.round((warehouse / total) * 100),
    avgTAT,
    cost,
  };
}

function Row({ label, traditional, returnhub, better }) {
  return (
    <div className="kv-row">
      <span className="kv-label">{label}</span>
      <span style={{ display: "flex", gap: 16, fontSize: 12.5 }}>
        <span className="faint" style={{ minWidth: 90, textAlign: "right" }}>{traditional}</span>
        <span style={{ fontWeight: 700, minWidth: 90, textAlign: "right", color: better ? "#1e7a3a" : "var(--text)" }}>{returnhub}</span>
      </span>
    </div>
  );
}

export default function Simulation() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  function run() {
    setRunning(true);
    setTimeout(() => {
      const batch = generateSimulatedBatch(BATCH_SIZE);
      setResult(summarize(batch));
      setRunning(false);
    }, 900);
  }

  const traditional = {
    avgTAT: MANUAL_TAT_HOURS,
    warehouseRate: 100,
    cost: BATCH_SIZE * MANUAL_COST_PER_RETURN,
  };

  return (
    <div className="card card-pad" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Simulation mode</div>
        <div style={{ display: "flex", gap: 8 }}>
          {result && (
            <button className="btn btn-ghost" onClick={() => setResult(null)}>
              <RotateCcw size={13} /> Clear
            </button>
          )}
          <button className="btn btn-primary" onClick={run} disabled={running}>
            <PlayCircle size={14} /> {running ? "Running…" : `Simulate ${BATCH_SIZE.toLocaleString("en-IN")} returns`}
          </button>
        </div>
      </div>
      <div className="muted" style={{ fontSize: 12, marginBottom: result ? 12 : 0 }}>
        Generates a synthetic batch of {BATCH_SIZE.toLocaleString("en-IN")} returns through the same decision engine
        and compares it against a fully manual baseline.
      </div>

      {result && (
        <>
          <div className="divider" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginBottom: 4, fontSize: 10.5, fontWeight: 700, color: "var(--faint)" }}>
            <span style={{ minWidth: 90, textAlign: "right" }}>TRADITIONAL</span>
            <span style={{ minWidth: 90, textAlign: "right" }}>RETURNHUB</span>
          </div>
          <Row label="Avg refund TAT" traditional={formatTAT(traditional.avgTAT)} returnhub={formatTAT(result.avgTAT)} better />
          <Row label="Warehouse volume" traditional={`${traditional.warehouseRate}%`} returnhub={`${result.warehouseRate}%`} better />
          <Row label="Processing cost" traditional={formatINR(traditional.cost)} returnhub={formatINR(result.cost)} better />

          <div className="callout callout-success" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>Estimated impact</div>
            <div style={{ fontSize: 12.5 }}>
              {Math.round((1 - result.avgTAT / traditional.avgTAT) * 100)}% faster average refunds ·{" "}
              {traditional.warehouseRate - result.warehouseRate} points less warehouse volume ·{" "}
              {formatINR(traditional.cost - result.cost)} lower processing cost across this batch
            </div>
          </div>
          <div className="disclaimer" style={{ marginTop: 8 }}>
            Prototype simulation — illustrative, not real-world results. Cost and baseline figures are assumptions, not measured data.
          </div>
        </>
      )}
    </div>
  );
}
