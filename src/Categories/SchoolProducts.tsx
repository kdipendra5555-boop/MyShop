import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  price: string;
}

const schoolProducts: Product[] = [
  {
    id: 1,
    name: "School ID Cards",
    category: "Identity",
    image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600",
    price: "₹20 onwards",
  },
  {
    id: 2,
    name: "School Diaries",
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600",
    price: "₹80 onwards",
  },
  {
    id: 3,
    name: "Student Notebooks",
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600",
    price: "₹40 onwards",
  },
  {
    id: 4,
    name: "School Prospectus",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    price: "₹30 onwards",
  },
  {
    id: 5,
    name: "Report Cards",
    category: "Academic",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600",
    price: "₹10 onwards",
  },
  {
    id: 6,
    name: "Merit Certificates",
    category: "Certificates",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600",
    price: "₹15 onwards",
  },
  {
    id: 7,
    name: "School Admission Forms",
    category: "Administration",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600",
    price: "₹5 onwards",
  },
  {
    id: 8,
    name: "School Registers",
    category: "Administration",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600",
    price: "₹120 onwards",
  },
  {
    id: 9,
    name: "Question Papers",
    category: "Academic",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600",
    price: "₹2 onwards",
  },
  {
    id: 10,
    name: "School Brochures",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
    price: "₹10 onwards",
  },
  {
    id: 11,
    name: "School Letterheads",
    category: "Office Printing",
    image: "https://images.unsplash.com/photo-1586282391129-76a6df230234?w=600",
    price: "₹3 onwards",
  },
  {
    id: 12,
    name: "School Event Certificates",
    category: "Certificates",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    price: "₹15 onwards",
  },
];

const shuffleProducts = (products: Product[]) => {
  const shuffled = [...products];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const SchoolProducts = () => {
  const [products] = useState(() => shuffleProducts(schoolProducts));

  return (
    <section className="bg-[#FAF8F5] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-8 flex items-end justify-between border-b border-[#E8DED6] pb-6 sm:mb-10">
          <div>
            <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8B3A3A]">
              Complete School Printing Solutions
            </span>

            <h2 className="text-3xl font-semibold tracking-tight text-[#302321] sm:text-5xl">
              School{" "}
              <span className="font-serif font-normal italic text-[#A36E65]">
                Essentials
              </span>
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#81736D]">
              Everything your school needs, thoughtfully designed and
              professionally printed.
            </p>
          </div>

          <span className="hidden text-xs tracking-widest text-[#A18D82] sm:block">
            DOT PRINT
          </span>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-xl bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#F1ECE7]">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-3 sm:p-4">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-[#A36E65] sm:text-[10px]">
                  {product.category}
                </span>

                <h3 className="mt-1 truncate text-sm font-medium text-[#302321] sm:text-base">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-[#8B3A3A]">
                  {product.price}
                </p>

                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#8B3A3A] py-2 text-xs font-medium text-[#8B3A3A] transition hover:bg-[#8B3A3A] hover:text-white sm:text-sm">
                  View Details
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SchoolProducts;