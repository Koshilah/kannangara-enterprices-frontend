import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "Kannangara Enterprises";
const CURRENCY = "LKR";

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

function getItems(order) {
  return (order?.items || []).map((item) => {
    const quantity = numberValue(item.quantity) || 1;
    const price = numberValue(item.priceSingle);
    const originalPrice = numberValue(item.originalPriceSingle) || price;
    const lineTotal = numberValue(item.priceTotal) || price * quantity;
    const savings =
      numberValue(item.savingsTotal) ||
      Math.max(0, originalPrice - price) * quantity;

    return {
      title: item.title || "Product",
      price,
      originalPrice,
      quantity,
      lineTotal,
      savings,
    };
  });
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

export async function downloadReceipt(order) {
  if (!order) {
    throw new Error("Receipt order data is unavailable.");
  }

  const items = getItems(order);
  const subtotal =
    numberValue(order.subtotal) ||
    items.reduce((total, item) => total + item.lineTotal, 0);
  const totalSavings =
    numberValue(order.totalSavings) ||
    items.reduce((total, item) => total + item.savings, 0);
  const deliveryFee = numberValue(order.deliveryFee);
  const orderTotal = numberValue(order.orderTotal) || subtotal + deliveryFee;
  const shortOrderId = String(order._id || order.id || "order")
    .slice(-10)
    .toUpperCase();

  const document = new jsPDF({ unit: "mm", format: "a4" });
  const logo = await loadLogoData();

  if (logo) {
    document.addImage(logo, "PNG", 20, 16, 22, 22);
  }

  document.setTextColor(18, 46, 74);
  document.setFontSize(20);
  document.setFont(undefined, "bold");
  document.text(COMPANY_NAME, 48, 25);
  document.setFontSize(10);
  document.setFont(undefined, "normal");
  document.setTextColor(90, 100, 110);
  document.text("Order Receipt", 48, 32);

  document.setTextColor(30, 30, 30);
  document.setFontSize(10);
  document.text(`Receipt: #${shortOrderId}`, 190, 21, { align: "right" });
  document.text(
    `Date: ${formatDate(order.dateOrdered || order.createdAt)}`,
    190,
    27,
    {
      align: "right",
    },
  );
  document.text(`Currency: ${CURRENCY}`, 190, 33, { align: "right" });

  document.setDrawColor(210, 215, 220);
  document.line(20, 43, 190, 43);

  autoTable(document, {
    startY: 50,
    head: [["Item", "Unit price", "Qty", "Total"]],
    body: items.map((item) => [
      item.title,
      formatCurrency(item.price),
      String(item.quantity),
      formatCurrency(item.lineTotal),
    ]),
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [35, 45, 55],
    },
    headStyles: {
      fillColor: [18, 46, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  const summaryTop = document.lastAutoTable.finalY + 12;
  document.setFontSize(10);
  document.setTextColor(70, 80, 90);
  document.text("Subtotal", 130, summaryTop);
  document.text(formatCurrency(subtotal), 190, summaryTop, { align: "right" });
  document.setTextColor(25, 130, 85);
  document.text("Total savings", 130, summaryTop + 7);
  document.text(formatCurrency(totalSavings), 190, summaryTop + 7, {
    align: "right",
  });
  document.setTextColor(70, 80, 90);
  document.text("Delivery fee", 130, summaryTop + 14);
  document.text(formatCurrency(deliveryFee), 190, summaryTop + 14, {
    align: "right",
  });
  document.setDrawColor(180, 185, 190);
  document.line(125, summaryTop + 19, 190, summaryTop + 19);
  document.setFont(undefined, "bold");
  document.setTextColor(18, 46, 74);
  document.text("Total", 130, summaryTop + 27);
  document.text(formatCurrency(orderTotal), 190, summaryTop + 27, {
    align: "right",
  });

  const detailsTop = summaryTop + 45;
  document.setFont(undefined, "bold");
  document.setFontSize(11);
  document.text("Order details", 20, detailsTop);
  document.setFont(undefined, "normal");
  document.setFontSize(10);
  document.setTextColor(70, 80, 90);
  document.text(
    `Fulfillment: ${order.orderType === "pickup" ? "Store pickup" : "Home delivery"}`,
    20,
    detailsTop + 8,
  );
  document.text(`Payment: ${order.paymentMethod || "-"}`, 20, detailsTop + 15);
  document.text(
    `Payment status: ${order.paymentStatus || "-"}`,
    20,
    detailsTop + 22,
  );
  document.text(
    `${order.orderType === "pickup" ? "Pickup location" : "Delivery address"}: ${order.deliveryAddress || "-"}`,
    20,
    detailsTop + 29,
    { maxWidth: 170 },
  );

  if (order.orderType === "delivery") {
    const estimatedDate =
      order.estimatedDeliveryDate ||
      new Date(
        new Date(order.dateOrdered || Date.now()).getTime() + 3 * 86400000,
      );
    document.text(
      `Estimated delivery: ${formatDate(estimatedDate)}`,
      20,
      detailsTop + 43,
    );
  }

  document.setFontSize(9);
  document.setTextColor(110, 115, 120);
  document.text(
    "Thank you for shopping with Kannangara Enterprises.",
    105,
    285,
    {
      align: "center",
    },
  );

  document.save(`kannangara-receipt-${shortOrderId}.pdf`);
}
