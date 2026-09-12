import { useMemo, useState } from "react";

function ProductPicker({ products, selectedProducts, onChange, disabled }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    const selectedIDs = new Set(selectedProducts.map((product) => product._id));

    return products
      .filter((product) => product.title.toLowerCase().includes(normalizedQuery))
      .filter((product) => !selectedIDs.has(product._id))
      .slice(0, 6);
  }, [products, query, selectedProducts]);

  function addProduct(product) {
    onChange([...selectedProducts, product]);
    setQuery("");
  }

  function removeProduct(productID) {
    onChange(selectedProducts.filter((product) => product._id !== productID));
  }

  return (
    <div className="relative">
      <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
        Products supplied
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type part of a product name"
          disabled={disabled}
          className="rounded-xl border border-night-sky-100/30 bg-white/70 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20 disabled:opacity-60"
        />
      </label>

      {matches.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-night-sky-100/30 bg-white shadow-xl">
          {matches.map((product) => (
            <button
              type="button"
              key={product._id}
              onClick={() => addProduct(product)}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2 text-left transition last:border-0 hover:bg-slate-50"
            >
              <img
                src={product.imageURL || "/product-placeholder.png"}
                alt=""
                className="size-10 rounded-lg bg-slate-100 object-contain"
              />
              <span className="text-sm font-semibold text-night-sky-500">{product.title}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {selectedProducts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-night-sky-100/30 px-3 py-3 text-xs text-night-sky-200">
            No products selected yet.
          </p>
        ) : (
          selectedProducts.map((product) => (
            <div key={product._id} className="flex items-center gap-3 rounded-xl border border-night-sky-100/20 bg-white/50 px-3 py-2">
              <img
                src={product.imageURL || "/product-placeholder.png"}
                alt=""
                className="size-9 rounded-lg bg-slate-100 object-contain"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-night-sky-500">{product.title}</span>
              <button
                type="button"
                onClick={() => removeProduct(product._id)}
                disabled={disabled}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                aria-label={`Remove ${product.title}`}
                title="Remove product"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductPicker;