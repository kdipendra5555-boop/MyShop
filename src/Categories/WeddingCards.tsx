
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  RefreshCw,
  ImageOff,
} from "lucide-react";

type WeddingCardItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
};

const SHEET_URL = import.meta.env.VITE_WEDDING_CARDS_CSV_URL || "";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "";

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
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && csv[i + 1] === "\n") i++;

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

  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

function readCards(csv: string): WeddingCardItem[] {
  const rows = parseCSV(csv);

  if (!rows.length) return [];

  const headers = rows[0].map((header) =>
    header.replace(/^\uFEFF/, "").trim().toLowerCase()
  );

  const column = (name: string) => headers.indexOf(name.toLowerCase());

  const get = (row: string[], name: string) => {
    const index = column(name);
    return index >= 0 ? (row[index] ?? "").trim() : "";
  };

  return rows.slice(1).flatMap((row, index) => {
    const name = get(row, "name");

    if (!name) return [];

    const priceValue = get(row, "price");
    const parsedPrice = Number(priceValue.replace(/[₹,\s]/g, ""));

    const availability = get(row, "available").toLowerCase();

    return [
      {
        id: get(row, "id") || `WC${index + 1}`,
        name,
        description: get(row, "description"),
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        imageUrl: get(row, "imageUrl"),
        available: !["false", "no", "0", "unavailable"].includes(
          availability
        ),
      },
    ];
  });
}

export default function WeddingCards() {
  const [cards, setCards] = useState<WeddingCardItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadCards() {
      setLoading(true);
      setError("");

      if (!SHEET_URL) {
        setError("Google Sheets CSV URL is not configured in .env.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(SHEET_URL);

        if (!response.ok) {
          throw new Error(
            "Could not load wedding cards from Google Sheets."
          );
        }

        const csv = await response.text();

        if (csv.trimStart().startsWith("<")) {
          throw new Error(
            "Google Sheets returned a webpage instead of CSV. Check Publish to web settings."
          );
        }

        const result = readCards(csv);

        if (!cancelled) {
          setCards(result);
          setFailedImages([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading cards."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCards();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filteredCards = cards.filter((card) =>
    `${card.name} ${card.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function orderCard(card: WeddingCardItem) {
    if (!card.available) return;

    if (!WHATSAPP_NUMBER) {
      alert("Please configure VITE_WHATSAPP_NUMBER in your .env file.");
      return;
    }

    const message = [
      "Hello Dot Print!",
      "I want to order this wedding card.",
      `Card: ${card.name}`,
      `Card ID: ${card.id}`,
      `Price per card: ₹${card.price}`,
      "Please share the ordering details.",
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
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
            Discover invitation designs thoughtfully created for your
            special day.
          </p>

          {/* Search */}
          <div className="mt-7 max-w-md">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search wedding cards..."
              aria-label="Search wedding cards"
              className="w-full rounded-full border border-[#DCD5CB] bg-white px-5 py-3 text-sm outline-none transition focus:border-[#A96B48]"
            />
          </div>
        </div>

        {/* Collection metadata */}
        <div className="flex items-center justify-between border-y border-[#E4DED5] py-4">
          <p className="text-sm text-[#77736D]">
            {loading
              ? "Loading collection..."
              : `${filteredCards.length} designs`}
          </p>

          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-[#77736D] transition hover:text-[#A96B48] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-5 py-10 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4] rounded-xl bg-[#EAE5DD]" />
                <div className="mt-4 h-4 w-3/4 rounded bg-[#EAE5DD]" />
                <div className="mt-3 h-3 w-1/2 rounded bg-[#EAE5DD]" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="my-10 rounded-2xl border border-[#E4DED5] bg-white p-8 text-center">
            <p className="font-medium">
              Unable to load the collection
            </p>

            <p className="mt-2 break-words text-sm text-[#77736D]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="mt-5 rounded-full bg-[#252522] px-5 py-3 text-sm text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && filteredCards.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCards.map((card) => (
              <article key={card.id} className="group min-w-0">
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
                      <ImageOff size={28} strokeWidth={1.3} />
                      <span className="px-2 text-center text-xs">
                        Add card image URL in Google Sheets
                      </span>
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-medium text-[#77736D]">
                    Wedding Collection
                  </span>

                  <button
                    type="button"
                    aria-label={`See details for ${card.name}`}
                    onClick={() => navigate(`/wedding-cards/${encodeURIComponent(card.id)}`)}
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

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#89837A] sm:text-sm">
                      {card.description}
                    </p>

                    <p className="mt-3 text-sm font-semibold">
                      ₹{card.price.toLocaleString("en-IN")}

                      <span className="ml-1 font-normal text-[#89837A]">
                        / card
                      </span>
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
                    onClick={() =>
                      navigate(`/wedding-cards/${encodeURIComponent(card.id)}`)
                    }
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
        {!loading && !error && filteredCards.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl">
              No designs found.
            </p>

            <p className="mt-3 text-sm text-[#77736D]">
              Try another search or add more designs to your Google Sheet.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 flex flex-col gap-3 border-t border-[#E4DED5] pt-6 text-xs leading-6 text-[#89837A] sm:flex-row sm:items-center sm:justify-between">
          <p>Beautifully printed. Thoughtfully delivered.</p>

          <p>
            Prices shown are per card; confirm quantity and final pricing
            before ordering.
          </p>
        </div>
      </div>
    </section>
  );
}
