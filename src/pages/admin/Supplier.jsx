import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../api/product";
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from "../../api/supplier";
import SupplierFormModal from "../../components/admin/suppliers/SupplierFormModal";
import SupplierSearchBar from "../../components/admin/suppliers/SupplierSearchBar";
import SupplierSummary from "../../components/admin/suppliers/SupplierSummary";
import SupplierTable from "../../components/admin/suppliers/SupplierTable";

function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [busyID, setBusyID] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const visibleSuppliers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return [];
    return suppliers.filter((supplier) => [
      supplier.representativeName,
      supplier.companyName,
      ...(supplier.products || []).map((product) => product.title),
    ].some((value) => value?.toLowerCase().includes(normalizedSearch)));
  }, [searchTerm, suppliers]);

  useEffect(() => {
    if (!modalMode || products.length > 0) return;
    let isMounted = true;
    getProducts()
      .then((loadedProducts) => { if (isMounted) setProducts(loadedProducts); })
      .catch((loadError) => { if (isMounted) setError(loadError.response?.data?.message || "Unable to load products."); })
      .finally(() => { if (isMounted) setIsLoadingProducts(false); });
    return () => { isMounted = false; };
  }, [modalMode, products.length]);

  async function handleSearch(event) {
    event.preventDefault();
    const normalizedSearch = searchTerm.trim();
    setError("");
    setNotice("");
    if (!normalizedSearch) {
      setSuppliers([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      setSuppliers(await getSuppliers());
    } catch (searchError) {
      setError(searchError.response?.data?.message || "Unable to load suppliers.");
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(mode, supplier = null) {
    setError("");
    setNotice("");
    setSelectedSupplier(supplier);
    if (products.length === 0) setIsLoadingProducts(true);
    setModalMode(mode);
  }

  async function handleSave(payload) {
    setBusyID(selectedSupplier?._id || "new");
    setError("");
    try {
      const savedSupplier = modalMode === "edit" ? await updateSupplier(selectedSupplier._id, payload) : await createSupplier(payload);
      setSuppliers((currentSuppliers) => modalMode === "edit" ? currentSuppliers.map((supplier) => supplier._id === savedSupplier._id ? savedSupplier : supplier) : [...currentSuppliers, savedSupplier]);
      setNotice(modalMode === "edit" ? "Supplier updated successfully." : "Supplier added successfully.");
      setModalMode(null);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save supplier.");
    } finally {
      setBusyID(null);
    }
  }

  async function handleDelete(supplier) {
    if (!window.confirm(`Delete ${supplier.companyName}?`)) return;
    setBusyID(supplier._id);
    setError("");
    try {
      await deleteSupplier(supplier._id);
      setSuppliers((currentSuppliers) => currentSuppliers.filter((item) => item._id !== supplier._id));
      setNotice("Supplier deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete supplier.");
    } finally {
      setBusyID(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-night-sky-100/10 px-5 py-8 text-night-sky-500 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300"></p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">Supplier Management</h1><p className="mt-2 max-w-xl text-sm text-night-sky-200"></p></div>
          <SupplierSummary count={hasSearched ? visibleSuppliers.length : 0} hasSearched={hasSearched} />
        </header>

        {(error || notice) && <div className="rounded-xl border border-night-sky-200/30 bg-night-sky-100/10 px-4 py-3 text-sm text-night-sky-400" role="status">{error || notice}</div>}

        <section className="rounded-2xl border border-night-sky-100/20 bg-night-sky-100/10 p-5 md:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h2 className="text-base font-bold text-night-sky-500">Supplier directory</h2><p className="mt-1 text-xs text-night-sky-200">Search the directory to view contacts, then select a row to edit.</p></div><button type="button" onClick={() => openModal("add")} className="rounded-xl bg-night-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-night-sky-400"><i className="fa-solid fa-plus mr-2" aria-hidden="true" />Add supplier</button></div>
          <div className="mt-5"><SupplierSearchBar value={searchTerm} onChange={setSearchTerm} onSubmit={handleSearch} onClear={() => { setSearchTerm(""); setSuppliers([]); setHasSearched(false); }} disabled={isLoading} /></div>
          {!hasSearched && <p className="mt-6 rounded-xl border border-dashed border-night-sky-100/30 px-4 py-10 text-center text-sm text-night-sky-200">Search by product, company, or representative name to view suppliers.</p>}
          {hasSearched && <SupplierTable suppliers={visibleSuppliers} isLoading={isLoading} busyID={busyID} onSelect={(supplier) => openModal("edit", supplier)} onDelete={handleDelete} />}
        </section>
      </div>
      {modalMode && <SupplierFormModal key={`${modalMode}-${selectedSupplier?._id || "new"}`} mode={modalMode} supplier={selectedSupplier} products={products} isLoadingProducts={isLoadingProducts} isSaving={Boolean(busyID)} error={error} onClose={() => setModalMode(null)} onSubmit={handleSave} />}
    </main>
  );
}

export default Supplier;