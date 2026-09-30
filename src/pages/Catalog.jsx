import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import ProductContainer from "../components/ProductContainer";
import SearchSection from "../components/SearchSection";
import { getProducts, getProductsByCategory } from "../api/product";
import { getCategories } from "../api/category";

function getCategoryPath(categories, categoryID) {
  const parentCategory = categories.find(
    (category) => String(category._id) === String(categoryID),
  );

  if (parentCategory) {
    return { parentCategory };
  }

  for (const category of categories) {
    const subcategory = (category.subCategories || []).find(
      (item) => String(item._id) === String(categoryID),
    );

    if (subcategory) {
      return { parentCategory: category, subcategory };
    }
  }

  return {};
}

function Catalog({ cart, setCart, categoryNames }) {
  const [searchParams] = useSearchParams();
  const categoryID = searchParams.get("category") || "";
  const searchTerm = searchParams.get("search")?.trim() || "";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryID) {
      setCategories([]);
      return undefined;
    }

    let isMounted = true;

    getCategories()
      .then((loadedCategories) => {
        if (isMounted) {
          setCategories(loadedCategories);
        }
      })
      .catch((error) => {
        console.error("Unable to load catalog categories", error);
        if (isMounted) {
          setCategories([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [categoryID]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);

      try {
        const loadedProducts = categoryID
          ? await getProductsByCategory(categoryID)
          : await getProducts();

        if (isMounted) {
          setProducts(loadedProducts);
        }
      } catch (error) {
        console.error("Unable to load catalog products", error);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [categoryID]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase();
    return products.filter((product) =>
      [product.title, product.description, product.category]
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearchTerm),
        ),
    );
  }, [products, searchTerm]);

  const { parentCategory, subcategory } = getCategoryPath(
    categories,
    categoryID,
  );
  const title = searchTerm
    ? `Search results for "${searchTerm}"`
    : subcategory?.name || parentCategory?.name || "Catalog";

  return (
    <main className="w-full">
      <title>{title} | Kannangara Hardwares</title>
      <SearchSection />
      <div className="px-4 py-10 sm:px-8 lg:px-8 lg:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto mb-8 max-w-7xl text-sm text-slate-500"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                to="/"
                className="transition-colors hover:text-night-sky-500"
              >
                Home
              </Link>
            </li>
            {parentCategory && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    to={`/catalog?category=${encodeURIComponent(parentCategory._id)}`}
                    className={
                      subcategory
                        ? "transition-colors hover:text-night-sky-500"
                        : "font-semibold text-slate-900"
                    }
                  >
                    {parentCategory.name}
                  </Link>
                </li>
              </>
            )}
            {subcategory && (
              <>
                <li aria-hidden="true">/</li>
                <li className="font-semibold text-slate-900">
                  {subcategory.name}
                </li>
              </>
            )}
            {searchTerm && !parentCategory && (
              <>
                <li aria-hidden="true">/</li>
                <li className="font-semibold text-slate-900">Search</li>
              </>
            )}
          </ol>
        </nav>
        <ProductContainer
          products={filteredProducts}
          cart={cart}
          setCart={setCart}
          categoryNames={categoryNames}
          loading={loading}
          title={title}
        />
      </div>
    </main>
  );
}

export default Catalog;
