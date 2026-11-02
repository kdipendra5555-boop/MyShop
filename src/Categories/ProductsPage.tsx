import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
};

const products: Product[] = [
  {
    id: "P001",
    name: "School ID Cards",
    category: "Identity",
    description: "Premium quality student and staff identity cards.",
    price: 25,
    originalPrice: 35,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600",
    badge: "Popular",
  },
  {
    id: "P002",
    name: "School Diaries",
    category: "Stationery",
    description: "Customized school diaries with premium printing.",
    price: 120,
    originalPrice: 150,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600",
  },
  {
    id: "P003",
    name: "Student Notebooks",
    category: "Stationery",
    description: "Customized notebooks for schools and institutions.",
    price: 45,
    originalPrice: 55,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600",
  },
  {
    id: "P004",
    name: "School Prospectus",
    category: "Marketing",
    description: "Professional school prospectus and brochures.",
    price: 35,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
  },
  {
    id: "P005",
    name: "Report Cards",
    category: "Academic",
    description: "Customized student report cards.",
    price: 10,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600",
  },
  {
    id: "P006",
    name: "Merit Certificates",
    category: "Certificates",
    description: "Premium certificates for school achievements.",
    price: 15,
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600",
    badge: "Best Seller",
  },
];

// Randomize products
const shuffleProducts = (items: Product[]) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All";

  // Random products on every refresh
  const shuffledProducts = useMemo(
    () => shuffleProducts(products),
    []
  );

  const filteredProducts = shuffledProducts.filter((product) => {
    return (
      selectedCategory === "All" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);

    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    setSearchParams(params);
  };

  // Every product opens its respective category
  const getCategoryLink = (category: string) => {
    return `/school-products?category=${encodeURIComponent(category)}`;
  };

  return (
    <main className="min-h-screen bg-[#fdfaf7]">

      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-[#eee5df] bg-gradient-to-b from-[#fffdfb] to-[#fdfaf7]">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-[1px] w-7 bg-[#851c2b]" />

                <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#851c2b] sm:text-xs">
                  Dot Print Collection
                </p>
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-tight text-[#241b19] sm:text-5xl">
                School Products
                <span className="text-[#851c2b]">.</span>
              </h1>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-3 pb-16 sm:px-8">

        

        {filteredProducts.length === 0 ? (

          <div className="rounded-2xl border border-[#eadfd8] bg-white py-20 text-center">

            <Package
              size={45}
              className="mx-auto mb-4 text-[#c8b9b0]"
            />

            <h3 className="font-serif text-xl text-[#241b19]">
              No Products Found
            </h3>

            <p className="mt-2 text-xs text-[#968a84]">
              No products available in this category.
            </p>

            <button
              onClick={() => handleCategoryChange("All")}
              className="mt-5 rounded-full bg-[#851c2b] px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#681522]"
            >
              View All Products
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">

            {filteredProducts.map((product) => {

              const categoryLink = getCategoryLink(product.category);

              return (
                <div
                  key={product.id}
                  className="
                    group overflow-hidden rounded-xl
                    border border-[#eadfd8] bg-white
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-[#d9c2b9]
                    hover:shadow-xl hover:shadow-[#5d3328]/10
                    sm:rounded-2xl
                  "
                >

                  {/* IMAGE */}
                  <Link
                    to={categoryLink}
                    className="relative block aspect-square overflow-hidden bg-[#f5efe8]"
                  >

                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="
                        h-full w-full object-cover
                        transition-transform duration-700
                        group-hover:scale-105
                      "
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {product.badge && (
                      <span className="
                        absolute left-1.5 top-1.5
                        rounded-full bg-[#851c2b]
                        px-2 py-1 text-[7px] font-semibold
                        uppercase tracking-wide text-white
                        shadow-sm
                        sm:left-3 sm:top-3 sm:px-3 sm:text-[10px]
                      ">
                        {product.badge}
                      </span>
                    )}

                  </Link>

                  {/* INFORMATION */}
                  <div className="p-2.5 sm:p-4">

                    <p className="mb-1 text-[7px] font-semibold uppercase tracking-wider text-[#851c2b] sm:text-[10px]">
                      {product.category}
                    </p>

                    <Link to={categoryLink}>
                      <h3 className="
                        min-h-[30px] line-clamp-2
                        font-serif text-[11px] font-semibold
                        leading-tight text-[#241b19]
                        transition-colors duration-300
                        hover:text-[#851c2b]
                        sm:min-h-[42px] sm:text-base
                      ">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="
                      mt-1 line-clamp-2
                      text-[9px] leading-relaxed text-[#766d68]
                      sm:mt-2 sm:text-xs
                    ">
                      {product.description}
                    </p>

                    {/* PRICE */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">

                      <span className="text-[11px] font-semibold text-[#851c2b] sm:text-base">
                        ₹{product.price}
                      </span>

                      {product.originalPrice && (
                        <span className="text-[8px] text-gray-400 line-through sm:text-xs">
                          ₹{product.originalPrice}
                        </span>
                      )}

                    </div>

                    {/* BUTTON */}
                    <Link
                      to={categoryLink}
                      className="
                        mt-3 flex w-full items-center justify-center
                        gap-1 rounded-lg bg-[#851c2b]
                        py-2 text-[8px] font-medium text-white
                        transition-all duration-300
                        hover:bg-[#681522]
                        sm:mt-4 sm:gap-2 sm:py-3 sm:text-xs
                      "
                    >
                      View Details

                      <ArrowRight
                        size={12}
                        className="transition-transform duration-300 group-hover:translate-x-1 sm:h-[15px] sm:w-[15px]"
                      />
                    </Link>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </section>
    </main>
  );
};

export default ProductsPage;