import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowUpRight,
  Heart,
  ImageOff,
  AlertCircle,
  ShoppingCart,
  Check,
  CreditCard,
  RefreshCw,
} from "lucide-react";

import { addToCart } from "../utils/cart";

type CashMemoItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string;
  imageUrls: string[];
  size: string;
  paper: string;
  printing: string;
  available: boolean;
  badge: string;
};

const SHEET_URL = (
  import.meta.env.VITE_CASHMEMO_CSV_URL || ""
).trim();

const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

function normalizeHeader(header: string) {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];

  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];

    if (char === '"') {
      if (quoted && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !quoted
    ) {
      if (char === "\r" && csv[i + 1] === "\n") i++;

      row.push(cell.trim());

      if (row.some(Boolean)) rows.push(row);

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  return rows;
}

function parsePrice(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, "").trim();

  if (!cleaned) return null;

  const price = Number(cleaned);

  return Number.isFinite(price) && price >= 0
    ? price
    : null;
}

function parseAvailability(value: string): boolean {
  return ![
    "false",
    "no",
    "0",
    "unavailable",
    "out of stock",
    "sold out",
  ].includes(value.trim().toLowerCase());
}

function shuffleCards(
  products: CashMemoItem[]
): CashMemoItem[] {
  const shuffled = [...products];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}

function readCashMemos(csv: string): CashMemoItem[] {
  const rows = parseCSV(csv);

  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);

  const get = (
    row: string[],
    ...names: string[]
  ): string => {
    for (const name of names) {
      const index = headers.indexOf(normalizeHeader(name));

      if (index >= 0) {
        return (row[index] ?? "").trim();
      }
    }

    return "";
  };

  const products = rows.slice(1).flatMap((row, index) => {
    const name = get(row, "name", "product name", "title");

    if (!name) return [];

    const imageUrls = [
      get(row, "image1", "image url 1"),
      get(row, "image2", "image url 2"),
      get(row, "image3", "image url 3"),
      get(row, "image4", "image url 4"),
    ].filter(Boolean);

    return [{
      id: get(row, "id", "product id") || `CM${index + 1}`,
      name,
      description: get(row, "description", "details"),
      category: get(row, "category", "type") || "Other",
      price: parsePrice(get(row, "price")),
      originalPrice: parsePrice(
        get(row, "originalPrice", "original price", "mrp")
      ),
      imageUrl: imageUrls[0] || "",
      imageUrls,
      size: get(row, "size"),
      paper: get(row, "paper", "paper type"),
      printing: get(row, "printing", "printing type"),
      available: parseAvailability(
        get(row, "available", "availability")
      ),
      badge: get(row, "badge", "label", "tag"),
    }];
  });

  const seen = new Set<string>();

  return products.map((product, index) => {
    let id = product.id;

    if (seen.has(id)) id = `${id}-${index + 1}`;

    seen.add(id);

    return { ...product, id };
  });
}

function formatPrice(price: number | null): string {
  if (price === null) return "Price on request";

  return `₹${price.toLocaleString("en-IN")}`;
}

