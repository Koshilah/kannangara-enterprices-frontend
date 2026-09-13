import { useState } from "react";
import { addToCart } from "../api/cart";

function ProductCard({ product, setCart }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const productId = product?._id || product?.id;
  const title = product?.title || "Product";
  const image = product?.imageURL || product?.image;
  const price = Number(product?.price || 0);
  const discountPrice = Number(product?.discountPrice || 0);

  const stock =
    product?.totalStock !== undefined
      ? Number(product.totalStock)
      : product?.quantity !== undefined
        ? Number(product.quantity)
        : product?.stock !== undefined
          ? Number(product.stock)
          : undefined;

  const isOutOfStock = Boolean(
    product?.outOfStock || (stock !== undefined && stock <= 0),
  );
  const isLowStock =
    !isOutOfStock && stock !== undefined && stock > 0 && stock < 5;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const formatPrice = (val) =>
    Number(val).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const category = Array.isArray(product?.category)
    ? product.category.join(", ")
    : product?.category;

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;

    try {
      setIsAdding(true);
      const response = await addToCart(productId);

      if (response && response.data) {
        setCart(response.data);
      } else {
        setCart((currentCart) => {
          const items = Array.isArray(currentCart)
            ? currentCart
            : currentCart?.items || [];

          const existingIndex = items.findIndex(
            (item) => String(item.productId || item._id) === String(productId),
          );

          if (existingIndex > -1) {
            const updatedItems = [...items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: (updatedItems[existingIndex].quantity || 1) + 1,
            };
            return Array.isArray(currentCart)
              ? updatedItems
              : { ...currentCart, items: updatedItems };
          }

          const newItem = {
            ...product,
            productId,
            quantity: 1,
          };

          return Array.isArray(currentCart)
            ? [...items, newItem]
            : { ...currentCart, items: [...items, newItem] };
        });
      }

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);
    } catch (error) {
      console.error("Unable to add product to cart", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      {/* Product Image & Floating Status Bubbles */}
      <div className="relative flex h-56 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/60 p-5 sm:h-64">
        {/* Top-left Stock Status Bubbles (Inside Card) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isOutOfStock && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Out of Stock
            </span>
          )}

          {isLowStock && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Only {stock} left!
            </span>
          )}
        </div>

        {/* Top-right Discount Savings Bubble */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Product Image or Fallback */}
        {image && !imageError ? (
          <img
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            className={`h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105 ${
              isOutOfStock ? "opacity-50 grayscale-[40%]" : ""
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <svg
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="mt-1 text-xs font-medium text-slate-400">
              No Image
            </span>
          </div>
        )}
      </div>

      {/* Product Information Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Optional Category */}
        {category && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-night-sky-300 line-clamp-1">
            {category}
          </p>
        )}

        {/* Title */}
        <h2
          className="line-clamp-2 min-h-11 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-night-sky-400"
          title={title}
        >
          {title}
        </h2>

        {/* Price Section: Side by Side with red crossed-out original price */}
        <div className="mt-3 mb-5 flex items-baseline gap-2.5 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-xl font-extrabold tracking-tight text-slate-950">
                Rs. {formatPrice(discountPrice)}
              </span>
              <span className="text-sm font-semibold text-red-500 line-through">
                Rs. {formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-extrabold tracking-tight text-slate-950">
              Rs. {formatPrice(price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          disabled={isOutOfStock || isAdding}
          onClick={handleAddToCart}
          className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-4 ${
            isOutOfStock
              ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 shadow-none focus:ring-0"
              : isAdded
                ? "bg-emerald-600 text-white shadow-md focus:ring-emerald-200"
                : isAdding
                  ? "cursor-wait bg-night-sky-400 text-white focus:ring-night-sky-200"
                  : "bg-night-sky-500 text-white shadow-xs hover:bg-night-sky-300 hover:shadow-md active:scale-[0.98] focus:ring-night-sky-100"
          }`}
          aria-label={
            isOutOfStock ? `${title} is out of stock` : `Add ${title} to cart`
          }
        >
          {isOutOfStock ? (
            <>
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <span>Out of Stock</span>
            </>
          ) : isAdded ? (
            <>
              <svg
                className="h-4 w-4 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Added to Cart!</span>
            </>
          ) : isAdding ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
