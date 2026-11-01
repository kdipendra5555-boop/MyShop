
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

// ==========================================
// TYPES
// ==========================================

type VisitingCardItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string;
  imageUrls: string[];
  paper: string;
  finish: string;
  printing: string;
  quantity: string;
  available: boolean;
  badge: string;
};

// ==========================================
// CONFIGURATION
// ==========================================

const SHEET_URL = (
  import.meta.env.VITE_VISITING_CARDS_CSV_URL || ""
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

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.trim());

    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function parsePrice(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, "").trim();

  if (!cleaned) return null;

  const price = Number(cleaned);

  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return price;
}

function parseAvailability(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  return ![
    "false",
    "no",
    "0",
    "unavailable",
    "out of stock",
    "sold out",
  ].includes(normalized);
}

// ==========================================
// RANDOM SHUFFLE
// ==========================================

function shuffleCards(
  products: VisitingCardItem[]
): VisitingCardItem[] {
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

// ==========================================
// READ GOOGLE SHEETS
// ==========================================

function readCards(csv: string): VisitingCardItem[] {
  const rows = parseCSV(csv);

  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);

  const get = (
    row: string[],
    ...names: string[]
  ): string => {
    for (const name of names) {
      const index = headers.indexOf(
        normalizeHeader(name)
      );

      if (index >= 0) {
        return (row[index] ?? "").trim();
      }
    }

    return "";
  };

  const cards = rows.slice(1).flatMap((row, index) => {
    const name = get(
      row,
      "name",
      "card name",
      "product name",
      "title"
    );

    if (!name) return [];

    const description = get(
      row,
      "description",
      "details",
      "short description"
    );

    const imageUrls = [
      get(row, "imageUrl", "imageUrl1", "image 1 url", "image 1"),
      get(row, "imageUrl2", "image 2 url", "image 2"),
      get(row, "imageUrl3", "image 3 url", "image 3"),
      get(row, "imageUrl4", "image 4 url", "image 4"),
    ].filter(Boolean);

    return [
      {
        id:
          get(row, "id", "card id", "product id") ||
          `VC${index + 1}`,

        name,
        description,

        category:
          get(row, "category", "card category", "type") ||
          "Other Visiting Cards",

        price: parsePrice(
          get(row, "price", "card price")
        ),

        originalPrice: parsePrice(
          get(row, "originalPrice", "original price", "mrp")
        ),

        imageUrl: imageUrls[0] || "",
        imageUrls,

        paper: get(row, "paper", "paper type", "material"),

        finish: get(row, "finish", "lamination", "coating"),

        printing: get(row, "printing", "printing type"),

        quantity: get(row, "quantity", "minimum quantity", "pack size"),

        available: parseAvailability(
          get(row, "available", "availability", "in stock")
        ),

        badge: get(row, "badge", "label", "tag"),
      },
    ];
  });

  // Handle duplicate IDs

  const seenIds = new Set<string>();

  return cards.map((card, index) => {
    let id = card.id;

    if (seenIds.has(id)) {
      id = `${id}-${index + 1}`;
    }

    seenIds.add(id);

    return {
      ...card,
      id,
    };
  });
}

// ==========================================
// WHATSAPP UTILITIES
// ==========================================

