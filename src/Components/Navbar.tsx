import { useState } from "react";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
  Settings2,
} from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = 2;

  return (
    <header className="w-full bg-white">

      {/* Top Announcement Bar */}
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
      <nav className="relative px-4 sm:px-8 py-3 border-b border-[#eee5df]">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Left Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#292929] hover:text-[#8b1828] transition"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>

          {/* Center Logo */}
          <a href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">

            <div className="flex items-center gap-1.5">

              <div className="w-6 h-7 bg-[#851c2b] rounded-md flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg">
                  D
                </span>
              </div>

              <span className="text-[23px] sm:text-[27px] font-bold tracking-tight text-[#761522]">
                Dot Print
              </span>

            </div>

            <span className="text-[6px] sm:text-[8px] tracking-[4px] font-semibold text-[#777]">
              PRINTING MADE SIMPLE
            </span>

          </a>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">

            <button
              className="text-[#292929] hover:text-[#851c2b] transition"
              aria-label="Search"
            >
              <Search size={23} />
            </button>

            <button
              className="relative text-[#292929] hover:text-[#851c2b] transition"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#851c2b] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`absolute z-50 left-0 w-full bg-white shadow-lg transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-5 space-y-4">

          {[
            "Home",
            "Wedding Cards",
            "Posters",
            "Visiting Cards",
            "Cash Memo",
            "Contact Us",
          ].map((item) => (
            <a
              key={item}
              href="#"
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-[#333] hover:text-[#851c2b] transition border-b border-gray-100 pb-3"
            >
              {item}
            </a>
          ))}

        </div>
      </div>

    </header>
  );
};

export default Navbar;