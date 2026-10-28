
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Package,
  Truck,
  ShieldCheck,
  Printer,
  Info,
  Image as ImageIcon,
  LoaderCircle,
} from "lucide-react";

interface WeddingCard {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrls: string[];
  printing: string;
  shipping: string;
  codAvailable: string;
  additionalInformation: string;
  available: string;
}

// Keep the same CSV variable used by the WeddingCards listing page.
const SHEET_CSV_URL = (
  import.meta.env.VITE_WEDDING_CARDS_CSV_URL ||
  import.meta.env.VITE_GOOGLE_SHEET_CSV_URL ||
  ""
).trim();
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, "");

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;

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

  row.push(cell.trim());

  if (row.some((value) => value !== "")) {
    rows.push(row);
  }

  return rows;
}

function getValue(
  row: string[],
  indexes: Record<string, number>,
  ...possibleNames: string[]
): string {
  for (const name of possibleNames) {
    const index = indexes[normalize(name)];

    if (index !== undefined && row[index] !== undefined) {
      return row[index].trim();
    }
  }

  return "";
}

function mapCSVToCards(text: string): WeddingCard[] {
  const rows = parseCSV(text);

  if (rows.length < 2) return [];

  const headers = rows[0].map(normalize);

  const indexes: Record<string, number> = {};

  headers.forEach((header, index) => {
    indexes[header] = index;
  });

  return rows.slice(1).map((row, index) => {
    // Support both separate imageUrl1...imageUrl4 columns and an imageUrls
    // column containing multiple URLs separated by |, semicolon, or a new line.
    const primaryImage = getValue(row, indexes, "imageUrl", "imageUrl1", "image 1 url");
    const combinedImages = getValue(row, indexes, "imageUrls", "image urls")
      .split(/[|;\n\r]+/)
      .map((url) => url.trim())
      .filter(Boolean);

    const imageUrls = [
      primaryImage,
      ...combinedImages,
      getValue(row, indexes, "imageUrl2", "image 2 url"),
      getValue(row, indexes, "imageUrl3", "image 3 url"),
      getValue(row, indexes, "imageUrl4", "image 4 url"),
    ].filter((url, index, all) => Boolean(url) && all.indexOf(url) === index);

    return {
      id: getValue(row, indexes, "id", "card id", "product id") || `WC${index + 1}`,
      name: getValue(row, indexes, "name", "card name", "product name", "title"),
      description: getValue(row, indexes, "description"),
      price: getValue(row, indexes, "price"),
      imageUrls,
      printing: getValue(row, indexes, "printing"),
      shipping: getValue(row, indexes, "shipping"),
      codAvailable: getValue(
        row,
        indexes,
        "codAvailable",
        "cod available",
        "COD Available",
      ),
      additionalInformation: getValue(
        row,
        indexes,
        "additionalInformation",
        "additional information",
      ),
      available: getValue(row, indexes, "available"),
    };
  });
}

const detailSections = [
  {
    key: "description",
    title: "Description",
    icon: Info,
  },
  {
    key: "printing",
    title: "Printing",
    icon: Printer,
  },
  {
    key: "shipping",
    title: "Shipping",
    icon: Truck,
  },
  {
    key: "codAvailable",
    title: "COD Available",
    icon: ShieldCheck,
  },
  {
    key: "additionalInformation",
    title: "Additional Information",
    icon: Package,
  },
] as const;

