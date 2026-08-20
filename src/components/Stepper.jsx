import React from "react";
import { Check, Clock } from "lucide-react";

export default function Stepper({ stages, activeIndex, tone = "#2874f0" }) {
  return (
    <div className="stepper">
      {stages.map((s, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        const color = current ? tone : done ? "#1e7a3a" : "#e0e2e6";
        return (
          <React.Fragment key={s}>
            <div className="stepper-seg">
              <div
                className="stepper-dot"
                style={{ borderColor: color, background: done ? "#1e7a3a" : current ? tone : "#fff" }}
              >
                {done ? <Check size={12} color="#fff" /> : current ? <Clock size={11} color="#fff" /> : null}
              </div>
              <div className="stepper-label" style={{ color: done || current ? "var(--text)" : "var(--faint)" }}>
                {s}
              </div>
            </div>
            {i < stages.length - 1 && (
              <div className="stepper-line" style={{ background: i < activeIndex ? "#1e7a3a" : "var(--border)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
