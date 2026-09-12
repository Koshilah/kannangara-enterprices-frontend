import { api } from "./auth";

export async function getExpenses() {
  const response = await api.get("/expense");
  return response.data.data || [];
}

export async function addExpense(expense) {
  const response = await api.post("/expense", expense);
  return response.data.data;
}

export async function deleteExpense(expenseId) {
  const response = await api.delete(`/expense/${expenseId}`);
  return response.data;
}
