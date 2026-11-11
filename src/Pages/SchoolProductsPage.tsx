import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  LoaderCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const SHEET_URL = import.meta.env.VITE_SCHOOL_CSV_URL;

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  originalPrice: string;
  images: string[];
  availability: string;
  badge: string;
  quantityPrices: {
    quantity: string;
    price: string;
  }[];
};

// Normalize values and headers
const normalize = (value: string) =>
  String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// CSV Parser
const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"' && text[i + 1] === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
    } else if (char === "\n" && !insideQuotes) {
      row.push(value.trim());
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value.length || row.length) {
    row.push(value.trim());
    rows.push(row);
  }

  return rows.filter((item) =>
    item.some((cell) => cell.trim() !== "")
  );
};

// Get value using flexible header matching
const getValue = (
  item: Record<string, string>,
  ...keys: string[]
): string => {
  for (const key of keys) {
    const foundKey = Object.keys(item).find(
      (itemKey) => normalize(itemKey) === normalize(key)
    );

    if (foundKey && item[foundKey]?.trim()) {
      return item[foundKey].trim();
    }
  }

  return "";
};

// Convert CSV rows into products
const mapProducts = (rows: string[][]): Product[] => {
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) =>
    header.replace(/^\uFEFF/, "").trim()
  );

  return rows.slice(1).map((row) => {
    const item: Record<string, string> = {};

    headers.forEach((header, index) => {
      item[header] = row[index] || "";
    });

    const id = getValue(item, "Product ID", "ID");
    const name = getValue(item, "Name", "Product Name");

    const images = [
      getValue(item, "Image 1", "Product Image 1", "Image"),
      getValue(item, "Image 2", "Product Image 2"),
      getValue(item, "Image 3", "Product Image 3"),
      getValue(item, "Image 4", "Product Image 4"),
    ].filter(Boolean);

    const quantityPrices = [1, 2, 3, 4, 5]
      .map((number) => ({
        quantity: getValue(item, `Quantity ${number}`),
        price: getValue(item, `Price ${number}`),
      }))
      .filter((item) => item.quantity && item.price);

    return {
      id,
      name,
      category: getValue(item, "Category"),
      description: getValue(item, "Description"),
      price: getValue(item, "Price"),
      originalPrice: getValue(item, "Original Price"),
      images,
      availability: getValue(item, "Availability", "Status"),
      badge: getValue(item, "Badge"),
      quantityPrices,
    };
  });
}

const SchoolProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from Google Sheets
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        if (!SHEET_URL) {
          throw new Error(
            "Google Sheet URL missing. Check your .env file."
          );
        }

        const response = await fetch(SHEET_URL);

        if (!response.ok) {
          throw new Error(
            `Unable to load products. Status: ${response.status}`
          );
        }

        const csv = await response.text();

        if (
          !csv.trim() ||
          csv.trim().startsWith("<!DOCTYPE") ||
          csv.trim().startsWith("<html")
        ) {
          throw new Error(
            "Google Sheet is not returning CSV data. Check publishing settings."
          );
        }

        const rows = parseCSV(csv);

        if (rows.length < 2) {
          throw new Error("No products found in Google Sheet.");
        }

        const data = mapProducts(rows);

        console.log("School Sheet Products:", data);

        const activeProducts = data.filter((product) => {
          const status = normalize(product.availability);

          return (
            product.name.trim() !== "" &&
            product.category.trim() !== "" &&
            status !== "inactive" &&
            status !== "hidden"
          );
        });

        if (!cancelled) {
          setProducts(activeProducts);
          setError("");
        }
      } catch (err) {
        console.error("School Products Error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Products load nahi ho paaye."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Dynamic Categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .map((product) => product.category.trim())
          .filter(Boolean)
      )
    );

    return ["All", ...uniqueCategories];
  }, [products]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const searchMatch =
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue) ||
        product.description.toLowerCase().includes(searchValue);

      return categoryMatch && searchMatch;
    });
  }, [products, selectedCategory, search]);

  return (
    <main className="min-h-screen bg-[#fdfaf7]">

      {/* PAGE HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-6">
        <p className="text-[#851c2b] text-xs font-semibold tracking-[3px] uppercase mb-2">
          Dot Print Collection
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#241b19]">
              School Products
            </h1>

            <p className="text-sm text-[#766d68] mt-2">
              Quality printing solutions for schools and institutions.
            </p>
          </div>

          <span className="text-sm text-[#766d68]">
            {filteredProducts.length} Products
          </span>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#766d68]"
          />

          <input
            type="text"
            placeholder="Search school products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#eadfd8] bg-white outline-none focus:border-[#851c2b] text-sm text-[#241b19]"
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-7">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                type="button"
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? "bg-[#851c2b] text-white border-[#851c2b]"
                    : "bg-white text-[#514542] border-[#eadfd8] hover:border-[#851c2b] hover:text-[#851c2b]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <LoaderCircle
              className="animate-spin text-[#851c2b]"
              size={32}
            />
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="text-center py-20">
            <AlertCircle
              size={40}
              className="mx-auto text-[#851c2b] mb-4"
            />

            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package
              size={45}
              className="mx-auto text-[#c8b9b0] mb-4"
            />

            <h3 className="font-serif text-xl text-[#241b19]">
              No Products Found
            </h3>

            <p className="text-sm text-[#766d68] mt-2">
              Try another category or search.
            </p>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product, index) => {
              // Same ID logic used by details page
              const productUrlId = product.id.trim() || product.name.trim();

              const productUrl = `/school-products/${encodeURIComponent(
                productUrlId
              )}`;

              return (
                <div
                  key={product.id || `${product.name}-${index}`}
                  className="group bg-white border border-[#eadfd8] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* IMAGE */}
                  <Link
                    to={productUrl}
                    className="block relative aspect-square bg-[#f5efe8] overflow-hidden"
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package
                          size={42}
                          className="text-[#c8b9b0]"
                        />
                      </div>
                    )}

                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-[#851c2b] text-white text-[10px] px-3 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}
                  </Link>

                  {/* INFORMATION */}
                  <div className="p-3 sm:p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#851c2b] mb-1">
                      {product.category}
                    </p>

                    <h3 className="font-serif text-sm sm:text-base text-[#241b19] line-clamp-2 min-h-[36px]">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-xs text-[#766d68] mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* PRICE */}
                    <div className="flex items-center gap-2 mt-3">
                      {product.price && (
                        <span className="font-semibold text-[#851c2b] text-sm">
                          ₹{product.price}
                        </span>
                      )}

                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* BULK PRICING */}
                    {product.quantityPrices.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#f0e8e2]">
                        <p className="text-[10px] font-semibold text-[#766d68] mb-2">
                          BULK PRICING
                        </p>

                        {product.quantityPrices.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-[11px] text-[#514542] py-0.5"
                          >
                            <span>{item.quantity} pcs</span>
                            <span className="font-medium">
                              ₹{item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* DETAILS */}
                    <Link
                      to={productUrl}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-[#851c2b] text-white py-2.5 rounded-lg text-xs sm:text-sm hover:bg-[#6f1725] transition-colors"
                    >
                      See Details
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default SchoolProductsPage;