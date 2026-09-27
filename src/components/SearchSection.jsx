import { useEffect, useRef, useState } from "react";

const categories = [
  {
    name: "Building Materials",
    subcategories: [
      "Cement",
      "Mortar",
      "Sand",
      "Bricks & Blocks",
      "Plywood",
      "Roofing Materials",
    ],
  },
  {
    name: "Plumbing",
    subcategories: [
      "PVC Pipes",
      "PVC Fittings",
      "GI / Metal Pipes",
      "Taps & Faucets",
      "Water Hoses",
      "Pipe Clamps",
    ],
  },
  {
    name: "Electrical",
    subcategories: [
      "Electrical Cables",
      "Switches",
      "Sockets",
      "Plugs",
      "Circuit Breakers",
      "Distribution Boards",
    ],
  },
  {
    name: "Paint & Decorating",
    subcategories: [
      "Interior Paint",
      "Exterior Paint",
      "Primer",
      "Wood Paint",
      "Metal Paint",
      "Varnish",
    ],
  },
];

function CategoryDropdown({ category, isOpen, onToggle }) {
  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-1 py-1 text-left text-sm font-semibold text-night-sky-500 transition-colors hover:text-night-sky-300 sm:text-base"
      >
        <span className="truncate">{category.name}</span>
        <span aria-hidden="true">&gt;</span>
      </button>

      {isOpen && (
        <ul className="absolute left-0 top-full z-20 mt-2 w-48 space-y-1.5 rounded-sm bg-white px-2 py-2.5 text-sm text-neutral-900 shadow-lg ring-1 ring-black/10">
          {category.subcategories.map((subcategory) => (
            <li key={subcategory} className="leading-5">
              <button
                type="button"
                className="w-full cursor-pointer text-left transition-colors hover:text-night-sky-500"
              >
                &gt; {subcategory}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchSection() {
  const [openCategory, setOpenCategory] = useState(null);
  const categoryNavigationRef = useRef(null);

  const toggleCategory = (categoryName) => {
    setOpenCategory((currentOpenCategory) =>
      currentOpenCategory === categoryName ? null : categoryName,
    );
  };

  useEffect(() => {
    const closeWhenClickedOutside = (event) => {
      if (!categoryNavigationRef.current?.contains(event.target)) {
        setOpenCategory(null);
      }
    };

    document.addEventListener("mousedown", closeWhenClickedOutside);
    return () => {
      document.removeEventListener("mousedown", closeWhenClickedOutside);
    };
  }, []);

  useEffect(() => {
    const closeWithEscape = (event) => {
      if (event.key === "Escape") {
        setOpenCategory(null);
      }
    };

    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  return (
    <section
      className="relative z-30 w-full bg-[#202020]"
      aria-label="Product search"
    >
      <div className="flex flex-col gap-5 bg-white px-5 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div
          ref={categoryNavigationRef}
          className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm font-semibold text-neutral-950 sm:text-base"
        >
          {categories.map((category) => (
            <CategoryDropdown
              key={category.name}
              category={category}
              isOpen={openCategory === category.name}
              onToggle={() => toggleCategory(category.name)}
            />
          ))}
        </div>

        <label className="flex h-10 w-full max-w-md items-center border border-neutral-500 bg-white px-4 focus-within:border-night-sky-500">
          <span className="sr-only">Search for products</span>
          <input
            type="search"
            placeholder="Search for products"
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
          />
          <span
            aria-hidden="true"
            className="text-xl leading-none text-neutral-700"
          >
            ⌕
          </span>
        </label>
      </div>
    </section>
  );
}

export default SearchSection;
