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

function DetailItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-night-sky-200">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-night-sky-400">
        {children || "-"}
      </dd>
    </div>
  );
}

function OrderDetailsPanel({
  order,
  delivery,
  isUpdatingPayment = false,
  onPaymentStatusChange,
}) {
  const isPendingCashPickup =
    order.orderType === "pickup" &&
    order.paymentStatus === "pending" &&
    order.paymentMethod?.toLowerCase().includes("cash");

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
        <h2 className="text-base font-bold text-night-sky-500">
          Customer and payment
        </h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Customer">{order.userID?.name}</DetailItem>
          <DetailItem label="Email">{order.userID?.email}</DetailItem>
          <DetailItem label="Ordered date">
            {formatDate(order.dateOrdered)}
          </DetailItem>
          <DetailItem label="Payment method">{order.paymentMethod}</DetailItem>
          <DetailItem label="Payment state">
            <OrderStatusBadge value={order.paymentStatus} />
          </DetailItem>
          <DetailItem label="Order state">
            <OrderStatusBadge value={order.orderStatus} />
          </DetailItem>
          <DetailItem label="Total amount">
            {formatCurrency(order.orderTotal)}
          </DetailItem>
          <DetailItem label="Payment ID">
            {order.paymentID || "Not available"}
          </DetailItem>
        </dl>
        {isPendingCashPickup && (
          <button
            type="button"
            onClick={() => onPaymentStatusChange?.("paid")}
            disabled={isUpdatingPayment}
            className="mt-5 rounded-lg bg-night-sky-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-night-sky-400 disabled:cursor-wait disabled:opacity-50"
          >
            {isUpdatingPayment
              ? "Updating payment..."
              : "Mark pickup cash as collected"}
          </button>
        )}
      </section>

      <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-base font-bold text-night-sky-500">
              Delivery details
            </h2>
            <p className="mt-1 text-sm text-night-sky-300">
              {order.deliveryAddress ||
                delivery?.deliveryAddress ||
                "No address provided"}
            </p>
          </div>
          <OrderStatusBadge value={delivery?.status} />
        </div>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailItem label="Due delivery date">
            {formatDate(delivery?.dueDate)}
          </DetailItem>
          <DetailItem label="Delivery status">
            <OrderStatusBadge value={delivery?.status} />
          </DetailItem>
        </dl>
      </section>

      <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
        <h2 className="text-base font-bold text-night-sky-500">
          Ordered items
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-140 border-collapse text-sm">
            <thead>
              <tr className="border-b border-night-sky-100/20 text-left text-xs uppercase tracking-wider text-night-sky-200">
                <th className="px-3 pb-3 font-bold">Item</th>
                <th className="px-3 pb-3 text-right font-bold">Unit price</th>
                <th className="px-3 pb-3 text-right font-bold">Quantity</th>
                <th className="px-3 pb-3 text-right font-bold">Line total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr
                  key={`${item.productID}-${item.title}`}
                  className="border-b border-night-sky-100/10"
                >
                  <td className="px-3 py-4 font-bold text-night-sky-400">
                    {item.title}
                  </td>
                  <td className="px-3 py-4 text-right text-night-sky-300">
                    {formatCurrency(item.priceSingle)}
                  </td>
                  <td className="px-3 py-4 text-right text-night-sky-300">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-4 text-right font-bold text-night-sky-400">
                    {formatCurrency(item.priceTotal)}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan="3"
                  className="px-3 pt-5 text-right text-sm font-bold text-night-sky-300"
                >
                  Total
                </td>
                <td className="px-3 pt-5 text-right text-base font-extrabold text-night-sky-500">
                  {formatCurrency(order.orderTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default OrderDetailsPanel;
