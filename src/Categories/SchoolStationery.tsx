import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
}

const dummyProducts: Product[] = [
  {
    id: 1,
    name: "Premium School Notebook",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600",
    price: "₹40 onwards",
    description: "Quality notebooks for everyday learning.",
  },
  {
    id: 2,
    name: "Custom School Diary",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600",
    price: "₹80 onwards",
    description: "Personalized school diaries.",
  },
  {
    id: 3,
    name: "Drawing Book",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
    price: "₹60 onwards",
    description: "Creative drawing books for students.",
  },
  {
    id: 4,
    name: "Exercise Notebook",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600",
    price: "₹35 onwards",
    description: "Everyday writing notebooks.",
  },
  {
    id: 5,
    name: "School Assignment File",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600",
    price: "₹25 onwards",
    description: "Premium assignment files.",
  },
  {
    id: 6,
    name: "Printed School Register",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600",
    price: "₹120 onwards",
    description: "Custom printed registers.",
  },
  {
    id: 7,
    name: "Student ID Card",
    image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600",
    price: "₹20 onwards",
    description: "Customized student identity cards.",
  },
  {
    id: 8,
    name: "School Prospectus",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    price: "₹30 onwards",
    description: "Professional school printed material.",
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

const SchoolStationery = () => {
  const [products] = useState(() => shuffleProducts(dummyProducts));

  return (
    <section className="bg-[#FAF8F5] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-8 flex items-end justify-between border-b border-[#E8DED6] pb-6">
          <div>
            <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8B3A3A]">
              Everyday Essentials
            </span>

            <h2 className="text-3xl font-semibold tracking-tight text-[#302321] sm:text-5xl">
              School{" "}
              <span className="font-serif font-normal italic text-[#A36E65]">
                Stationery
              </span>
            </h2>
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
                <h3 className="truncate text-sm font-medium text-[#302321] sm:text-base">
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

export default SchoolStationery;