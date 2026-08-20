import React, { useState } from "react";
import { Package, LayoutDashboard, Truck, ShieldCheck, BarChart3, ChevronDown } from "lucide-react";
import { CUSTOMERS, DEMO_CUSTOMER_IDS } from "../data/seedData";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "returns", label: "Returns", icon: Package },
  { id: "operations", label: "Operations", icon: Truck },
  { id: "risk-engine", label: "Risk Engine", icon: ShieldCheck },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function Navigation({ tab, onTabChange, asUserId, onUserChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const demoCustomers = CUSTOMERS.filter((c) => DEMO_CUSTOMER_IDS.includes(c.id));
  const current = demoCustomers.find((c) => c.id === asUserId) || demoCustomers[0];

  return (
    <div className="topnav">
      <div className="topnav-inner">
        <div className="topnav-row">
          <div className="brand">
            <div className="brand-mark">
              <Package size={17} color="#fff" />
            </div>
            <div>
              <div className="brand-name">ReturnHub</div>
              <div className="brand-tag">INTELLIGENT RETURN RESOLUTION</div>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <button className="account-btn" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="true" aria-expanded={menuOpen}>
              Viewing as {current.name.split(" ")[0]} <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                style={{
                  position: "absolute", right: 0, top: 28, background: "#fff", borderRadius: 8,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.18)", width: 220, overflow: "hidden", zIndex: 10,
                }}
              >
                {demoCustomers.map((c) => (
                  <button
                    key={c.id}
                    role="menuitem"
                    onClick={() => { onUserChange(c.id); setMenuOpen(false); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "9px 12px",
                      border: "none", background: c.id === asUserId ? "#eaf1fe" : "#fff", cursor: "pointer", fontSize: 12.5,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ color: "#6e6e6e", fontSize: 10.5 }}>customer account</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="nav-pills" aria-label="Main">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-pill${tab === t.id ? " active" : ""}`}
              onClick={() => onTabChange(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
            >
              <t.icon size={15} aria-hidden="true" /> {t.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
