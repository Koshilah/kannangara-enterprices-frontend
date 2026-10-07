import { useState } from "react";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  paid: "Paid",
  unpaid: "Unpaid",
  successful: "Successful",
  unknown: "Unknown",
};

function StatusBadge({ value }) {
  const key = String(value || "unknown").toLowerCase();
  const label = STATUS_LABELS[key] || value || "Unknown";

  const colourMap = {
    cancelled: "border-red-200 bg-red-50 text-red-700",
    delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
    paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
    successful: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const colour =
    colourMap[key] || "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${colour}`}
    >
      {label}
    </span>
  );
}

const DELIVERY_STEPS = ["pending", "processing", "shipped", "delivered"];

function DeliveryTracker({ status }) {
  const rawStatus = String(status || "").toLowerCase();
  const normalised = rawStatus === "out_for_delivery" ? "shipped" : rawStatus;
  const isCancelled = normalised === "cancelled";

  if (isCancelled) {
    return (
      <p className="text-xs font-semibold text-red-600">Delivery cancelled</p>
    );
  }

  const currentIndex = DELIVERY_STEPS.indexOf(normalised);

  return (
    <div className="flex items-center gap-0" aria-label="Delivery progress">
      {DELIVERY_STEPS.map((step, i) => {
        const isCompleted = currentIndex >= i;
        const isCurrent = currentIndex === i;
        const isLast = i === DELIVERY_STEPS.length - 1;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isCompleted
                    ? isCurrent
                      ? "bg-night-sky-500 text-white ring-2 ring-night-sky-200"
                      : "bg-night-sky-400 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <svg
                    className="size-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] font-semibold capitalize ${isCompleted ? "text-night-sky-500" : "text-slate-400"}`}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mb-4 h-0.5 w-8 ${isCompleted && currentIndex > i ? "bg-night-sky-400" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailChip({ label, value, children }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-night-sky-200">
        {label}
      </dt>
      <dd className="mt-1 text-xs font-semibold text-night-sky-400">
        {children || value || "—"}
      </dd>
    </div>
  );
}

function OrderCard({
  order,
  onCancel,
  isCancelling,
  onDownload,
  isDownloading,
}) {
  const [expanded, setExpanded] = useState(false);

  const orderID = order._id || order.id || "";
  const shortID = String(orderID).slice(-10).toUpperCase();
  const canCancel =
    !isCancelling &&
    ["pending", "processing", "successful"].includes(
      String(order.orderStatus || "").toLowerCase(),
    );

  return (
    <article className="overflow-hidden rounded-2xl border border-night-sky-100/20 bg-white shadow-sm transition hover:shadow-md">
      {/* Summary row */}
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: order id + date */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-night-sky-500">
              #{shortID}
            </span>
            <StatusBadge value={order.orderStatus} />
            <StatusBadge value={order.paymentStatus} />
          </div>
          <p className="mt-1 text-xs text-night-sky-100">
            Placed on {formatDate(order.dateOrdered)}
            {order.paymentMethod && ` · ${order.paymentMethod}`}
          </p>
        </div>

        {/* Right: total + actions */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-base font-extrabold text-night-sky-500">
            {formatCurrency(order.orderTotal)}
          </span>
          <button
            type="button"
            onClick={() => onDownload(order)}
            disabled={isDownloading}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-50"
          >
            {isDownloading ? "Preparing..." : "Receipt"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-night-sky-100/30 px-3.5 py-1.5 text-xs font-bold text-night-sky-400 transition hover:bg-night-sky-100/10"
            aria-expanded={expanded}
          >
            {expanded ? "Hide" : "Details"}
            <svg
              className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(order)}
              disabled={isCancelling}
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-night-sky-100/15 px-6 pb-6 pt-5 space-y-6">
          {/* Delivery tracker */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-night-sky-300">
              Delivery Progress
            </h3>
            <DeliveryTracker
              status={order.deliveryStatus || order.orderStatus}
            />
            {order.deliveryAddress && (
              <p className="mt-3 flex items-start gap-1.5 text-xs text-night-sky-200">
                <svg
                  className="mt-0.5 size-3.5 shrink-0 text-night-sky-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {order.deliveryAddress}
              </p>
            )}
          </div>

          {/* Payment info */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 px-5 py-4 sm:grid-cols-4">
            <DetailChip label="Payment Method" value={order.paymentMethod} />
            <DetailChip label="Payment Status">
              <StatusBadge value={order.paymentStatus} />
            </DetailChip>
            <DetailChip label="Order Status">
              <StatusBadge value={order.orderStatus} />
            </DetailChip>
            {order.paymentID && (
              <DetailChip label="Payment ID">
                <span className="font-mono text-xs">{order.paymentID}</span>
              </DetailChip>
            )}
          </div>

          {/* Items table */}
          {(order.items || []).length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-night-sky-300">
                Items Ordered
              </h3>
              <div className="overflow-x-auto rounded-xl border border-night-sky-100/20">
                <table className="w-full min-w-100 border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-night-sky-100/20 bg-slate-50 text-left text-xs uppercase tracking-wider text-night-sky-200">
                      <th className="px-4 py-3 font-bold">Product</th>
                      <th className="px-4 py-3 text-right font-bold">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right font-bold">Qty</th>
                      <th className="px-4 py-3 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item, idx) => (
                      <tr
                        key={item.productID || idx}
                        className="border-b border-night-sky-100/10 last:border-none"
                      >
                        <td className="flex items-center gap-3 px-4 py-3">
                          {item.imageURL && (
                            <img
                              src={item.imageURL}
                              alt=""
                              className="size-10 rounded-lg object-contain"
                            />
                          )}
                          <span className="font-semibold text-night-sky-500">
                            {item.title || "Product"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-night-sky-300">
                          {formatCurrency(item.priceSingle)}
                        </td>
                        <td className="px-4 py-3 text-right text-night-sky-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-night-sky-500">
                          {formatCurrency(item.priceTotal)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 pt-4 text-right text-xs font-bold uppercase tracking-wider text-night-sky-300"
                      >
                        Order Total
                      </td>
                      <td className="px-4 pt-4 text-right text-base font-extrabold text-night-sky-500">
                        {formatCurrency(order.orderTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default OrderCard;
