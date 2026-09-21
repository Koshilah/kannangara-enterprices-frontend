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
const CHART_COLORS = [
  [239, 68, 68],
  [245, 158, 11],
  [16, 185, 129],
  [99, 102, 241],
  [20, 184, 166],
  [100, 116, 139],
  [148, 163, 184],
];

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

function loadImage() {
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

function drawMetricCard(document, x, y, width, label, value, color) {
  document.setFillColor(...color);
  document.roundedRect(x, y, width, 23, 3, 3, "F");
  document.setTextColor(255, 255, 255);
  document.setFontSize(8);
  document.setFont(undefined, "normal");
  document.text(label, x + 5, y + 8);
  document.setFontSize(12);
  document.setFont(undefined, "bold");
  document.text(formatCurrency(value), x + 5, y + 17);
}

function drawPeriodCard(document, x, y, width, label, value, color) {
  document.setFillColor(...color);
  document.roundedRect(x, y, width, 23, 3, 3, "F");
  document.setTextColor(255, 255, 255);
  document.setFontSize(8);
  document.setFont(undefined, "normal");
  document.text(label, x + 5, y + 8);
  document.setFontSize(12);
  document.setFont(undefined, "bold");
  document.text(value, x + 5, y + 17);
}

function drawIncomeChart(document, month, x, y, width) {
  const values = [
    {
      label: "Revenue",
      value: numberValue(month.revenue),
      color: [16, 185, 129],
    },
    {
      label: "Expenses",
      value: numberValue(month.expenses),
      color: [239, 68, 68],
    },
    {
      label: "Net profit",
      value: numberValue(month.netProfit),
      color: [245, 158, 11],
    },
  ];
  const maxValue = Math.max(...values.map((item) => item.value), 1);
  const chartWidth = width - 45;
  const barHeight = 12;

  document.setFontSize(11);
  document.setFont(undefined, "bold");
  document.setTextColor(18, 46, 74);
  document.text("Income versus expenses", x, y);
  document.setFont(undefined, "normal");

  values.forEach((item, index) => {
    const rowY = y + 10 + index * 22;
    document.setFontSize(8);
    document.setTextColor(75, 85, 95);
    document.text(item.label, x, rowY + 8);
    document.setFillColor(232, 237, 241);
    document.roundedRect(x + 40, rowY, chartWidth, barHeight, 2, 2, "F");
    document.setFillColor(...item.color);
    document.roundedRect(
      x + 40,
      rowY,
      Math.max((item.value / maxValue) * chartWidth, item.value ? 2 : 0),
      barHeight,
      2,
      2,
      "F",
    );
    document.setTextColor(35, 45, 55);
    document.text(formatCurrency(item.value), x + 44 + chartWidth, rowY + 8, {
      align: "right",
    });
  });
}

function drawExpenseChart(document, categories, x, y, width) {
  const rows = categories.slice(0, 7);
  const maxValue = Math.max(...rows.map((item) => numberValue(item.total)), 1);
  const chartWidth = width - 55;

  document.setFontSize(11);
  document.setFont(undefined, "bold");
  document.setTextColor(18, 46, 74);
  document.text("Expense breakdown", x, y);
  document.setFont(undefined, "normal");

  if (rows.length === 0) {
    document.setFontSize(9);
    document.setTextColor(110, 115, 120);
    document.text("No expenses recorded for this month.", x, y + 18);
    return;
  }

  rows.forEach((item, index) => {
    const rowY = y + 10 + index * 17;
    const label = CATEGORY_LABELS[item.category] || "Other";
    document.setFontSize(8);
    document.setTextColor(75, 85, 95);
    document.text(label, x, rowY + 7);
    document.setFillColor(232, 237, 241);
    document.roundedRect(x + 50, rowY, chartWidth, 10, 2, 2, "F");
    document.setFillColor(...CHART_COLORS[index % CHART_COLORS.length]);
    document.roundedRect(
      x + 50,
      rowY,
      Math.max((numberValue(item.total) / maxValue) * chartWidth, 2),
      10,
      2,
      2,
      "F",
    );
    document.setTextColor(35, 45, 55);
    document.text(formatCurrency(item.total), x + 55 + chartWidth, rowY + 7, {
      align: "right",
    });
  });
}

export async function downloadFinancialReport(report) {
  if (!report?.currentMonth) {
    throw new Error("Financial report data is unavailable.");
  }

  const month = report.currentMonth;
  const categories = report.expensesByCategory || [];
  const document = new jsPDF({ unit: "mm", format: "a4" });
  const logo = await loadImage();

  if (logo) document.addImage(logo, "PNG", 20, 15, 22, 22);

  document.setTextColor(18, 46, 74);
  document.setFontSize(20);
  document.setFont(undefined, "bold");
  document.text(COMPANY_NAME, 48, 24);
  document.setFontSize(10);
  document.setFont(undefined, "normal");
  document.setTextColor(90, 100, 110);
  document.text("Financial Report", 48, 31);
  document.text(`Reporting month: ${month.label}`, 190, 21, { align: "right" });
  document.text(
    `Generated: ${new Intl.DateTimeFormat("en-LK", { dateStyle: "medium" }).format(new Date())}`,
    190,
    28,
    { align: "right" },
  );
  document.line(20, 42, 190, 42);

  const cardWidth = 40;
  drawMetricCard(
    document,
    20,
    50,
    cardWidth,
    "Revenue",
    month.revenue,
    [16, 185, 129],
  );
  drawMetricCard(
    document,
    65,
    50,
    cardWidth,
    "Expenses",
    month.expenses,
    [239, 68, 68],
  );
  drawMetricCard(
    document,
    110,
    50,
    cardWidth,
    "Net profit",
    month.netProfit,
    [245, 158, 11],
  );
  drawPeriodCard(document, 155, 50, 35, "Period", "1 month", [18, 46, 74]);

  drawIncomeChart(document, month, 20, 88, 82);
  drawExpenseChart(document, categories, 108, 88, 82);

  autoTable(document, {
    startY: 165,
    head: [["Reporting month", "Revenue", "Expenses", "Net profit"]],
    body: [
      [
        month.label,
        formatCurrency(month.revenue),
        formatCurrency(month.expenses),
        formatCurrency(month.netProfit),
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3, textColor: [35, 45, 55] },
    headStyles: {
      fillColor: [18, 46, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
  });

  const categoryRows = categories.map((item) => {
    const totalExpenses = numberValue(month.expenses);
    const percentage = totalExpenses
      ? (numberValue(item.total) / totalExpenses) * 100
      : 0;
    return [
      CATEGORY_LABELS[item.category] || "Other",
      formatCurrency(item.total),
      `${percentage.toFixed(1)}%`,
    ];
  });

  autoTable(document, {
    startY: document.lastAutoTable.finalY + 10,
    head: [["Expense category", "Amount", "Share"]],
    body: categoryRows.length
      ? categoryRows
      : [["No expenses recorded", formatCurrency(0), "0.0%"]],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3, textColor: [35, 45, 55] },
    headStyles: {
      fillColor: [18, 46, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
  });

  document.setFontSize(8);
  document.setTextColor(110, 115, 120);
  document.text(
    "Revenue includes paid or successful, non-cancelled orders. Expenses are recorded business expenses.",
    105,
    285,
    { align: "center" },
  );

  document.save(`kannangara-financial-report-${month.month}.pdf`);
}
