import React from "react";

export default function MetricCard({ icon: Icon, label, value, sub, color = "#2874f0" }) {
  return (
    <div className="card card-pad">
      <div
        style={{
          width: 30, height: 30, borderRadius: 7, background: `${color}1a`,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
        }}
      >
        <Icon size={15} color={color} aria-hidden="true" />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)" }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
