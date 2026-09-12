function SupplierSearchBar({ value, onChange, onSubmit, onClear, disabled }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Search a supplier by product, company or representative name</span>
        <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-night-sky-200" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by product, company or representative name"
          className="w-full rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 py-3 pl-11 pr-4 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
          disabled={disabled}
        />
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-night-sky-400 disabled:cursor-wait disabled:opacity-60"
      >
        {disabled ? "Searching..." : "Search suppliers"}
      </button>
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-night-sky-100/30 px-5 py-3 text-sm font-bold text-night-sky-400 transition hover:bg-night-sky-100/20"
        >
          Clear
        </button>
      )}
    </form>
  );
}

export default SupplierSearchBar;