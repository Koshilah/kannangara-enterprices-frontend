import { api } from "./auth";

export async function getOrders() {
  const response = await api.get("/order");
  return response.data.data || [];
}

export async function getOrder(orderID) {
  const response = await api.get(`/order/${orderID}`);
  return response.data.data;
}

export async function cancelOrder(orderID) {
  const response = await api.patch(`/order/${orderID}/cancel`, {});
  return response.data.data;
}

export async function createOrder({
  cartID,
  paymentMethod,
  deliveryAddress,
  orderType,
}) {
  const response = await api.post("/order", {
    cartID,
    paymentMethod,
    deliveryAddress,
    orderType,
  });
  return response.data;
}

export async function getMyOrders() {
  const response = await api.get("/order/my-orders");
  return response.data?.data || [];
}

export async function updatePaymentStatus(orderID, paymentStatus) {
  const response = await api.patch(`/order/${orderID}/payment`, {
    paymentStatus,
  });
  return response.data.data;
}
