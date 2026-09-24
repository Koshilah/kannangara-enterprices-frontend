import { useEffect, useMemo, useState } from "react";
import {
  deleteDelivery,
  getDeliveries,
  updateDeliveryDueDate,
  updateDeliveryStatus,
} from "../../api/delivery";
import DeliveryReportModal from "../../components/DeliveryReportModal";
import { downloadDeliveryReport } from "../../utility/deliveryReport";

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function dateInputValue(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function statusLabel(status) {
  return statuses.find((item) => item.value === status)?.label || status;
}

function Delivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDeliveries() {
      try {
        const loadedDeliveries = await getDeliveries();
        if (isMounted) setDeliveries(loadedDeliveries);
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError.response?.data?.message ||
              "Unable to load delivery records.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDeliveries();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDeliveries = useMemo(
    () =>
      deliveries.filter((delivery) => {
        const matchesStatus =
          statusFilter === "all" || delivery.status === statusFilter;
        const matchesDueDate =
          !dueDateFilter || dateInputValue(delivery.dueDate) === dueDateFilter;

        return matchesStatus && matchesDueDate;
      }),
    [deliveries, dueDateFilter, statusFilter],
  );

  async function handleStatusChange(deliveryID, status) {
    setBusyId(deliveryID);
    setError("");
    setNotice("");

    try {
      const updatedDelivery = await updateDeliveryStatus(deliveryID, status);
      setDeliveries((currentDeliveries) =>
        currentDeliveries.map((delivery) =>
          delivery._id === deliveryID
            ? { ...delivery, ...updatedDelivery }
            : delivery,
        ),
      );
      setNotice("Delivery status updated.");
    } catch (updateError) {
      setError(
        updateError.response?.data?.message ||
          "Unable to update delivery status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDueDateChange(deliveryID, dueDate) {
    setBusyId(deliveryID);
    setError("");
    setNotice("");

    try {
      const updatedDelivery = await updateDeliveryDueDate(deliveryID, dueDate);
      setDeliveries((currentDeliveries) =>
        currentDeliveries.map((delivery) =>
          delivery._id === deliveryID
            ? { ...delivery, ...updatedDelivery }
            : delivery,
        ),
      );
      setNotice("Delivery due date updated.");
    } catch (updateError) {
      setError(
        updateError.response?.data?.message ||
          "Unable to update delivery due date.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(delivery) {
    if (delivery.status !== "delivered") return;
    if (!window.confirm("Delete this completed delivery?")) return;

    setBusyId(delivery._id);
    setError("");
    setNotice("");

    try {
      await deleteDelivery(delivery._id);
      setDeliveries((currentDeliveries) =>
        currentDeliveries.filter((item) => item._id !== delivery._id),
      );
      setNotice("Completed delivery deleted.");
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message || "Unable to delete delivery.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownloadReport({
    statusFilter: sf,
    fromDate,
    toDate,
    filteredDeliveries: toDownload,
  }) {
    setIsDownloadingReport(true);
    setError("");

    try {
      await downloadDeliveryReport({
        deliveries: toDownload,
        filters: { statusFilter: sf, fromDate, toDate },
      });
      setShowReportModal(false);
      setNotice("Delivery report downloaded successfully.");
    } catch (downloadError) {
      console.error("Delivery report failed", downloadError);
      setError("Unable to generate delivery report. Please try again.");
    } finally {
      setIsDownloadingReport(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* ── Page Header ── */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300"></p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
              Deliveries
            </h1>
            <p className="mt-2 max-w-xl text-sm text-night-sky-200"></p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Showing count badge */}
            <div className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 px-5 py-4 sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-night-sky-200">
                Showing
              </p>
              <p className="mt-1 text-2xl font-extrabold text-night-sky-500">
                {filteredDeliveries.length}
                <span className="ml-1 text-sm font-semibold text-night-sky-200">
                  of {deliveries.length}
                </span>
              </p>
            </div>

            {/* Download Report button */}
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              disabled={isLoading || deliveries.length === 0}
              className="flex items-center gap-2 rounded-xl bg-night-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-night-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
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
              Download Report
            </button>
          </div>
        </header>

        {/* ── Report Filter Modal ── */}
        {showReportModal && (
          <DeliveryReportModal
            onClose={() => setShowReportModal(false)}
            onDownload={handleDownloadReport}
            totalCount={deliveries.length}
            deliveries={deliveries}
            isDownloading={isDownloadingReport}
          />
        )}

        {/* ── Alerts ── */}
        {(error || notice) && (
          <div
            className="rounded-xl border border-night-sky-200/30 bg-night-sky-100/10 px-4 py-3 text-sm text-night-sky-400"
            role="status"
          >
            {error || notice}
          </div>
        )}

        {/* ── Delivery Records Section ── */}
        <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-base font-bold text-night-sky-500">
                Delivery records
              </h2>
              <p className="mt-1 text-xs text-night-sky-200">
                Search by due date or narrow the list by status.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="min-w-48 rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
                >
                  <option value="all">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
                Due date
                <input
                  type="date"
                  value={dueDateFilter}
                  onChange={(event) => setDueDateFilter(event.target.value)}
                  className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-220 border-collapse text-sm">
              <thead>
                <tr className="border-b border-night-sky-100/20 text-left text-xs uppercase tracking-wider text-night-sky-200">
                  <th className="px-3 pb-3 font-bold">Order ID</th>
                  <th className="px-3 pb-3 font-bold">Delivery address</th>
                  <th className="px-3 pb-3 font-bold">Due date</th>
                  <th className="px-3 pb-3 font-bold">Status</th>
                  <th className="px-3 pb-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-3 py-14 text-center text-night-sky-200"
                    >
                      Loading deliveries...
                    </td>
                  </tr>
                ) : filteredDeliveries.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-3 py-14 text-center text-night-sky-200"
                    >
                      No deliveries match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => {
                    const isBusy = busyId === delivery._id;
                    const orderID = delivery.orderID?._id || delivery.orderID;

                    return (
                      <tr
                        key={delivery._id}
                        className="border-b border-night-sky-100/10 align-middle transition hover:bg-night-sky-100/10"
                      >
                        <td className="whitespace-nowrap px-3 py-4 font-mono text-xs font-bold text-night-sky-400">
                          {String(orderID).slice(-10)}
                        </td>
                        <td className="max-w-80 px-3 py-4 font-medium text-night-sky-400">
                          <span className="line-clamp-2">
                            {delivery.deliveryAddress}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-night-sky-300">
                          <input
                            type="date"
                            value={dateInputValue(delivery.dueDate)}
                            onChange={(event) =>
                              handleDueDateChange(
                                delivery._id,
                                event.target.value,
                              )
                            }
                            disabled={isBusy}
                            className="rounded-lg border border-night-sky-100/20 bg-night-sky-100/10 px-2 py-2 text-xs font-semibold text-night-sky-400 outline-none focus:border-night-sky-300 disabled:cursor-wait disabled:opacity-50"
                            aria-label={`Due date for order ${orderID}`}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <label
                            className="sr-only"
                            htmlFor={`status-${delivery._id}`}
                          >
                            Status for order {orderID}
                          </label>
                          <select
                            id={`status-${delivery._id}`}
                            value={delivery.status}
                            onChange={(event) =>
                              handleStatusChange(
                                delivery._id,
                                event.target.value,
                              )
                            }
                            disabled={isBusy}
                            className="rounded-lg border border-night-sky-100/20 bg-night-sky-100/10 px-2 py-2 text-xs font-bold text-night-sky-400 outline-none focus:border-night-sky-300 disabled:cursor-wait disabled:opacity-50"
                          >
                            {statuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(delivery)}
                            disabled={
                              delivery.status !== "delivered" || isBusy
                            }
                            className="inline-flex size-9 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-night-sky-100/20 hover:text-night-sky-500 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Delete delivery for order ${orderID}`}
                            title={
                              delivery.status === "delivered"
                                ? "Delete completed delivery"
                                : `Delivery must be ${statusLabel("delivered").toLowerCase()}`
                            }
                          >
                            <i
                              className="fa-solid fa-trash"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Delivery;
