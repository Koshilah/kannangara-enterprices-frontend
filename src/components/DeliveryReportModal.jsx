import { useEffect, useRef, useState } from "react";

const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function DeliveryReportModal({
  onClose,
  onDownload,
  totalCount = 0,
  deliveries = [],
  isDownloading = false,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const backdropRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);


  const matchedDeliveries = deliveries.filter((d) => {
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const dueDate = d.dueDate
      ? new Date(d.dueDate).toISOString().slice(0, 10)
      : null;
    const matchFrom = !fromDate || (dueDate && dueDate >= fromDate);
    const matchTo = !toDate || (dueDate && dueDate <= toDate);
    return matchStatus && matchFrom && matchTo;
  });

  const matchedCount = matchedDeliveries.length;

  function handleSubmit(e) {
    e.preventDefault();
    if (matchedCount === 0) return;
    onDownload({
      statusFilter,
      fromDate,
      toDate,
      filteredDeliveries: matchedDeliveries,
    });
  }

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-sky-500/40 px-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="report-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-night-sky-100/20 bg-white p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2
              id="report-modal-title"
              className="text-lg font-extrabold text-night-sky-500"
            >
              Download Delivery Report
            </h2>
            <p className="mt-0.5 text-xs text-night-sky-200">
              Apply filters then download a PDF report.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-lg p-1.5 text-night-sky-300 transition hover:bg-night-sky-100/10 hover:text-night-sky-500"
            aria-label="Close"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
            Delivery Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
              Due Date From
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
              Due Date To
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              />
            </label>
          </div>

          {(statusFilter !== "all" || fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setFromDate("");
                setToDate("");
              }}
              className="text-xs font-semibold text-night-sky-300 underline underline-offset-2 transition hover:text-night-sky-500"
            >
              Clear filters
            </button>
          )}

          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
              matchedCount === 0
                ? "border border-red-200 bg-red-50 text-red-600"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <svg
              className="size-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {matchedCount === 0
              ? "No deliveries match the selected filters."
              : `${matchedCount} of ${totalCount} deliveries will be included in the report.`}
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
              disabled={matchedCount === 0 || isDownloading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-night-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-night-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="size-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