function getWhatsAppUrl(number: string, message: string) {
  let phone = number;

  if (phone.startsWith("0")) phone = phone.slice(1);

  if (phone.length === 10) phone = `91${phone}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function CashMemo() {
  const [products, setProducts] = useState<CashMemoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Cards");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [addedItems, setAddedItems] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      if (!SHEET_URL) {
        setError("VITE_CASHMEMO_CSV_URL is missing in .env");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(SHEET_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Google Sheets error: ${response.status}`);
        }

        const csv = await response.text();

        if (!csv.trim() || csv.trimStart().startsWith("<")) {
          throw new Error("Google Sheets did not return CSV data.");
        }

        const result = readCashMemos(csv);

        if (!result.length) {
          throw new Error("No Cash Memo products found in Google Sheet.");
        }

        setProducts(shuffleCards(result));
        setFailedImages([]);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Cash Memo products."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, [refreshKey]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category.trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    return ["All Cards", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All Cards") return products;

    return products.filter(
      (p) =>
        p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [products, selectedCategory]);

  function handleAddToCart(product: CashMemoItem) {
    if (!product.available || product.price === null) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
    });

    setAddedItems((previous) =>
      previous.includes(product.id)
        ? previous
        : [...previous, product.id]
    );

    window.setTimeout(() => {
      setAddedItems((previous) =>
        previous.filter((id) => id !== product.id)
      );
    }, 1800);
  }

  function orderProduct(product: CashMemoItem) {
    if (!product.available) return;

    if (!WHATSAPP_NUMBER) {
      window.alert("Configure VITE_WHATSAPP_NUMBER in .env");
      return;
    }

    const message = [
      "Hello Dot Print!",
      "",
      "I want to enquire about this Cash Memo.",
      `Product: ${product.name}`,
      `Product ID: ${product.id}`,
      `Price: ${formatPrice(product.price)}`,
      `Size: ${product.size || "Please confirm"}`,
      `Paper: ${product.paper || "Please confirm"}`,
      `Printing: ${product.printing || "Please confirm"}`,
      "",
      "Please share the available quantity and pricing options.",
    ].join("\n");

    window.open(
      getWhatsAppUrl(WHATSAPP_NUMBER, message),
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openDetails(product: CashMemoItem) {
    navigate(`/cash-memo/${encodeURIComponent(product.id)}`);
  }

  return (
    <section
      id="cash-memo"
      className="bg-[#FAF8F6] px-4 pt-12 pb-0 text-[#29201E] sm:px-8 sm:pt-16 sm:pb-0 lg:px-16 lg:pt-20 lg:pb-0"
    >
      <div className="mx-auto max-w-7xl">

        {/* CATEGORY FILTERS */}

        <div className="mb-6">
          <div className="flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-2 scrollbar-hide sm:flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`
                  shrink-0 rounded-full border px-4 py-2.5 text-xs
                  transition-all duration-200 sm:text-sm
                  ${
                    selectedCategory === category
                      ? "border-[#941B32] bg-[#941B32] text-white"
                      : "border-[#E5DDD7] bg-white text-[#817875] hover:border-[#941B32] hover:text-[#941B32]"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* COLLECTION BAR */}

        <div className="flex items-center justify-between border-y border-[#EEE7E2] py-4">
          <p className="text-sm text-[#817875]">
            {loading
              ? "Loading collection..."
              : `${filteredProducts.length} designs`}
          </p>

          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-[#817875] hover:text-[#941B32] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Shuffle Products
          </button>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-2 gap-4 py-10 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[20px] border border-[#EEE7E2] bg-white p-2"
              >
                <div className="h-[150px] rounded-[15px] bg-[#EAE5DD]" />
                <div className="mt-4 h-4 w-3/4 rounded bg-[#EAE5DD]" />
                <div className="mt-3 h-3 w-1/2 rounded bg-[#EAE5DD]" />
                <div className="mt-5 h-9 rounded-full bg-[#EAE5DD]" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="my-10 rounded-2xl border border-[#EEE7E2] bg-white p-8 text-center">
            <AlertCircle size={30} className="mx-auto text-[#941B32]" />

            <p className="mt-4 font-medium">
              Unable to load Cash Memo collection
            </p>

            <p className="mt-2 break-words text-sm text-[#817875]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="mt-5 rounded-full bg-[#941B32] px-5 py-3 text-sm text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* PRODUCT GRID */}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group min-w-0 overflow-hidden rounded-[20px] border border-[#EEE7E2] bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* IMAGE */}

                <div className="relative overflow-hidden rounded-[15px] bg-[#F5F3F0]">
                  {product.imageUrl &&
                  !failedImages.includes(product.id) ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      onError={() =>
                        setFailedImages((previous) =>
                          previous.includes(product.id)
                            ? previous
                            : [...previous, product.id]
                        )
                      }
                      className="h-[125px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-[170px] lg:h-[180px]"
                    />
                  ) : (
                    <div className="flex h-[125px] flex-col items-center justify-center gap-3 text-[#93887B] sm:h-[170px] lg:h-[180px]">
                      <ImageOff size={28} strokeWidth={1.3} />
                      <span className="px-2 text-center text-xs">
                        Image unavailable
                      </span>
                    </div>
                  )}

                  {product.badge && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#941B32] px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-white">
                      {product.badge}
                    </span>
                  )}

                  {!product.available && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-[#29201E]/90 px-2.5 py-1.5 text-[9px] text-white">
                      Currently unavailable
                    </span>
                  )}

                  <button
                    type="button"
                    aria-label={`See details for ${product.name}`}
                    onClick={() => openDetails(product)}
                    className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#29201E] shadow-sm transition hover:bg-[#941B32] hover:text-white sm:h-9 sm:w-9"
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                {/* PRODUCT DETAILS */}

                <div className="px-1.5 pb-1 pt-3">
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="line-clamp-1 min-w-0 text-[13px] font-semibold text-[#29201E] sm:text-[15px]">
                      {product.name}
                    </h2>

                    <Heart
                      size={15}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-[#941B32]"
                    />
                  </div>

                  <p className="mt-1 line-clamp-2 min-h-[34px] text-[10px] leading-[17px] text-[#817875] sm:text-xs">
                    {product.description || "Premium quality cash memo."}
                  </p>

                  <div className="mt-2 flex min-h-[24px] flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold text-[#941B32] sm:text-base">
                      {formatPrice(product.price)}
                    </span>

                    {product.originalPrice !== null &&
                      product.price !== null &&
                      product.originalPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                  </div>

                  {/* ADD TO CART */}

                  <button
                    type="button"
                    disabled={!product.available || product.price === null}
                    onClick={() => handleAddToCart(product)}
                    className={`
                      mt-3 flex h-[36px] w-full items-center
                      justify-center gap-2 rounded-full border
                      text-[10px] font-medium transition-all
                      sm:h-[38px] sm:text-xs
                      ${
                        addedItems.includes(product.id)
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-[#941B32] bg-white text-[#941B32] hover:bg-[#FFF5F6]"
                      }
                      disabled:cursor-not-allowed disabled:opacity-40
                    `}
                  >
                    {addedItems.includes(product.id) ? (
                      <>
                        <Check size={14} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} />
                        Add to Cart
                      </>
                    )}
                  </button>

                  {/* ORDER NOW */}

                  <button
                    type="button"
                    disabled={!product.available}
                    onClick={() => orderProduct(product)}
                    className="mt-2 flex h-[36px] w-full items-center justify-center gap-2 rounded-full bg-[#941B32] text-[10px] font-semibold text-white transition-all hover:bg-[#761326] disabled:cursor-not-allowed disabled:opacity-40 sm:h-[38px] sm:text-xs"
                  >
                    <CreditCard size={14} />
                    Order Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl">
              No Cash Memo designs available.
            </p>

            <p className="mt-3 text-sm text-[#817875]">
              Add Cash Memo designs to your Google Sheet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}