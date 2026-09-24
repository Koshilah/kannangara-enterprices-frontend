import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "Kannangara Enterprises";
const COMPANY_ADDRESS = "Nonagama Road, Kuttigala, Ambilipitiya";
const COMPANY_CONTACT =
  "Tel: 0472262591 / 0705806000 | Email: kannangaraenterprises@gmail.com";

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
 * Downloads a PDF supplier directory report.
 *
 * @param {Array} suppliers - All supplier records to include
 */
export async function downloadSupplierReport(suppliers = []) {
  if (!suppliers || suppliers.length === 0) {
    throw new Error("No suppliers available to generate the report.");
  }

  // Sort alphabetically by company name
  const sorted = [...suppliers].sort((a, b) =>
    (a.companyName || "").localeCompare(b.companyName || "")
  );

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const logo = await loadLogoData();

  // ── Metrics ──
  const totalProducts = sorted.reduce(
    (sum, s) => sum + (s.products?.length || 0),
    0
  );
  const suppliersWithProducts = sorted.filter(
    (s) => s.products?.length > 0
  ).length;

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
  doc.text("SUPPLIER DIRECTORY REPORT", rightX, 18, { align: "right" });

  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.setTextColor(90, 100, 110);
  doc.text(`Generated: ${formatDateTime(new Date())}`, rightX, 23.5, {
    align: "right",
  });
  doc.text(`Total Suppliers: ${sorted.length}`, rightX, 28, {
    align: "right",
  });

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
    doc, startX, cardY, cardW, cardH,
    "Total Suppliers", `${sorted.length} Suppliers`, [18, 46, 74]
  );
  drawStatCard(
    doc, startX + (cardW + gap), cardY, cardW, cardH,
    "With Products", `${suppliersWithProducts} Suppliers`, [16, 140, 95]
  );
  drawStatCard(
    doc, startX + (cardW + gap) * 2, cardY, cardW, cardH,
    "Total Products", `${totalProducts} Products`, [217, 119, 6]
  );
  drawStatCard(
    doc, startX + (cardW + gap) * 3, cardY, cardH, cardH,
    "Report Date", new Intl.DateTimeFormat("en-LK", { dateStyle: "medium" }).format(new Date()), [79, 70, 229]
  );

  // ── Section heading ──
  let currentY = 66;

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(18, 46, 74);
  doc.text("Supplier Directory", startX, currentY);
  doc.setFontSize(8.5);
  doc.setFont(undefined, "normal");
  doc.setTextColor(120, 130, 140);
  doc.text(
    `${sorted.length} supplier${sorted.length !== 1 ? "s" : ""} — sorted alphabetically by company name`,
    startX + 34,
    currentY
  );

  currentY += 5;

  // ── Main table ──
  const tableBody = sorted.map((supplier, index) => {
    const company = supplier.companyName || "—";
    const rep = supplier.representativeName || "—";
    const phone = supplier.phone || "—";
    const email = supplier.email || "—";
    const products = (supplier.products || [])
      .map((p) => p.title || p.name || "")
      .filter(Boolean)
      .join(", ") || "—";

    return [index + 1, company, rep, phone, email, products];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: pageWidth - rightX },
    head: [["#", "Company Name", "Representative", "Phone", "Email", "Products Supplied"]],
    body: tableBody,
    theme: "plain",
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [45, 55, 65],
      lineColor: [230, 235, 240],
      lineWidth: 0.15,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [235, 240, 245],
      textColor: [18, 46, 74],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 35, fontStyle: "bold" },
      2: { cellWidth: 30 },
      3: { cellWidth: 24 },
      4: { cellWidth: 38 },
      5: { cellWidth: "auto" },
    },
    // Alternating row background for readability
    didParseCell(data) {
      if (data.section === "body" && data.row.index % 2 === 0) {
        data.cell.styles.fillColor = [250, 251, 253];
      }
    },
  });

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
      289
    );
    doc.text(`Page ${i} of ${totalPages}`, rightX, 289, { align: "right" });
  }

  const fileTimestamp = new Date().toISOString().slice(0, 10);
  doc.save(`kannangara-supplier-directory-${fileTimestamp}.pdf`);
}
