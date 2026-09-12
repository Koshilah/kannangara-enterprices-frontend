import { api } from "./auth";

export async function getFinancialSummary(months = 12) {
  const response = await api.get(`/finance/summary?months=${months}`);
  return response.data.data;
}
