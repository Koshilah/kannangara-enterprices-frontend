import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../api/product";
import { getCategories } from "../../api/category";
import { uploadProductImage } from "../../api/cloudinary";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  discountPrice: "",
  totalStock: "0",
  category: "",
  imageURL: "",
  outOfStock: false,
  visibility: true,
};

function ProductForm() {
  const navigate = useNavigate();
  const { productID } = useParams();
  const isEditing = Boolean(productID);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewURL, setImagePreviewURL] = useState("");
  const previewObjectURLRef = useRef(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getCategories(),
      isEditing ? getProducts() : Promise.resolve([]),
    ])
      .then(([loadedCategories, products]) => {
        if (!mounted) return;
        setCategories(loadedCategories);
        const product = products.find((item) => item._id === productID);
        if (isEditing && !product) throw new Error("Product not found.");
        if (product) {
          setForm({
            title: product.title || "",
            description: product.description || "",
            price: product.price ?? "",
            discountPrice: product.discountPrice ?? "",
            totalStock: product.totalStock ?? 0,
            category: product.category?.[0] || "",
            imageURL: product.imageURL || "",
            outOfStock: Boolean(product.outOfStock),
            visibility: product.visibility !== false,
          });
        }
      })
      .catch((loadError) => {
        if (mounted)
          setError(
            loadError.response?.data?.message ||
              loadError.message ||
              "Unable to load product details.",
          );
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isEditing, productID]);

  const categoryOptions = useMemo(
    () =>
      categories.flatMap((category) => [
        { ...category, isMain: true },
        ...(category.subCategories || []).map((child) => ({
          ...child,
          isMain: false,
          parentName: category.name,
        })),
      ]),
    [categories],
  );

  useEffect(() => {
    return () => {
      if (previewObjectURLRef.current) {
        URL.revokeObjectURL(previewObjectURLRef.current);
      }
    };
  }, []);

  const previewImage = imagePreviewURL || form.imageURL;

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  function validateForm() {
    const nextErrors = {};
    const title = form.title.trim();
    const description = form.description.trim();
    const price = Number(form.price);
    const discountPrice = Number(form.discountPrice || 0);
    const totalStock = Number(form.totalStock);

    if (title.length < 5 || title.length > 40) {
      nextErrors.title = "Product name must be between 5 and 40 characters.";
    }
    if (description.length < 10 || description.length > 500) {
      nextErrors.description =
        "Description must be between 10 and 500 characters.";
    }
    if (!Number.isFinite(price) || price < 0) {
      nextErrors.price = "Enter a valid non-negative price.";
    }
    if (!Number.isFinite(discountPrice) || discountPrice < 0) {
      nextErrors.discountPrice = "Enter a valid non-negative discount price.";
    }
    if (
      Number.isFinite(price) &&
      Number.isFinite(discountPrice) &&
      discountPrice > price
    ) {
      nextErrors.discountPrice =
        "Discount price cannot exceed the regular price.";
    }
    if (!Number.isInteger(totalStock) || totalStock < 0) {
      nextErrors.totalStock = "Stock must be a non-negative whole number.";
    }
    if (form.imageURL.trim()) {
      try {
        new URL(form.imageURL.trim());
      } catch {
        nextErrors.imageURL = "Enter a valid image URL.";
      }
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const validationErrors = validateForm();
    const totalStock = Number(form.totalStock);
    const price = Number(form.price);
    const discountPrice = Number(form.discountPrice || 0);
    if (Object.keys(validationErrors).length > 0) return;
    setIsSaving(true);
    try {
      let imageURL = form.imageURL.trim();
      if (imageFile) imageURL = await uploadProductImage(imageFile);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category ? [form.category] : [],
        price,
        discountPrice,
        imageURL,
        totalStock,
        outOfStock: totalStock === 0 || form.outOfStock,
        visibility: form.visibility,
      };
      if (isEditing) await updateProduct(productID, payload);
      else await createProduct(payload);
      navigate("/inventory");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete ${form.title || "this product"}? This action cannot be undone.`,
      )
    )
      return;
    setError("");
    setIsDeleting(true);
    try {
      await deleteProduct(productID);
      navigate("/inventory");
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message || "Unable to delete product.",
      );
      setIsDeleting(false);
    }
  }

  if (isLoading)
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#f4f6f9] px-5 py-8 text-[#333333]">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center text-sm text-[#8c8c8c]">
          Loading product...
        </div>
      </main>
    );

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f4f6f9] px-5 py-8 text-[#333333] md:px-8">
      <title>Add Product | Kannangara Hardwares</title>
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/inventory")}
          className="mb-5 text-sm font-bold text-[#64748b] hover:text-[#0f9f6e]"
        >
          <i className="fa-solid fa-arrow-left mr-2" aria-hidden="true" />
          Back to inventory
        </button>
        <section className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] md:p-7">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9ca3af]">
              Inventory catalog
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#1a1a1a]">
              {isEditing ? "Edit product" : "Add product"}
            </h1>
            <p className="mt-2 text-sm text-[#8c8c8c]">
              Keep product details and stock information up to date.
            </p>
          </header>
          {error && (
            <p
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Product name"
                name="title"
                value={form.title}
                onChange={updateField}
                required
                placeholder="Enter product name"
                error={fieldErrors.title}
              />
              <Field
                label="Price"
                name="price"
                value={form.price}
                onChange={updateField}
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                error={fieldErrors.price}
              />
              <Field
                label="Discount price"
                name="discountPrice"
                value={form.discountPrice}
                onChange={updateField}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                error={fieldErrors.discountPrice}
              />
              <Field
                label="Total stock"
                name="totalStock"
                value={form.totalStock}
                onChange={updateField}
                required
                type="number"
                min="0"
                step="1"
                placeholder="0"
                error={fieldErrors.totalStock}
              />
            </div>
            <label className="flex flex-col gap-2 text-xs font-bold text-[#64748b]">
              Description
              <textarea
                required
                name="description"
                value={form.description}
                onChange={updateField}
                rows="4"
                placeholder="Describe this product"
                className="resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-[#1f2937] outline-none focus:border-emerald-400"
              />
              {fieldErrors.description && (
                <span className="text-xs font-medium text-red-600">
                  {fieldErrors.description}
                </span>
              )}
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-bold text-[#64748b]">
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-[#1f2937] outline-none focus:border-emerald-400"
                >
                  <option value="">Uncategorised</option>
                  {categoryOptions.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.isMain
                        ? category.name
                        : `${category.parentName} / ${category.name}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-bold text-[#64748b]">
                Image upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;

                    if (previewObjectURLRef.current) {
                      URL.revokeObjectURL(previewObjectURLRef.current);
                      previewObjectURLRef.current = null;
                    }

                    if (file) {
                      const objectURL = URL.createObjectURL(file);
                      previewObjectURLRef.current = objectURL;
                      setImagePreviewURL(objectURL);
                    } else {
                      setImagePreviewURL("");
                    }

                    setImageFile(file);
                    setFieldErrors((current) => ({
                      ...current,
                      imageFile: "",
                    }));
                  }}
                  className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-[#64748b]"
                />
                <span className="text-[11px] font-normal text-[#94a3b8]">
                  Optional. Uploaded images are stored in Cloudinary.
                </span>
                {fieldErrors.imageFile && (
                  <span className="text-xs font-medium text-red-600">
                    {fieldErrors.imageFile}
                  </span>
                )}
                {previewImage && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <img
                      src={previewImage}
                      alt="Product preview"
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  </div>
                )}
              </label>
            </div>
            <label className="flex flex-col gap-2 text-xs font-bold text-[#64748b]">
              Image URL
              <input
                name="imageURL"
                value={form.imageURL}
                onChange={updateField}
                placeholder="Optional image URL"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-[#1f2937] outline-none focus:border-emerald-400"
              />
              {fieldErrors.imageURL && (
                <span className="text-xs font-medium text-red-600">
                  {fieldErrors.imageURL}
                </span>
              )}
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-bold text-[#374151]">
                <input
                  type="checkbox"
                  name="outOfStock"
                  checked={form.outOfStock}
                  onChange={updateField}
                  className="size-4 accent-emerald-600"
                />
                Mark as out of stock
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-bold text-[#374151]">
                <input
                  type="checkbox"
                  name="visibility"
                  checked={form.visibility}
                  onChange={updateField}
                  className="size-4 accent-emerald-600"
                />
                Visible to customers
              </label>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || isSaving}
                    className="rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                  >
                    <i className="fa-solid fa-trash mr-2" aria-hidden="true" />
                    {isDeleting ? "Deleting..." : "Delete product"}
                  </button>
                )}
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/inventory")}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#64748b] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-[#087f59] disabled:cursor-wait disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : isEditing
                      ? "Save changes"
                      : "Add product"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({ label, name, value, onChange, error, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-xs font-bold text-[#64748b]">
      {label}
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-[#1f2937] outline-none focus:border-emerald-400"
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-red-600">{error}</span>
      )}
    </label>
  );
}

export default ProductForm;