function getWhatsAppUrl(
  number: string,
  message: string
): string {
  let internationalNumber = number;

  if (internationalNumber.startsWith("0")) {
    internationalNumber = internationalNumber.slice(1);
  }

  if (
    internationalNumber.length === 10 &&
    /^[6-9]\d{9}$/.test(internationalNumber)
  ) {
    internationalNumber = `91${internationalNumber}`;
  }

  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(
    message
  )}`;
}

function formatPrice(price: number | null): string {
  if (price === null) return "Price on request";

  return `₹${price.toLocaleString("en-IN")}`;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function VisitingCards() {
  const [cards, setCards] = useState<VisitingCardItem[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All Cards");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [failedImages, setFailedImages] = useState<string[]>([]);

  const [addedItems, setAddedItems] = useState<string[]>([]);

  const navigate = useNavigate();

  // ========================================
  // LOAD GOOGLE SHEETS + RANDOMIZE
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadCards() {
      setLoading(true);
      setError("");

      if (!SHEET_URL) {
        setError(
          "Google Sheets CSV URL is missing. Please configure VITE_VISITING_CARDS_CSV_URL in your .env file."
        );

        setLoading(false);
        return;
      }

      try {
        const response = await fetch(SHEET_URL, {
          signal: controller.signal,
          headers: {
            Accept: "text/csv,text/plain,*/*",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Google Sheets request failed (HTTP ${response.status}).`
          );
        }

        const csv = await response.text();

        if (
          !csv.trim() ||
          csv.trimStart().startsWith("<")
        ) {
          throw new Error(
            "Google Sheets did not return CSV data. Check your published CSV URL."
          );
        }

        const result = readCards(csv);

        if (result.length === 0) {
          throw new Error(
            'No visiting cards found. Check your "name" or "Card Name" column.'
          );
        }

        // Random order on every fresh load
        setCards(shuffleCards(result));

        setFailedImages([]);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading visiting cards."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadCards();

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  // ========================================
  // CATEGORIES
  // ========================================

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        cards
          .map((card) => card.category.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    return ["All Cards", ...uniqueCategories];
  }, [cards]);

  // ========================================
  // FILTER PRODUCTS
  // ========================================

  const filteredCards = useMemo(() => {
    if (selectedCategory === "All Cards") {
      return cards;
    }

    return cards.filter(
      (card) =>
        card.category.trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase()
    );
  }, [cards, selectedCategory]);

  // ========================================
  // ADD TO CART
  // ========================================

  function handleAddToCart(card: VisitingCardItem) {
    if (!card.available) return;

    if (card.price === null) {
      window.alert(
        "Price is not available. Please enquire on WhatsApp."
      );
      return;
    }

    addToCart({
      id: card.id,
      name: card.name,
      price: card.price,
      image: card.imageUrl,
    });

    setAddedItems((previous) =>
      previous.includes(card.id)
        ? previous
        : [...previous, card.id]
    );

    window.setTimeout(() => {
      setAddedItems((previous) =>
        previous.filter((id) => id !== card.id)
      );
    }, 1800);
  }

  // ========================================
  // ORDER NOW - WHATSAPP
  // ========================================

  function orderCard(card: VisitingCardItem) {
    if (!card.available) return;

    if (!WHATSAPP_NUMBER) {
      window.alert(
        "Please configure VITE_WHATSAPP_NUMBER in your .env file."
      );
      return;
    }

    const message = [
      "Hello Dot Print!",
      "",
      "I want to enquire about this visiting card.",
      "",
      `Product: ${card.name}`,
      `Product ID: ${card.id}`,
      `Price: ${formatPrice(card.price)}`,
      `Category: ${card.category}`,
      `Paper: ${card.paper || "Please share options"}`,
      `Finish: ${card.finish || "Please share options"}`,
      `Printing: ${card.printing || "Please share options"}`,
      `Quantity: ${card.quantity || "Please confirm"}`,
      "",
      "Please share available sizes, quantity options and final pricing.",
    ].join("\n");

    window.open(
      getWhatsAppUrl(WHATSAPP_NUMBER, message),
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ========================================
  // PRODUCT DETAILS
  // ========================================

  function openDetails(card: VisitingCardItem) {
    navigate(
      `/visiting-cards/${encodeURIComponent(card.id)}`
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      id="visiting-cards"
      className="min-h-screen bg-[#FAF8F6] px-4 py-12 text-[#29201E] sm:px-8 sm:py-16 lg:px-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADING */}

        <div className="mb-">
          {/* CATEGORY FILTERS */}

          <div className="mt-">


            <div
              className="
                -mx-4 flex flex-nowrap gap-2
                overflow-x-auto overflow-y-hidden
                whitespace-nowrap px-4 pb-2
                sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0
                scrollbar-hide
              "
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`
                    shrink-0 rounded-full border
                    px-4 py-2.5 text-xs
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
        </div>

        {/* COLLECTION BAR */}

        <div className="flex items-center justify-between border-y border-[#EEE7E2] py-4">

          <p className="text-sm text-[#817875]">
            {loading
              ? "Loading collection..."
              : `${filteredCards.length} ${
                  filteredCards.length === 1
                    ? "design"
                    : "designs"
                }`}
          </p>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((key) => key + 1)
            }
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-[#817875] transition hover:text-[#941B32] disabled:opacity-50"
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
                <div className="mt-2 h-9 rounded-full bg-[#EAE5DD]" />
              </div>
            ))}

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div
            className="my-10 rounded-2xl border border-[#EEE7E2] bg-white p-8 text-center"
            role="alert"
          >
            <AlertCircle
              size={30}
              className="mx-auto text-[#941B32]"
            />

            <p className="mt-4 font-medium">
              Unable to load the collection
            </p>

            <p className="mt-2 break-words text-sm text-[#817875]">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setRefreshKey((key) => key + 1)
              }
              className="mt-5 rounded-full bg-[#941B32] px-5 py-3 text-sm text-white hover:bg-[#761326]"
            >
              Try again
            </button>
          </div>
        )}

        {/* PRODUCT GRID */}

        {!loading &&
          !error &&
          filteredCards.length > 0 && (

            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">

              {filteredCards.map((card) => (

                <article
                  key={card.id}
                  className="group min-w-0 overflow-hidden rounded-[20px] border border-[#EEE7E2] bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* IMAGE */}

                  <div className="relative overflow-hidden rounded-[15px] bg-[#F5F3F0]">

                    {card.imageUrl &&
                    !failedImages.includes(card.id) ? (

                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        loading="lazy"
                        onError={() =>
                          setFailedImages((previous) =>
                            previous.includes(card.id)
                              ? previous
                              : [...previous, card.id]
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

                    {/* BADGE */}

                    {card.badge && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#941B32] px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-white shadow-sm sm:text-[9px]">
                        {card.badge}
                      </span>
                    )}

                    {/* UNAVAILABLE */}

                    {!card.available && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-[#29201E]/90 px-2.5 py-1.5 text-[9px] text-white">
                        Currently unavailable
                      </span>
                    )}

                    {/* DETAILS */}

                    <button
                      type="button"
                      aria-label={`See details for ${card.name}`}
                      onClick={() => openDetails(card)}
                      className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#29201E] shadow-sm transition hover:bg-[#941B32] hover:text-white sm:h-9 sm:w-9"
                    >
                      <ArrowUpRight size={17} />
                    </button>

                  </div>

                  {/* PRODUCT DETAILS */}

                  <div className="px-1.5 pb-1 pt-3">

                    <div className="flex items-start justify-between gap-1">

                      <h2 className="line-clamp-1 min-w-0 text-[13px] font-semibold text-[#29201E] sm:text-[15px]">
                        {card.name}
                      </h2>

                      <Heart
                        size={15}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-[#941B32]"
                      />

                    </div>

                    <p className="mt-1 line-clamp-2 min-h-[34px] text-[10px] leading-[17px] text-[#817875] sm:text-xs sm:leading-[18px]">
                      {card.description ||
                        "Premium business visiting card design."}
                    </p>

                    {/* PRICE */}

                    <div className="mt-2 flex min-h-[24px] flex-wrap items-center gap-2">

                      <span className="text-[15px] font-bold text-[#941B32] sm:text-base">
                        {formatPrice(card.price)}
                      </span>

                      {card.originalPrice !== null &&
                        card.price !== null &&
                        card.originalPrice > card.price && (
                          <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                            {formatPrice(card.originalPrice)}
                          </span>
                        )}

                    </div>

                    {/* ADD TO CART */}

                    <button
                      type="button"
                      disabled={!card.available || card.price === null}
                      onClick={() => handleAddToCart(card)}
                      className={`
                        mt-3 flex h-[36px] w-full items-center
                        justify-center gap-2 rounded-full border
                        text-[10px] font-medium transition-all
                        duration-300 sm:h-[38px] sm:text-xs

                        ${
                          addedItems.includes(card.id)
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-[#941B32] bg-white text-[#941B32] hover:bg-[#FFF5F6]"
                        }

                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      `}
                    >

                      {addedItems.includes(card.id) ? (
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
                      disabled={!card.available}
                      onClick={() => orderCard(card)}
                      className="mt-2 flex h-[36px] w-full items-center justify-center gap-2 rounded-full bg-[#941B32] text-[10px] font-semibold text-white transition-all duration-300 hover:bg-[#761326] disabled:cursor-not-allowed disabled:opacity-40 sm:h-[38px] sm:text-xs"
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

        {!loading &&
          !error &&
          filteredCards.length === 0 && (

            <div className="py-20 text-center">

              <p className="font-serif text-2xl">
                {selectedCategory !== "All Cards"
                  ? `No designs found in ${selectedCategory}.`
                  : "No designs available yet."}
              </p>

              <p className="mt-3 text-sm text-[#817875]">
                Add visiting card designs to your Google Sheet.
              </p>

              {selectedCategory !== "All Cards" && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All Cards")}
                  className="mt-5 rounded-full border border-[#EEE7E2] px-5 py-2.5 text-sm hover:bg-white"
                >
                  View all cards
                </button>
              )}

            </div>

          )}

      </div>
    </section>
  );
}

