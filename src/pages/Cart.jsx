import { useNavigate } from "react-router";
import { products } from "../utility/products";
import { removeFromCart, updateCartQuantity } from "../api/cart";

function Cart({ cart, setCart }) {
  const navigate = useNavigate();
  const items = Array.isArray(cart) ? cart : cart?.items || [];
  const rows = items.map((item) => {
    const productId = String(item.productId || item._id);
    const product = products.find(
      (candidate) => String(candidate.id) === productId,
    );
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(
      item.discountPrice || item.price || product?.price || 0,
    );

    return {
      ...item,
      title: item.title || product?.title || "Product",
      image: item.imageURL || item.image || product?.image,
      quantity,
      unitPrice,
      totalPrice: Number(item.totalPrice) || unitPrice * quantity,
    };
  });

  const totalAmount = rows.reduce((total, item) => total + item.totalPrice, 0);

  const handleQuantityChange = async (item, change) => {
    const productID = item.productId || item._id;
    const updatedQuantity = Math.max(1, item.quantity + change);

    if (!productID || updatedQuantity === item.quantity) {
      return;
    }

    try {
      const response = await updateCartQuantity(productID, updatedQuantity);

      if (response.data) {
        setCart(response.data);
      }
    } catch (error) {
      console.error("Unable to update cart quantity", error);
    }
  };

  const handleRemoveItem = async (item) => {
    const productID = item.productId || item._id;

    if (!productID) {
      return;
    }

    try {
      const response = await removeFromCart(productID);

      if (response.data) {
        setCart(response.data);
      }
    } catch (error) {
      console.error("Unable to remove item from cart", error);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
        Shopping Cart
      </h1>
      {rows.length === 0 ? (
        <p className="rounded-md border border-gray-200 bg-gray-50 px-6 py-10 text-center text-slate-500">
          Your cart is empty.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full min-w-162.5 text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-night-sky-500">
                <th className="px-6 py-4 font-semibold">Item</th>
                <th className="px-6 py-4 text-center font-semibold">
                  Quantity
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Unit Price Rs.
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Total Price Rs.
                </th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {rows.map((item, index) => (
                <tr
                  key={String(item._id || item.productId) || index}
                  className={index % 2 ? "bg-gray-50" : "bg-gray-100"}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="size-12 object-contain"
                        />
                      )}
                      <span>{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center overflow-hidden rounded-md border border-gray-300">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.title}`}
                        disabled={item.quantity <= 1}
                        onClick={() => handleQuantityChange(item, -1)}
                        className="px-3 py-1 text-lg font-semibold text-night-sky-500 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="min-w-10 border-x border-gray-300 px-3 py-1 font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.title}`}
                        onClick={() => handleQuantityChange(item, 1)}
                        className="px-3 py-1 text-lg font-semibold text-night-sky-500 transition hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item)}
                      className="font-semibold text-red-700 transition hover:text-red-900 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-6 flex items-center justify-between rounded-md bg-gray-100 px-6 py-4">
        <span className="font-medium text-night-sky-500">Total Amount</span>
        <span className="font-semibold text-slate-900">
          Rs. {totalAmount.toFixed(2)}
        </span>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          disabled={rows.length === 0}
          onClick={() => navigate("/checkout")}
          className="rounded-md bg-night-sky-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-night-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Proceed to Checkout
        </button>
      </div>
    </main>
  );
}

export default Cart;
