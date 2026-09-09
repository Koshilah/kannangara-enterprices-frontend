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

export async function getExpenses() {
  const response = await api.get("/expense", authConfig());
  return response.data.data || [];
}

export async function addExpense(expense) {
  const response = await api.post("/expense", expense, authConfig());
  return response.data.data;
}

export async function deleteExpense(expenseId) {
  const response = await api.delete(`/expense/${expenseId}`, authConfig());
  return response.data;
}
