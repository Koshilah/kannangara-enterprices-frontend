import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/cloudinary", formData, {
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.url;
}