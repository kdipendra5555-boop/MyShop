
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  ImageOff,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Truck,
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

// CSV parser
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

// CSV data ko product objects mein convert karna
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

export default function WeddingCardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<WeddingCardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [quantity, setQuantity] = useState(100);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setImageFailed(false);

      if (!SHEET_URL) {
        setError(
          "Google Sheets CSV URL is not configured in your .env file."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(SHEET_URL);

        if (!response.ok) {
          throw new Error("Unable to load wedding card details.");
        }

        const csv = await response.text();

        if (csv.trimStart().startsWith("<")) {
          throw new Error(
            "Google Sheets returned a webpage instead of CSV. Check your publishing settings."
          );
        }

        const cards = readCards(csv);
        const foundProduct = cards.find((card) => card.id === id);

        if (!cancelled) {
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            setError("Wedding card not found.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the product."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function orderProduct() {
    if (!product || !product.available) return;

    if (!WHATSAPP_NUMBER) {
      alert("Please configure VITE_WHATSAPP_NUMBER in your .env file.");
      return;
    }

    const message = [
      "Hello Dot Print!",
      "I want to order a wedding card.",
      `Product: ${product.name}`,
      `Product ID: ${product.id}`,
      `Price per card: ₹${product.price}`,
      `Required quantity: ${quantity}`,
      `Estimated product total: ₹${product.price * quantity}`,
      "Please confirm the final price and delivery details.",
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#252522]">
      {/* Navigation */}
      <header className="border-b border-[#E4DED5] bg-[#F8F7F4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-16">
          <button
            type="button"
            onClick={() => navigate("/wedding-cards")}
            className="flex items-center gap-2 text-sm text-[#77736D] transition hover:text-[#A96B48]"
          >
            <ArrowLeft size={17} />
            Back to collection
          </button>

          <span className="text-sm font-semibold tracking-[0.2em]">
            DOT PRINT
          </span>
        </div>
      </header>

      {/* Loading state */}
      {loading && (
        <div className="mx-auto grid max-w-7xl animate-pulse gap-10 px-5 py-12 md:grid-cols-2 sm:px-8 lg:px-16 lg:py-20">
          <div className="aspect-[4/5] rounded-2xl bg-[#EAE5DD]" />
          <div className="space-y-5 py-5">
            <div className="h-4 w-40 rounded bg-[#EAE5DD]" />
            <div className="h-10 w-3/4 rounded bg-[#EAE5DD]" />
            <div className="h-4 w-full rounded bg-[#EAE5DD]" />
            <div className="h-4 w-2/3 rounded bg-[#EAE5DD]" />
            <div className="h-10 w-32 rounded bg-[#EAE5DD]" />
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <section className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-serif text-3xl">{error}</h1>

          <p className="mt-4 break-words text-sm leading-7 text-[#77736D]">
            Please check the product link or try loading the collection again.
          </p>

          <button
            type="button"
            onClick={() => navigate("/wedding-cards")}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#252522] px-6 py-3 text-sm text-white transition hover:bg-[#A96B48]"
          >
            <ArrowLeft size={16} />
            View all wedding cards
          </button>
        </section>
      )}

      {/* Product details */}
      {!loading && !error && product && (
        <>
          <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 md:grid-cols-2 md:gap-14 lg:px-16 lg:py-16">
            {/* Product image */}
            <div>
              <div className="relative overflow-hidden rounded-2xl bg-[#EAE5DD]">
                {product.imageUrl && !imageFailed ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    onError={() => setImageFailed(true)}
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 text-[#93887B]">
                    <ImageOff size={40} strokeWidth={1.2} />
                    <p className="text-sm">Product image unavailable</p>
                  </div>
                )}

                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-medium">
                  Wedding Collection
                </span>
              </div>

              <p className="mt-4 text-xs leading-6 text-[#89837A]">
                Product images are for design reference. Please confirm paper,
                printing, finishing and final specifications before ordering.
              </p>
            </div>

            {/* Product information */}
            <div className="flex flex-col py-2 md:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A96B48]">
                Dot Print / Wedding Invitations
              </p>

              <h1 className="mt-5 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              <p className="mt-5 text-sm leading-7 text-[#77736D] sm:text-base">
                {product.description ||
                  "A beautiful wedding invitation design for your special occasion. Contact us for more details."}
              </p>

              <div className="mt-7 border-y border-[#E4DED5] py-6">
                <p className="text-xs uppercase tracking-[0.18em] text-[#89837A]">
                  Price per card
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-xs text-[#89837A]">
                  Final pricing may vary depending on quantity, paper and
                  finishing options.
                </p>
              </div>

              {/* Quantity selector */}
              <div className="mt-7">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium"
                >
                  Required quantity
                </label>

                <div className="mt-3 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 50))
                    }
                    disabled={quantity <= 50}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DCD5CB] text-lg transition hover:bg-white disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);

                      if (Number.isFinite(value) && value >= 1) {
                        setQuantity(Math.floor(value));
                      }
                    }}
                    className="h-11 w-28 rounded-full border border-[#DCD5CB] bg-white text-center text-sm outline-none focus:border-[#A96B48]"
                  />

                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 50)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DCD5CB] text-lg transition hover:bg-white"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Estimated total */}
              <div className="mt-6 flex items-center justify-between rounded-xl bg-[#EEE9E1] p-4">
                <div>
                  <p className="text-sm text-[#77736D]">Estimated total</p>
                  <p className="mt-1 text-xs text-[#89837A]">
                    {quantity.toLocaleString("en-IN")} cards
                  </p>
                </div>

                <p className="text-xl font-semibold">
                  ₹{(product.price * quantity).toLocaleString("en-IN")}
                </p>
              </div>

              {/* Order button */}
              <button
                type="button"
                disabled={!product.available}
                onClick={orderProduct}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#252522] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#A96B48] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MessageCircle size={19} />
                {product.available ? "Order on WhatsApp" : "Currently unavailable"}
              </button>

              <p className="mt-3 text-center text-xs leading-6 text-[#89837A]">
                Confirm the final quote and delivery details with Dot Print
                before placing your order.
              </p>

              {/* Product benefits */}
              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#E4DED5] pt-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#A96B48]"
                  />
                  <div>
                    <p className="text-sm font-medium">Customisation</p>
                    <p className="mt-1 text-xs leading-5 text-[#89837A]">
                      Ask about available customisation options.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-[#A96B48]"
                  />
                  <div>
                    <p className="text-sm font-medium">Order confirmation</p>
                    <p className="mt-1 text-xs leading-5 text-[#89837A]">
                      Confirm specifications before printing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck
                    size={19}
                    className="mt-0.5 shrink-0 text-[#A96B48]"
                  />
                  <div>
                    <p className="text-sm font-medium">Delivery details</p>
                    <p className="mt-1 text-xs leading-5 text-[#89837A]">
                      Discuss delivery timelines when ordering.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RefreshCw
                    size={19}
                    className="mt-0.5 shrink-0 text-[#A96B48]"
                  />
                  <div>
                    <p className="text-sm font-medium">Product reference</p>
                    <p className="mt-1 text-xs leading-5 text-[#89837A]">
                      ID: {product.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom collection link */}
          <section className="border-t border-[#E4DED5]">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
              <div>
                <p className="font-serif text-xl">
                  Explore more wedding designs
                </p>
                <p className="mt-1 text-sm text-[#77736D]">
                  Find a design that matches your celebration.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/wedding-cards")}
                className="inline-flex items-center justify-center rounded-full border border-[#DCD5CB] px-6 py-3 text-sm transition hover:border-[#252522] hover:bg-white"
              >
                View collection
              </button>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E4DED5] px-5 py-6 text-center text-xs text-[#89837A]">
        © {new Date().getFullYear()} Dot Print. Beautifully printed.
      </footer>
    </main>
  );
}

