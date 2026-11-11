
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
  Settings2,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  type CartItem,
} from "../utils/cart";

const navigation = [
  { name: "Home", path: "/" },
  { name: "Wedding Cards", path: "/wedding-cards" },
  { name: "Posters", path: "/posters" },
  { name: "Visiting Cards", path: "/visiting-cards" },
  { name: "Cash Memo", path: "/cash-memo" },
  { name: "Contact Us", path: "/contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const syncCart = () => {
      setCart(getCart());
    };

    syncCart();

    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  // Close body scroll when drawer opens
  useEffect(() => {
    document.body.style.overflow =
      cartOpen || menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, menuOpen]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const searchResults = navigation.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearch("");
  };

  const changeQuantity = (id: string, quantity: number) => {
    updateCartQuantity(id, quantity);
    setCart(getCart());
  };

  const deleteItem = (id: string) => {
    removeFromCart(id);
    setCart(getCart());
  };

  return (
    <header className="w-full bg-white relative z-40">

      {/* Announcement Bar */}
      <div className="bg-[#650e19] text-white px-3 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-7 text-[9px] sm:text-xs tracking-wide">

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles size={12} />
            Premium Quality Prints
          </div>

          <span className="opacity-40">|</span>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Truck size={12} />
            Fast & Secure Delivery
          </div>

          <span className="opacity-40 hidden sm:block">|</span>

          <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
            <Settings2 size={12} />
            Fully Customisable
          </div>

        </div>
      </div>

      {/* Main Navbar */}
      <nav className="relative px-4 sm:px-8 py-3 border-b border-[#eee5df] bg-white">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#292929] hover:text-[#851c2b] transition"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>

          {/* Logo */}
{/* Logo */}
<Link
  to="/"
  onClick={() => setMenuOpen(false)}
  className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
>
  <div className="flex items-center gap-1">

    {/* Dot Print Icon */}
    <img
      src="/logo.png"
      alt="Dot Print Icon"
      className="w-7 h-7 sm:w-10 sm:h-10 object-contain"
    />

    {/* Brand Name */}
    <span className="text-[22px] sm:text-[27px] font-extrabold tracking-tight text-[#8F1D32]">
      dotprint
    </span>

  </div>

  {/* Tagline */}
  <span className="text-[7px] sm:text-[8px] tracking-[px] font-semibold text-[#555] pl-8  mt- ">
    By Shailendra Press
  </span>
</Link>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#292929] hover:text-[#851c2b] transition"
              aria-label="Search"
            >
              {searchOpen ? <X size={23} /> : <Search size={23} />}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-[#292929] hover:text-[#851c2b] transition"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#851c2b] text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </nav>

      {/* Navigation Menu */}
      <div
        className={`absolute top-full left-0 w-full bg-white shadow-lg overflow-hidden transition-all duration-300 ${
          menuOpen
            ? "max-h-[450px] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5">

          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between py-3 text-sm text-[#333] border-b border-gray-100 hover:text-[#851c2b] transition"
            >
              {item.name}
              <ArrowRight size={15} />
            </Link>
          ))}

        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg p-5 z-30">

          <div className="max-w-2xl mx-auto">

            <div className="flex items-center gap-3 border border-[#eadfd8] rounded-xl px-4 py-3">
              <Search size={19} className="text-[#851c2b]" />

              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);

                  if (e.key === "Enter" && searchResults[0]) {
                    handleSearch(searchResults[0].path);
                  }
                }}
                placeholder="Search products and categories..."
                className="w-full outline-none text-sm bg-transparent"
              />

              <button
                onClick={() => setSearch("")}
                className="text-gray-400"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-4 space-y-1">

              {searchResults.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleSearch(item.path)}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm hover:bg-[#fdf5f2] hover:text-[#851c2b] transition"
                >
                  {item.name}
                </button>
              ))}

              {search && searchResults.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-5">
                  No matching categories found.
                </p>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Cart Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40"
          onClick={() => setCartOpen(false)}
        >

          {/* Cart Drawer */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-cart"
          >

            {/* Cart Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-[#eee5df]">

              <div>
                <h2 className="font-serif text-xl text-[#29201f]">
                  Your Cart
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {cartCount} items in your cart
                </p>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="w-9 h-9 rounded-full bg-[#f8f4f1] flex items-center justify-center hover:bg-[#f0e5df]"
                aria-label="Close cart"
              >
                <X size={19} />
              </button>

            </div>

            {/* Cart Products */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {cart.length === 0 ? (

                <div className="h-full flex flex-col items-center justify-center text-center">

                  <ShoppingBag
                    size={45}
                    strokeWidth={1}
                    className="text-[#851c2b] mb-4"
                  />

                  <h3 className="font-serif text-xl text-[#29201f]">
                    Your cart is empty
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    Looks like you haven't added anything yet.
                  </p>

                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate("/wedding-cards");
                    }}
                    className="mt-6 px-6 py-3 rounded-full bg-[#851c2b] text-white text-sm hover:bg-[#650e19] transition"
                  >
                    Explore Products
                  </button>

                </div>

              ) : (

                <div className="space-y-5">

                  {cart.map((item) => (

                    <div
                      key={item.id}
                      className="flex gap-3 border-b border-[#eee5df] pb-5"
                    >

                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-xl bg-[#f8f3ef] overflow-hidden shrink-0">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#851c2b]">
                            <ShoppingBag size={25} />
                          </div>
                        )}

                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">

                        <h3 className="font-medium text-sm text-[#29201f] truncate">
                          {item.name}
                        </h3>

                        <p className="text-sm text-[#851c2b] font-semibold mt-1">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>

                        <div className="flex items-center justify-between mt-3">

                          {/* Quantity */}
                          <div className="flex items-center border border-[#eadfd8] rounded-lg">

                            <button
                              onClick={() =>
                                changeQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1.5 hover:text-[#851c2b]"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="text-xs px-2">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                changeQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1.5 hover:text-[#851c2b]"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>

                          </div>

                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-[#eee5df] px-5 py-5 bg-[#fdfaf7]">

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#29201f]">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 mb-4">
                  Shipping and additional charges calculated at checkout.
                </p>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/cart");
                  }}
                  className="w-full py-3.5 rounded-full bg-[#851c2b] text-white text-sm font-medium hover:bg-[#650e19] transition flex items-center justify-center gap-2"
                >
                  Proceed to Cart
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full mt-3 text-xs text-gray-500 hover:text-[#851c2b]"
                >
                  Continue Shopping
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      <style>{`
        @keyframes cartSlide {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-cart {
          animation: cartSlide 0.3s ease-out;
        }
      `}</style>

    </header>
  );
};

export default Navbar;

