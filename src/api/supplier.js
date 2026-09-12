import { api } from "./auth";

export async function getSuppliers() {
  const response = await api.get("/supplier");
  return response.data.data || [];
}

export async function createSupplier(supplier) {
  const response = await api.post("/supplier", supplier);
  return response.data.data;
}

export async function updateSupplier(supplierID, supplier) {
  const response = await api.put(`/supplier/${supplierID}`, supplier);
  return response.data.data;
}

export async function deleteSupplier(supplierID) {
  const response = await api.delete(`/supplier/${supplierID}`);
  return response.data;
}
