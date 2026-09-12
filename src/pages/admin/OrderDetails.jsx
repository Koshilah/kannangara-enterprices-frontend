import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getOrder } from "../../api/order";
import OrderDetailsPanel from "../../components/admin/orders/OrderDetailsPanel";

function OrderDetails() {
  const { orderID } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        const loadedDetails = await getOrder(orderID);
        if (isMounted) setDetails(loadedDetails);
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError.response?.data?.message ||
              "Unable to load order details.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderID]);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-2 text-sm font-bold text-night-sky-300 transition hover:text-night-sky-500"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to
            orders
          </button>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
            Order details
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
            {orderID ? `Order ${String(orderID).slice(-10)}` : "Order"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-night-sky-200">
            Review the customer request, payment record, ordered items, and
            delivery commitment.
          </p>
        </header>

        {error && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}
        {isLoading && (
          <div className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 px-4 py-14 text-center text-sm text-night-sky-200">
            Loading order details...
          </div>
        )}
        {!isLoading && !error && details && (
          <OrderDetailsPanel
            order={details.order}
            delivery={details.delivery}
          />
        )}
      </div>
    </main>
  );
}

export default OrderDetails;
