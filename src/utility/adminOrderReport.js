import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "Kannangara Enterprises";
const COMPANY_ADDRESS = "Nonagama Road, Kuttigala, Ambilipitiya";
const COMPANY_CONTACT =
  "Tel: 0472262591 / 0705806000 | Email: kannangaraenterprises@gmail.com";

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
  return `Rs. ${numberValue(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

async function loadLogoData() {
  try {
    const response = await fetch("/logo.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawStatCard(doc, x, y, width, label, value, color) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, width, 18, 2.5, 2.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont(undefined, "normal");
  doc.text(label.toUpperCase(), x + 4, y + 6);
  doc.setFontSize(10.5);
  doc.setFont(undefined, "bold");
  doc.text(String(value), x + 4, y + 14);
}

export async function downloadAdminOrderReport({ orders = [], month }) {
  if (!orders.length) {
    throw new Error("No orders available to generate the report.");
  }

  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.dateOrdered || b.createdAt) -
      new Date(a.dateOrdered || a.createdAt),
  );
  const totalValue = sortedOrders.reduce(
    (total, order) => total + numberValue(order.orderTotal),
    0,
  );
  const paidCount = sortedOrders.filter((order) =>
    ["paid", "successful"].includes(String(order.paymentStatus).toLowerCase()),
  ).length;
  const cancelledCount = sortedOrders.filter(
    (order) => String(order.orderStatus).toLowerCase() === "cancelled",
  ).length;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const logo = await loadLogoData();
  const startX = 15;
  const rightX = 282;

  if (logo) doc.addImage(logo, "PNG", startX, 12, 22, 22);
  const headerTextX = logo ? startX + 26 : startX;
  doc.setTextColor(18, 46, 74);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(COMPANY_NAME, headerTextX, 18);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.setTextColor(80, 90, 100);
  doc.text(COMPANY_ADDRESS, headerTextX, 23.5);
  doc.text(COMPANY_CONTACT, headerTextX, 28);
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(18, 46, 74);
  doc.text("MONTHLY ORDER REPORT", rightX, 18, { align: "right" });
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.setTextColor(90, 100, 110);
  doc.text(`Month: ${month}`, rightX, 23.5, { align: "right" });
  doc.text(`Generated: ${formatDate(new Date())}`, rightX, 28, { align: "right" });
  doc.setDrawColor(210, 215, 220);
  doc.setLineWidth(0.4);
  doc.line(startX, 36, rightX, 36);

  const cardWidth = 60;
  drawStatCard(doc, startX, 41, cardWidth, "Total orders", sortedOrders.length, [18, 46, 74]);
  drawStatCard(doc, startX + 64, 41, cardWidth, "Order value", formatCurrency(totalValue), [16, 140, 95]);
  drawStatCard(doc, startX + 128, 41, cardWidth, "Paid orders", paidCount, [79, 70, 229]);
  drawStatCard(doc, startX + 192, 41, cardWidth, "Cancelled", cancelledCount, [220, 38, 38]);

  const rows = sortedOrders.map((order) => [
    String(order._id || "").slice(-10).toUpperCase() || "-",
    order.userID?.name || "Unknown customer",
    formatDate(order.dateOrdered || order.createdAt),
    formatCurrency(order.orderTotal),
    order.paymentMethod || "-",
    String(order.paymentStatus || "-").toUpperCase(),
    String(order.orderStatus || "-").toUpperCase(),
    order.orderType === "pickup" ? "Store Pickup" : "Delivery",
    order.items?.length || 0,
    order.deliveryAddress || "-",
  ]);

  autoTable(doc, {
    startY: 68,
    head: [["Order ID", "Customer", "Ordered", "Total", "Payment", "Payment state", "Order state", "Type", "Items", "Delivery address"]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak", textColor: [35, 45, 55], valign: "top" },
    headStyles: { fillColor: [18, 46, 74], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: [246, 248, 250] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 31 },
      2: { cellWidth: 23 },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 22 },
      8: { cellWidth: 12, halign: "right" },
      9: { cellWidth: 44 },
    },
  });

  doc.setFontSize(8);
  doc.setTextColor(110, 115, 120);
  doc.text("Order values reflect the order records available when this report was generated.", 148.5, 200, { align: "center" });
  doc.save(`kannangara-orders-${month}.pdf`);
}
