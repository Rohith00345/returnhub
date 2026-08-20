export function formatINR(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatReason(reason) {
  return reason.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
