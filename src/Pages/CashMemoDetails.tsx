import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ShoppingCart,
  Check,
  ImageOff,
  MessageCircle,
  Package,
  Printer,
  Ruler,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { addToCart } from "../utils/cart";

type PriceSlab = {
  quantity: number;
  price: number;
};

type CashMemoItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  originalPrice: number | null;
  imageUrls: string[];
  size: string;
  paper: string;
  printing: string;
  available: boolean;
  badge: string;
  additionalInformation: string;
  pricing: PriceSlab[];
};

const SHEET_URL = (
  import.meta.env.VITE_CASHMEMO_CSV_URL || ""
).trim();

const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

// ==========================================
// CSV UTILITIES
// ==========================================

function normalizeHeader(header: string): string {
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
      if (char === "\r" && csv[i + 1] === "\n") {
        i++;
      }

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

// ==========================================
// READ GOOGLE SHEETS
// ==========================================

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

  return rows.slice(1).flatMap((row, index) => {
    const name = get(row, "name", "product name", "title");

    if (!name) return [];

    const pricing: PriceSlab[] = [];

    // Read all quantity-price pairs dynamically.
    for (let i = 1; i <= headers.length; i++) {
      const quantity = parsePrice(
        get(row, `quantity${i}`, `qty${i}`)
      );

      const price = parsePrice(
        get(row, `price${i}`)
      );

      if (
        quantity !== null &&
        price !== null &&
        quantity > 0
      ) {
        pricing.push({
          quantity,
          price,
        });
      }
    }

    pricing.sort((a, b) => a.quantity - b.quantity);

    const imageUrls = [
      get(row, "image1", "image url 1", "imageurl"),
      get(row, "image2", "image url 2", "imageurl2"),
      get(row, "image3", "image url 3", "imageurl3"),
      get(row, "image4", "image url 4", "imageurl4"),
    ].filter(Boolean);

    return [
      {
        id:
          get(row, "id", "product id") ||
          `CM${index + 1}`,

        name,

        description: get(
          row,
          "description",
          "details"
        ),

        category: get(
          row,
          "category",
          "type"
        ),

        price: parsePrice(get(row, "price")),

        originalPrice: parsePrice(
          get(row, "originalprice", "mrp")
        ),

        imageUrls,

        size: get(row, "size"),

        paper: get(row, "paper", "paper type"),

        printing: get(row, "printing", "printing type"),

        available: parseAvailability(
          get(row, "available", "availability")
        ),

        badge: get(row, "badge", "label", "tag"),

        additionalInformation: get(
          row,
          "additionalinformation",
          "additional info",
          "information"
        ),

        pricing,
      },
    ];
  });
}

// ==========================================
// FORMAT PRICE
// ==========================================

function formatPrice(price: number | null): string {
  if (price === null) return "Price on request";

  return `₹${price.toLocaleString("en-IN")}`;
}

// ==========================================
// WHATSAPP
// ==========================================

