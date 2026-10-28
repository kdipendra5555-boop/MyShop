import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  RefreshCw,
  ImageOff,
  AlertCircle,
} from "lucide-react";

type WeddingCardItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  imageUrl: string;
  imageUrls: string[];
  printing: string;
  shipping: string;
  codAvailable: string;
  additionalInformation: string;
  available: boolean;
};

const SHEET_URL = (
  import.meta.env.VITE_WEDDING_CARDS_CSV_URL || ""
).trim();

const WHATSAPP_NUMBER = (
  import.meta.env.VITE_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

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

  if (!cleaned) {
    return null;
  }

  const price = Number(cleaned);

  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return price;
}

function parseAvailability(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  // Blank availability defaults to available.
  // Set FALSE, NO, 0, or UNAVAILABLE in Sheets to disable ordering.
  return ![
    "false",
    "no",
    "0",
    "unavailable",
    "out of stock",
    "sold out",
  ].includes(normalized);
}

function inferCategory(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();

  const categoryRules: Array<[RegExp, string]> = [
    [/\b(hindu|sanatan|mandap|vivah|ganesh|radha|ram|krishna)\b/, "Hindu Wedding Cards"],
    [/\b(muslim|islamic|nikah|nikkah|muslim)\b/, "Muslim Wedding Cards"],
    [/\b(tamil)\b/, "Tamil Wedding Cards"],
    [/\b(sikh|punjabi|anand karaj)\b/, "Sikh Wedding Cards"],
    [/\b(christian|church|bible)\b/, "Christian Wedding Cards"],
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

function readCards(csv: string): WeddingCardItem[] {
  const rows = parseCSV(csv);

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(normalizeHeader);

  const get = (row: string[], ...names: string[]): string => {
    for (const name of names) {
      const index = headers.indexOf(normalizeHeader(name));

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

    if (!name) {
      return [];
    }

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
        description: get(
          row,
          "description",
          "details",
          "short description"
        ),
        category: normalizeCategory(
          get(row, "category", "card category", "tradition", "wedding category"),
          name,
          get(row, "description", "details", "short description")
        ),
        price: parsePrice(get(row, "price", "card price")),
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
      },
    ];
  });

  // Prevent duplicate React keys if IDs are repeated in the sheet.
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

function getWhatsAppUrl(
  number: string,
  message: string
): string {
  // Supports either a 10-digit Indian number or a number
  // already containing India's country code 91.
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
  if (price === null) {
    return "Price on request";
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

export default function WeddingCards() {
  const [cards, setCards] = useState<WeddingCardItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Cards");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const navigate = useNavigate();

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
            "Google Sheets did not return CSV data. Publish the spreadsheet to the web as CSV and check the URL."
          );
        }

        const result = readCards(csv);

        if (result.length === 0) {
          throw new Error(
            'No wedding cards were found. Check that your sheet contains a header named "name" or "Card Name" and that product rows contain names.'
          );
        }

        setCards(result);
        setFailedImages([]);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

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

  function orderCard(card: WeddingCardItem) {
    if (!card.available) {
      return;
    }

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

  function openDetails(card: WeddingCardItem) {
    navigate(
      `/wedding-cards/${encodeURIComponent(card.id)}`
    );
  }

  return (
    <section
      id="wedding-cards"
      className="min-h-screen bg-[#F8F7F4] px-5 py-16 text-[#252522] sm:px-8 lg:px-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#A96B48]">
            Dot Print / Wedding Collection
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl">
            Wedding Invitations
            <span className="text-[#A96B48]">.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#77736D] sm:text-base">
            Discover invitation designs thoughtfully
            created for your special day.
          </p>

          {/* Wedding card categories */}
          <div className="mt-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#89837A]">
              Explore by Tradition
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`rounded-full border px-4 py-2.5 text-sm transition ${
                    selectedCategory === category
                      ? "border-[#252522] bg-[#252522] text-white"
                      : "border-[#DCD5CB] bg-white text-[#77736D] hover:border-[#A96B48] hover:text-[#A96B48]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collection metadata */}
        <div className="flex items-center justify-between border-y border-[#E4DED5] py-4">
          <p
            className="text-sm text-[#77736D]"
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
            className="inline-flex items-center gap-2 text-sm text-[#77736D] transition hover:text-[#A96B48] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                loading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div
            className="grid grid-cols-2 gap-5 py-10 md:grid-cols-3 lg:grid-cols-4"
            aria-label="Loading wedding cards"
          >
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="animate-pulse"
                >
                  <div className="aspect-[3/4] rounded-xl bg-[#EAE5DD]" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-[#EAE5DD]" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-[#EAE5DD]" />
                </div>
              )
            )}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            className="my-10 rounded-2xl border border-[#E4DED5] bg-white p-8 text-center"
            role="alert"
          >
            <AlertCircle
              size={30}
              className="mx-auto text-[#A96B48]"
            />

            <p className="mt-4 font-medium">
              Unable to load the collection
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-[#77736D]">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setRefreshKey((key) => key + 1)
              }
              className="mt-5 rounded-full bg-[#252522] px-5 py-3 text-sm text-white transition hover:bg-[#A96B48]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Product grid */}
        {!loading &&
          !error &&
          filteredCards.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCards.map((card) => (
                <article
                  key={card.id}
                  className="group min-w-0"
                >
                  {/* Product image */}
                  <div className="relative overflow-hidden rounded-xl bg-[#EAE5DD]">
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
                        className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 text-[#93887B]">
                        <ImageOff
                          size={28}
                          strokeWidth={1.3}
                        />

                        <span className="px-2 text-center text-xs">
                          Image unavailable
                        </span>
                      </div>
                    )}

                    {/* <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-medium text-[#77736D]">
                      Wedding Collection
                    </span> */}

                    {!card.available && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-[#252522]/90 px-3 py-1.5 text-[10px] font-medium text-white">
                        Currently unavailable
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label={`See details for ${card.name}`}
                      onClick={() => openDetails(card)}
                      className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#252522] shadow-sm transition hover:bg-[#252522] hover:text-white"
                    >
                      <ArrowUpRight size={19} />
                    </button>
                  </div>

                  {/* Product details */}
                  <div className="flex items-start justify-between gap-2 pt-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-medium sm:text-base">
                        {card.name}
                      </h2>

                      {card.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#89837A] sm:text-sm">
                          {card.description}
                        </p>
                      )}

                      <p className="mt-3 text-sm font-semibold">
                        {formatPrice(card.price)}

                        {card.price !== null && (
                          <span className="ml-1 font-normal text-[#89837A]">
                            / card
                          </span>
                        )}
                      </p>
                    </div>

                    <Heart
                      size={17}
                      strokeWidth={1.4}
                      className="mt-1 shrink-0 text-[#A96B48]"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!card.available}
                      onClick={() => orderCard(card)}
                      className="flex min-w-0 items-center justify-center gap-1.5 rounded-full bg-[#252522] px-2 py-3 text-xs font-medium text-white transition hover:bg-[#A96B48] disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-3 sm:text-sm"
                    >
                      <MessageCircle size={15} />
                      Order Now
                    </button>

                    <button
                      type="button"
                      onClick={() => openDetails(card)}
                      className="flex min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#DCD5CB] px-2 py-3 text-xs font-medium transition hover:border-[#252522] hover:bg-white sm:gap-2 sm:px-3 sm:text-sm"
                    >
                      <ArrowUpRight size={15} />
                      See Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

        {/* Empty state */}
        {!loading &&
          !error &&
          filteredCards.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-serif text-2xl">
                {selectedCategory !== "All Cards"
                  ? `No designs found in ${selectedCategory}.`
                  : "No designs available yet."}
              </p>

              <p className="mt-3 text-sm text-[#77736D]">
                {selectedCategory !== "All Cards"
                  ? "Choose another category or select All Cards."
                  : "Add wedding card designs to your Google Sheet and refresh the collection."}
              </p>

              {selectedCategory !== "All Cards" && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All Cards")}
                  className="mt-5 rounded-full border border-[#DCD5CB] px-5 py-2.5 text-sm transition hover:bg-white"
                >
                  View all cards
                </button>
              )}
            </div>
          )}

        {/* Footer */}
        <div className="mt-16 flex flex-col gap-3 border-t border-[#E4DED5] pt-6 text-xs leading-6 text-[#89837A] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Beautifully printed. Thoughtfully delivered.
          </p>

          <p>
            Prices shown are per card. Confirm quantity
            and final pricing before ordering.
          </p>
        </div>
      </div>
    </section>
  );
}