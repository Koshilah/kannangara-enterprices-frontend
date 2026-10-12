import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "Kannangara Enterprises";
const COMPANY_ADDRESS = "Nonagama Road, Kuttigala, Ambilipitiya";
const COMPANY_CONTACT = "Tel: 0472262591 / 0705806000 | Email: kannangaraenterprises@gmail.com";

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
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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

function drawStatCard(doc, x, y, width, height, label, value, bgColor) {
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y, width, height, 2.5, 2.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont(undefined, "normal");
  doc.text(label.toUpperCase(), x + 4, y + 6);

  doc.setFontSize(10.5);
  doc.setFont(undefined, "bold");
  doc.text(String(value), x + 4, y + 14);
}

export async function downloadOrderHistoryReport({ orders = [], user = null }) {
  if (!orders || orders.length === 0) {
    throw new Error("No orders available to generate the report.");
  }

  
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.dateOrdered || b.createdAt) - new Date(a.dateOrdered || a.createdAt)
  );

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const logo = await loadLogoData();

  let totalExpenditure = 0;
  let totalSavings = 0;
  let deliveredCount = 0;
  let processingCount = 0;
  let cancelledCount = 0;

  sortedOrders.forEach((order) => {
    totalExpenditure += numberValue(order.orderTotal);
    totalSavings += numberValue(order.totalSavings);

    const st = String(order.orderStatus || "").toLowerCase();
    if (st === "delivered" || st === "successful") {
      deliveredCount++;
    } else if (st === "cancelled") {
      cancelledCount++;
    } else {
      processingCount++;
    }
  });

  const customerName = user?.name || user?.fullName || "Valued Customer";
  const customerEmail = user?.email || "";

  
  const startX = 15;
  const pageWidth = 210;
  const contentWidth = 180;
  const rightX = startX + contentWidth;

  if (logo) {
    doc.addImage(logo, "PNG", startX, 12, 22, 22);
  }

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
  doc.text("CUSTOMER ORDER HISTORY", rightX, 18, { align: "right" });

  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.setTextColor(90, 100, 110);
  doc.text(`Generated: ${formatDateTime(new Date())}`, rightX, 23.5, { align: "right" });
  doc.text(
    `Customer: ${customerName}${customerEmail ? ` (${customerEmail})` : ""}`,
    rightX,
    28,
    { align: "right" }
  );

  
  doc.setDrawColor(210, 215, 220);
  doc.setLineWidth(0.4);
  doc.line(startX, 36, rightX, 36);

  
  const cardY = 41;
  const cardHeight = 18;
  const cardWidth = 42;
  const cardGap = 4;

  drawStatCard(doc, startX, cardY, cardWidth, cardHeight, "Total Orders", `${sortedOrders.length} Orders`, [18, 46, 74]);
  drawStatCard(doc, startX + (cardWidth + cardGap), cardY, cardWidth, cardHeight, "Total Spent", formatCurrency(totalExpenditure), [16, 140, 95]);
  drawStatCard(doc, startX + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, "Total Savings", formatCurrency(totalSavings), [217, 119, 6]);
  drawStatCard(doc, startX + (cardWidth + cardGap) * 3, cardY, cardWidth, cardHeight, "Delivered", `${deliveredCount} Orders`, [79, 70, 229]);

  // ── Orders Section ──
  let currentY = 66;

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(18, 46, 74);
  doc.text("Order Details", startX, currentY);
  doc.setFontSize(8.5);
  doc.setFont(undefined, "normal");
  doc.setTextColor(120, 130, 140);
  doc.text(`Showing all ${sortedOrders.length} orders recorded in your history`, startX + 32, currentY);

  currentY += 4;

  sortedOrders.forEach((order, index) => {
    const items = (order.items || []).map((item) => {
      const quantity = numberValue(item.quantity) || 1;
      const price = numberValue(item.priceSingle);
      const lineTotal = numberValue(item.priceTotal) || price * quantity;
      return {
        title: item.title || "Product",
        price,
        quantity,
        lineTotal,
      };
    });

    const shortOrderId = String(order._id || order.id || `ORD-${index + 1}`)
      .slice(-10)
      .toUpperCase();
    const orderDate = formatDate(order.dateOrdered || order.createdAt);
    const orderStatus = String(order.orderStatus || "Pending").toUpperCase();
    const paymentStatus = String(order.paymentStatus || "Unpaid").toUpperCase();
    const paymentMethod = order.paymentMethod || "Standard";
    const fulfillmentType = order.orderType === "pickup" ? "Store Pickup" : "Delivery";
    const address = order.deliveryAddress || (order.orderType === "pickup" ? "Kannangara Enterprises Main Branch" : "—");

    // Estimate vertical height needed for this order block
    const estimatedHeight = 36 + items.length * 6;

    // Check if adding this order overflows page (page height 297mm, leave 22mm for footer)
    if (currentY + estimatedHeight > 275) {
      doc.addPage();
      currentY = 18;
    }

    
    doc.setFillColor(244, 247, 250);
    doc.setDrawColor(218, 225, 233);
    doc.setLineWidth(0.2);
    doc.roundedRect(startX, currentY, contentWidth, 12, 1.5, 1.5, "FD");

    
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.setTextColor(18, 46, 74);
    doc.text(`#${shortOrderId}`, startX + 3, currentY + 5);

    doc.setFontSize(7.5);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 110, 120);
    doc.text(`Placed: ${orderDate}`, startX + 3, currentY + 9.5);

    // Fulfillment & Address
    doc.setFontSize(7.5);
    doc.setTextColor(70, 80, 90);
    doc.text(
      `${fulfillmentType}: ${address.length > 45 ? address.substring(0, 42) + "..." : address}`,
      startX + 45,
      currentY + 5
    );
    doc.text(`Payment: ${paymentMethod} (${paymentStatus})`, startX + 45, currentY + 9.5);

    
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    if (orderStatus === "DELIVERED" || orderStatus === "SUCCESSFUL") {
      doc.setTextColor(16, 140, 95);
    } else if (orderStatus === "CANCELLED") {
      doc.setTextColor(220, 38, 38);
    } else {
      doc.setTextColor(217, 119, 6);
    }
    doc.text(`Status: ${orderStatus}`, rightX - 3, currentY + 5, { align: "right" });

    doc.setFontSize(8.5);
    doc.setTextColor(18, 46, 74);
    doc.text(`Total: ${formatCurrency(order.orderTotal)}`, rightX - 3, currentY + 9.5, { align: "right" });

    
    autoTable(doc, {
      startY: currentY + 13.5,
      margin: { left: startX, right: pageWidth - rightX },
      head: [["#", "Item Description", "Unit Price", "Qty", "Item Total"]],
      body: items.map((item, idx) => [
        idx + 1,
        item.title,
        formatCurrency(item.price),
        String(item.quantity),
        formatCurrency(item.lineTotal),
      ]),
      theme: "plain",
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        textColor: [45, 55, 65],
        lineColor: [230, 235, 240],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [235, 240, 245],
        textColor: [18, 46, 74],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: 14, halign: "center" },
        4: { cellWidth: 28, halign: "right" },
      },
    });

    
    const tableEndY = doc.lastAutoTable.finalY + 3.5;

    doc.setFontSize(7.5);
    doc.setFont(undefined, "normal");
    doc.setTextColor(110, 120, 130);

    const subtotalText = `Subtotal: ${formatCurrency(order.subtotal || order.orderTotal)}`;
    const savingsText = order.totalSavings > 0 ? `Savings: ${formatCurrency(order.totalSavings)}` : null;
    const feeText = `Delivery: ${numberValue(order.deliveryFee) === 0 ? "Free" : formatCurrency(order.deliveryFee)}`;
    const totalText = `Order Total: ${formatCurrency(order.orderTotal)}`;

    const summaryParts = [subtotalText];
    if (savingsText) summaryParts.push(savingsText);
    summaryParts.push(feeText);
    summaryParts.push(totalText);

    doc.text(summaryParts.join("   |   "), rightX, tableEndY, { align: "right" });

    currentY = tableEndY + 7;
  });

  
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(215, 220, 225);
    doc.setLineWidth(0.3);
    doc.line(startX, 284, rightX, 284);

    doc.setFontSize(7.5);
    doc.setFont(undefined, "normal");
    doc.setTextColor(120, 130, 140);
    doc.text(
      "Kannangara Enterprises — Quality Tools, Building Materials & Hardware Supplies",
      startX,
      289
    );
    doc.text(`Page ${i} of ${totalPages}`, rightX, 289, { align: "right" });
  }

  const fileTimestamp = new Date().toISOString().slice(0, 10);
  doc.save(`kannangara-order-history-${fileTimestamp}.pdf`);
}