import { useState } from "react";

function ProductTable({
  products,
  categoryNames,
  isLoading,
  canEdit,
  busyID,
  onSelect,
  onStockChange,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  function updateFilter(name, value) {
    const nextSearchTerm = name === "searchTerm" ? value : searchTerm;
    const nextStockFilter = name === "stockFilter" ? value : stockFilter;
    if (name === "searchTerm") setSearchTerm(value);
    if (name === "stockFilter") setStockFilter(value);
    window.dispatchEvent(
      new CustomEvent("inventory-table-filter", {
        detail: { searchTerm: nextSearchTerm, stockFilter: nextStockFilter },
      }),
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search products by name or category</span>
          <i
            className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-night-sky-200"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => updateFilter("searchTerm", event.target.value)}
            placeholder="Search by product name or category"
            className="w-full rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 py-3 pl-11 pr-4 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-night-sky-300">
          <span className="sr-only">Filter products by stock status</span>
          <select
            value={stockFilter}
            onChange={(event) =>
              updateFilter("stockFilter", event.target.value)
            }
            className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-3 py-3 text-sm font-semibold text-night-sky-500 outline-none focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
          >
            <option value="all">All stock</option>
            <option value="in-stock">In stock</option>
            <option value="low-stock">Low stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </label>
      </div>
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[15%]" />
          <col className="w-[20%]" />
          <col className="w-[17%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-night-sky-100/20 text-left text-xs uppercase tracking-wider text-night-sky-200">
            <th className="px-3 pb-3 font-bold">Product</th>
            <th className="px-3 pb-3 font-bold">Price</th>
            <th className="px-3 pb-3 font-bold">Main category</th>
            <th className="px-3 pb-3 font-bold">Stock status</th>
            <th className="px-3 pb-3 text-right font-bold">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan="5"
                className="px-3 py-14 text-center text-night-sky-200"
              >
                Loading products...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="px-3 py-14 text-center text-night-sky-200"
              >
                No products found.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const outOfStock = product.outOfStock || product.totalStock === 0;
              const lowStock = !outOfStock && product.totalStock <= 5;
              return (
                <tr
                  key={product._id}
                  onClick={() => canEdit && onSelect(product)}
                  className={`${canEdit ? "cursor-pointer hover:bg-night-sky-100/10" : ""} border-b border-night-sky-100/10 align-middle transition`}
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageURL || "/product-placeholder.png"}
                        alt=""
                        className="size-11 rounded-xl bg-night-sky-100/20 object-contain"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-night-sky-400">
                          {product.title}
                        </p>
                        <p className="mt-1 text-xs text-night-sky-200">
                          {product.visibility ? "Visible" : "Hidden"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="wrap-break-word px-3 py-4 font-semibold text-night-sky-400">
                    Rs. {Number(product.price || 0).toLocaleString("en-LK")}
                  </td>
                  <td className="wrap-break-word px-3 py-4 text-night-sky-300">
                    {categoryNames[product.category?.[0]] || "Uncategorised"}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${outOfStock ? "bg-red-50 text-red-700" : lowStock ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      {outOfStock
                        ? "Out of stock"
                        : lowStock
                          ? "Low stock"
                          : "In stock"}
                    </span>
                  </td>
                  <td
                    className="px-1 py-4 text-right sm:px-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-0.5 rounded-xl border border-night-sky-100/30 p-0.5 sm:gap-2 sm:p-1">
                      <button
                        type="button"
                        disabled={
                          busyID === product._id || product.totalStock <= 0
                        }
                        onClick={() =>
                          onStockChange(product, product.totalStock - 1)
                        }
                        className="inline-flex size-7 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-night-sky-100/20 hover:text-night-sky-500 disabled:cursor-not-allowed disabled:opacity-40 sm:size-8"
                        aria-label={`Decrease ${product.title} stock`}
                        title="Decrease stock"
                      >
                        <i className="fa-solid fa-minus" aria-hidden="true" />
                      </button>
                      <span className="min-w-6 text-center font-extrabold text-night-sky-500 sm:min-w-8">
                        {product.totalStock}
                      </span>
                      <button
                        type="button"
                        disabled={busyID === product._id}
                        onClick={() =>
                          onStockChange(product, product.totalStock + 1)
                        }
                        className="inline-flex size-7 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-night-sky-100/20 hover:text-night-sky-500 disabled:cursor-wait disabled:opacity-40 sm:size-8"
                        aria-label={`Increase ${product.title} stock`}
                        title="Increase stock"
                      >
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;
