import { addToCart } from "../api/cart";

function ProductCard({ product, cart, setCart }) {

  const handleAddToCart = async () => {
    try {

      const response = await addToCart(product.id);
      console.log(cart)

      if (response.data) {
        setCart(response.data);
      } else {
        setCart((currentCart) => [...currentCart, { ...product, quantity: 1 }]);
      }
    } catch (error) {
      console.error("Unable to add product to cart", error);
    }
  };
  return (
    <article className="flex h-full flex-col rounded-xl bg-white p-5 shadow-[0_5px_20px_rgba(40,44,77,0.08)] ring-1 ring-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(40,44,77,0.15)]">
      <div className="flex h-56 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-4 sm:h-64">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-contain mix-blend-multiply"
        />
      </div>
      <h2 className="mt-4 min-h-14 text-l font-bold leading-tight text-slate-950">
        {product.title}
      </h2>
      <p className="mt-1 text-l font-medium tracking-tight text-slate-950">
        Rs.{" "}
        {product.price.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
      </p>
      <button
        type="button"
        className="mt-8 w-full rounded-xl bg-night-sky-500 px-4 py-4 text-l font-bold text-white transition hover:bg-night-sky-300 focus:outline-none focus:ring-4 focus:ring-night-sky-100"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </article>
  );
}

export default ProductCard;
