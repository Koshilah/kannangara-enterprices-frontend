import { useState } from "react";
import { employeeRoles, getEmployeeRole } from "../../../utility/employees";

function initialForm(employee) {
  return {
    name: employee?.name || "",
    email: employee?.email || "",
    password: "",
    role: employee ? getEmployeeRole(employee) : "cashier",
  };
}

function EmployeeFormModal({ mode, employee, isSaving, error, onClose, onSubmit }) {
  const [form, setForm] = useState(() => initialForm(employee));
  const isEdit = mode === "edit";

  function updateField(event) {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = { name: form.name, email: form.email, role: form.role };
    if (!isEdit) payload.password = form.password;
    onSubmit(payload);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-sky-500/50 p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-night-sky-100/20 bg-white p-5 shadow-2xl md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">Team access</p>
            <h2 id="employee-modal-title" className="mt-2 text-2xl font-extrabold text-night-sky-500">
              {isEdit ? "Edit employee role" : "Add employee"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex size-9 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-night-sky-100/20 hover:text-night-sky-500" aria-label="Close employee form">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
              Full name
              <input required name="name" value={form.name} onChange={updateField} placeholder="Enter employee name" minLength="2" maxLength="40" className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
              Email address
              <input required name="email" value={form.email} onChange={updateField} placeholder="employee@example.com" type="email" disabled={isEdit} className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20 disabled:cursor-not-allowed disabled:opacity-60" />
            </label>
          </div>

          {!isEdit && (
            <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
              Temporary password
              <input required name="password" value={form.password} onChange={updateField} placeholder="Use a strong password" type="password" minLength="8" className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20" />
            </label>
          )}

          <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
            Responsibility level
            <select name="role" value={form.role} onChange={updateField} className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20">
              {employeeRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-night-sky-100/30 px-5 py-3 text-sm font-bold text-night-sky-400 transition hover:bg-night-sky-100/20">Cancel</button>
            <button type="submit" disabled={isSaving} className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-night-sky-400 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Saving..." : isEdit ? "Save role" : "Create employee"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default EmployeeFormModal;
