import ProductContainer from "../components/ProductContainer";
import HeroSlider from "../components/HeroSlider";
import SearchSection from "../components/SearchSection";
import Footer from "../components/Footer";

function Home({ products, cart, setCart, loading, categoryNames }) {
  return (
    <main className="w-full">
      <title>Home | Kannangara Hardwares</title>
      <HeroSlider />
      <SearchSection />
      <div className="px-4 py-10 sm:px-8 lg:px-8 lg:py-12">
        <ProductContainer
          products={products}
          cart={cart}
          setCart={setCart}
          categoryNames={categoryNames}
          loading={loading}
        />
      </div>
      <Footer />
    </main>
  );
}

export default Home;
