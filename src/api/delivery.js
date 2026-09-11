import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

function authConfig() {
  const token = window.localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getDeliveries() {
  const response = await api.get("/delivery", authConfig());
  return response.data.data || [];
}

export async function updateDeliveryStatus(deliveryID, status) {
  const response = await api.patch(
    "/delivery/status",
    { deliveryID, status },
    authConfig(),
  );
  return response.data.data;
}

export async function updateDeliveryDueDate(deliveryID, dueDate) {
  const response = await api.patch(
    "/delivery/due-date",
    { deliveryID, dueDate },
    authConfig(),
  );
  return response.data.data;
}

export async function deleteDelivery(deliveryID) {
  const response = await api.delete(`/delivery/${deliveryID}`, authConfig());
  return response.data;
}