export default function WeddingCardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [card, setCard] = useState<WeddingCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [activeSection, setActiveSection] =
    useState<(typeof detailSections)[number]["key"]>("description");

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCard() {
      if (!SHEET_CSV_URL) {
        setError(
          "Google Sheets CSV URL configured nahi hai. .env file check karo.",
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(SHEET_CSV_URL);

        if (!response.ok) {
          throw new Error("Google Sheets se data load nahi ho paya.");
        }

        const csvText = await response.text();
        if (!csvText.trim() || csvText.trimStart().startsWith("<")) {
          throw new Error("Google Sheets CSV publish URL se CSV data nahi aa raha. .env URL aur Publish to web settings check karo.");
        }
        const cards = mapCSVToCards(csvText);

        const decodedId = (() => {
          try {
            return decodeURIComponent(id ?? "");
          } catch {
            return id ?? "";
          }
        })();
        const foundCard = cards.find((item) => item.id === decodedId);

        if (!cancelled) {
          if (foundCard) {
            setCard(foundCard);
            setActiveImage(0);
          } else {
            setError(
              `Wedding card nahi mila (URL ID: ${id ?? "missing"}). Sheet ke id column mein matching ID check karo.`,
            );
          }

          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Product load nahi ho paya. Internet aur Sheet URL check karo.");
          setLoading(false);
        }
      }
    }

    loadCard();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = card?.imageUrls ?? [];

  const goToImage = (direction: number) => {
    if (images.length <= 1) return;

    setActiveImage((current) => {
      return (current + direction + images.length) % images.length;
    });
  };

  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!customerName.trim()) {
      setFormError("Apna naam enter karo.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setFormError("Valid 10-digit Indian mobile number enter karo.");
      return;
    }

    if (!WHATSAPP_NUMBER) {
      setFormError(
        "Order enquiry service configure nahi hai. Shop se directly contact karo.",
      );
      return;
    }

    if (!card) return;

    const enquiry = [
      "Hello Dot Print!",
      "",
      "Wedding Card Enquiry",
      `Product: ${card.name}`,
      `Product ID: ${card.id}`,
      `Price: ${card.price ? `₹${card.price}` : "Please confirm"}`,
      "",
      `Customer Name: ${customerName.trim()}`,
      `Mobile: ${mobile.trim()}`,
      `Message: ${message.trim() || "Please share more details."}`,
    ].join("\n");

    let number = WHATSAPP_NUMBER;
    if (number.startsWith("0")) number = number.slice(1);
    if (number.length === 10) number = `91${number}`;
    const whatsappURL = `https://wa.me/${number}?text=${encodeURIComponent(enquiry)}`;

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading wedding card...
        </div>
      </main>
    );
  }

  if (error || !card) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f6] px-6 text-center">
        <ImageIcon className="mb-4 h-10 w-10 text-neutral-400" />

        <h1 className="text-2xl font-semibold text-neutral-900">
          Product unavailable
        </h1>

        <p className="mt-2 max-w-md text-sm text-neutral-500">
          {error || "Wedding card nahi mila."}
        </p>

        <button
          onClick={() => navigate("/wedding-cards")}
          className="mt-6 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          Back to Wedding Cards
        </button>
      </main>
    );
  }

  const currentSection = detailSections.find(
    (section) => section.key === activeSection,
  );

  const sectionContent: Record<string, string> = {
    description: card.description,
    printing: card.printing,
    shipping: card.shipping,
    codAvailable: card.codAvailable,
    additionalInformation: card.additionalInformation,
  };

  // Treat TRUE/YES/AVAILABLE/1 as available; FALSE/NO/etc. as unavailable.
  const availabilityValue = normalize(card.available);
  const available = availabilityValue === ""
    ? true
    : !["false", "no", "0", "unavailable", "outofstock", "soldout"].includes(availabilityValue);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-neutral-900">
      {/* Navigation */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={() => navigate("/wedding-cards")}
            className="flex items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to collection
          </button>

          <span className="text-lg font-semibold tracking-[0.15em]">
            DOT PRINT
          </span>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
        <p className="text-xs tracking-wide text-neutral-500">
          Home <span className="mx-2">/</span> Wedding Cards
          <span className="mx-2">/</span>
          <span className="text-neutral-900">{card.name}</span>
        </p>
      </div>

      {/* Product details */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        {/* Image gallery */}
        <div>
          <div className="group relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {images.length > 0 ? (
              <img
                key={images[activeImage]}
                src={images[activeImage]}
                alt={`${card.name} - Image ${activeImage + 1}`}
                className="h-full w-full object-contain p-3"
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <ImageIcon className="h-12 w-12" />
                <span className="text-sm">Product image unavailable</span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => goToImage(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 shadow-sm transition hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={() => goToImage(1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 shadow-sm transition hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs text-neutral-700">
                  {activeImage + 1} / {images.length}
                </span>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`aspect-square overflow-hidden rounded-xl border bg-white p-1 transition ${
                    activeImage === index
                      ? "border-neutral-900 ring-1 ring-neutral-900"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${card.name} thumbnail ${index + 1}`}
                    className="h-full w-full rounded-lg object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="lg:pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Wedding Invitation Collection
          </p>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {card.name}
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Product ID: {card.id}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {card.price.trim() && Number.isFinite(Number(card.price.replace(/[₹,\s]/g, ""))) ? (
              <p className="text-2xl font-semibold">
                ₹{Number(card.price.replace(/[₹,\s]/g, "")).toLocaleString("en-IN")}
              </p>
            ) : (
              <p className="text-xl font-semibold">Price on request</p>
            )}

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                available
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {available ? "Available for enquiry" : "Currently unavailable"}
            </span>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-600">
            {card.description ||
              "Is wedding invitation ke design, printing aur order details ke liye enquiry bhejein."}
          </p>

          {/* Detail section tabs */}
          <div className="mt-8 border-y border-neutral-200">
            <div className="flex flex-wrap gap-2 py-4">
              {detailSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.key;

                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition sm:text-sm ${
                      isActive
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.title}
                  </button>
                );
              })}
            </div>

            <div className="min-h-32 py-5">
              <h2 className="text-base font-semibold">
                {currentSection?.title}
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
                {sectionContent[activeSection] ||
                  (activeSection === "codAvailable"
                    ? "COD availability confirm karne ke liye enquiry karein."
                    : "Details coming soon. More information ke liye enquiry karein.")}
              </p>
            </div>
          </div>

          {/* Enquiry form */}
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <MessageCircle className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">Interested in this card?</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Apni details bharein. Hamari team aapse order ke baare mein
                  contact karegi.
                </p>
              </div>
            </div>

            <form onSubmit={submitEnquiry} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="mb-2 block text-sm font-medium"
                >
                  Your name
                </label>

                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
                />
              </div>

              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium"
                >
                  Mobile number
                </label>

                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit mobile number"
                  autoComplete="tel-national"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium"
                >
                  Message <span className="font-normal text-neutral-400">(optional)</span>
                </label>

                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Quantity, customisation or any questions..."
                  rows={3}
                  className="w-full resize-y rounded-xl border border-neutral-200 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-700"
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm text-red-600">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={!available}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                <MessageCircle className="h-4 w-4" />
                Send Order Enquiry
              </button>

              <p className="text-center text-xs leading-5 text-neutral-400">
                Enquiry bhejne se order automatically confirm nahi hota.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-semibold tracking-[0.15em] text-neutral-800">
            DOT PRINT
          </span>
          <span>Wedding invitations, thoughtfully printed.</span>
        </div>
      </footer>
    </main>
  );
}

