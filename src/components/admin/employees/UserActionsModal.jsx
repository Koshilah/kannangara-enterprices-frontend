import { useEffect, useState } from "react";

function UserActionsModal({
  employees,
  isDownloading,
  error,
  onClose,
  onDownload,
}) {
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("pdf");

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    onDownload({ userId, startDate, endDate, format });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-sky-500/40 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-night-sky-100/20 bg-white p-5 shadow-2xl md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-actions-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
              Employee activity
            </p>
            <h2
              id="user-actions-title"
              className="mt-2 text-2xl font-extrabold text-night-sky-500"
            >
              User Actions
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-night-sky-100/20 hover:text-night-sky-500"
            aria-label="Close user actions report"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <p
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
            Employee
            <select
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
            >
              <option value="">All employees</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
              Start date
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
              End date
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
            Format
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </label>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-night-sky-100/30 px-5 py-3 text-sm font-bold text-night-sky-400 transition hover:bg-night-sky-100/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDownloading}
              className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-night-sky-400 disabled:cursor-wait disabled:opacity-60"
            >
              {isDownloading ? "Preparing..." : "Download Report"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default UserActionsModal;
