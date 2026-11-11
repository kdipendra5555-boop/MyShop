import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { addToCart } from "../utils/cart";
import {
  getUserInterests,
  trackInterest,
  type ProductType,
} from "../utils/recommendations";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  price: number | null;
  type: ProductType;
  available: boolean;
}

const SOURCES = [
  {
    type: "wedding" as const,
    url: import.meta.env.VITE_WEDDING_CARDS_CSV_URL,
  },
  {
    type: "visiting" as const,
    url: import.meta.env.VITE_VISITING_CARDS_CSV_URL,
  },
];

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"' && text[i + 1] === '"' && quoted) {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;

      row.push(cell.trim());

      if (row.some(Boolean)) rows.push(row);

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());

  if (row.some(Boolean)) rows.push(row);

  return rows;
}

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function parsePrice(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, "").trim();

  if (!cleaned) return null;

  const price = Number(cleaned);

  return Number.isFinite(price) && price >= 0 ? price : null;
}

function isAvailable(value: string) {
  return ![
    "false",
    "no",
    "0",
    "unavailable",
    "out of stock",
    "sold out",
  ].includes(value.trim().toLowerCase());
}

function readProducts(csv: string, type: ProductType): Product[] {
  const rows = parseCSV(csv);

  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);

  const get = (row: string[], ...names: string[]) => {
    for (const name of names) {
      const index = headers.indexOf(normalizeHeader(name));

      if (index >= 0) return row[index] || "";
    }

    return "";
  };

  return rows.slice(1).flatMap((row, index) => {
    const name = get(row, "name", "card name", "product name", "title");

    const image = get(
      row,
      "imageUrl",
      "imageUrl1",
      "image 1 url",
      "image 1"
    );

    if (!name || !image) return [];

    let category = get(row, "category", "card category", "type");

    if (type === "wedding" && !category) {
      const text = `${name} ${get(row, "description")}`.toLowerCase();

      if (/hindu|sanatan|vivah|mandap/.test(text)) {
        category = "Hindu Wedding Cards";
      } else if (/muslim|islamic|nikah/.test(text)) {
        category = "Muslim Wedding Cards";
      } else if (/sikh|punjabi/.test(text)) {
        category = "Sikh Wedding Cards";
      } else if (/christian|church/.test(text)) {
        category = "Christian Wedding Cards";
      } else {
        category = "Other Wedding Cards";
      }
    }

    return [{
      id: get(row, "id", "card id", "product id") || `${type}-${index + 1}`,
      name,
      category: category || (type === "wedding" ? "Other Wedding Cards" : "Other Visiting Cards"),
      description: get(row, "description", "details", "short description"),
      image,
      price: parsePrice(get(row, "price", "card price")),
      type,
      available: isAvailable(get(row, "available", "availability", "in stock")),
    }];
  });
}

function shuffle<T,>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getRecommendations(products: Product[]): Product[] {
  const interests = getUserInterests();

  return shuffle(products)
    .map((product) => {
      const categoryKey = `${product.type}:${product.category}`;
      const productKey = `${product.type}:${product.id}`;

      const categoryScore = interests.categories[categoryKey] || 0;
      const productScore = interests.products[productKey] || 0;

      return {
        product,
        score: categoryScore + productScore * 2,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product)
    .slice(0, 8);
}

const Recommended = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const results = await Promise.all(
          SOURCES.map(async (source) => {
            if (!source.url) return [];

            const response = await fetch(source.url);

            if (!response.ok) return [];

            const csv = await response.text();

            if (!csv.trim() || csv.trimStart().startsWith("<")) {
              return [];
            }

            return readProducts(csv, source.type);
          })
        );

        if (active) {
          setProducts(
            getRecommendations(results.flat().filter((p) => p.available))
          );
        }
      } catch (error) {
        console.error("Recommendation error:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  // Update recommendations when user interests change
  useEffect(() => {
    const updateRecommendations = () => {
      setProducts((previous) => {
        return getRecommendations(previous);
      });
    };

    window.addEventListener(
      "dotprint-interest-update",
      updateRecommendations
    );

    return () => {
      window.removeEventListener(
        "dotprint-interest-update",
        updateRecommendations
      );
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    if (product.price === null) {
      window.alert("Please contact us for product pricing.");
      return;
    }

    addToCart({
      id: `${product.type}-${product.id}`,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    trackInterest(product.type, product.category, product.id, "cart");

    setAddedItems((previous) =>
      previous.includes(`${product.type}-${product.id}`)
        ? previous
        : [...previous, `${product.type}-${product.id}`]
    );

    setTimeout(() => {
      setAddedItems((previous) =>
        previous.filter((id) => id !== `${product.type}-${product.id}`)
      );
    }, 1800);
  };

  const openProduct = (product: Product) => {
    trackInterest(product.type, product.category, product.id, "view");

    navigate(
      `/${product.type === "wedding" ? "wedding-cards" : "visiting-cards"}/${encodeURIComponent(product.id)}`
    );
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-[#FAF8F6] px-4 py-12 text-[#29201E] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-end justify-between border-b border-[#EEE7E2] pb-6">
          <div>
            <span className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#941B32]">
              <Sparkles size={13} />
              Selected for you
            </span>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Highly{" "}
              <span className="font-serif font-normal italic text-[#A36E65]">
                Recommended
              </span>
            </h2>

            <p className="mt-2 text-sm text-[#817875]">
              Products picked according to your interests.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-[4/5] animate-pulse rounded-xl bg-[#EAE5DD]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => {
              const key = `${product.type}-${product.id}`;

              return (
                <article
                  key={key}
                  className="group overflow-hidden rounded-[18px] border border-[#EEE7E2] bg-white p-2 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => openProduct(product)}
                    className="block w-full overflow-hidden rounded-xl bg-[#F5F3F0]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </button>

                  <div className="p-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#A36E65]">
                      {product.type === "wedding" ? "Wedding Cards" : "Visiting Cards"}
                    </span>

                    <h3 className="mt-1 truncate text-sm font-semibold">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-[#941B32]">
                      {product.price === null
                        ? "Price on request"
                        : `₹${product.price.toLocaleString("en-IN")}`}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#941B32] py-2 text-xs font-medium text-[#941B32] transition hover:bg-[#941B32] hover:text-white"
                    >
                      {addedItems.includes(key) ? "Added to Cart" : "Add to Cart"}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Recommended;