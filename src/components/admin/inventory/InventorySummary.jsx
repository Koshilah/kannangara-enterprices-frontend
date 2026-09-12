const tones = {
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  green: "bg-emerald-100 text-emerald-700",
};

function InventorySummary({ icon, label, value, detail, tone }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-lg ${tones[tone]}`}
      >
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-night-sky-200">
          {label}
        </p>
        <p className="mt-1 text-2xl font-extrabold text-night-sky-500">
          {value}
        </p>
        <p className="mt-1 text-xs text-night-sky-200">{detail}</p>
      </div>
    </article>
  );
}

export default InventorySummary;
