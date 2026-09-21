import { api } from "./auth";

export async function getFinancialSummary(months = 12) {
  const response = await api.get(`/finance/summary?months=${months}`);
  return response.data.data;
}

export async function getFinancialReport(month) {
  const response = await api.get(`/finance/report?month=${month}`);
  return response.data.data;
}
