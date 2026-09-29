import axios from "axios";
import { api } from "./auth";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

export async function getHeroSlides() {
  const response = await publicApi.get("/hero-slide");
  return response.data.data || [];
}

export async function getManageableHeroSlides() {
  const response = await api.get("/hero-slide/manage");
  return response.data.data || [];
}

export async function createHeroSlide(payload) {
  const response = await api.post("/hero-slide", payload);
  return response.data.data;
}

export async function updateHeroSlide(slideID, payload) {
  const response = await api.put(`/hero-slide/${slideID}`, payload);
  return response.data.data;
}

export async function deleteHeroSlide(slideID) {
  const response = await api.delete(`/hero-slide/${slideID}`);
  return response.data;
}
