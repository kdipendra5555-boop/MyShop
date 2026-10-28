
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface ProductPageProps {
  title: string;
  subtitle: string;
  category: string;
  products: Product[];
  detailsBasePath: string;
  onOrder?: (product: Product) => void;
}

export default function ProductPage({
  title,
  subtitle,
  category,
  products,
  detailsBasePath,
  onOrder,
}: ProductPageProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const query = search.toLowerCase();

      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    });

    if (sort === "low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, search, sort]);

  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#252522]">
      {/* Page Header */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 md:pt-24">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-[#A96B48]" />

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A96B48]">
            Dot Print / {category}
          </p>
        </div>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl md:text-6xl">
              {title}
              <span className="text-[#A96B48]">.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#77736D] sm:text-base">
              {subtitle}
            </p>
          </div>

          <p className="text-sm text-[#77736D]">
            {filteredProducts.length} products
          </p>
        </div>
      </section>

      {/* Search and Sort */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 border-y border-[#E4DED5] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#89837A]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-[#DCD5CB] bg-white py-3 pl-11 pr-5 text-sm outline-none transition focus:border-[#A96B48]"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-[#77736D]">
            <SlidersHorizontal size={16} />

            <span>Sort by</span>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-full border border-[#DCD5CB] bg-white px-4 py-2.5 text-[#252522] outline-none"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </label>
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-14">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag
              size={32}
              className="mx-auto mb-4 text-[#A96B48]"
            />

            <h2 className="font-serif text-2xl">
              No products found.
            </h2>

            <p className="mt-3 text-sm text-[#77736D]">
              Try another search or add products to this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article key={product.id} className="group min-w-0">
                {/* Product Image */}
                <Link
                  to={`${detailsBasePath}/${encodeURIComponent(product.id)}`}
                  className="relative block overflow-hidden rounded-xl bg-[#EAE5DD]"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center text-sm text-[#89837A]">
                      Product Image
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[#77736D]">
                    {category}
                  </span>

                  <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#252522] shadow-sm transition group-hover:bg-[#252522] group-hover:text-white">
                    <ArrowUpRight size={19} />
                  </span>
                </Link>

                {/* Product Information */}
                <div className="flex items-start justify-between gap-2 pt-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium sm:text-base">
                      {product.name}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#89837A] sm:text-sm">
                      {product.description}
                    </p>

                    <p className="mt-3 text-sm font-semibold">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <Heart
                    size={17}
                    strokeWidth={1.4}
                    className="mt-1 shrink-0 text-[#A96B48]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOrder?.(product)}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-[#252522] px-2 py-3 text-xs font-medium text-white transition hover:bg-[#A96B48] sm:gap-2 sm:text-sm"
                  >
                    <ShoppingBag size={15} />
                    Order Now
                  </button>

                  <Link
                    to={`${detailsBasePath}/${encodeURIComponent(product.id)}`}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-[#DCD5CB] px-2 py-3 text-xs font-medium transition hover:border-[#252522] hover:bg-white sm:gap-2 sm:text-sm"
                  >
                    See Details
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Banner */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24">
        <div className="rounded-3xl bg-[#252522] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4B58B]">
            Made for your brand
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl sm:text-4xl">
            Something custom in mind?
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-300">
            Explore our printing collection and find the right design for
            your needs.
          </p>
        </div>
      </section>
    </main>
  );
}

