import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

function authConfig() {
  return {
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
  };
}

export async function getFinancialSummary(months = 12) {
  const response = await api.get(
    `/finance/summary?months=${months}`,
    authConfig(),
  );
  return response.data.data;
}
