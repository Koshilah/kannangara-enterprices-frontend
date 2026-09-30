import ProductContainer from "../components/ProductContainer";

function Deals({ products, cart, setCart, loading, categoryNames }) {
  const dealProducts = loading
    ? []
    : products.filter((p) => p.discountPrice > 0);

  return (
    <main className="w-dvw px-4 py-10 sm:px-8 lg:px-8 lg:py-12">
      <title>Deals | Kannangara Hardwares</title>
      <ProductContainer
        products={dealProducts}
        cart={cart}
        setCart={setCart}
        categoryNames={categoryNames}
        loading={loading}
        title="Today's Deals"
      />
    </main>
  );
}

export default Deals;
