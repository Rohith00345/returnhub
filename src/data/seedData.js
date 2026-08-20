// All data on this page is SIMULATED for prototype purposes.
// Nothing here represents a real customer, order, or business outcome.

import { evaluateReturn } from "../utils/decisionEngine";

// deterministic PRNG so the "realistic" dataset is stable across reloads
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1337);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const round2 = (n) => Math.round(n * 100) / 100;

const FIRST_NAMES = [
  "Meera", "Arjun", "Divya", "Kabir", "Priya", "Rohan", "Ananya", "Vikram",
  "Sneha", "Aditya", "Kavya", "Rahul", "Ishita", "Karthik", "Neha", "Siddharth",
  "Pooja", "Manish", "Riya", "Amit", "Tanvi", "Suresh", "Nandini", "Vivek",
  "Shreya", "Gaurav", "Anjali", "Rajesh", "Deepika", "Nikhil",
];
const LAST_NAMES = [
  "Kapoor", "Rao", "Sen", "Malhotra", "Sharma", "Mehta", "Gupta", "Iyer",
  "Verma", "Nair", "Reddy", "Joshi", "Bose", "Chatterjee", "Pillai", "Kulkarni",
  "Agarwal", "Menon", "Bhatt", "Chauhan",
];

const PRODUCTS = [
  { name: "Nike Air Zoom Pegasus 41", category: "Footwear", risk: "LOW", price: 8995 },
  { name: "Sony WH-1000XM5 Headphones", category: "Audio Electronics", risk: "MEDIUM", price: 29990 },
  { name: "Apple MacBook Air M3", category: "Premium Electronics", risk: "HIGH", price: 114900 },
  { name: "Dyson Airwrap Multi-Styler", category: "Beauty Appliances", risk: "MEDIUM", price: 45900 },
  { name: "IKEA MICKE Study Desk", category: "Furniture", risk: "LOW", price: 7990 },
  { name: "Canon EOS R6 Mark II Body", category: "Premium Electronics", risk: "HIGH", price: 215995 },
  { name: "boAt Airdopes 141", category: "Audio Electronics", risk: "LOW", price: 1299 },
  { name: "Fabindia Cotton Kurta", category: "Apparel", risk: "LOW", price: 2499 },
  { name: "Mamaearth Vitamin C Face Wash", category: "Beauty", risk: "LOW", price: 299 },
  { name: "Samsung Galaxy S24", category: "Premium Electronics", risk: "HIGH", price: 79999 },
  { name: "Milton Thermosteel Bottle", category: "Home", risk: "LOW", price: 899 },
  { name: "Prestige Induction Cooktop", category: "Home Appliances", risk: "MEDIUM", price: 3499 },
];

const REASONS = ["DEFECTIVE", "WRONG_ITEM", "SIZE_FIT", "CHANGED_MIND"];

function randomDateWithinDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - randInt(1, days));
  return d;
}

export const CUSTOMERS = Array.from({ length: 60 }, (_, i) => ({
  id: `CUST-${1000 + i}`,
  name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
  trustScore: round2(0.3 + rand() * 0.68),
  previousReturns: randInt(0, 6),
}));

export const ORDERS = [];
{
  let seq = 8000;
  CUSTOMERS.forEach((c) => {
    const n = randInt(1, 5);
    for (let i = 0; i < n; i++) {
      const product = pick(PRODUCTS);
      seq += 1;
      ORDERS.push({
        id: `ORD-${seq}`,
        customerId: c.id,
        product: product.name,
        category: product.category,
        categoryRisk: product.risk,
        value: product.price,
        date: randomDateWithinDays(120),
      });
    }
  });
}

export const RETURNS = [];
{
  let seq = 1000;
  const shuffled = [...ORDERS].sort(() => rand() - 0.5).slice(0, 70);
  shuffled.forEach((order) => {
    const customer = CUSTOMERS.find((c) => c.id === order.customerId);
    const daysSinceDelivery = randInt(1, 25);
    const photoVerification = pick(["PASSED", "PASSED", "PASSED", "PENDING", "FAILED"]);
    const decision = evaluateReturn({
      trustScore: customer.trustScore,
      orderValue: order.value,
      categoryRisk: order.categoryRisk,
      previousReturns: customer.previousReturns,
      photoVerification,
    });
    seq += 1;

    let status = "COMPLETED";
    if (decision.decision === "WAREHOUSE_INSPECTION") status = "PENDING_WAREHOUSE";
    else if (decision.decision === "DOORSTEP_VERIFICATION") status = pick(["PENDING_VERIFICATION", "PENDING_VERIFICATION", "COMPLETED"]);

    RETURNS.push({
      id: `RET-${seq}`,
      customerId: customer.id,
      customerName: customer.name,
      orderId: order.id,
      product: order.product,
      category: order.category,
      categoryRisk: order.categoryRisk,
      orderValue: order.value,
      trustScore: customer.trustScore,
      returnReason: pick(REASONS),
      previousReturns: customer.previousReturns,
      daysSinceDelivery,
      photoVerification,
      riskScore: decision.riskLevel,
      resolutionPath: decision.decision,
      reason: decision.reason,
      refundAmount: decision.refundAmount,
      refundTAT: decision.estimatedTAT,
      warehouseRequired: decision.warehouseRequired,
      status,
      createdAt: randomDateWithinDays(20),
      checklistPassed: status === "COMPLETED",
    });
  });
}

// A handful of customers with fresh, un-returned orders — used to drive the
// interactive "submit a return" demo in the Returns tab.
export const DEMO_CUSTOMER_IDS = CUSTOMERS.slice(0, 4).map((c) => c.id);

export function orderById(id) {
  return ORDERS.find((o) => o.id === id);
}
export function customerById(id) {
  return CUSTOMERS.find((c) => c.id === id);
}

// Generates a standalone batch of synthetic returns for Simulation Mode.
// These are NOT added to the seeded dataset above — they're a self-contained
// "what if" batch so the main dashboards stay stable while this runs.
export function generateSimulatedBatch(count, seed = Date.now()) {
  const r = mulberry32(seed);
  const p = (arr) => arr[Math.floor(r() * arr.length)];
  const ri = (min, max) => Math.floor(r() * (max - min + 1)) + min;

  const batch = [];
  for (let i = 0; i < count; i++) {
    const product = p(PRODUCTS);
    const trustScore = round2(0.3 + r() * 0.68);
    const previousReturns = ri(0, 6);
    const photoVerification = p(["PASSED", "PASSED", "PASSED", "PENDING", "FAILED"]);
    const decision = evaluateReturn({
      trustScore,
      orderValue: product.price,
      categoryRisk: product.risk,
      previousReturns,
      photoVerification,
    });
    batch.push({
      id: `SIM-${i}`,
      product: product.name,
      category: product.category,
      categoryRisk: product.risk,
      orderValue: product.price,
      trustScore,
      previousReturns,
      photoVerification,
      resolutionPath: decision.decision,
      refundAmount: decision.refundAmount,
      refundTAT: decision.estimatedTAT,
      riskScore: decision.riskLevel,
    });
  }
  return batch;
}
