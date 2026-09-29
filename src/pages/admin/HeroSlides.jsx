import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  createHeroSlide,
  deleteHeroSlide,
  getManageableHeroSlides,
  updateHeroSlide,
} from "../../api/heroSlide";
import { uploadImage } from "../../api/cloudinary";

const emptyForm = {
  eyebrow: "",
  title: "",
  description: "",
  actionLabel: "Explore now",
  href: "/catalog",
  imageURL: "",
  imagePublicId: "",
  alt: "",
  accentTheme: "navy",
  sortOrder: "0",
  isActive: true,
};

const accentOptions = [
  { value: "navy", label: "Navy" },
  { value: "slate", label: "Slate" },
  { value: "charcoal", label: "Charcoal" },
];

function getCurrentUser() {
  try {
    return JSON.parse(window.localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function HeroSlides() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const canManage = Boolean(user?.isAdmin || user?.isMannager);
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingID, setEditingID] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewURL, setImagePreviewURL] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function loadSlides() {
    setIsLoading(true);
    try {
      setSlides(await getManageableHeroSlides());
    } catch (loadError) {
      setError(
        loadError.response?.data?.message || "Unable to load hero slides.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!canManage) return undefined;

    let mounted = true;
    getManageableHeroSlides()
      .then((loadedSlides) => {
        if (mounted) setSlides(loadedSlides);
      })
      .catch((loadError) => {
        if (mounted) {
          setError(
            loadError.response?.data?.message || "Unable to load hero slides.",
          );
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [canManage]);

  useEffect(() => {
    return () => {
      if (imagePreviewURL) URL.revokeObjectURL(imagePreviewURL);
    };
  }, [imagePreviewURL]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
    setNotice("");
  }

  function validateForm() {
    const nextErrors = {};
    const title = form.title.trim();
    const sortOrder = Number(form.sortOrder);

    if (title.length < 5 || title.length > 100) {
      nextErrors.title = "Title must be between 5 and 100 characters.";
    }
    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }
    if (!form.href.trim() || !/^(\/|https?:\/\/)/.test(form.href.trim())) {
      nextErrors.href = "Use a relative path or an http(s) URL.";
    }
    if (!form.imageURL.trim() && !imageFile) {
      nextErrors.imageURL = "Choose an image for this slide.";
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      nextErrors.sortOrder = "Order must be a non-negative whole number.";
    }
    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        nextErrors.imageFile = "Select a valid image file.";
      } else if (imageFile.size > 5 * 1024 * 1024) {
        nextErrors.imageFile = "Image must be 5 MB or smaller.";
      }
    }

    setFieldErrors(nextErrors);
    return nextErrors;
  }

  function startEditing(slide) {
    setEditingID(slide._id);
    setForm({
      eyebrow: slide.eyebrow || "",
      title: slide.title || "",
      description: slide.description || "",
      actionLabel: slide.actionLabel || "Explore now",
      href: slide.href || "/catalog",
      imageURL: slide.imageURL || "",
      imagePublicId: slide.imagePublicId || "",
      alt: slide.alt || "",
      accentTheme: slide.accentTheme || "navy",
      sortOrder: String(slide.sortOrder ?? 0),
      isActive: slide.isActive !== false,
    });
    setImageFile(null);
    setImagePreviewURL("");
    setFieldErrors({});
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingID(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreviewURL("");
    setFieldErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (Object.keys(validateForm()).length > 0) return;

    setIsSaving(true);
    try {
      let imageURL = form.imageURL.trim();
      let imagePublicId = form.imagePublicId;
      if (imageFile) {
        const uploadedImage = await uploadImage(imageFile);
        imageURL = uploadedImage.url;
        imagePublicId = uploadedImage.publicId;
      }

      const payload = {
        ...form,
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        actionLabel: form.actionLabel.trim(),
        href: form.href.trim(),
        imageURL,
        imagePublicId,
        alt: (form.alt || form.title).trim(),
        sortOrder: Number(form.sortOrder),
      };

      if (editingID) await updateHeroSlide(editingID, payload);
      else await createHeroSlide(payload);

      await loadSlides();
      resetForm();
      setNotice(editingID ? "Hero slide updated." : "Hero slide created.");
    } catch (saveError) {
      setError(
        saveError.response?.data?.message || "Unable to save hero slide.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(slide) {
    if (!window.confirm(`Delete “${slide.title}”? This cannot be undone.`))
      return;

    setError("");
    try {
      await deleteHeroSlide(slide._id);
      setSlides((current) => current.filter((item) => item._id !== slide._id));
      if (editingID === slide._id) resetForm();
      setNotice("Hero slide deleted.");
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message || "Unable to delete hero slide.",
      );
    }
  }

  if (!canManage) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-12 text-center text-night-sky-500">
        You are not authorized to manage hero slides.
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <title>Hero Slides | Kannangara Hardwares</title>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
              Storefront content
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
              Hero slides
            </h1>
            <p className="mt-2 text-sm text-night-sky-200">
              Manage the featured content shown on the home page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm font-bold text-night-sky-300 hover:text-night-sky-500"
          >
            View storefront
          </button>
        </header>

        {error && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            role="status"
          >
            {notice}
          </p>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] md:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-night-sky-500">
                {editingID ? "Edit slide" : "Add slide"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload a poster and keep the message short and clear.
              </p>
            </div>
            {editingID && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-bold text-slate-500 hover:text-night-sky-500"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <Field
              label="Eyebrow"
              name="eyebrow"
              value={form.eyebrow}
              onChange={updateField}
              placeholder="Build with confidence"
            />
            <Field
              label="Title"
              name="title"
              value={form.title}
              onChange={updateField}
              required
              placeholder="The right tools for every project."
              error={fieldErrors.title}
            />
            <Field
              label="Button label"
              name="actionLabel"
              value={form.actionLabel}
              onChange={updateField}
              placeholder="Shop hardware"
            />
            <Field
              label="Link"
              name="href"
              value={form.href}
              onChange={updateField}
              placeholder="/catalog"
              error={fieldErrors.href}
            />
            <label className="flex flex-col gap-2 text-xs font-bold text-slate-600 md:col-span-2">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows="3"
                placeholder="Quality hardware for every project"
                className="resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-night-sky-300"
              />
              {fieldErrors.description && (
                <span className="font-medium text-red-600">
                  {fieldErrors.description}
                </span>
              )}
            </label>
            <Field
              label="Image alt text"
              name="alt"
              value={form.alt}
              onChange={updateField}
              placeholder="Hand tools arranged on a workbench"
            />
            <Field
              label="Display order"
              name="sortOrder"
              value={form.sortOrder}
              onChange={updateField}
              type="number"
              min="0"
              step="1"
              error={fieldErrors.sortOrder}
            />
            <label className="flex flex-col gap-2 text-xs font-bold text-slate-600">
              Accent theme
              <select
                name="accentTheme"
                value={form.accentTheme}
                onChange={updateField}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-night-sky-300"
              >
                {accentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold text-slate-600">
              Poster image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setImageFile(file);
                  setImagePreviewURL(file ? URL.createObjectURL(file) : "");
                  setFieldErrors((current) => ({ ...current, imageFile: "" }));
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-night-sky-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
              />
              {fieldErrors.imageFile && (
                <span className="font-medium text-red-600">
                  {fieldErrors.imageFile}
                </span>
              )}
              {fieldErrors.imageURL && (
                <span className="font-medium text-red-600">
                  {fieldErrors.imageURL}
                </span>
              )}
            </label>
            <label className="flex items-center gap-3 self-end pb-2 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={updateField}
                className="size-4 accent-night-sky-500"
              />
              Show this slide on the storefront
            </label>
            {(imagePreviewURL || form.imageURL) && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 md:col-span-2">
                <img
                  src={imagePreviewURL || form.imageURL}
                  alt="Selected slide preview"
                  className="h-40 w-full object-cover"
                />
              </div>
            )}
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-night-sky-400 disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : editingID
                    ? "Save changes"
                    : "Add slide"}
              </button>
              {!editingID && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] md:p-7">
          <h2 className="mb-5 text-xl font-extrabold text-night-sky-500">
            Current slides
          </h2>
          {isLoading ? (
            <p className="py-8 text-sm text-slate-500">Loading slides...</p>
          ) : slides.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">
              No slides have been added yet.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {slides.map((slide) => (
                <article
                  key={slide._id}
                  className="flex gap-4 rounded-xl border border-slate-200 p-3"
                >
                  <img
                    src={slide.imageURL}
                    alt={slide.alt || slide.title}
                    className="h-24 w-32 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Order {slide.sortOrder}
                        </p>
                        <h3 className="mt-1 line-clamp-2 font-bold text-night-sky-500">
                          {slide.title}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${slide.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {slide.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-3 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => startEditing(slide)}
                        className="text-night-sky-400 hover:text-night-sky-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(slide)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, name, value, onChange, error, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-xs font-bold text-slate-600">
      {label}
      <input
        name={name}
        value={value}
        onChange={onChange}
        {...props}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-night-sky-300"
      />
      {error && <span className="font-medium text-red-600">{error}</span>}
    </label>
  );
}

export default HeroSlides;
