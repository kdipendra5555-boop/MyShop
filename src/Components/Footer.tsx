
import {
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  Printer,
} from "lucide-react";

import { Link } from "react-router-dom";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Our Products", href: "/products" },
  { name: "Contact Us", href: "/contact" },
];

const services = [
  "Wedding Cards",
  "Visiting Cards",
  "Posters & Banners",
  "Cash Memo",
  "Custom Printing",
];

const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-5">

              <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center">
                <Printer size={23} className="text-white" />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  dot<span className="text-orange-500">print.</span>
                </h2>

                <p className="text-[10px] tracking-[2px] text-gray-400 uppercase">
                  By Shailendra Press
                </p>
              </div>

            </Link>

            <p className="text-gray-400 text-sm leading-7 max-w-xs">
              Bringing your ideas to life with quality printing,
              creative designs and reliable printing solutions.
            </p>

            {/* Social Media */}
            <div className="flex gap-3 mt-6">

              {/* Instagram */}
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.6V3.9c-.8-.1-1.6-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3V10H7.2v3h2.8v8h3.5z" />
                </svg>
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">
              Quick Links
            </h3>

            <ul className="space-y-4 text-sm text-gray-400">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="hover:text-orange-500 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">
              Our Services
            </h3>

            <ul className="space-y-4 text-sm text-gray-400">
              {services.map((item) => (
                <li key={item}>
                  <Link
                    to="/products"
                    className="hover:text-orange-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6">
              Get in Touch
            </h3>

            <div className="space-y-5 text-sm text-gray-400">

              <div className="flex gap-3">
                <MapPin
                  size={19}
                  className="text-orange-500 shrink-0"
                />
                <p>Kanpur, Uttar Pradesh, India</p>
              </div>

              <div className="flex gap-3">
                <Phone
                  size={18}
                  className="text-orange-500 shrink-0"
                />
                <p>Contact us for enquiries</p>
              </div>

              <div className="flex gap-3">
                <Mail
                  size={19}
                  className="text-orange-500 shrink-0"
                />
                <p>Get in touch with us</p>
              </div>

            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
            >
              Get a Quote
              <ArrowUpRight size={16} />
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Dot Print. All rights reserved.
          </p>

          <p className="text-xs text-gray-500">
            Made with{" "}
            <span className="text-orange-500">♥</span>
            {" "}by{" "}
            <Link
              to="/invoicemydot"
              className="text-white font-medium hover:text-orange-500 transition-colors"
            >
              Dot Print
            </Link>
          </p>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
