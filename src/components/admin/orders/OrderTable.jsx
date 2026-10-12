import { useNavigate } from "react-router";
import OrderStatusBadge from "./OrderStatusBadge";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function OrderTable({
  orders,
  isLoading,
  busyID,
  onCancel,
  emptyMessage = "No orders found.",
}) {
  const navigate = useNavigate();

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-240 border-collapse text-sm">
        <thead>
          <tr className="border-b border-night-sky-100/20 text-left text-xs uppercase tracking-wider text-night-sky-200">
            <th className="px-3 pb-3 font-bold">Order ID</th>
            <th className="px-3 pb-3 font-bold">Customer</th>
            <th className="px-3 pb-3 font-bold">Ordered date</th>
            <th className="px-3 pb-3 font-bold">Total amount</th>
            <th className="px-3 pb-3 font-bold">Payment</th>
            <th className="px-3 pb-3 font-bold">Payment state</th>
            <th className="px-3 pb-3 font-bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="7" className="px-3 py-14 text-center text-night-sky-200">Loading orders...</td></tr>
          ) : orders.length === 0 ? (
            <tr><td colSpan="7" className="px-3 py-14 text-center text-night-sky-200">{emptyMessage}</td></tr>
          ) : orders.map((order) => {
            const isBusy = busyID === order._id;
            const canCancel = !["cancelled", "delivered"].includes(order.orderStatus);
            return (
              <tr
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="cursor-pointer border-b border-night-sky-100/10 align-middle transition hover:bg-night-sky-100/10"
              >
                <td className="whitespace-nowrap px-3 py-4 font-mono text-xs font-bold text-night-sky-400">{String(order._id).slice(-10)}</td>
                <td className="px-3 py-4 font-bold text-night-sky-400">{order.userID?.name || "Unknown customer"}</td>
                <td className="whitespace-nowrap px-3 py-4 text-night-sky-300">{formatDate(order.dateOrdered)}</td>
                <td className="whitespace-nowrap px-3 py-4 font-bold text-night-sky-400">{formatCurrency(order.orderTotal)}</td>
                <td className="px-3 py-4 capitalize text-night-sky-300">{order.paymentMethod || "-"}</td>
                <td className="px-3 py-4"><OrderStatusBadge value={order.paymentStatus} /></td>
                <td className="px-3 py-4">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onCancel(order); }}
                    disabled={!canCancel || isBusy}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                    title={canCancel ? "Cancel order" : "This order cannot be cancelled"}
                  >
                    {isBusy ? "Cancelling..." : "Cancel"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;
