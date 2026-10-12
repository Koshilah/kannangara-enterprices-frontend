import { useEffect, useMemo, useState } from "react";
import { cancelOrder, getOrders } from "../../api/order";
import OrderReportModal from "../../components/OrderReportModal";
import OrderSummary from "../../components/admin/orders/OrderSummary";
import OrderTable from "../../components/admin/orders/OrderTable";
import { downloadAdminOrderReport } from "../../utility/adminOrderReport";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "successful", label: "Successful" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "successful", label: "Successful" },
];

function Order() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyID, setBusyID] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        [
          order._id,
          order.userID?.name,
          order.paymentMethod,
          order.paymentID,
        ].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        order.paymentStatus === paymentStatusFilter;
      const orderedDate = order.dateOrdered
        ? new Date(order.dateOrdered).toISOString().slice(0, 10)
        : "";
      const matchesFromDate = !fromDate || orderedDate >= fromDate;
      const matchesToDate = !toDate || orderedDate <= toDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [orders, searchTerm, statusFilter, paymentStatusFilter, fromDate, toDate]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    Boolean(fromDate) ||
    Boolean(toDate);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const loadedOrders = await getOrders();
        if (isMounted) setOrders(loadedOrders);
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError.response?.data?.message || "Unable to load orders.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCancel(order) {
    if (!window.confirm(`Cancel order ${String(order._id).slice(-10)}?`))
      return;

    setBusyID(order._id);
    setError("");
    setNotice("");

    try {
      const updated = await cancelOrder(order._id);
      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item._id === order._id ? { ...item, ...updated.order } : item,
        ),
      );
      setNotice("Order cancelled successfully.");
    } catch (cancelError) {
      setError(
        cancelError.response?.data?.message || "Unable to cancel order.",
      );
    } finally {
      setBusyID(null);
    }

  }

  async function handleDownloadReport({ month, filteredOrders }) {
    setIsDownloadingReport(true);
    setError("");

    try {
      await downloadAdminOrderReport({ orders: filteredOrders, month });
      setShowReportModal(false);
      setNotice("Order report downloaded successfully.");
    } catch (downloadError) {
      console.error("Order report failed", downloadError);
      setError("Unable to generate the order report. Please try again.");
    } finally {
      setIsDownloadingReport(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <title>Orders | Kannangara Hardwares</title>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
              Orders
            </h1>
            <p className="mt-2 max-w-xl text-sm text-night-sky-200">
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OrderSummary count={filteredOrders.length} total={orders.length} />
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              disabled={isLoading || orders.length === 0 || isDownloadingReport}
              className="flex items-center gap-2 rounded-xl bg-night-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-night-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
              {isDownloadingReport ? "Preparing report..." : "Download report"}
            </button>
          </div>
        </header>

        {(error || notice) && (
          <div
            className="rounded-xl border border-night-sky-200/30 bg-night-sky-100/10 px-4 py-3 text-sm text-night-sky-400"
            role="status"
          >
            {error || notice}
          </div>
        )}

        <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
          <div>
            <h2 className="text-base font-bold text-night-sky-500">
              All orders
            </h2>
            <p className="mt-1 text-xs text-night-sky-200">
              Select an order row to view its customer, items, payment, and
              delivery details.
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
              Search orders
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Order ID, customer, or payment"
                className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
              Order status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              >
                <option value="all">All statuses</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
              Payment status
              <select
                value={paymentStatusFilter}
                onChange={(event) =>
                  setPaymentStatusFilter(event.target.value)
                }
                className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              >
                <option value="all">All payment statuses</option>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
              Ordered from
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-night-sky-300">
              Ordered to
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
              />
            </label>
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPaymentStatusFilter("all");
                    setFromDate("");
                    setToDate("");
                  }}
                  className="text-xs font-semibold text-night-sky-300 underline underline-offset-2 transition hover:text-night-sky-500"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <OrderTable
            orders={filteredOrders}
            isLoading={isLoading}
            busyID={busyID}
            onCancel={handleCancel}
            emptyMessage={
              hasActiveFilters
                ? "No orders match the selected filters."
                : "No orders found."
            }
          />
        </section>
      </div>
      {showReportModal && (
        <OrderReportModal
          onClose={() => setShowReportModal(false)}
          onDownload={handleDownloadReport}
          totalCount={orders.length}
          orders={orders}
          isDownloading={isDownloadingReport}
        />
      )}
    </main>
  );
}

export default Order;
