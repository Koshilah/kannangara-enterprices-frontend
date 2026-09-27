import { useEffect, useState } from "react";
import { cancelOrder, getOrders } from "../../api/order";
import OrderSummary from "../../components/admin/orders/OrderSummary";
import OrderTable from "../../components/admin/orders/OrderTable";

function Order() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyID, setBusyID] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const loadedOrders = await getOrders();
        if (isMounted) setOrders(loadedOrders);
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError.response?.data?.message || "Unable to load orders.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCancel(order) {
    if (!window.confirm(`Cancel order ${String(order._id).slice(-10)}?`))
      return;

    setBusyID(order._id);
    setError("");
    setNotice("");

    try {
      const updated = await cancelOrder(order._id);
      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item._id === order._id ? { ...item, ...updated.order } : item,
        ),
      );
      setNotice("Order cancelled successfully.");
    } catch (cancelError) {
      setError(
        cancelError.response?.data?.message || "Unable to cancel order.",
      );
    } finally {
      setBusyID(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <title>Orders | Kannangara Hardwares</title>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
              Orders
            </h1>
            <p className="mt-2 max-w-xl text-sm text-night-sky-200">
            </p>
          </div>
          <OrderSummary count={orders.length} total={orders.length} />
        </header>

        {(error || notice) && (
          <div
            className="rounded-xl border border-night-sky-200/30 bg-night-sky-100/10 px-4 py-3 text-sm text-night-sky-400"
            role="status"
          >
            {error || notice}
          </div>
        )}

        <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
          <div>
            <h2 className="text-base font-bold text-night-sky-500">
              All orders
            </h2>
            <p className="mt-1 text-xs text-night-sky-200">
              Select an order row to view its customer, items, payment, and
              delivery details.
            </p>
          </div>
          <OrderTable
            orders={orders}
            isLoading={isLoading}
            busyID={busyID}
            onCancel={handleCancel}
          />
        </section>
      </div>
    </main>
  );
}

export default Order;
