import { useState, useEffect } from "react";
import { getMyOrders, cancelOrder } from "../api/order";
import { downloadReceipt } from "../utility/receipt";
import { downloadOrderHistoryReport } from "../utility/orderHistoryReport";
import OrderCard from "../components/OrderCard";


function EmptyOrders() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-night-sky-100/20 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <svg
          className="size-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-base font-bold text-night-sky-500">
          No orders yet
        </h3>
        <p className="mt-1 text-sm text-night-sky-100">
          Your placed orders will appear here once you make a purchase.
        </p>
      </div>
      <a
        href="/"
        className="rounded-xl bg-night-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-night-sky-400 active:scale-98"
      >
        Start Shopping
      </a>
    </div>
  );
}


function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-night-sky-100/20 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-3 w-28 rounded bg-slate-100" />
        </div>
        <div className="h-4 w-24 rounded bg-slate-200" />
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancellingID, setCancellingID] = useState(null);
  const [downloadingReceiptID, setDownloadingReceiptID] = useState(null);
  const [isDownloadingHistory, setIsDownloadingHistory] = useState(false);

  // Filter state
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const data = await getMyOrders();
        if (isMounted) setOrders(data);
      } catch (err) {
        if (isMounted)
          setError(
            err.response?.data?.message || "Unable to load your orders.",
          );
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
    if (
      !window.confirm(
        `Cancel order #${String(order._id).slice(-10).toUpperCase()}? This cannot be undone.`,
      )
    )
      return;

    setCancellingID(order._id);
    setError("");
    setNotice("");

    try {
      const updated = await cancelOrder(order._id);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                ...updated.order,
                deliveryStatus: updated.delivery?.status || "cancelled",
              }
            : o,
        ),
      );
      setNotice("Order cancelled successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel order.");
    } finally {
      setCancellingID(null);
    }
  }

  async function handleDownloadReceipt(order) {
    setDownloadingReceiptID(order._id);
    setError("");

    try {
      await downloadReceipt(order);
      setNotice("Receipt downloaded successfully.");
    } catch (downloadError) {
      console.error("Receipt download failed", downloadError);
      setError("Unable to download the receipt. Please try again.");
    } finally {
      setDownloadingReceiptID(null);
    }
  }

  async function handleDownloadOrderHistory() {
    if (!orders || orders.length === 0) return;

    setIsDownloadingHistory(true);
    setError("");

    try {
      let user = null;
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          user = JSON.parse(storedUser);
        }
      } catch (parseErr) {
        console.error("Failed to parse user from localStorage", parseErr);
      }

      await downloadOrderHistoryReport({ orders, user });
      setNotice("Order history report downloaded successfully.");
    } catch (downloadError) {
      console.error("Order history download failed", downloadError);
      setError("Unable to generate order history report. Please try again.");
    } finally {
      setIsDownloadingHistory(false);
    }
  }

  const FILTER_TABS = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const visibleOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (o) => String(o.orderStatus || "").toLowerCase() === filter,
        );

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-slate-50 text-night-sky-500 antialiased">
      <title>My Orders | Kannangara Hardwares</title>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-12">
        <header className="mb-8 rounded-2xl border border-night-sky-100/20 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-night-sky-500 sm:text-3xl">
                My Orders
              </h1>
              <p className="mt-1 text-sm text-night-sky-100">
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5">
                <svg
                  className="size-5 text-night-sky-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-sm font-bold text-night-sky-500">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDownloadOrderHistory}
                disabled={isDownloadingHistory || isLoading || orders.length === 0}
                className="flex items-center gap-2 rounded-xl bg-night-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-night-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDownloadingHistory ? (
                  <>
                    <svg
                      className="size-4 animate-spin text-white"
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
                    <span>Generating Report...</span>
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
                    <span>Download My Order History</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Alerts ── */}
        {notice && (
          <div
            role="status"
            className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-medium text-emerald-800 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="size-5 shrink-0 text-emerald-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="text-emerald-600 hover:text-emerald-800"
              aria-label="Dismiss"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-medium text-red-800 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="size-5 shrink-0 text-red-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800"
              aria-label="Dismiss"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!isLoading && orders.length > 0 && (
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`shrink-0 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                  filter === tab.key
                    ? "bg-night-sky-500 text-white shadow-xs"
                    : "border border-night-sky-100/20 bg-white text-night-sky-300 hover:bg-night-sky-100/10"
                }`}
              >
                {tab.label}
                {tab.key !== "all" && (
                  <span className="ml-1.5 opacity-70">
                    (
                    {
                      orders.filter(
                        (o) =>
                          String(o.orderStatus || "").toLowerCase() === tab.key,
                      ).length
                    }
                    )
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Order list ── */}
        <section className="space-y-4">
          {isLoading ? (
            <>
              <OrderSkeleton />
              <OrderSkeleton />
              <OrderSkeleton />
            </>
          ) : visibleOrders.length === 0 && orders.length > 0 ? (
            <div className="rounded-2xl border border-night-sky-100/20 bg-white px-6 py-10 text-center text-sm text-night-sky-200 shadow-sm">
              No orders match the selected filter.
            </div>
          ) : visibleOrders.length === 0 ? (
            <EmptyOrders />
          ) : (
            // Sort newest first
            [...visibleOrders]
              .sort((a, b) => new Date(b.dateOrdered) - new Date(a.dateOrdered))
              .map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancel={handleCancel}
                  isCancelling={cancellingID === order._id}
                  onDownload={handleDownloadReceipt}
                  isDownloading={downloadingReceiptID === order._id}
                />
              ))
          )}
        </section>
      </main>
    </div>
  );
}

export default MyOrders;
