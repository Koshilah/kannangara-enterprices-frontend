import { api } from "./auth";

export async function getAddresses() {
  const response = await api.get("/address");
  return response.data?.data || [];
}

export async function addAddress(addressData) {
  const response = await api.post("/address", addressData);
  return response.data;
}
