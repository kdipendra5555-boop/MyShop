import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  LoaderCircle,
  CheckCircle2,
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
  badge: string;
  size: string;
  paper: string;
  printing: string;
  additionalInfo: string;
  quantityPrices: {
    quantity: string;
    price: string;
  }[];
};

const normalize = (value: string) =>
  String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

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

const SchoolProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        if (!SHEET_URL) {
          throw new Error(
            "Google Sheet URL missing. Check your .env file."
          );
        }

        const response = await fetch(SHEET_URL);

        if (!response.ok) {
          throw new Error(
            `Google Sheet request failed: ${response.status}`
          );
        }

        const csvText = await response.text();

        if (
          !csvText.trim() ||
          csvText.trim().startsWith("<!DOCTYPE") ||
          csvText.trim().startsWith("<html")
        ) {
          throw new Error(
            "Google Sheet did not return CSV data. Check publishing settings."
          );
        }

        const rows = parseCSV(csvText);

        if (rows.length < 2) {
          throw new Error("No products found in Google Sheet.");
        }

        const headers = rows[0].map((header) =>
          header.replace(/^\uFEFF/, "").trim()
        );

        const data: Product[] = rows.slice(1).map((row) => {
          const item: Record<string, string> = {};

          headers.forEach((header, index) => {
            item[header] = row[index] || "";
          });

          return {
            id: getValue(item, "Product ID", "ID"),
            name: getValue(item, "Name", "Product Name"),
            category: getValue(item, "Category"),
            description: getValue(item, "Description"),
            price: getValue(item, "Price"),
            originalPrice: getValue(item, "Original Price"),

            images: [
              getValue(item, "Image 1", "Product Image 1", "Image"),
              getValue(item, "Image 2", "Product Image 2"),
              getValue(item, "Image 3", "Product Image 3"),
              getValue(item, "Image 4", "Product Image 4"),
            ].filter(Boolean),

            badge: getValue(item, "Badge"),
            size: getValue(item, "Size"),
            paper: getValue(item, "Paper"),
            printing: getValue(item, "Printing"),

            additionalInfo: getValue(
              item,
              "Additional Info",
              "Additional Information"
            ),

            quantityPrices: [1, 2, 3, 4, 5].map((number) => ({
              quantity: getValue(item, `Quantity ${number}`),
              price: getValue(item, `Price ${number}`),
            })),
          };
        });

        const routeId = normalize(productId || "");

        console.log("School Product URL:", productId);
        console.log("Normalized URL:", routeId);
        console.log("Sheet Headers:", headers);
        console.log("Products Loaded:", data);

        const found = data.find((item) => {
          const sheetId = normalize(item.id);
          const sheetName = normalize(item.name);

          return (
            (sheetId !== "" && sheetId === routeId) ||
            (sheetName !== "" && sheetName === routeId)
          );
        });

        console.log("Matched Product:", found);

        if (!found) {
          throw new Error(
            `Product "${productId}" was not found in Google Sheet.`
          );
        }

        if (!cancelled) {
          setProduct(found);
          setSelectedImage(0);
        }
      } catch (err) {
        console.error("School Product Error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the product."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#fdfaf7]">
        <LoaderCircle
          className="animate-spin text-[#851c2b]"
          size={32}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fdfaf7] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f5efe8] flex items-center justify-center mb-5">
          {error ? (
            <AlertCircle size={32} className="text-[#851c2b]" />
          ) : (
            <Package size={32} className="text-[#c8b9b0]" />
          )}
        </div>

        <h2 className="font-serif text-2xl text-[#241b19]">
          {error ? "Unable to Load Product" : "Product Not Found"}
        </h2>

        {error && (
          <p className="text-sm text-[#766d68] mt-3 max-w-md">
            {error}
          </p>
        )}

        <Link
          to="/school-products"
          className="mt-6 bg-[#851c2b] text-white px-6 py-3 rounded-full text-sm hover:bg-[#6f1724] transition"
        >
          Back to School Products
        </Link>
      </div>
    );
  }

  const specifications = [
    { label: "Size", value: product.size },
    { label: "Paper", value: product.paper },
    { label: "Printing", value: product.printing },
    { label: "Category", value: product.category },
    {
      label: "Additional Information",
      value: product.additionalInfo,
    },
  ].filter((item) => item.value);

  const bulkPrices = product.quantityPrices.filter(
    (item) => item.quantity && item.price
  );

  return (
    <main className="min-h-screen bg-[#fdfaf7]">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <Link
          to="/school-products"
          className="inline-flex items-center gap-2 text-sm text-[#766d68] hover:text-[#851c2b] transition"
        >
          <ArrowLeft size={17} />
          Back to School Products
        </Link>
      </div>

      {/* Product Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5efe8]">
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package
                    size={55}
                    className="text-[#c8b9b0]"
                  />
                </div>
              )}

              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#851c2b] text-white text-xs px-4 py-2 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-[#851c2b]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="py-2">
            <p className="text-xs tracking-[2px] uppercase text-[#851c2b] font-semibold">
              {product.category}
            </p>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#241b19] mt-3">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-sm sm:text-base text-[#766d68] leading-7 mt-4">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-6">
              {product.price && (
                <span className="text-2xl font-semibold text-[#851c2b]">
                  ₹{product.price}
                </span>
              )}

              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* Specifications */}
            {specifications.length > 0 && (
              <div className="mt-8 border-t border-[#eadfd8] pt-5">
                <h3 className="font-serif text-xl text-[#241b19] mb-4">
                  Product Information
                </h3>

                <div className="space-y-3">
                  {specifications.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between gap-4 text-sm border-b border-[#f0e8e2] pb-3"
                    >
                      <span className="text-[#766d68]">
                        {item.label}
                      </span>

                      <span className="text-[#241b19] font-medium text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Pricing */}
            {bulkPrices.length > 0 && (
              <div className="mt-8">
                <h3 className="font-serif text-xl text-[#241b19] mb-4">
                  Bulk Pricing
                </h3>

                <div className="border border-[#eadfd8] rounded-xl overflow-hidden bg-white">
                  {bulkPrices.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between px-4 py-3 text-sm border-b last:border-0 border-[#f0e8e2]"
                    >
                      <span className="text-[#766d68]">
                        {item.quantity} Pieces
                      </span>

                      <span className="font-semibold text-[#851c2b]">
                        ₹{item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-7 text-xs text-green-700">
              <CheckCircle2 size={17} />
              Quality Printing by Dot Print
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SchoolProductDetailsPage;