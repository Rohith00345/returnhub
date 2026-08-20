import React, { useState } from "react";
import Navigation from "./components/Navigation";
import Overview from "./components/Overview";
import CustomerPortal from "./components/CustomerPortal";
import Operations from "./components/Operations";
import DecisionEngine from "./components/DecisionEngine";
import AnalyticsPage from "./components/Analytics";
import AgentApp from "./components/AgentApp";
import { RETURNS, DEMO_CUSTOMER_IDS, customerById } from "./data/seedData";
import { evaluateReturn } from "./utils/decisionEngine";

export default function App() {
  const [tab, setTab] = useState("overview");
  const [asUserId, setAsUserId] = useState(DEMO_CUSTOMER_IDS[0]);
  const [liveReturns, setLiveReturns] = useState([]); // returns submitted interactively this session
  const [returns, setReturns] = useState(RETURNS); // seeded dataset, mutated by agent actions

  function handleSubmitReturn(order, reason, setBusy) {
    const customer = customerById(order.customerId);
    const tempId = `RET-LIVE-${Date.now()}`;
    const placeholder = {
      id: tempId,
      customerId: customer.id,
      customerName: customer.name,
      orderId: order.id,
      product: order.product,
      category: order.category,
      categoryRisk: order.categoryRisk,
      orderValue: order.value,
      trustScore: customer.trustScore,
      returnReason: reason,
      previousReturns: customer.previousReturns,
      daysSinceDelivery: 3,
      photoVerification: "PENDING",
      status: "EVALUATING",
      createdAt: new Date(),
    };
    setLiveReturns((rs) => [placeholder, ...rs]);

    setTimeout(() => {
      const decision = evaluateReturn({
        trustScore: customer.trustScore,
        orderValue: order.value,
        categoryRisk: order.categoryRisk,
        previousReturns: customer.previousReturns,
        photoVerification: "PASSED",
      });
      setLiveReturns((rs) =>
        rs.map((r) =>
          r.id === tempId
            ? {
                ...r,
                photoVerification: "PASSED",
                resolutionPath: decision.decision,
                decision: decision.decision,
                reason: decision.reason,
                refundAmount: decision.refundAmount,
                refundTAT: decision.estimatedTAT,
                riskScore: decision.riskLevel,
                status: decision.decision === "WAREHOUSE_INSPECTION" ? "PENDING_WAREHOUSE" : decision.decision === "DOORSTEP_VERIFICATION" ? "PENDING_VERIFICATION" : "COMPLETED",
              }
            : r
        )
      );
      // fold into the ops dataset once resolved, so Operations/Analytics/Risk Engine reflect it
      setReturns((rs) => [
        { ...placeholder, photoVerification: "PASSED", resolutionPath: decision.decision, reason: decision.reason, refundAmount: decision.refundAmount, refundTAT: decision.estimatedTAT, riskScore: decision.riskLevel, status: decision.decision === "WAREHOUSE_INSPECTION" ? "PENDING_WAREHOUSE" : decision.decision === "DOORSTEP_VERIFICATION" ? "PENDING_VERIFICATION" : "COMPLETED" },
        ...rs,
      ]);
      setBusy(false);
    }, 1200);
  }

  function handleAgentApprove(id) {
    setReturns((rs) => rs.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r)));
    setLiveReturns((rs) => rs.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r)));
  }

  function handleAgentEscalate(id) {
    setReturns((rs) => rs.map((r) => (r.id === id ? { ...r, resolutionPath: "WAREHOUSE_INSPECTION", decision: "WAREHOUSE_INSPECTION", status: "PENDING_WAREHOUSE", refundAmount: 0 } : r)));
    setLiveReturns((rs) => rs.map((r) => (r.id === id ? { ...r, resolutionPath: "WAREHOUSE_INSPECTION", decision: "WAREHOUSE_INSPECTION", status: "PENDING_WAREHOUSE", refundAmount: 0 } : r)));
  }

  const myReturns = liveReturns.filter((r) => r.customerId === asUserId);
  const doorstepQueue = returns.filter((r) => r.resolutionPath === "DOORSTEP_VERIFICATION" && r.status === "PENDING_VERIFICATION");

  return (
    <div className="app-shell">
      <Navigation tab={tab} onTabChange={setTab} asUserId={asUserId} onUserChange={setAsUserId} />
      <div className="page">
        {tab === "overview" && <Overview returns={returns} />}
        {tab === "returns" && (
          <CustomerPortal asUserId={asUserId} myReturns={myReturns} onSubmitReturn={handleSubmitReturn} />
        )}
        {tab === "operations" && (
          <>
            <AgentApp queue={doorstepQueue} onApprove={handleAgentApprove} onEscalate={handleAgentEscalate} />
            <div style={{ marginTop: 24 }}>
              <Operations returns={returns} />
            </div>
          </>
        )}
        {tab === "risk-engine" && <DecisionEngine returns={returns} />}
        {tab === "analytics" && <AnalyticsPage returns={returns} />}
      </div>
    </div>
  );
}
