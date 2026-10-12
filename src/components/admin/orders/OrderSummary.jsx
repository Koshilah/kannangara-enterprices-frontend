function OrderSummary({ count, total, pending }) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 px-5 py-4 sm:text-right">
        <p className="text-xs font-semibold uppercase tracking-wider text-night-sky-200">
          Orders
        </p>
        <p className="mt-1 text-2xl font-extrabold text-night-sky-500">
          {count}
          {count !== total && (
            <span className="ml-1 text-base font-semibold text-night-sky-200">
              / {total}
            </span>
          )}
          <span className="ml-2 text-sm font-semibold text-night-sky-200">
            {count === 1 ? "record" : "records"}
          </span>
        </p>
      </div>
      <div className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 px-5 py-4 sm:text-right">
        <p className="text-xs font-semibold uppercase tracking-wider text-night-sky-200">
          Pending orders
        </p>
        <p className="mt-1 text-2xl font-extrabold text-night-sky-500">
          {pending}
          <span className="ml-2 text-sm font-semibold text-night-sky-200">
            {pending === 1 ? "order" : "orders"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default OrderSummary;
