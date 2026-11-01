
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
} from "lucide-react";

import { addToCart } from "../utils/cart";

// ==========================================
// TYPES
// ==========================================

type WeddingCardItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string;
  imageUrls: string[];
  printing: string;
  shipping: string;
  codAvailable: string;
  additionalInformation: string;
  available: boolean;
  badge: string;
};

// ==========================================
// CONFIGURATION
// ==========================================

const SHEET_URL = (
  import.meta.env.VITE_WEDDING_CARDS_CSV_URL || ""
).trim();

const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

// const BRAND = {
//   primary: "#941B32",
//   dark: "#761326",
//   background: "#FAF8F6",
//   text: "#29201E",
//   muted: "#817875",
//   border: "#EEE7E2",
// };

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
// CATEGORY UTILITIES
// ==========================================

function inferCategory(
  name: string,
  description: string
): string {
  const text = `${name} ${description}`.toLowerCase();

  const categoryRules: Array<[RegExp, string]> = [
    [
      /\b(hindu|sanatan|mandap|vivah|ganesh|radha|ram|krishna)\b/,
      "Hindu Wedding Cards",
    ],
    [
      /\b(muslim|islamic|nikah|nikkah)\b/,
      "Muslim Wedding Cards",
    ],
    [/\b(tamil)\b/, "Tamil Wedding Cards"],
    [
      /\b(sikh|punjabi|anand karaj)\b/,
      "Sikh Wedding Cards",
    ],
    [
      /\b(christian|church|bible)\b/,
      "Christian Wedding Cards",
    ],
    [/\b(bengali|bangla)\b/, "Bengali Wedding Cards"],
    [/\b(telugu)\b/, "Telugu Wedding Cards"],
    [/\b(kannada|kannadiga)\b/, "Kannada Wedding Cards"],
    [/\b(marathi)\b/, "Marathi Wedding Cards"],
    [/\b(gujarati)\b/, "Gujarati Wedding Cards"],
  ];

  for (const [pattern, category] of categoryRules) {
    if (pattern.test(text)) return category;
  }

  return "Other Wedding Cards";
}

function normalizeCategory(
  rawCategory: string,
  name: string,
  description: string
): string {
  const raw = rawCategory.trim().toLowerCase();

  const aliases: Record<string, string> = {
    hindu: "Hindu Wedding Cards",
    "hindu wedding": "Hindu Wedding Cards",
    "hindu wedding card": "Hindu Wedding Cards",
    "hindu wedding cards": "Hindu Wedding Cards",

    muslim: "Muslim Wedding Cards",
    islamic: "Muslim Wedding Cards",
    nikah: "Muslim Wedding Cards",
    "muslim wedding": "Muslim Wedding Cards",
    "muslim wedding cards": "Muslim Wedding Cards",

    tamil: "Tamil Wedding Cards",
    "tamil wedding": "Tamil Wedding Cards",
    "tamil wedding cards": "Tamil Wedding Cards",

    sikh: "Sikh Wedding Cards",
    punjabi: "Sikh Wedding Cards",

    christian: "Christian Wedding Cards",
    bengali: "Bengali Wedding Cards",
    telugu: "Telugu Wedding Cards",
    kannada: "Kannada Wedding Cards",
    marathi: "Marathi Wedding Cards",
    gujarati: "Gujarati Wedding Cards",
  };

  if (aliases[raw]) return aliases[raw];

  if (rawCategory.trim()) return rawCategory.trim();

  return inferCategory(name, description);
}

// ==========================================
// READ GOOGLE SHEETS
// ==========================================

