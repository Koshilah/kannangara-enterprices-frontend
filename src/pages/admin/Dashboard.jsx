import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getFinancialReport, getFinancialSummary } from "../../api/finance";
import { downloadFinancialReport } from "../../utility/financialReport";

const categoryLabels = {
  inventory: "Inventory",
  salaries: "Salaries",
  utilities: "Utilities",
  marketing: "Marketing",
  rent: "Rent",
  transport: "Transport",
  other: "Other",
};
const chartColors = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#14b8a6",
  "#64748b",
  "#94a3b8",
];

function formatAmount(amount) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportMonth, setReportMonth] = useState(currentMonthValue);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getFinancialSummary()
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((loadError) => {
        if (isMounted)
          setError(
            loadError.response?.data?.message ||
              "Unable to load the financial summary.",
          );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const current = summary?.currentMonth || {
    revenue: 0,
    expenses: 0,
    netProfit: 0,
  };
  const monthly = summary?.monthly || [];
  const monthlyLatestFirst = [...monthly].reverse();
  const categories = (summary?.expensesByCategory || []).map((item) => ({
    ...item,
    name: categoryLabels[item.category] || "Other",
  }));
  const value = (amount) => (isLoading ? "Loading..." : formatAmount(amount));

  function openReportModal() {
    setReportError("");
    setReportMonth(currentMonthValue());
    setIsReportModalOpen(true);
  }

  async function handleGenerateReport(event) {
    event.preventDefault();
    setReportError("");

    if (!reportMonth || reportMonth > currentMonthValue()) {
      setReportError("Choose the current month or an earlier month.");
      return;
    }

    setIsGeneratingReport(true);
    try {
      const report = await getFinancialReport(reportMonth);
      await downloadFinancialReport(report);
      setIsReportModalOpen(false);
    } catch (reportGenerationError) {
      setReportError(
        reportGenerationError.response?.data?.message ||
          "Unable to generate the financial report.",
      );
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300"></p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
              Financial Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-night-sky-200"></p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="rounded-xl border border-night-sky-100/20 bg-night-sky-100/10 px-4 py-3 text-left text-xs font-bold text-night-sky-400 sm:text-right">
              <span className="block uppercase tracking-wider text-night-sky-300">
                Reporting period
              </span>
              <span className="mt-1 block text-sm text-night-sky-500">
                {summary?.period
                  ? `${summary.period.from} to ${summary.period.to}`
                  : "Last 12 months"}
              </span>
            </div>
            <button
              type="button"
              onClick={openReportModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-night-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-night-sky-400"
            >
              <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
              Generate Report
            </button>
          </div>
        </header>

        {error && (
          <div
            className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-800"
            role="status"
          >
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon="fa-arrow-trend-up"
            label="Revenue this month"
            value={value(current.revenue)}
            detail="Paid orders"
            tone="green"
          />
          <SummaryCard
            icon="fa-arrow-trend-down"
            label="Expenses this month"
            value={value(current.expenses)}
            detail="Recorded expenses"
            tone="red"
            onClick={() => navigate("/expenses")}
          />
          <SummaryCard
            icon="fa-chart-line"
            label="Net profit this month"
            value={value(current.netProfit)}
            detail="Revenue less expenses"
            tone={current.netProfit >= 0 ? "green" : "red"}
          />
          <SummaryCard
            icon="fa-calendar-days"
            label="Reporting period"
            value={
              summary?.period ? `${summary.period.months} months` : "12 months"
            }
            detail="Rolling financial view"
            tone="amber"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <Panel
            title="Income vs expenses"
            description="Monthly paid revenue compared with recorded expenses."
          >
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthly}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#dbe4ee" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#9aaabd", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "#9aaabd", fontSize: 11 }}
                    tickFormatter={(item) => `${Math.round(item / 1000)}k`}
                  />
                  <Tooltip formatter={(item) => formatAmount(item)} />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="netProfit"
                    name="Net profit"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Expense breakdown"
            description="Recorded expenses by category for the reporting period."
          >
            <div className="h-80 w-full">
              {categories.length === 0 ? (
                <EmptyState label="No expenses recorded yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={105}
                      paddingAngle={2}
                    >
                      {categories.map((item, index) => (
                        <Cell
                          key={item.category}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(item) => formatAmount(item)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>
        </section>

        <Panel
          title="Monthly summary"
          description="A clear month-by-month view of the current reporting period."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-155 border-collapse text-sm">
              <thead>
                <tr>
                  {["Month", "Revenue", "Expenses", "Net profit"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="border-b border-night-sky-100/20 pb-3 text-left text-xs font-semibold uppercase tracking-wider text-night-sky-300"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {monthlyLatestFirst.map((month) => (
                  <tr key={month.month}>
                    <td className="border-b border-night-sky-100/10 py-4 font-semibold text-night-sky-400">
                      {month.label}
                    </td>
                    <td className="border-b border-night-sky-100/10 py-4  font-extrabold tabular-nums text-emerald-900">
                      {formatAmount(month.revenue)}
                    </td>
                    <td className="border-b border-night-sky-100/10 py-4  font-extrabold tabular-nums text-red-900">
                      {formatAmount(month.expenses)}
                    </td>
                    <td
                      className={`border-b border-night-sky-100/10 py-4  font-extrabold tabular-nums ${month.netProfit >= 0 ? "text-emerald-900" : "text-red-900"}`}
                    >
                      {formatAmount(month.netProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      {isReportModalOpen && (
        <ReportModal
          month={reportMonth}
          isGenerating={isGeneratingReport}
          error={reportError}
          onChange={setReportMonth}
          onClose={() => !isGeneratingReport && setIsReportModalOpen(false)}
          onSubmit={handleGenerateReport}
        />
      )}
    </main>
  );
}

function ReportModal({
  month,
  isGenerating,
  error,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-sky-500/50 p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="w-full max-w-md rounded-2xl border border-night-sky-100/20 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="financial-report-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
              Finance
            </p>
            <h2
              id="financial-report-title"
              className="mt-2 text-2xl font-extrabold text-night-sky-500"
            >
              Generate report
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="inline-flex size-9 items-center justify-center rounded-lg text-night-sky-300 hover:bg-night-sky-100/20 hover:text-night-sky-500 disabled:opacity-50"
            aria-label="Close financial report dialog"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
            Reporting month
            <input
              type="month"
              value={month}
              max={currentMonthValue()}
              onChange={(event) => onChange(event.target.value)}
              required
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-night-sky-500 outline-none focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-100"
            />
          </label>

          {error && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-night-sky-400 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-night-sky-400 disabled:cursor-wait disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate PDF"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-night-sky-500">{title}</h2>
        <p className="mt-1 text-xs text-night-sky-200">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SummaryCard({ icon, label, value, detail, tone, onClick }) {
  const tones = {
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
  };
  function handleKeyDown(event) {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <article
      className={`flex items-center gap-4 rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 ${onClick ? "cursor-pointer transition hover:bg-night-sky-100/20" : ""}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-lg ${tones[tone]}`}
      >
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-night-sky-200">
          {label}
        </p>
        <p className="mt-1 truncate text-xl font-extrabold text-night-sky-500">
          {value}
        </p>
        <p className="mt-1 truncate text-xs text-night-sky-200">{detail}</p>
      </div>
    </article>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-night-sky-200">
      {label}
    </div>
  );
}

export default Dashboard;
