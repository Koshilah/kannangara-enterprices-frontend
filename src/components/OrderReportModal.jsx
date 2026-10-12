import { useEffect, useRef, useState } from "react";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function orderMonth(order) {
  const value = order.dateOrdered || order.createdAt;
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 7);
}

export default function OrderReportModal({
  onClose,
  onDownload,
  totalCount = 0,
  orders = [],
  isDownloading = false,
}) {
  const [month, setMonth] = useState(currentMonth);
  const backdropRef = useRef(null);
  const matchedOrders = orders.filter((order) => orderMonth(order) === month);

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    if (matchedOrders.length === 0) return;
    onDownload({ month, filteredOrders: matchedOrders });
  }

  function handleBackdropClick(event) {
    if (event.target === backdropRef.current) onClose();
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-sky-500/40 px-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="order-report-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-night-sky-100/20 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2
              id="order-report-modal-title"
              className="text-lg font-extrabold text-night-sky-500"
            >
              Download Order Report
            </h2>
            <p className="mt-0.5 text-xs text-night-sky-200">
              Select a month to download all orders recorded during it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-lg p-1.5 text-night-sky-300 transition hover:bg-night-sky-100/10 hover:text-night-sky-500"
            aria-label="Close"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
            Order month
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              required
            />
          </label>

          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              matchedOrders.length === 0
                ? "border border-red-200 bg-red-50 text-red-600"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {matchedOrders.length === 0
              ? "No orders match the selected month."
              : `${matchedOrders.length} of ${totalCount} orders will be included in the report.`}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-night-sky-100/30 px-4 py-2.5 text-sm font-bold text-night-sky-400 transition hover:bg-night-sky-100/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={matchedOrders.length === 0 || isDownloading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-night-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-night-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
