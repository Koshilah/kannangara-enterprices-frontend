import { api } from "./auth";

export async function getDeliveries() {
  const response = await api.get("/delivery");
  return response.data.data || [];
}

export async function updateDeliveryStatus(deliveryID, status) {
  const response = await api.patch("/delivery/status", { deliveryID, status });
  return response.data.data;
}

export async function updateDeliveryDueDate(deliveryID, dueDate) {
  const response = await api.patch("/delivery/due-date", {
    deliveryID,
    dueDate,
  });
  return response.data.data;
}

export async function deleteDelivery(deliveryID) {
  const response = await api.delete(`/delivery/${deliveryID}`);
  return response.data;
}
