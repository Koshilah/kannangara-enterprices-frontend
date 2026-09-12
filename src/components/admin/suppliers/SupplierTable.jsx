function SupplierTable({ suppliers, isLoading, busyID, onSelect, onDelete }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-220 border-collapse text-sm">
        <thead>
          <tr className="border-b border-night-sky-100/20 text-left text-xs uppercase tracking-wider text-night-sky-200">
            <th className="px-3 pb-3 font-bold">Representative</th>
            <th className="px-3 pb-3 font-bold">Company</th>
            <th className="px-3 pb-3 font-bold">Contact</th>
            <th className="px-3 pb-3 font-bold">Products supplied</th>
            <th className="px-3 pb-3 text-right font-bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="5" className="px-3 py-14 text-center text-night-sky-200">Loading suppliers...</td></tr>
          ) : suppliers.length === 0 ? (
            <tr><td colSpan="5" className="px-3 py-14 text-center text-night-sky-200">No suppliers match this search.</td></tr>
          ) : suppliers.map((supplier) => (
            <tr key={supplier._id} onClick={() => onSelect(supplier)} className="cursor-pointer border-b border-night-sky-100/10 align-middle transition hover:bg-night-sky-100/10">
              <td className="px-3 py-4 font-bold text-night-sky-400">{supplier.representativeName}</td>
              <td className="px-3 py-4 font-medium text-night-sky-400">{supplier.companyName}</td>
              <td className="px-3 py-4 text-night-sky-300"><span className="block">{supplier.phoneNumber}</span><span className="text-xs">{supplier.email}</span></td>
              <td className="max-w-72 px-3 py-4 text-night-sky-300"><span className="line-clamp-2">{supplier.products?.map((product) => product.title).join(", ") || "No products assigned"}</span></td>
              <td className="px-3 py-4 text-right">
                <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(supplier); }} disabled={busyID === supplier._id} className="inline-flex size-9 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-40" aria-label={`Delete ${supplier.companyName}`} title="Delete supplier">
                  <i className="fa-solid fa-trash" aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SupplierTable;