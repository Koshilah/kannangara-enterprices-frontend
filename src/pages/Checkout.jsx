import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { getAddresses, addAddress } from "../api/address";
import { createOrder } from "../api/order";
import { downloadReceipt } from "../utility/receipt";

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getEstimatedDeliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Checkout({ cart, setCart, products = [] }) {
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState("delivery"); // "delivery" | "pickup"
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    houseNo: "",
    street1: "",
    street2: "",
    city: "",
    postalCode: "",
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState("cash"); // "cash" | "card"

  // Order submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Cart item processing
  const rows = useMemo(() => {
    const items = Array.isArray(cart) ? cart : cart?.items || [];
    return items.map((item) => {
      const productId = String(item.productId || item._id);
      const product = products.find(
        (candidate) => String(candidate._id || candidate.id) === productId,
      );
      const quantity = Number(item.quantity) || 1;
      const unitPrice = Number(
        item.discountPrice ||
          item.price ||
          product?.discountPrice ||
          product?.price ||
          0,
      );

      return {
        ...item,
        productId,
        title: item.title || product?.title || "Hardware Item",
        image:
          item.imageURL || item.image || product?.imageURL || product?.image,
        quantity,
        unitPrice,
        totalPrice: Number(item.totalPrice) || unitPrice * quantity,
      };
    });
  }, [cart, products]);

  const subtotal = useMemo(() => {
    return rows.reduce((acc, row) => acc + row.totalPrice, 0);
  }, [rows]);

  const deliveryFee = 0; // Free delivery / pickup
  const grandTotal = subtotal + deliveryFee;

  // Load saved addresses on mount
  useEffect(() => {
    let isMounted = true;
    async function loadUserAddresses() {
      try {
        setIsLoadingAddresses(true);
        const data = await getAddresses();
        if (isMounted) {
          setAddresses(data);
          if (data.length > 0) {
            setSelectedAddressId(data[0]._id);
          } else {
            setShowAddressForm(true);
          }
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
        if (isMounted) {
          setShowAddressForm(true);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAddresses(false);
        }
      }
    }

    loadUserAddresses();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
    if (addressErrors[name]) {
      setAddressErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!newAddress.houseNo.trim()) {
      errors.houseNo = "House / Flat No. is required";
    }
    if (!newAddress.street1.trim()) {
      errors.street1 = "Street address is required";
    }
    if (!newAddress.city.trim()) {
      errors.city = "City is required";
    }
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    try {
      setIsSavingAddress(true);
      const res = await addAddress({
        houseNo: newAddress.houseNo.trim(),
        street1: newAddress.street1.trim(),
        street2: newAddress.street2.trim() || undefined,
        city: newAddress.city.trim(),
        postalCode: newAddress.postalCode.trim() || undefined,
      });

      const savedAddress = res.data;
      const parts = [
        savedAddress.houseNo,
        savedAddress.street1,
        savedAddress.street2,
        savedAddress.city,
        savedAddress.postalCode,
      ].filter(Boolean);

      const formatted = {
        ...savedAddress,
        formattedAddress: parts.join(", "),
      };

      setAddresses((prev) => [formatted, ...prev]);
      setSelectedAddressId(savedAddress._id);
      setShowAddressForm(false);
      setNewAddress({
        houseNo: "",
        street1: "",
        street2: "",
        city: "",
        postalCode: "",
      });
    } catch (err) {
      console.error("Unable to save address", err);
      setAddressErrors((prev) => ({
        ...prev,
        form: err.response?.data?.message || "Failed to save address.",
      }));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleProceedToPayment = async () => {
    setSubmissionError("");

    if (rows.length === 0) {
      setSubmissionError("Your cart is empty.");
      return;
    }

    let finalDeliveryAddress;
    if (orderType === "delivery") {
      const selected = addresses.find((a) => a._id === selectedAddressId);
      if (!selected) {
        setSubmissionError(
          "Please select a delivery address or add a new one.",
        );
        return;
      }
      finalDeliveryAddress = selected.formattedAddress;
    } else {
      finalDeliveryAddress =
        "Store Pickup (Kannangara Enterprises Main Branch, Colombo)";
    }

    const resolvedPaymentMethod =
      paymentMethod === "cash"
        ? orderType === "delivery"
          ? "Cash on Delivery"
          : "Cash on Pickup"
        : "Visa / MasterCard";

    try {
      setIsSubmitting(true);
      const response = await createOrder({
        cartID: cart?._id,
        paymentMethod: resolvedPaymentMethod,
        deliveryAddress: finalDeliveryAddress,
        orderType,
      });

      if (response && response.data) {
        // Clear cart in state
        setCart({ items: [] });
        setOrderSuccessData({
          order: response.data,
          orderType,
          paymentMethod: resolvedPaymentMethod,
          deliveryAddress: finalDeliveryAddress,
        });
      }
    } catch (err) {
      console.error("Order creation failed", err);
      setSubmissionError(
        err.response?.data?.message ||
          "Failed to process order. Please check your details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    setIsDownloadingReceipt(true);
    setSubmissionError("");

    try {
      await downloadReceipt(orderSuccessData?.order);
    } catch (error) {
      console.error("Receipt download failed", error);
      setSubmissionError("Unable to download the receipt. Please try again.");
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  // If order was successfully placed, render Order Confirmation View
  if (orderSuccessData) {
    const { order } = orderSuccessData;
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <i className="fa-solid fa-check text-2xl" aria-hidden="true" />
          </div>

          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Order Status: Successful
          </span>

          <h1 className="mt-3 text-2xl font-bold text-night-sky-500">
            Thank you for your order!
          </h1>
          <p className="mt-1 text-sm text-night-sky-100">
            We have received your order and are preparing it right away.
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/70 p-6 text-left">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-night-sky-100">
                  Order ID
                </dt>
                <dd className="mt-1 font-mono text-sm font-bold text-night-sky-400">
                  #{order._id || "NEW-ORDER"}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-night-sky-100">
                  Fulfillment Type
                </dt>
                <dd className="mt-1 text-sm font-semibold capitalize text-night-sky-400">
                  {orderType === "delivery"
                    ? "🚚 Home Delivery"
                    : "🏬 Store Pickup"}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-night-sky-100">
                  Payment Method
                </dt>
                <dd className="mt-1 text-sm font-semibold text-night-sky-400">
                  {orderSuccessData.paymentMethod}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-night-sky-100">
                  Total Amount
                </dt>
                <dd className="mt-1 text-base font-bold text-night-sky-500">
                  Rs. {formatCurrency(order.orderTotal || grandTotal)}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-night-sky-100">
                  {orderType === "delivery"
                    ? "Delivery Destination"
                    : "Pickup Location"}
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {orderSuccessData.deliveryAddress}
                </dd>
              </div>

              {orderType === "delivery" && (
                <div className="sm:col-span-2 rounded-lg border border-night-sky-100/20 bg-white p-3">
                  <div className="flex items-center gap-2 text-night-sky-400">
                    <i className="fa-regular fa-calendar-check text-night-sky-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-night-sky-100">
                      Estimated Delivery Date:
                    </span>
                    <span className="text-sm font-bold text-night-sky-500">
                      {order.estimatedDeliveryDate
                        ? new Date(
                            order.estimatedDeliveryDate,
                          ).toLocaleDateString("en-LK", { dateStyle: "full" })
                        : "Within 3 days"}
                    </span>
                  </div>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              disabled={isDownloadingReceipt}
              className="rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isDownloadingReceipt
                ? "Preparing Receipt..."
                : "Download Receipt"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-md bg-night-sky-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-night-sky-300"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-night-sky-400 transition hover:bg-gray-100"
            >
              View Profile & Orders
            </button>
          </div>
        </div>
      </main>
    );
  }

  // If cart is empty
  if (rows.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gray-100 text-night-sky-200">
            <i className="fa-solid fa-cart-shopping text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-night-sky-500">
            Your Cart is Empty
          </h1>
          <p className="mt-2 text-sm text-night-sky-100">
            You don&apos;t have any items to checkout yet. Browse our hardware
            catalog to find what you need.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-block rounded-md bg-night-sky-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-night-sky-300"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-night-sky-300 transition hover:text-night-sky-500"
        >
          <i className="fa-solid fa-arrow-left text-xs" /> Back to Cart
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-night-sky-500 sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-night-sky-100">
          Complete your order details, select fulfillment, and choose your
          payment option.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Fulfillment, Address, Payment */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Fulfillment Method */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-night-sky-500">
              <span className="flex size-6 items-center justify-center rounded-full bg-night-sky-500 text-xs text-white">
                1
              </span>
              Fulfillment Method
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Delivery Option */}
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition ${
                  orderType === "delivery"
                    ? "border-night-sky-500 bg-night-sky-500/5 ring-1 ring-night-sky-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-lg">🚚</span>
                  <input
                    type="radio"
                    name="orderType"
                    checked={orderType === "delivery"}
                    onChange={() => setOrderType("delivery")}
                    className="size-4 accent-night-sky-500"
                  />
                </div>
                <p className="mt-2 font-semibold text-night-sky-500">
                  Home Delivery
                </p>
                <p className="mt-1 text-xs text-night-sky-100">
                  Delivered safely to your preferred address.
                </p>
                <span className="mt-3 inline-block rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Free Delivery
                </span>
              </button>

              {/* Store Pickup Option */}
              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition ${
                  orderType === "pickup"
                    ? "border-night-sky-500 bg-night-sky-500/5 ring-1 ring-night-sky-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-lg">🏬</span>
                  <input
                    type="radio"
                    name="orderType"
                    checked={orderType === "pickup"}
                    onChange={() => setOrderType("pickup")}
                    className="size-4 accent-night-sky-500"
                  />
                </div>
                <p className="mt-2 font-semibold text-night-sky-500">
                  Store Pickup
                </p>
                <p className="mt-1 text-xs text-night-sky-100">
                  Collect from our main hardware store counter.
                </p>
                <span className="mt-3 inline-block rounded bg-night-sky-100/15 px-2 py-0.5 text-xs font-semibold text-night-sky-400">
                  Free Pickup
                </span>
              </button>
            </div>

            {/* Delivery Estimate Box */}
            {orderType === "delivery" ? (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-800">
                <i className="fa-regular fa-clock text-night-sky-300" />
                <div>
                  <span className="font-semibold text-night-sky-500">
                    Estimated Delivery:
                  </span>{" "}
                  <span className="font-medium text-slate-700">
                    {getEstimatedDeliveryDate()} (3–5 business days)
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-800">
                <p className="font-semibold text-night-sky-500">
                  Store Pickup Location:
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Kannangara Enterprises Main Branch — No. 120, Galle Road,
                  Moratuwa
                </p>
                <p className="mt-1 text-xs text-emerald-700 font-medium">
                  ✓ Ready for collection within 24 hours of order placement.
                </p>
              </div>
            )}
          </section>

          {/* 2. Address Selection (Only if Home Delivery) */}
          {orderType === "delivery" && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-night-sky-500">
                  <span className="flex size-6 items-center justify-center rounded-full bg-night-sky-500 text-xs text-white">
                    2
                  </span>
                  Delivery Address
                </h2>

                <button
                  type="button"
                  onClick={() => setShowAddressForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-night-sky-300 transition hover:text-night-sky-500"
                >
                  <i
                    className={`fa-solid ${showAddressForm ? "fa-xmark" : "fa-plus"}`}
                  />
                  {showAddressForm ? "Cancel" : "Add New Address"}
                </button>
              </div>

              {/* Add New Address Form */}
              {showAddressForm && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="mt-4 rounded-xl border border-night-sky-100/30 bg-gray-50/80 p-4"
                >
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-night-sky-400">
                    Add New Shipping Address
                  </h3>

                  {addressErrors.form && (
                    <div className="mb-3 rounded bg-red-50 p-2.5 text-xs text-red-600">
                      {addressErrors.form}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-night-sky-400">
                        House / Building No. *
                      </label>
                      <input
                        type="text"
                        name="houseNo"
                        value={newAddress.houseNo}
                        onChange={handleAddressInputChange}
                        placeholder="e.g. 45/B"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-night-sky-500 focus:outline-none"
                      />
                      {addressErrors.houseNo && (
                        <p className="mt-1 text-xs text-red-600">
                          {addressErrors.houseNo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-night-sky-400">
                        Street Address 1 *
                      </label>
                      <input
                        type="text"
                        name="street1"
                        value={newAddress.street1}
                        onChange={handleAddressInputChange}
                        placeholder="e.g. Temple Road"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-night-sky-500 focus:outline-none"
                      />
                      {addressErrors.street1 && (
                        <p className="mt-1 text-xs text-red-600">
                          {addressErrors.street1}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-night-sky-400">
                        Street Address 2 (Optional)
                      </label>
                      <input
                        type="text"
                        name="street2"
                        value={newAddress.street2}
                        onChange={handleAddressInputChange}
                        placeholder="e.g. 2nd Lane"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-night-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-night-sky-400">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressInputChange}
                        placeholder="e.g. Moratuwa"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-night-sky-500 focus:outline-none"
                      />
                      {addressErrors.city && (
                        <p className="mt-1 text-xs text-red-600">
                          {addressErrors.city}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-night-sky-400">
                        Postal Code (Optional)
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={newAddress.postalCode}
                        onChange={handleAddressInputChange}
                        placeholder="e.g. 10400"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-night-sky-500 focus:outline-none sm:w-1/2"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="rounded-md bg-night-sky-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-night-sky-300 disabled:opacity-50"
                    >
                      {isSavingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Address List */}
              <div className="mt-4">
                {isLoadingAddresses ? (
                  <p className="py-4 text-center text-xs text-slate-500">
                    Loading your saved addresses...
                  </p>
                ) : addresses.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-300 py-6 text-center text-xs text-slate-500">
                    No addresses saved yet. Please add a shipping address above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <label
                          key={addr._id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                            isSelected
                              ? "border-night-sky-500 bg-night-sky-500/5 ring-1 ring-night-sky-500"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(addr._id)}
                            className="mt-1 size-4 accent-night-sky-500"
                          />
                          <div className="flex-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-night-sky-500">
                                {addr.name || "Delivery Address"}
                              </span>
                              {isSelected && (
                                <span className="rounded bg-night-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-night-sky-400">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                              {addr.formattedAddress ||
                                [
                                  addr.houseNo,
                                  addr.street1,
                                  addr.street2,
                                  addr.city,
                                  addr.postalCode,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 3. Payment Option */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-night-sky-500">
              <span className="flex size-6 items-center justify-center rounded-full bg-night-sky-500 text-xs text-white">
                {orderType === "delivery" ? "3" : "2"}
              </span>
              Payment Option
            </h2>

            <div className="mt-4 space-y-3">
              {/* Cash Option */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  paymentMethod === "cash"
                    ? "border-night-sky-500 bg-night-sky-500/5 ring-1 ring-night-sky-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="mt-1 size-4 accent-night-sky-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-night-sky-500">
                      {orderType === "delivery"
                        ? "Cash on Delivery (COD)"
                        : "Cash on Pickup"}
                    </span>
                    <i className="fa-solid fa-money-bill-wave text-night-sky-300" />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {orderType === "delivery"
                      ? "Pay with cash at your doorstep when your items arrive."
                      : "Pay with cash or card at the store pickup counter."}
                  </p>
                </div>
              </label>

              {/* Card Option */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  paymentMethod === "card"
                    ? "border-night-sky-500 bg-night-sky-500/5 ring-1 ring-night-sky-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mt-1 size-4 accent-night-sky-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-night-sky-500">
                      Visa / MasterCard
                    </span>
                    <div className="flex items-center gap-1.5 text-base text-night-sky-300">
                      <i className="fa-brands fa-cc-visa" />
                      <i className="fa-brands fa-cc-mastercard" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Direct instant order placement. (Payment gateway integration
                    in progress).
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-night-sky-500">
              Order Summary
            </h2>

            {/* Items list */}
            <div className="mt-4 max-h-64 divide-y divide-gray-100 overflow-y-auto pr-1">
              {rows.map((item, index) => (
                <div
                  key={String(item._id || item.productId) || index}
                  className="flex items-center gap-3 py-3 text-sm"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="size-12 rounded border border-gray-200 object-contain p-1"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded border border-gray-200 bg-gray-50 text-slate-400">
                      <i className="fa-solid fa-wrench" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-slate-800">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity} × Rs.{" "}
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>

                  <span className="text-right font-semibold text-slate-900">
                    Rs. {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>Rs. {formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>
                  {orderType === "delivery" ? "Delivery Fee" : "Pickup Fee"}
                </span>
                <span className="font-medium text-emerald-700">Free</span>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-base font-bold text-night-sky-500">
                <span>Total Amount</span>
                <span>Rs. {formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Error banner */}
            {submissionError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                <i className="fa-solid fa-circle-exclamation mr-1.5" />
                {submissionError}
              </div>
            )}

            {/* Action button */}
            <div className="mt-6">
              <button
                type="button"
                disabled={isSubmitting || rows.length === 0}
                onClick={handleProceedToPayment}
                className="w-full rounded-md bg-night-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-night-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin" /> Processing
                    Order...
                  </span>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              🔒 Safe & secure hardware order processing
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
