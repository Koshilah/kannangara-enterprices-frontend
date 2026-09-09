import { useEffect, useMemo, useState } from "react";
import { addExpense, deleteExpense, getExpenses } from "../../api/expense";

const emptyForm = {
  amount: "",
  shortDescription: "",
  date: new Date().toISOString().slice(0, 10),
};

function formatAmount(amount) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-LK", { dateStyle: "medium" }).format(
    new Date(date),
  );
}

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadExpenses() {
      try {
        const loadedExpenses = await getExpenses();
        if (isMounted) setExpenses(loadedExpenses);
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError.response?.data?.message || "Unable to load expenses.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadExpenses();
    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const now = new Date();
    const thisMonth = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === now.getFullYear() &&
        expenseDate.getMonth() === now.getMonth()
      );
    });

    return {
      monthTotal: thisMonth.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
      total: expenses.reduce((total, expense) => total + expense.amount, 0),
      monthCount: thisMonth.length,
      count: expenses.length,
    };
  }, [expenses]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a valid non-negative amount.");
      return;
    }

    if (!form.shortDescription.trim()) {
      setError("Add a short description for this expense.");
      return;
    }

    setIsSaving(true);
    try {
      const createdExpense = await addExpense({
        amount,
        shortDescription: form.shortDescription.trim(),
        date: form.date,
      });
      setExpenses((currentExpenses) => [createdExpense, ...currentExpenses]);
      setForm(emptyForm);
      setNotice("Expense added successfully.");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to add expense.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(expenseId) {
    if (!window.confirm("Delete this expense?")) return;

    setDeletingId(expenseId);
    setError("");
    setNotice("");
    try {
      await deleteExpense(expenseId);
      setExpenses((currentExpenses) =>
        currentExpenses.filter((expense) => expense._id !== expenseId),
      );
      setNotice("Expense deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message || "Unable to delete expense.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f4f6f9] px-5 py-8 text-[#333333] md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-0.5px] text-[#1a1a1a]">
              Expense Tracker
            </h1>
            <p className="mt-2 text-sm text-[#8c8c8c]">
              Keep a clear record of every business expense.
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-right shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <p className="text-xs font-medium text-[#8c8c8c]">
              Tracking period
            </p>
            <p className="mt-1 text-sm font-bold text-[#1a1a1a]">
              {new Intl.DateTimeFormat("en-LK", {
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </p>
          </div>
        </header>

        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Expense summary"
        >
          <SummaryCard
            icon="fa-calendar-days"
            label="This month"
            value={formatAmount(summary.monthTotal)}
            tone="red"
            detail={`${summary.monthCount} entries`}
          />
          <SummaryCard
            icon="fa-wallet"
            label="All expenses"
            value={formatAmount(summary.total)}
            tone="green"
            detail={`${summary.count} total entries`}
          />
          <SummaryCard
            icon="fa-arrow-trend-down"
            label="Average this month"
            value={formatAmount(
              summary.monthCount ? summary.monthTotal / summary.monthCount : 0,
            )}
            tone="amber"
            detail="Per recorded expense"
          />
          <SummaryCard
            icon="fa-receipt"
            label="Latest expense"
            value={formatAmount(expenses[0]?.amount || 0)}
            tone="blue"
            detail={
              expenses[0] ? formatDate(expenses[0].date) : "No entries yet"
            }
          />
        </section>

        {(error || notice) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]"
                : "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]"
            }`}
            role="status"
          >
            {error || notice}
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#1a1a1a]">
                  Expense history
                </h2>
                <p className="mt-1 text-xs text-[#8c8c8c]">
                  Review and manage recorded expenses.
                </p>
              </div>
              <span className="rounded-full bg-[#fff1f2] px-3 py-1 text-xs font-bold text-[#e02424]">
                {summary.count} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-155 border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-[#f0f0f0] pb-3 text-left font-medium text-[#8c8c8c]">
                      Date
                    </th>
                    <th className="border-b border-[#f0f0f0] pb-3 text-left font-medium text-[#8c8c8c]">
                      Description
                    </th>
                    <th className="border-b border-[#f0f0f0] pb-3 text-right font-medium text-[#8c8c8c]">
                      Amount
                    </th>
                    <th className="border-b border-[#f0f0f0] pb-3 text-right font-medium text-[#8c8c8c]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-[#8c8c8c]"
                      >
                        Loading expenses...
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-[#8c8c8c]"
                      >
                        No expenses recorded yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td className="border-b border-[#f9f9f9] py-4 text-[#4b5563]">
                          {formatDate(expense.date)}
                        </td>
                        <td className="border-b border-[#f9f9f9] py-4 font-medium text-[#374151]">
                          {expense.shortDescription}
                        </td>
                        <td className="border-b border-[#f9f9f9] py-4 text-right font-bold text-[#e02424]">
                          - {formatAmount(expense.amount)}
                        </td>
                        <td className="border-b border-[#f9f9f9] py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(expense._id)}
                            disabled={deletingId === expense._id}
                            className="inline-flex size-9 items-center justify-center rounded-lg text-[#ef4444] transition hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Delete ${expense.shortDescription}`}
                            title="Delete expense"
                          >
                            <i
                              className="fa-solid fa-trash"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] md:p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#1a1a1a]">
                  Add expense
                </h2>
                <p className="mt-1 text-xs text-[#8c8c8c]">
                  Record a new business expense.
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#ffeef0] text-[#ff4d4f]">
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-xs font-semibold text-[#4b5563]">
                Amount
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8c8c8c]">
                    Rs.
                  </span>
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-[#e5e7eb] py-3 pl-11 pr-3 text-sm outline-none transition focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/10"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-xs font-semibold text-[#4b5563]">
                Short description
                <input
                  name="shortDescription"
                  type="text"
                  value={form.shortDescription}
                  onChange={handleChange}
                  placeholder="e.g. Monthly electricity bill"
                  maxLength="120"
                  required
                  className="w-full rounded-xl border border-[#e5e7eb] px-3 py-3 text-sm outline-none transition focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/10"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs font-semibold text-[#4b5563]">
                Date
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#e5e7eb] px-3 py-3 text-sm outline-none transition focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/10"
                />
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#ff3b30] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(255,59,48,0.2)] transition hover:bg-[#e22f25] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i
                  className={`fa-solid ${isSaving ? "fa-spinner fa-spin" : "fa-plus"}`}
                  aria-hidden="true"
                ></i>
                {isSaving ? "Saving..." : "Add expense"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ icon, label, value, detail, tone }) {
  const tones = {
    red: "bg-[#ffeef0] text-[#ff4d4f]",
    green: "bg-[#e8f8f0] text-[#0f9f6e]",
    amber: "bg-[#fff8e6] text-[#d97706]",
    blue: "bg-[#eef2ff] text-[#6366f1]",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-lg ${tones[tone]}`}
      >
        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
      </div>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-medium text-[#8c8c8c]">{label}</p>
        <p className="truncate text-xl font-bold text-[#1a1a1a]">{value}</p>
        <p className="mt-1 truncate text-[11px] text-[#8c8c8c]">{detail}</p>
      </div>
    </div>
  );
}

export default Expenses;
