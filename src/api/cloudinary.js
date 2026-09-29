import { api } from "./auth";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/cloudinary", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return {
    url: response.data.url,
    publicId: response.data.public_id || "",
  };
}

export async function uploadProductImage(file) {
  const result = await uploadImage(file);
  return result.url;
}