function readCards(csv: string): WeddingCardItem[] {
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

    const id =
      get(row, "id", "card id", "product id") ||
      `WC${index + 1}`;

    return [
      {
        id,
        name,
        description,

        category: normalizeCategory(
          get(
            row,
            "category",
            "card category",
            "tradition",
            "wedding category"
          ),
          name,
          description
        ),

        price: parsePrice(
          get(row, "price", "card price")
        ),

        originalPrice: parsePrice(
          get(row, "originalPrice", "original price", "mrp")
        ),

        imageUrl: imageUrls[0] || "",
        imageUrls,

        printing: get(row, "printing", "printing type"),

        shipping: get(row, "shipping", "delivery"),

        codAvailable: get(
          row,
          "cod available",
          "cod",
          "cash on delivery"
        ),

        additionalInformation: get(
          row,
          "additional information",
          "additionalInformation",
          "extra information"
        ),

        available: parseAvailability(
          get(row, "available", "availability", "in stock")
        ),

        badge: get(row, "badge", "label", "tag") || "Best Seller",
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

export default function WeddingCards() {
  const [cards, setCards] = useState<WeddingCardItem[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All Cards");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [failedImages, setFailedImages] = useState<string[]>([]);

  const [addedItems, setAddedItems] = useState<string[]>([]);

  const navigate = useNavigate();

  // ========================================
  // LOAD GOOGLE SHEETS
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadCards() {
      setLoading(true);
      setError("");

      if (!SHEET_URL) {
        setError(
          "Google Sheets CSV URL is missing. Please configure VITE_WEDDING_CARDS_CSV_URL in your .env file."
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
            `Google Sheets request failed (HTTP ${response.status}). Check your published CSV URL.`
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
            'No wedding cards found. Check that your sheet contains a "name" or "Card Name" column.'
          );
        }

        setCards(result);
        setFailedImages([]);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading wedding cards."
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

  function handleAddToCart(card: WeddingCardItem) {
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

  function orderCard(card: WeddingCardItem) {
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
      "I want to enquire about this wedding card.",
      "",
      `Card Name: ${card.name}`,
      `Card ID: ${card.id}`,
      `Price per card: ${formatPrice(card.price)}`,
      "",
      `Printing: ${card.printing || "Please share options"}`,
      `Shipping: ${card.shipping || "Please share details"}`,
      `COD: ${card.codAvailable || "Please confirm"}`,
      "",
      "Please share the minimum order quantity, printing options, and final pricing.",
    ].join("\n");

    const url = getWhatsAppUrl(
      WHATSAPP_NUMBER,
      message
    );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ========================================
  // PRODUCT DETAILS
  // ========================================

  function openDetails(card: WeddingCardItem) {
    navigate(
      `/wedding-cards/${encodeURIComponent(card.id)}`
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      id="wedding-cards"
      className="min-h-screen px-4 py-  text-[#29201E] sm:px-8 sm:py-16 lg:px-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* ==================================
            HEADING
        ================================== */}

        <div className="mb-9">

          {/* CATEGORY FILTERS */}

<div className="mt-">

  <div
    className="
      flex flex-nowrap gap-2
      overflow-x-auto overflow-y-hidden
      whitespace-nowrap
      pb-2
      -mx-4 px-4
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

        {/* ==================================
            COLLECTION METADATA
        ================================== */}

        {/* <div className="flex items-center justify-between border-y border-[#EEE7E2] py-4">

          <p
            className="text-sm text-[#817875]"
            aria-live="polite"
          >
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
            className="inline-flex items-center gap-2 text-sm text-[#817875] transition hover:text-[#941B32] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

        </div> */}

        {/* ==================================
            LOADING SKELETON
        ================================== */}

        {loading && (
          <div
            className="grid grid-cols-2 gap-4 py-10 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
            aria-label="Loading wedding cards"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-[20px] border border-[#EEE7E2] bg-white p-2"
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

        {/* ==================================
            ERROR STATE
        ================================== */}

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

            <p className="mt-2 break-words text-sm leading-6 text-[#817875]">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setRefreshKey((key) => key + 1)
              }
              className="mt-5 rounded-full bg-[#941B32] px-5 py-3 text-sm text-white transition hover:bg-[#761326]"
            >
              Try again
            </button>

          </div>
        )}

        {/* ==================================
            PRODUCT GRID
        ================================== */}

        {!loading &&
          !error &&
          filteredCards.length > 0 && (

            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">

              {filteredCards.map((card) => (

                <article
                  key={card.id}
                  className="group min-w-0 overflow-hidden rounded-[20px] border border-[#EEE7E2] bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* PRODUCT IMAGE */}

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

                        <ImageOff
                          size={28}
                          strokeWidth={1.3}
                        />

                        <span className="px-2 text-center text-xs">
                          Image unavailable
                        </span>

                      </div>

                    )}

                    {/* PRODUCT BADGE */}

                    {/* {card.badge && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#941B32] px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-white shadow-sm sm:left-2.5 sm:top-2.5 sm:px-3 sm:text-[9px]">
                        {card.badge}
                      </span>
                    )} */}

                    {/* UNAVAILABLE BADGE */}

                    {!card.available && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-[#29201E]/90 px-2.5 py-1.5 text-[9px] font-medium text-white">
                        Currently unavailable
                      </span>
                    )}

                    {/* DETAILS BUTTON */}

                    <button
                      type="button"
                      aria-label={`See details for ${card.name}`}
                      onClick={() => openDetails(card)}
                      className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#29201E] shadow-sm transition hover:bg-[#941B32] hover:text-white sm:h-9 sm:w-9"
                    >
                      <ArrowUpRight size={17} />
                    </button>

                  </div>

                  {/* ==================================
                      PRODUCT DETAILS
                  ================================== */}

                  <div className="px-1.5 pb-1 pt-3">

                    {/* PRODUCT NAME */}

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

                    {/* DESCRIPTION */}

                    <p className="mt-1 line-clamp-2 min-h-[34px] text-[10px] leading-[17px] text-[#817875] sm:text-xs sm:leading-[18px]">
                      {card.description || "Beautifully designed wedding invitation."}
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

                    {/* ==================================
                        ADD TO CART
                    ================================== */}

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

                    {/* ==================================
                        ORDER NOW
                    ================================== */}

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

        {/* ==================================
            EMPTY STATE
        ================================== */}

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
                {selectedCategory !== "All Cards"
                  ? "Choose another category or select All Cards."
                  : "Add wedding card designs to your Google Sheet and refresh the collection."}
              </p>

              {selectedCategory !== "All Cards" && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All Cards")}
                  className="mt-5 rounded-full border border-[#EEE7E2] px-5 py-2.5 text-sm transition hover:bg-white"
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

