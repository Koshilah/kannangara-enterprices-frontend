import { api } from "./auth";

export async function getCategories() {
  const response = await api.get("/category");
  return response.data.data || [];
}

export async function createCategory(payload) {
  const response = await api.post("/category", payload);
  return response.data.data;
}

export async function toggleCategoryVisibility(categoryID) {
  const response = await api.put(
    `/category/${categoryID}/toggle-visibility`,
    {},
  );
  return response.data;
}
