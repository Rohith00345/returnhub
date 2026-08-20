import React, { useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Package, Zap, Clock, Truck, IndianRupee, TrendingDown, AlertTriangle } from "lucide-react";
import { formatINR } from "../utils/format";
import { formatTAT } from "../utils/decisionEngine";
import { MANUAL_COST_PER_RETURN, AUTOMATED_COST_PER_RETURN } from "../utils/assumptions";
import MetricCard from "./MetricCard";
import Simulation from "./Simulation";

const BLUE = "#2874f0";
const GREEN = "#1e7a3a";
const AMBER = "#b76e00";
const RED = "#c62828";
const PIE_COLORS = [GREEN, AMBER, RED];

function isToday(date) {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function Operations({ returns }) {
  const stats = useMemo(() => {
    const total = returns.length || 1;
    const automated = returns.filter((r) => r.resolutionPath !== "WAREHOUSE_INSPECTION").length;
    const warehouse = returns.filter((r) => r.resolutionPath === "WAREHOUSE_INSPECTION").length;
    const avgTAT = returns.reduce((a, r) => a + r.refundTAT, 0) / total;
    const fraudAlerts = returns.filter((r) => r.photoVerification === "FAILED" || r.previousReturns >= 4).length;
    const costSaved = automated * (MANUAL_COST_PER_RETURN - AUTOMATED_COST_PER_RETURN);
    return {
      returnsToday: returns.filter((r) => isToday(r.createdAt)).length,
      automationRate: Math.round((automated / total) * 100),
      avgTAT,
      warehouseRate: Math.round((warehouse / total) * 100),
      costPerReturn: Math.round((automated * AUTOMATED_COST_PER_RETURN + warehouse * MANUAL_COST_PER_RETURN) / total),
      costSaved,
      fraudAlerts,
    };
  }, [returns]);

  const byOutcome = useMemo(() => {
    const c = { "Instant refund": 0, "Doorstep verification": 0, "Warehouse inspection": 0 };
    returns.forEach((r) => {
      if (r.resolutionPath === "INSTANT_REFUND") c["Instant refund"]++;
      else if (r.resolutionPath === "DOORSTEP_VERIFICATION") c["Doorstep verification"]++;
      else c["Warehouse inspection"]++;
    });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [returns]);

  const byCategory = useMemo(() => {
    const map = {};
    returns.forEach((r) => { map[r.category] = (map[r.category] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [returns]);

  const byRisk = useMemo(() => {
    const c = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    returns.forEach((r) => { c[r.riskScore] = (c[r.riskScore] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [returns]);

  const byTAT = useMemo(() => {
    const buckets = { "< 1 hr": 0, "1–24 hr": 0, "1–3 days": 0, "3+ days": 0 };
    returns.forEach((r) => {
      const h = r.refundTAT;
      if (h < 1) buckets["< 1 hr"]++;
      else if (h <= 24) buckets["1–24 hr"]++;
      else if (h <= 72) buckets["1–3 days"]++;
      else buckets["3+ days"]++;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [returns]);

  const volumeOverTime = useMemo(() => {
    const days = 14;
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return { key: d.toDateString(), label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), total: 0, warehouse: 0 };
    });
    returns.forEach((r) => {
      const key = new Date(r.createdAt).toDateString();
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) {
        bucket.total++;
        if (r.resolutionPath === "WAREHOUSE_INSPECTION") bucket.warehouse++;
      }
    });
    return buckets;
  }, [returns]);

  return (
    <div>
      <Simulation />
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <MetricCard icon={Package} label="Returns today" value={stats.returnsToday} sub="last 24 hours" color={BLUE} />
        <MetricCard icon={Zap} label="Automation rate" value={`${stats.automationRate}%`} sub="target > 45%" color={GREEN} />
        <MetricCard icon={Clock} label="Avg refund TAT" value={formatTAT(stats.avgTAT)} sub="vs 5-day manual baseline" color={AMBER} />
        <MetricCard icon={Truck} label="Warehouse routing rate" value={`${stats.warehouseRate}%`} sub="high-risk / high-value" color={RED} />
      </div>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <MetricCard icon={IndianRupee} label="Est. cost per return" value={formatINR(stats.costPerReturn)} sub="illustrative assumption" color={BLUE} />
        <MetricCard icon={TrendingDown} label="Est. cost saved" value={formatINR(stats.costSaved)} sub="vs fully manual process" color={GREEN} />
        <MetricCard icon={AlertTriangle} label="Fraud risk alerts" value={stats.fraudAlerts} sub="failed photo / repeat returns" color={RED} />
        <div className="card card-pad" style={{ display: "flex", alignItems: "center" }}>
          <span className="disclaimer">Cost figures are prototype assumptions for illustration — not real financial data.</span>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card card-pad">
          <div className="section-title">Return volume, last 14 days</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={volumeOverTime}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} stroke="var(--muted)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <Tooltip />
              <Bar dataKey="total" fill={BLUE} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card card-pad">
          <div className="section-title">Routing outcome split</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byOutcome} dataKey="value" nameKey="name" innerRadius={38} outerRadius={64} paddingAngle={2}>
                {byOutcome.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card card-pad">
          <div className="section-title">Returns by category</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10.5 }} stroke="var(--muted)" />
              <Tooltip />
              <Bar dataKey="count" fill={BLUE} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card card-pad">
          <div className="section-title">Refund TAT distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byTAT}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10.5 }} stroke="var(--muted)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <Tooltip />
              <Bar dataKey="count" fill={AMBER} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="section-title">Warehouse routing trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={volumeOverTime}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} stroke="var(--muted)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <Tooltip />
              <Bar dataKey="warehouse" fill={RED} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card card-pad">
          <div className="section-title">Risk distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byRisk} dataKey="value" nameKey="name" innerRadius={38} outerRadius={64} paddingAngle={2}>
                {byRisk.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
