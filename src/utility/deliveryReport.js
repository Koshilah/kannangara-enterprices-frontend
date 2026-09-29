import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "Kannangara Enterprises";
const COMPANY_ADDRESS = "Nonagama Road, Kuttigala, Ambilipitiya";
const COMPANY_CONTACT =
  "Tel: 0472262591 / 0705806000 | Email: kannangaraenterprises@gmail.com";

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  delivered: [16, 140, 95],
  cancelled: [220, 38, 38],
  out_for_delivery: [37, 99, 235],
  processing: [217, 119, 6],
  pending: [100, 116, 139],
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
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

/**
 * Downloads a PDF delivery report.
 *
 * @param {object} options
 * @param {Array}  options.deliveries  - Delivery records to include (already filtered)
 * @param {object} options.filters     - { statusFilter, fromDate, toDate }
 */
export async function downloadDeliveryReport({
  deliveries = [],
  filters = {},
}) {
  if (!deliveries || deliveries.length === 0) {
    throw new Error("No deliveries available to generate the report.");
  }

  // Sort newest due-date first
  const sorted = [...deliveries].sort(
    (a, b) => new Date(b.dueDate) - new Date(a.dueDate),
  );

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const logo = await loadLogoData();

  // ── Metrics ──
  const counts = {
    delivered: 0,
    cancelled: 0,
    out_for_delivery: 0,
    processing: 0,
    pending: 0,
  };
  sorted.forEach((d) => {
    const st = d.status || "pending";
    if (counts[st] !== undefined) counts[st]++;
  });

  // ── Page layout ──
  const startX = 15;
  const pageWidth = 210;
  const contentWidth = 180;
  const rightX = startX + contentWidth;

  // ── Header ──
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
  doc.text("DELIVERY REPORT", rightX, 18, { align: "right" });

  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.setTextColor(90, 100, 110);
  doc.text(`Generated: ${formatDateTime(new Date())}`, rightX, 23.5, {
    align: "right",
  });

  // Filter summary line
  const filterParts = [];
  if (filters.statusFilter && filters.statusFilter !== "all") {
    filterParts.push(
      `Status: ${STATUS_LABELS[filters.statusFilter] || filters.statusFilter}`,
    );
  }
  if (filters.fromDate)
    filterParts.push(`From: ${formatDate(filters.fromDate)}`);
  if (filters.toDate) filterParts.push(`To: ${formatDate(filters.toDate)}`);
  const filterSummary = filterParts.length
    ? filterParts.join("  |  ")
    : "All deliveries";
  doc.text(filterSummary, rightX, 28, { align: "right" });

  // Separator
  doc.setDrawColor(210, 215, 220);
  doc.setLineWidth(0.4);
  doc.line(startX, 36, rightX, 36);

  // ── Summary Cards ──
  const cardY = 41;
  const cardH = 18;
  const cardW = 42;
  const gap = 4;

  drawStatCard(
    doc,
    startX,
    cardY,
    cardW,
    cardH,
    "Total",
    `${sorted.length} Records`,
    [18, 46, 74],
  );
  drawStatCard(
    doc,
    startX + (cardW + gap),
    cardY,
    cardW,
    cardH,
    "Delivered",
    `${counts.delivered} Orders`,
    [16, 140, 95],
  );
  drawStatCard(
    doc,
    startX + (cardW + gap) * 2,
    cardY,
    cardW,
    cardH,
    "In Progress",
    `${counts.processing + counts.out_for_delivery} Orders`,
    [217, 119, 6],
  );
  drawStatCard(
    doc,
    startX + (cardW + gap) * 3,
    cardY,
    cardW,
    cardH,
    "Cancelled",
    `${counts.cancelled} Orders`,
    [220, 38, 38],
  );

  // ── Section heading ──
  let currentY = 66;

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(18, 46, 74);
  doc.text("Delivery Records", startX, currentY);
  doc.setFontSize(8.5);
  doc.setFont(undefined, "normal");
  doc.setTextColor(120, 130, 140);
  doc.text(
    `${sorted.length} record${sorted.length !== 1 ? "s" : ""} included`,
    startX + 36,
    currentY,
  );

  currentY += 5;

  // ── Main table ──
  const tableBody = sorted.map((delivery, index) => {
    const orderID = delivery.orderID?._id || delivery.orderID || "—";
    const shortID = String(orderID).slice(-10).toUpperCase();
    const statusText = STATUS_LABELS[delivery.status] || delivery.status || "—";
    const dueDate = formatDate(delivery.dueDate);
    const address = delivery.deliveryAddress || "—";

    return [index + 1, shortID, address, dueDate, statusText];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: pageWidth - rightX },
    head: [["#", "Order ID", "Delivery Address", "Due Date", "Status"]],
    body: tableBody,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [45, 55, 65],
      lineColor: [230, 235, 240],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [235, 240, 245],
      textColor: [18, 46, 74],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 26 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 28, halign: "center" },
      4: { cellWidth: 30, halign: "center" },
    },
    // Colour-code status text without replacing the table's rendered value.
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 4) {
        const delivery = sorted[data.row.index];
        const color = STATUS_COLORS[delivery?.status] || [45, 55, 65];
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const tableEndY = doc.lastAutoTable.finalY;

  // ── Status breakdown summary bar ──
  const summaryY = tableEndY + 8;
  if (summaryY < 275) {
    doc.setFillColor(244, 247, 250);
    doc.roundedRect(startX, summaryY, contentWidth, 16, 2, 2, "F");

    const statusOrder = [
      "delivered",
      "out_for_delivery",
      "processing",
      "pending",
      "cancelled",
    ];
    const parts = statusOrder
      .filter((s) => counts[s] > 0)
      .map((s) => `${STATUS_LABELS[s]}: ${counts[s]}`);

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(60, 70, 80);
    doc.text("Summary:", startX + 4, summaryY + 6);
    doc.setFont(undefined, "bold");
    doc.text(parts.join("   |   "), startX + 22, summaryY + 6);

    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 110, 120);
    const rate =
      sorted.length > 0
        ? ((counts.delivered / sorted.length) * 100).toFixed(1)
        : "0.0";
    doc.text(`Delivery success rate: ${rate}%`, rightX, summaryY + 6, {
      align: "right",
    });
  }

  // ── Footer on every page ──
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
      289,
    );
    doc.text(`Page ${i} of ${totalPages}`, rightX, 289, { align: "right" });
  }

  const fileTimestamp = new Date().toISOString().slice(0, 10);
  doc.save(`kannangara-delivery-report-${fileTimestamp}.pdf`);
}
