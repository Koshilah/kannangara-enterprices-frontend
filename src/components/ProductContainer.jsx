import ProductCard from "./ProductCard";

function ProductContainer({
  products,
  cart,
  setCart,
  categoryNames,
  loading,
  title = "Best Sellers",
}) {
  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-night-sky-300"></p>
          <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
            {title}
          </h1>
        </div>
        <p className="hidden text-right text-sm text-slate-500 sm:block"></p>
      </div>
      {loading ? (
        <p className="py-20 text-center text-slate-500">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-slate-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              cart={cart}
              setCart={setCart}
              categoryNames={categoryNames}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductContainer;
