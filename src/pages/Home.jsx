import ProductContainer from "../components/ProductContainer";

function Home({ products, cart, setCart, loading }) {
  return (
    <main className="w-dvw px-4 py-10 sm:px-8 lg:px-8 lg:py-12">
      <title>Home | Kannangara Hardwares</title>
      <ProductContainer
        products={products}
        cart={cart}
        setCart={setCart}
        loading={loading}
      />
    </main>
  );
}

export default Home;
