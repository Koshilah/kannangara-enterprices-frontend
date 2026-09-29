import { api } from "./auth";

export async function getCategories() {
  const response = await api.get("/category");
  return response.data.data || [];
}

export async function getStoreCategories(limit = 4) {
  const categories = await getCategories();

  return categories
    .filter((category) => category.visibility !== false)
    .slice(0, limit)
    .map((category) => ({
      ...category,
      subcategories: (category.subCategories || []).filter(
        (subcategory) => subcategory.visibility !== false,
      ),
    }));
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