function getWhatsAppUrl(
  number: string,
  message: string
): string {
  let phone = number;

  if (phone.startsWith("0")) {
    phone = phone.slice(1);
  }

  if (phone.length === 10) {
    phone = `91${phone}`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CashMemoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState<CashMemoItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);

  const [selectedSlab, setSelectedSlab] =
    useState<PriceSlab | null>(null);

  const [added, setAdded] = useState(false);

  // ========================================
  // LOAD PRODUCT
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");

      if (!SHEET_URL) {
        setError("Cash Memo Google Sheet URL is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(SHEET_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to fetch Google Sheet.");
        }

        const csv = await response.text();

        if (!csv.trim() || csv.trimStart().startsWith("<")) {
          throw new Error("Invalid Google Sheets CSV response.");
        }

        const products = readCashMemos(csv);

        const found = products.find(
          (item) => item.id === decodeURIComponent(id || "")
        );

        if (!found) {
          throw new Error("Cash Memo product not found.");
        }

        setProduct(found);
        setSelectedImage(0);
        setSelectedSlab(found.pricing[0] || null);

      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load product."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => controller.abort();
  }, [id]);

  // ========================================
  // ADD TO CART
  // ========================================

  function handleAddToCart() {
    if (!product || !product.available) return;

    const selectedPrice =
      selectedSlab?.price ?? product.price;

    if (selectedPrice === null) {
      window.alert("Please enquire for product pricing.");
      return;
    }

    const quantity = selectedSlab?.quantity;

    addToCart({
      id: quantity
        ? `${product.id}-${quantity}`
        : product.id,

      name: quantity
        ? `${product.name} (${quantity} Pieces)`
        : product.name,

      price: selectedPrice,
      image: product.imageUrls[0] || "",
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  // ========================================
  // WHATSAPP ORDER
  // ========================================

  function handleWhatsAppOrder() {
    if (!product) return;

    if (!WHATSAPP_NUMBER) {
      window.alert("WhatsApp number is missing in .env");
      return;
    }

    const selectedPrice =
      selectedSlab?.price ?? product.price;

    const message = [
      "Hello Dot Print!",
      "",
      "I want to order a Cash Memo.",
      "",
      `Product: ${product.name}`,
      `Product ID: ${product.id}`,
      `Category: ${product.category || "Cash Memo"}`,
      `Quantity: ${selectedSlab?.quantity ?? "Please confirm"}`,
      `Price: ${formatPrice(selectedPrice)}`,
      `Size: ${product.size || "Please confirm"}`,
      `Paper: ${product.paper || "Please confirm"}`,
      `Printing: ${product.printing || "Please confirm"}`,
      "",
      "Please confirm my order.",
    ].join("\n");

    window.open(
      getWhatsAppUrl(WHATSAPP_NUMBER, message),
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F6]">
        <RefreshCw
          size={28}
          className="animate-spin text-[#941B32]"
        />
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F6] px-5 text-center">
        <AlertCircle
          size={38}
          className="text-[#941B32]"
        />

        <h2 className="mt-5 text-xl font-semibold">
          Product unavailable
        </h2>

        <p className="mt-2 text-sm text-[#817875]">
          {error || "Unable to find this product."}
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 rounded-full bg-[#941B32] px-6 py-3 text-sm text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const selectedPrice =
    selectedSlab?.price ?? product.price;

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="min-h-screen bg-[#FAF8F6] px-4 py-8 text-[#29201E] sm:px-8 sm:py-12">

      <div className="mx-auto max-w-7xl">

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#817875] transition hover:text-[#941B32]"
        >
          <ArrowLeft size={17} />
          Back to Cash Memos
        </button>

        {/* PRODUCT SECTION */}

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* IMAGE GALLERY */}

          <div>

            <div className="relative overflow-hidden rounded-[24px] border border-[#EEE7E2] bg-white">

              {product.imageUrls.length > 0 ? (
                <img
                  src={product.imageUrls[selectedImage]}
                  alt={product.name}
                  className="aspect-square w-full object-contain p-4 sm:p-8"
                />
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center gap-3 text-[#93887B]">
                  <ImageOff size={42} />
                  <p className="text-sm">
                    No product image available
                  </p>
                </div>
              )}

              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-[#941B32] px-4 py-2 text-xs font-semibold text-white">
                  {product.badge}
                </span>
              )}
            </div>

            {/* THUMBNAILS */}

            {product.imageUrls.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">

                {product.imageUrls.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`
                      overflow-hidden rounded-xl border-2 bg-white
                      ${
                        selectedImage === index
                          ? "border-[#941B32]"
                          : "border-[#EEE7E2]"
                      }
                    `}
                  >
                    <img
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      className="aspect-square w-full object-contain p-1"
                    />
                  </button>
                ))}

              </div>
            )}

          </div>

          {/* PRODUCT INFORMATION */}

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#941B32]">
              DOT PRINT / CASH MEMO
            </p>

            <h1 className="mt-4 font-serif text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <p className="mt-4 text-sm leading-7 text-[#817875] sm:text-base">
              {product.description ||
                "Premium quality printed cash memo for your business."}
            </p>

            {/* PRICE */}

            <div className="mt-7 border-y border-[#EEE7E2] py-5">

              <p className="text-xs uppercase tracking-wider text-[#817875]">
                {selectedSlab
                  ? `Price for ${selectedSlab.quantity} pieces`
                  : "Starting Price"}
              </p>

              <div className="mt-2 flex items-center gap-3">

                <span className="text-3xl font-bold text-[#941B32]">
                  {formatPrice(selectedPrice)}
                </span>

                {product.originalPrice !== null &&
                  selectedPrice !== null &&
                  product.originalPrice > selectedPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}

              </div>

            </div>

            {/* PRODUCT SPECIFICATIONS */}

            <div className="mt-7">

              <h2 className="text-lg font-semibold">
                Product Specifications
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-[#EEE7E2] bg-white p-4">
                  <Ruler size={19} className="text-[#941B32]" />

                  <p className="mt-3 text-xs text-[#817875]">
                    Size
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {product.size || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EEE7E2] bg-white p-4">
                  <FileText size={19} className="text-[#941B32]" />

                  <p className="mt-3 text-xs text-[#817875]">
                    Paper
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {product.paper || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EEE7E2] bg-white p-4">
                  <Printer size={19} className="text-[#941B32]" />

                  <p className="mt-3 text-xs text-[#817875]">
                    Printing
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {product.printing || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EEE7E2] bg-white p-4">
                  <Package size={19} className="text-[#941B32]" />

                  <p className="mt-3 text-xs text-[#817875]">
                    Availability
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {product.available
                      ? "Available"
                      : "Out of Stock"}
                  </p>
                </div>

              </div>

            </div>

            {/* ADDITIONAL INFORMATION */}

            {product.additionalInformation && (
              <div className="mt-7 rounded-xl border border-[#EEE7E2] bg-white p-5">

                <h3 className="font-semibold">
                  Additional Information
                </h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#817875]">
                  {product.additionalInformation}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* PRICING TABLE */}

        <section className="mt-16 border-t border-[#EEE7E2] pt-12">

          <div className="text-center">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#941B32]">
              Quantity & Pricing
            </p>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Bulk Order Pricing
            </h2>

            <p className="mt-3 text-sm text-[#817875]">
              Select your required quantity to see the applicable price.
            </p>

          </div>

          {product.pricing.length > 0 ? (

            <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-[#EEE7E2] bg-white">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[360px] text-left">

                  <thead className="bg-[#F4EFEB]">

                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#817875]">
                        Quantity
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#817875]">
                        Total Price
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#817875]">
                        Selection
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {product.pricing.map((slab, index) => {
                      const active =
                        selectedSlab?.quantity === slab.quantity;

                      return (
                        <tr
                          key={`${slab.quantity}-${index}`}
                          onClick={() => setSelectedSlab(slab)}
                          className={`
                            cursor-pointer border-t border-[#EEE7E2]
                            transition
                            ${
                              active
                                ? "bg-[#FFF5F6]"
                                : "hover:bg-[#FAF8F6]"
                            }
                          `}
                        >

                          <td className="px-5 py-5 text-sm font-medium">
                            {slab.quantity.toLocaleString("en-IN")} Pieces
                          </td>

                          <td className="px-5 py-5 text-base font-bold text-[#941B32]">
                            {formatPrice(slab.price)}
                          </td>

                          <td className="px-5 py-5">

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedSlab(slab);
                              }}
                              className={`
                                rounded-full px-4 py-2 text-xs font-semibold
                                ${
                                  active
                                    ? "bg-[#941B32] text-white"
                                    : "border border-[#EEE7E2] text-[#817875]"
                                }
                              `}
                            >
                              {active ? "Selected" : "Select"}
                            </button>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

              <div className="border-t border-[#EEE7E2] bg-[#FAF8F6] px-5 py-4">

                <p className="text-sm text-[#817875]">
                  Selected Quantity:{" "}
                  <strong className="text-[#29201E]">
                    {selectedSlab
                      ? `${selectedSlab.quantity} Pieces`
                      : "Not selected"}
                  </strong>
                </p>

                <p className="mt-1 text-sm text-[#817875]">
                  Total Amount:{" "}
                  <strong className="text-[#941B32]">
                    {formatPrice(selectedPrice)}
                  </strong>
                </p>

              </div>

            </div>

          ) : (

            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-[#EEE7E2] bg-white p-8 text-center">

              <p className="text-sm text-[#817875]">
                Pricing options are currently unavailable.
                Please contact us for a quotation.
              </p>

            </div>

          )}

        </section>

        {/* ACTION BUTTONS */}

        <section className="mx-auto mt-12 max-w-3xl">

          {!product.available && (
            <p className="mb-4 text-center text-sm font-medium text-red-600">
              This product is currently unavailable.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">

            <button
              type="button"
              disabled={!product.available}
              onClick={handleAddToCart}
              className={`
                flex min-h-[52px] items-center justify-center gap-2
                rounded-full border text-sm font-semibold transition
                ${
                  added
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-[#941B32] bg-white text-[#941B32] hover:bg-[#FFF5F6]"
                }
                disabled:cursor-not-allowed disabled:opacity-40
              `}
            >
              {added ? (
                <>
                  <Check size={18} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!product.available}
              onClick={handleWhatsAppOrder}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#941B32] text-sm font-semibold text-white transition hover:bg-[#761326] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MessageCircle size={18} />
              Order on WhatsApp
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}