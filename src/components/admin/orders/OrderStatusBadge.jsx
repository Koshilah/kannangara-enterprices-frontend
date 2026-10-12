const labels = {
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  paid: "Paid",
  unpaid: "Unpaid",
};

function OrderStatusBadge({ value }) {
  const normalizedValue = String(value || "unknown").toLowerCase();
  const isCancelled = normalizedValue === "cancelled";
  const isPositive = ["paid", "completed"].includes(
    normalizedValue,
  );
  const className = isCancelled
    ? "border-red-200 bg-red-50 text-red-700"
    : isPositive
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}
    >
      {labels[normalizedValue] || value || "Unknown"}
    </span>
  );
}

export default OrderStatusBadge;
