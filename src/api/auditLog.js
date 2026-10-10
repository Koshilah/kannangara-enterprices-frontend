import { api } from "./auth";

function getFilename(contentDisposition, format) {
  const match = contentDisposition?.match(
    /filename\*?=(?:UTF-8''|")?([^";]+)/i,
  );
  return match
    ? decodeURIComponent(match[1].replace(/"/g, ""))
    : `employee-actions.${format}`;
}

export async function downloadAuditReport({
  userId,
  startDate,
  endDate,
  format = "pdf",
}) {
  const response = await api.get("/audit-logs/export", {
    params: {
      userId: userId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      format,
    },
    responseType: "blob",
  });
  if (!response.data || response.data.size === 0)
    throw new Error("The report was empty.");

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = getFilename(response.headers["content-disposition"], format);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
