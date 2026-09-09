import ProductCard from "../components/ProductCard";


function Home({ products, cart, setCart }) {
  return (
    <main className="w-dvw bg-slate-50 px-4 py-10 sm:px-8 lg:px-8 lg:py-16">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-night-sky-300">
              Built for the job
            </p>
            <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
              Hardware essentials
            </h1>
          </div>
          <p className="hidden text-right text-sm text-slate-500 sm:block">
            Quality tools for every project
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cart={cart}
              setCart={setCart}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
