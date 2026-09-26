import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  getCategories,
  createCategory,
  toggleCategoryVisibility,
} from "../../api/category";
import { getProducts, updateProductStock } from "../../api/product";
import CategoryModal from "../../components/admin/inventory/CategoryModal";
import InventorySummary from "../../components/admin/inventory/InventorySummary";
import ProductTable from "../../components/admin/inventory/ProductTable";
import { downloadInventoryReport } from "../../utility/inventoryReport";

const PAGE_SIZE = 5;

function getCurrentUser() {
  try {
    return JSON.parse(window.localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function Inventory() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const canCatalog = Boolean(user?.isAdmin || user?.isMannager);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [busyID, setBusyID] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadInventory() {
    setIsLoading(true);
    try {
      const [loadedProducts, loadedCategories] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(loadedProducts);
      setCategories(loadedCategories);
    } catch (loadError) {
      setError(
        loadError.response?.data?.message || "Unable to load inventory.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadInventory();
    }, 0);
    function handleTableFilter(event) {
      setSearchTerm(event.detail.searchTerm);
      setStockFilter(event.detail.stockFilter);
      setPage(1);
    }
    window.addEventListener("inventory-table-filter", handleTableFilter);
    return () => {
      window.clearTimeout(loadTimer);
      window.removeEventListener("inventory-table-filter", handleTableFilter);
    };
  }, []);

  const summary = useMemo(
    () => ({
      total: products.length,
      low: products.filter(
        (product) =>
          !product.outOfStock &&
          product.totalStock > 0 &&
          product.totalStock <= 5,
      ).length,
      out: products.filter(
        (product) => product.outOfStock || product.totalStock === 0,
      ).length,
      units: products.reduce(
        (total, product) => total + Number(product.totalStock || 0),
        0,
      ),
    }),
    [products],
  );

  const categoryNames = useMemo(
    () =>
      categories.reduce((names, category) => {
        names[category._id] = category.name;
        (category.subCategories || []).forEach((child) => {
          names[child._id] = `${category.name} / ${child.name}`;
        });
        return names;
      }, {}),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const categoryName =
        categoryNames[product.category?.[0]] || "uncategorised";
      const matchesSearch =
        !query ||
        product.title?.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query);
      const isOutOfStock = product.outOfStock || product.totalStock === 0;
      const isLowStock =
        !isOutOfStock && product.totalStock > 0 && product.totalStock <= 5;
      const matchesFilter =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && !isOutOfStock && !isLowStock) ||
        (stockFilter === "low-stock" && isLowStock) ||
        (stockFilter === "out-of-stock" && isOutOfStock);
      return matchesSearch && matchesFilter;
    });
  }, [categoryNames, products, searchTerm, stockFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  async function handleStockChange(product, totalStock) {
    setBusyID(product._id);
    setError("");
    setNotice("");
    try {
      const updatedProduct = await updateProductStock(product._id, totalStock);
      setProducts((current) =>
        current.map((item) =>
          item._id === product._id ? updatedProduct : item,
        ),
      );
      setNotice(`${product.title} stock updated.`);
    } catch (updateError) {
      setError(
        updateError.response?.data?.message || "Unable to update stock.",
      );
    } finally {
      setBusyID(null);
    }
  }

  async function handleCreateCategory(payload) {
    setIsSavingCategory(true);
    setError("");
    try {
      await createCategory(payload);
      await loadInventory();
      setNotice("Category added successfully.");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to add category.");
      throw saveError;
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleToggleCategory(category) {
    try {
      await toggleCategoryVisibility(category._id);
      await loadInventory();
    } catch (toggleError) {
      setError(
        toggleError.response?.data?.message ||
          "Unable to update category visibility.",
      );
    }
  }

  async function handleDownloadReport() {
    setError("");
    setNotice("");
    setIsDownloadingReport(true);

    try {
      await downloadInventoryReport(products, categoryNames);
      setNotice("Inventory report downloaded successfully.");
    } catch (reportError) {
      console.error("Inventory report download failed", reportError);
      setError("Unable to download the inventory report.");
    } finally {
      setIsDownloadingReport(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300"></p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
              Inventory
            </h1>
            <p className="mt-2 max-w-xl text-sm text-night-sky-200"></p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={isLoading || isDownloadingReport}
              className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-4 py-3 text-sm font-bold text-night-sky-400 hover:bg-night-sky-100/20 disabled:cursor-wait disabled:opacity-50"
            >
              <i
                className="fa-solid fa-file-arrow-down mr-2"
                aria-hidden="true"
              />
              {isDownloadingReport ? "Preparing report..." : "Download report"}
            </button>
            {canCatalog && (
              <>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(true)}
                  className="rounded-xl border border-night-sky-100/30 bg-night-sky-100/10 px-4 py-3 text-sm font-bold text-night-sky-400 hover:bg-night-sky-100/20"
                >
                  <i
                    className="fa-solid fa-layer-group mr-2"
                    aria-hidden="true"
                  />
                  Categories
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/inventory/new")}
                  className="rounded-xl bg-night-sky-500 px-4 py-3 text-sm font-bold text-white hover:bg-night-sky-400"
                >
                  <i className="fa-solid fa-plus mr-2" aria-hidden="true" />
                  Add product
                </button>
              </>
            )}
          </div>
        </header>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InventorySummary
            icon="fa-boxes-stacked"
            label="Total products"
            value={summary.total}
            detail={`${summary.units} units in stock`}
            tone="blue"
          />
          <InventorySummary
            icon="fa-triangle-exclamation"
            label="Low stock"
            value={summary.low}
            detail="5 units or fewer"
            tone="amber"
          />
          <InventorySummary
            icon="fa-circle-xmark"
            label="Out of stock"
            value={summary.out}
            detail="Needs replenishment"
            tone="red"
          />
          <InventorySummary
            icon="fa-circle-check"
            label="Healthy stock"
            value={Math.max(0, summary.total - summary.low - summary.out)}
            detail="Above threshold"
            tone="green"
          />
        </section>
        {(error || notice) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
            role="status"
          >
            {error || notice}
          </div>
        )}
        <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-base font-bold text-night-sky-500">
                Product stock
              </h2>
              <p className="mt-1 text-xs text-night-sky-200">
                Use the quantity controls for quick stock adjustments.
                {canCatalog && " Select a row to edit product details."}
              </p>
            </div>
            <p className="text-xs font-semibold text-night-sky-200">
              Showing {products.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, products.length)} of {products.length}
            </p>
          </div>
          <ProductTable
            products={visibleProducts}
            categoryNames={categoryNames}
            isLoading={isLoading}
            canEdit={canCatalog}
            busyID={busyID}
            onSelect={(product) => navigate(`/inventory/${product._id}/edit`)}
            onStockChange={handleStockChange}
          />
          <div className="mt-5 flex items-center justify-between border-t border-night-sky-100/20 pt-4">
            <span className="text-xs text-night-sky-200">
              Page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-night-sky-100/30 text-night-sky-300 hover:bg-night-sky-100/20 disabled:opacity-40"
                aria-label="Previous page"
                title="Previous page"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-night-sky-100/30 text-night-sky-300 hover:bg-night-sky-100/20 disabled:opacity-40"
                aria-label="Next page"
                title="Next page"
              >
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </div>
      {isCategoryOpen && canCatalog && (
        <CategoryModal
          categories={categories}
          isSaving={isSavingCategory}
          onClose={() => setIsCategoryOpen(false)}
          onCreate={handleCreateCategory}
          onToggleVisibility={handleToggleCategory}
        />
      )}
    </main>
  );
}

export default Inventory;
