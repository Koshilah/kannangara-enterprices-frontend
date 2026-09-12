import { useState } from "react";

function CategoryModal({
  categories,
  isSaving,
  onClose,
  onCreate,
  onToggleVisibility,
}) {
  const [tab, setTab] = useState("list");
  const [name, setName] = useState("");
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [parentID, setParentID] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreate({
      name: name.trim(),
      parentID: isSubcategory ? parentID : null,
    });
    setName("");
    setParentID("");
    setIsSubcategory(false);
    setTab("list");
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
        aria-labelledby="category-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
              Catalog
            </p>
            <h2
              id="category-modal-title"
              className="mt-2 text-2xl font-extrabold text-night-sky-500"
            >
              Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-lg text-night-sky-300 hover:bg-night-sky-100/20 hover:text-night-sky-500"
            aria-label="Close categories"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flex border-b border-night-sky-100/20">
          <button
            type="button"
            onClick={() => setTab("list")}
            className={`border-b-2 px-4 pb-3 text-sm font-bold ${tab === "list" ? "border-night-sky-300 text-night-sky-500" : "border-transparent text-night-sky-200"}`}
          >
            Category list
          </button>
          <button
            type="button"
            onClick={() => setTab("add")}
            className={`border-b-2 px-4 pb-3 text-sm font-bold ${tab === "add" ? "border-night-sky-300 text-night-sky-500" : "border-transparent text-night-sky-200"}`}
          >
            Add category
          </button>
        </div>
        {tab === "list" ? (
          <div className="mt-5 space-y-3">
            {categories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-[#94a3b8]">
                No categories yet.
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category._id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#374151]">
                        {category.name}
                      </p>
                      <p className="mt-1 text-xs text-[#94a3b8]">
                        {category.subCategories?.length || 0} subcategories
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(category)}
                      className={`text-xs font-bold ${category.visibility ? "text-emerald-600" : "text-slate-400"}`}
                    >
                      {category.visibility ? "Visible" : "Hidden"}
                    </button>
                  </div>
                  {category.subCategories?.length > 0 && (
                    <div className="mt-3 grid gap-2 border-l-2 border-slate-100 pl-4 sm:grid-cols-2">
                      {category.subCategories.map((child) => (
                        <div
                          key={child._id}
                          className="flex items-center justify-between text-sm text-[#64748b]"
                        >
                          <span>{child.name}</span>
                          <button
                            type="button"
                            onClick={() => onToggleVisibility(child)}
                            className={`text-xs font-bold ${child.visibility ? "text-emerald-600" : "text-slate-400"}`}
                          >
                            {child.visibility ? "Visible" : "Hidden"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="flex flex-col gap-2 text-xs font-bold text-[#64748b]">
              Category name
              <input
                required
                minLength="2"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#1f2937] outline-none focus:border-emerald-400"
                placeholder="e.g. Power tools"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-bold text-[#374151]">
              Make this a subcategory
              <input
                type="checkbox"
                checked={isSubcategory}
                onChange={(event) => setIsSubcategory(event.target.checked)}
                className="size-4 accent-emerald-600"
              />
            </label>
            {isSubcategory && (
              <label className="flex flex-col gap-2 text-xs font-bold text-[#64748b]">
                Main category
                <select
                  required
                  value={parentID}
                  onChange={(event) => setParentID(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#1f2937] outline-none focus:border-emerald-400"
                >
                  <option value="">Choose a main category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={isSaving || (isSubcategory && !parentID)}
                className="rounded-xl bg-[#0f9f6e] px-5 py-3 text-sm font-bold text-white hover:bg-[#087f59] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Add category"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default CategoryModal;
