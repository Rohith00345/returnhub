import React, { useState } from "react";
import { Camera } from "lucide-react";
import { ORDERS } from "../data/seedData";
import { formatINR, formatDate, formatReason } from "../utils/format";
import StatusBadge from "./StatusBadge";
import Stepper from "./Stepper";
import DecisionCard from "./DecisionCard";

const REASONS = ["DEFECTIVE", "WRONG_ITEM", "SIZE_FIT", "CHANGED_MIND"];

const STAGES = ["Return requested", "Eligibility checked", "Verification", "Pickup", "Refund"];

function stageIndex(r) {
  if (!r || r.status === "EVALUATING") return 1;
  if (r.decision === "INSTANT_REFUND") return 4;
  if (r.decision === "DOORSTEP_VERIFICATION") return r.status === "COMPLETED" ? 4 : 2;
  if (r.decision === "WAREHOUSE_INSPECTION") return 3;
  return 0;
}

export default function CustomerPortal({ asUserId, myReturns, onSubmitReturn }) {
  const [openOrder, setOpenOrder] = useState(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [busy, setBusy] = useState(false);

  const myOrders = ORDERS.filter((o) => o.customerId === asUserId);
  const returnedOrderIds = new Set(myReturns.map((r) => r.orderId));

  function handleSubmit(order) {
    setBusy(true);
    setOpenOrder(null);
    onSubmitReturn(order, reason, setBusy);
  }

  return (
    <div className="grid-2">
      <div>
        <div className="section-title">Your orders</div>
        {myOrders.map((o) => {
          const returned = returnedOrderIds.has(o.id);
          return (
            <div key={o.id} className="card card-pad" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.product}</div>
                  <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>
                    {o.id} · delivered {formatDate(o.date)}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{formatINR(o.value)}</div>
              </div>

              <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                {returned ? (
                  <span className="faint" style={{ fontSize: 11.5, fontWeight: 600 }}>Return filed for this order</span>
                ) : (
                  <button
                    className="btn btn-outline"
                    onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)}
                  >
                    Return or replace
                  </button>
                )}
              </div>

              {openOrder === o.id && (
                <div style={{ marginTop: 12, borderTop: "1px dashed var(--border)", paddingTop: 12 }}>
                  <div className="muted" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 7 }}>
                    Why are you returning this?
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {REASONS.map((r) => (
                      <button
                        key={r}
                        className={`chip${reason === r ? " selected" : ""}`}
                        onClick={() => setReason(r)}
                      >
                        {formatReason(r)}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="muted" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 }}>
                      <Camera size={13} aria-hidden="true" /> Photo attached
                    </span>
                    <button className="btn btn-primary" disabled={busy} onClick={() => handleSubmit(o)}>
                      Submit return
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {myOrders.length === 0 && <div className="card empty">No orders on this account yet.</div>}
      </div>

      <div>
        <div className="section-title">Track your returns</div>
        {myReturns.length === 0 && <div className="card empty">No returns filed yet.</div>}
        {myReturns.map((r) => {
          const order = ORDERS.find((o) => o.id === r.orderId);
          const evaluating = r.status === "EVALUATING";
          return (
            <div key={r.id} className="card card-pad" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{order?.product}</div>
                {!evaluating && <StatusBadge status={r.decision} />}
              </div>
              <div className="faint" style={{ fontSize: 11, marginTop: 2 }}>
                {r.orderId} · {formatReason(r.returnReason)}
              </div>

              <Stepper stages={STAGES} activeIndex={stageIndex(r)} />

              {evaluating ? (
                <div className="muted" style={{ fontSize: 12, fontStyle: "italic" }}>
                  Checking eligibility for this return…
                </div>
              ) : (
                <DecisionCard
                  decision={r.decision}
                  refundAmount={r.refundAmount}
                  reason={r.reason}
                  signals={[
                    ["Order value", formatINR(r.orderValue)],
                    ["Category", r.category],
                    ["Days since delivery", r.daysSinceDelivery],
                  ]}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
