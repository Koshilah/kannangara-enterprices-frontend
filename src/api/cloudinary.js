import { api } from "./auth";

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/cloudinary", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.url;
}
