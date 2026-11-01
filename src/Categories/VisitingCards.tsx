
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowRight,
  Check,
  CreditCard,
} from "lucide-react";

import { addToCart } from "../utils/cart";

const products = [
  {
    id: "VC-001",
    name: "Premium Matte Visiting Card",
    description: "Elegant matte finish with premium paper quality.",
    price: 199,
    oldPrice: 299,
    image:
      "https://images.unsplash.com/photo-1596079890744-c1a0462d0975?auto=format&fit=crop&w=700&q=85",
    tag: "BEST SELLER",
  },
  {
    id: "VC-002",
    name: "Luxury Business Card",
    description: "Professional design for your business identity.",
    price: 299,
    oldPrice: 399,
    image:
      "https://images.unsplash.com/photo-1634942536790-253b7e5a5c8b?auto=format&fit=crop&w=700&q=85",
    tag: "PREMIUM",
  },
  {
    id: "VC-003",
    name: "Minimal Visiting Card",
    description: "Clean and minimal design with elegant typography.",
    price: 149,
    oldPrice: 249,
    image:
      "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=700&q=85",
    tag: "",
  },
  {
    id: "VC-004",
    name: "Creative Business Card",
    description: "Creative and modern cards for your brand.",
    price: 249,
    oldPrice: 349,
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=700&q=85",
    tag: "NEW",
  },
];

const VisitingCards = () => {
  const navigate = useNavigate();

  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAddToCart = (product: (typeof products)[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    setAddedId(product.id);

    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  const handleOrderNow = (product: (typeof products)[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    navigate("/cart");
  };

  return (
    <section className="px-4 sm:px-6 py-10 bg-[#fdfaf7]">

      <div className="max-w-7xl mx-auto">

        {/* Section Heading */}
        <div className="flex items-end justify-between mb-8">

          <div>
            <p className="text-[10px] tracking-[3px] text-[#851c2b] font-semibold mb-2">
              OUR COLLECTION
            </p>

            <h2 className="font-serif text-2xl sm:text-4xl text-[#29201f]">
              Visiting Cards
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Make your first impression unforgettable.
            </p>
          </div>

          <button
            onClick={() => navigate("/visiting-cards")}
            className="hidden sm:flex items-center gap-2 text-sm text-[#851c2b] hover:gap-3 transition-all"
          >
            View All <ArrowRight size={16} />
          </button>

        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

          {products.map((product) => (

            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-[#eee5df] overflow-hidden hover:shadow-lg transition-all duration-300"
            >

              {/* Product Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f0eb]">

                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Product Tag */}
                {product.tag && (
                  <span className="absolute top-2 left-2 bg-[#851c2b] text-white text-[8px] sm:text-[9px] tracking-wider px-2.5 py-1.5 rounded-full">
                    {product.tag}
                  </span>
                )}

              </div>

              {/* Product Details */}
              <div className="p-3 sm:p-4">

                <h3 className="font-serif text-sm sm:text-base text-[#29201f] line-clamp-1">
                  {product.name}
                </h3>

                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-2 min-h-[30px]">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mt-3">

                  <span className="text-base sm:text-lg font-semibold text-[#851c2b]">
                    ₹{product.price}
                  </span>

                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                    ₹{product.oldPrice}
                  </span>

                </div>

                {/* Buttons */}
                <div className="mt-4 space-y-2">

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full border text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                      addedId === product.id
                        ? "bg-green-50 border-green-600 text-green-700"
                        : "border-[#851c2b] text-[#851c2b] hover:bg-[#f9eeec]"
                    }`}
                  >
                    {addedId === product.id ? (
                      <>
                        <Check size={14} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOrderNow(product)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#851c2b] text-white text-[10px] sm:text-xs font-medium hover:bg-[#650e19] transition-all duration-300"
                  >
                    <CreditCard size={14} />
                    Order Now
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* Mobile View All */}
        <div className="sm:hidden flex justify-center mt-7">
          <button
            onClick={() => navigate("/visiting-cards")}
            className="flex items-center gap-2 text-sm text-[#851c2b]"
          >
            View All Products <ArrowRight size={16} />
          </button>
        </div>

      </div>

    </section>
  );
};

export default VisitingCards;