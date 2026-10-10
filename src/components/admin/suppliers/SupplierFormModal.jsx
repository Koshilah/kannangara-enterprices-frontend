import { useState } from "react";
import ProductPicker from "./ProductPicker";

const emptyForm = {
  representativeName: "",
  companyName: "",
  phoneNumber: "",
  email: "",
  address: "",
};

function initialForm(supplier) {
  return supplier
    ? {
        representativeName: supplier.representativeName || "",
        companyName: supplier.companyName || "",
        phoneNumber: supplier.phoneNumber || "",
        email: supplier.email || "",
        address: supplier.address || "",
      }
    : emptyForm;
}

function SupplierFormModal({
  mode,
  supplier,
  products,
  isLoadingProducts,
  isSaving,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => initialForm(supplier));
  const [selectedProducts, setSelectedProducts] = useState(
    () => supplier?.products || [],
  );

  function updateField(event) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      products: selectedProducts.map((product) => product._id),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-sky-500/50 p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-night-sky-100/20 bg-white p-5 shadow-2xl md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplier-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
              Supplier directory
            </p>
            <h2
              id="supplier-modal-title"
              className="mt-2 text-2xl font-extrabold text-night-sky-500"
            >
              {mode === "edit" ? "Edit supplier" : "Add supplier"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-lg text-night-sky-300 transition hover:bg-night-sky-100/20 hover:text-night-sky-500"
            aria-label="Close supplier form"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <p
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                "representativeName",
                "Representative name",
                "Enter representative name",
              ],
              ["companyName", "Company name", "Enter company name"],
              ["phoneNumber", "Phone number", "Enter phone number"],
              ["email", "Email address", "Enter email address"],
            ].map(([name, label, placeholder]) => (
              <label
                key={name}
                className="flex flex-col gap-2 text-xs font-bold text-night-sky-300"
              >
                {label}
                <input
                  required
                  name={name}
                  value={form[name]}
                  onChange={updateField}
                  placeholder={placeholder}
                  type={
                    name === "email"
                      ? "email"
                      : name === "phoneNumber"
                        ? "tel"
                        : "text"
                  }
                  inputMode={name === "phoneNumber" ? "numeric" : undefined}
                  pattern={name === "phoneNumber" ? "[0-9]{10}" : undefined}
                  minLength={name === "phoneNumber" ? 10 : undefined}
                  maxLength={name === "phoneNumber" ? 10 : undefined}
                  title={
                    name === "phoneNumber"
                      ? "Enter exactly 10 numbers."
                      : undefined
                  }
                  className="rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
                />
              </label>
            ))}
          </div>

          <label className="flex flex-col gap-2 text-xs font-bold text-night-sky-300">
            Address
            <textarea
              required
              name="address"
              value={form.address}
              onChange={updateField}
              placeholder="Enter supplier address"
              rows="3"
              className="resize-y rounded-xl border border-night-sky-100/30 bg-slate-50 px-3 py-2.5 text-sm font-medium text-night-sky-500 outline-none transition placeholder:text-night-sky-200 focus:border-night-sky-300 focus:ring-2 focus:ring-night-sky-200/20"
            />
          </label>

          {isLoadingProducts ? (
            <p className="text-sm text-night-sky-200">Loading products...</p>
          ) : (
            <ProductPicker
              products={products}
              selectedProducts={selectedProducts}
              onChange={setSelectedProducts}
              disabled={isSaving}
            />
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-night-sky-100/30 px-5 py-3 text-sm font-bold text-night-sky-400 transition hover:bg-night-sky-100/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoadingProducts}
              className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-night-sky-400 disabled:cursor-wait disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : mode === "edit"
                  ? "Save changes"
                  : "Add supplier"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default SupplierFormModal;
