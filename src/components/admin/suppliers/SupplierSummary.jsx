function SupplierSummary({ count, isFiltered }) {
  return (
    <div className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 px-5 py-4 sm:text-right">
      <p className="text-xs font-semibold uppercase tracking-wider text-night-sky-200">
        Supplier network
      </p>
      <p className="mt-1 text-2xl font-extrabold text-night-sky-500">
        {count}
        <span className="ml-1 text-sm font-semibold text-night-sky-200">
          {count === 1 ? "supplier" : "suppliers"}
        </span>
      </p>
      <p className="mt-1 text-xs text-night-sky-200">
        {isFiltered ? "Suppliers in directory" : "All suppliers in directory"}
      </p>
    </div>
  );
}

export default SupplierSummary;
