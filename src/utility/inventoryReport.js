import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = "Kannangara Enterprises";
const CATEGORY_LABELS = {
  inventory: "Inventory",
  salaries: "Salaries",
  utilities: "Utilities",
  marketing: "Marketing",
  rent: "Rent",
  transport: "Transport",
  other: "Other",
};

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
    dateStyle: "medium",
  }).format(new Date(value));
}

function loadLogo() {
  return fetch("/logo.png")
    .then((response) => (response.ok ? response.blob() : null))
    .then(
      (blob) =>
        new Promise((resolve) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        }),
    )
    .catch(() => null);
}

function categoryName(product, categoryNames) {
  if (Array.isArray(product.category)) {
    return product.category
      .map(
        (category) =>
          categoryNames?.[category] || CATEGORY_LABELS[category] || category,
      )
      .join(", ");
  }
  return product.category || "Uncategorised";
}

function stockStatus(product) {
  if (product.outOfStock || numberValue(product.totalStock) === 0) {
    return "Out of stock";
  }
  if (numberValue(product.totalStock) <= 5) return "Low stock";
  return "In stock";
}

export async function downloadInventoryReport(
  products = [],
  categoryNames = {},
) {
  const document = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const logo = await loadLogo();
  const totalUnits = products.reduce(
    (total, product) => total + numberValue(product.totalStock),
    0,
  );
  const visibleCount = products.filter((product) => product.visibility).length;
  const outOfStockCount = products.filter(
    (product) => product.outOfStock || numberValue(product.totalStock) === 0,
  ).length;

  if (logo) document.addImage(logo, "PNG", 16, 12, 20, 20);

  document.setTextColor(18, 46, 74);
  document.setFontSize(20);
  document.setFont(undefined, "bold");
  document.text(COMPANY_NAME, 42, 21);
  document.setFontSize(10);
  document.setFont(undefined, "normal");
  document.setTextColor(90, 100, 110);
  document.text("Inventory Report", 42, 28);
  document.text(
    `Generated: ${new Intl.DateTimeFormat("en-LK", { dateStyle: "medium" }).format(new Date())}`,
    281,
    18,
    { align: "right" },
  );
  document.text(`Products: ${products.length}`, 281, 25, { align: "right" });
  document.line(16, 38, 281, 38);

  const summaryY = 47;
  const summaryCards = [
    ["Total products", products.length, [18, 46, 74]],
    ["Total units", totalUnits, [16, 185, 129]],
    ["Visible products", visibleCount, [99, 102, 241]],
    ["Out of stock", outOfStockCount, [239, 68, 68]],
  ];
  summaryCards.forEach(([label, value, color], index) => {
    const x = 16 + index * 67;
    document.setFillColor(...color);
    document.roundedRect(x, summaryY, 62, 20, 3, 3, "F");
    document.setTextColor(255, 255, 255);
    document.setFontSize(8);
    document.setFont(undefined, "normal");
    document.text(label, x + 4, summaryY + 7);
    document.setFontSize(12);
    document.setFont(undefined, "bold");
    document.text(String(value), x + 4, summaryY + 15);
  });

  const rows = products.map((product) => [
    product.title || "Untitled product",
    product.description || "-",
    categoryName(product, categoryNames),
    formatCurrency(product.price),
    product.discountPrice && numberValue(product.discountPrice) > 0
      ? formatCurrency(product.discountPrice)
      : "-",
    String(numberValue(product.totalStock)),
    stockStatus(product),
    product.visibility ? "Visible" : "Hidden",
    product.imageURL || "-",
    product.addedBy?.name || "-",
    formatDate(product.createdAt),
    formatDate(product.updatedAt),
  ]);

  autoTable(document, {
    startY: 76,
    head: [
      [
        "Product",
        "Description",
        "Category",
        "Price",
        "Discount price",
        "Stock",
        "Stock status",
        "Visibility",
        "Image URL",
        "Added by",
        "Created",
        "Updated",
      ],
    ],
    body: rows.length ? rows : [["No products found", ...Array(11).fill("-")]],
    theme: "grid",
    styles: {
      fontSize: 6.5,
      cellPadding: 2,
      overflow: "linebreak",
      textColor: [35, 45, 55],
      valign: "top",
    },
    headStyles: {
      fillColor: [18, 46, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.5,
    },
    alternateRowStyles: { fillColor: [246, 248, 250] },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 42 },
      2: { cellWidth: 24 },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 21, halign: "right" },
      5: { cellWidth: 12, halign: "right" },
      6: { cellWidth: 20 },
      7: { cellWidth: 15 },
      8: { cellWidth: 42 },
      9: { cellWidth: 19 },
      10: { cellWidth: 20 },
      11: { cellWidth: 20 },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 6) {
        const status = String(data.cell.raw);
        if (status === "Out of stock")
          data.cell.styles.textColor = [185, 28, 28];
        if (status === "Low stock") data.cell.styles.textColor = [180, 83, 9];
        if (status === "In stock") data.cell.styles.textColor = [4, 120, 87];
      }
    },
  });

  document.setFontSize(8);
  document.setTextColor(110, 115, 120);
  document.text(
    "Inventory values reflect the catalog data available when this report was generated.",
    148.5,
    200,
    { align: "center" },
  );

  document.save("kannangara-inventory-report.pdf");
}
