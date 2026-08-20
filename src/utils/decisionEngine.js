// Rule-based return decision engine.
//
// This is intentionally NOT machine learning. It is a small, explainable
// set of thresholds so every decision can be traced back to a plain-English
// reason. ML-based risk scoring is a roadmap item (see Overview), not part
// of this MVP.

export const DECISIONS = {
  INSTANT_REFUND: "INSTANT_REFUND",
  DOORSTEP_VERIFICATION: "DOORSTEP_VERIFICATION",
  WAREHOUSE_INSPECTION: "WAREHOUSE_INSPECTION",
};

export const DECISION_LABELS = {
  INSTANT_REFUND: "Instant refund",
  DOORSTEP_VERIFICATION: "Doorstep verification",
  WAREHOUSE_INSPECTION: "Warehouse inspection",
};

// Thresholds live in one place so they're easy to point to in an interview
// and easy to A/B test later.
const THRESHOLDS = {
  instantTrust: 0.8,
  instantMaxValue: 5000, // ₹
  doorstepTrust: 0.5,
  doorstepMaxValue: 20000, // ₹
  maxPreviousReturns: 4,
};

const TAT_HOURS = {
  INSTANT_REFUND: 0.05, // ~3 minutes
  DOORSTEP_VERIFICATION: 48,
  WAREHOUSE_INSPECTION: 120,
};

/**
 * evaluateReturn(returnData) -> {
 *   decision, reason, refundAmount, estimatedTAT, warehouseRequired, riskLevel
 * }
 *
 * returnData: {
 *   trustScore: 0-1,
 *   orderValue: number (₹),
 *   categoryRisk: 'LOW' | 'MEDIUM' | 'HIGH',
 *   previousReturns: number,
 *   photoVerification: 'PASSED' | 'PENDING' | 'FAILED',
 * }
 */
export function evaluateReturn(returnData) {
  const {
    trustScore,
    orderValue,
    categoryRisk,
    previousReturns = 0,
    photoVerification = "PENDING",
  } = returnData;

  if (photoVerification === "FAILED") {
    return build(DECISIONS.WAREHOUSE_INSPECTION, orderValue, "HIGH", [
      "Photo evidence did not match the listed item",
    ]);
  }

  if (previousReturns >= THRESHOLDS.maxPreviousReturns) {
    return build(DECISIONS.WAREHOUSE_INSPECTION, orderValue, "HIGH", [
      `${previousReturns} previous returns on this account`,
    ]);
  }

  if (
    trustScore >= THRESHOLDS.instantTrust &&
    orderValue < THRESHOLDS.instantMaxValue &&
    categoryRisk !== "HIGH"
  ) {
    return build(DECISIONS.INSTANT_REFUND, orderValue, "LOW", [
      "High-trust customer",
      `Order value under ${fmt(THRESHOLDS.instantMaxValue)}`,
      `${categoryRisk.toLowerCase()}-risk category`,
    ]);
  }

  if (
    trustScore >= THRESHOLDS.doorstepTrust &&
    orderValue < THRESHOLDS.doorstepMaxValue &&
    categoryRisk !== "HIGH"
  ) {
    return build(DECISIONS.DOORSTEP_VERIFICATION, orderValue, "MEDIUM", [
      "Moderate trust or order value",
      "An agent can confirm item condition at pickup",
    ]);
  }

  const reasons = [];
  if (orderValue >= THRESHOLDS.doorstepMaxValue) reasons.push(`Order value at or above ${fmt(THRESHOLDS.doorstepMaxValue)}`);
  if (categoryRisk === "HIGH") reasons.push("High-risk category");
  if (trustScore < THRESHOLDS.doorstepTrust) reasons.push("Lower trust signal on this account");
  if (reasons.length === 0) reasons.push("Combined signals fall outside the automated approval range");

  return build(DECISIONS.WAREHOUSE_INSPECTION, orderValue, "HIGH", reasons);
}

function build(decision, orderValue, riskLevel, reasons) {
  const warehouseRequired = decision === DECISIONS.WAREHOUSE_INSPECTION;
  return {
    decision,
    reason: reasons.join(" · "),
    refundAmount: warehouseRequired ? 0 : Math.round(orderValue),
    estimatedTAT: TAT_HOURS[decision],
    warehouseRequired,
    riskLevel,
  };
}

export function formatTAT(hours) {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${Math.round(hours)} hr`;
  return `${(hours / 24).toFixed(1)} days`;
}

function fmt(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}
