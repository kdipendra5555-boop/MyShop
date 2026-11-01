import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

interface HeroSlide {
  image: string;
  heading: string;
  paragraph: string;
  button: string;
  link: string;
  status: string;
}

// Environment Variable
const SHEET_URL = import.meta.env.VITE_HERO_SHEET_URL;

// Fallback Data
const fallbackSlides: HeroSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1632769514641-1e252a8a8e4e?auto=format&fit=crop&w=1600&q=85",
    heading: "Make Every Moment Special",
    paragraph:
      "Beautifully crafted wedding invitations for your special celebrations.",
    button: "Explore Collection",
    link: "/wedding-cards",
    status: "TRUE",
  },
];

// CSV Parser
const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {
      if (char === "\r" && next === "\n") i++;

      row.push(cell.trim());

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());

  if (row.some((value) => value !== "")) {
    rows.push(row);
  }

  return rows;
};

const Hero = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Fetch Spreadsheet
  useEffect(() => {
    const fetchSlides = async () => {
      if (!SHEET_URL) {
        console.error("VITE_HERO_SHEET_URL is missing");
        return;
      }

      try {
        const separator = SHEET_URL.includes("?") ? "&" : "?";

        const response = await fetch(
          `${SHEET_URL}${separator}_=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error("Spreadsheet fetch failed");
        }

        const csv = await response.text();
        const rows = parseCSV(csv);

        if (rows.length < 2) return;

        const headers = rows[0].map((header) =>
          header.replace(/^\uFEFF/, "").trim().toLowerCase()
        );

        const getValue = (
          row: string[],
          key: string
        ): string => {
          const index = headers.indexOf(key);
          return index >= 0 ? row[index]?.trim() || "" : "";
        };

        const fetchedSlides: HeroSlide[] = rows
          .slice(1)
          .map((row) => ({
            image: getValue(row, "image"),
            heading: getValue(row, "heading"),
            paragraph: getValue(row, "paragraph"),
            button: getValue(row, "button"),
            link: getValue(row, "link"),
            status: getValue(row, "status"),
          }))
          .filter(
            (slide) =>
              slide.image &&
              slide.heading &&
              slide.status.toLowerCase() === "true"
          );

        if (fetchedSlides.length > 0) {
          setSlides(fetchedSlides);
          setActive(0);
        }
      } catch (error) {
        console.error("Hero Spreadsheet Error:", error);
      }
    };

    fetchSlides();
  }, []);

  // Auto Slider
  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, paused]);

  // Navigation
  const next = () => {
    setActive((prev) => (prev + 1) % slides.length);
  };

  const previous = () => {
    setActive(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  const slide = slides[active];

  if (!slide) return null;

  return (
    <section className="px-3 sm:px-5 pt-2 sm:pt-4">

      <div
        className="relative max-w-7xl mx-auto
        h-[260px] sm:h-[340px] lg:h-[440px]
        rounded-xl sm:rounded-2xl overflow-hidden
        bg-[#f4e9df]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >

        {/* Background Image */}
        <div
          key={slide.image}
          className="absolute inset-0 bg-cover bg-center animate-zoom"
          style={{
            backgroundImage: `url("${slide.image}")`,
          }}
        />

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r
          from-[#f6ede4] via-[#f6ede4]/90 to-transparent"
        />

        {/* Content */}
        <div
          key={active}
          className="relative z-10 h-full flex items-center
          px-7 sm:px-12 lg:px-16 animate-fade"
        >
          <div className="max-w-[430px]">

            <h1
              className="font-serif text-[29px]
              sm:text-4xl lg:text-5xl
              leading-[1.12] text-[#241b19]"
            >
              {slide.heading}
            </h1>

            <p
              className="mt-3 sm:mt-5 text-[11px]
              sm:text-sm leading-6 text-[#625752]
              max-w-[330px]"
            >
              {slide.paragraph}
            </p>

            <a
              href={slide.link || "/"}
              className="inline-flex items-center gap-2
              mt-4 sm:mt-6 bg-[#851c2b] text-white
              px-5 py-2.5 sm:py-3 rounded-full
              text-xs sm:text-sm hover:bg-[#650e19]
              transition-all"
            >
              {slide.button}
              <ArrowRight size={15} />
            </a>

          </div>
        </div>

        {/* Previous */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={previous}
            aria-label="Previous slide"
            className="absolute z-20 left-2 sm:left-4
            top-1/2 -translate-y-1/2
            w-8 h-8 sm:w-10 sm:h-10 rounded-full
            bg-white/90 text-[#851c2b]
            flex items-center justify-center
            hover:bg-[#851c2b] hover:text-white transition"
          >
            <ChevronLeft size={19} />
          </button>
        )}

        {/* Next */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute z-20 right-2 sm:right-4
            top-1/2 -translate-y-1/2
            w-8 h-8 sm:w-10 sm:h-10 rounded-full
            bg-white/90 text-[#851c2b]
            flex items-center justify-center
            hover:bg-[#851c2b] hover:text-white transition"
          >
            <ChevronRight size={19} />
          </button>
        )}

        {/* Indicators */}
        {slides.length > 1 && (
          <div
            className="absolute z-20 bottom-3 sm:bottom-5
            left-1/2 -translate-x-1/2
            flex items-center gap-2"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  active === index
                    ? "w-6 bg-[#851c2b]"
                    : "w-1.5 bg-[#bda9a0]"
                }`}
              />
            ))}
          </div>
        )}

      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoom {
          from {
            transform: scale(1.04);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-fade {
          animation: fade 0.5s ease-out;
        }

        .animate-zoom {
          animation: zoom 1s ease-out;
        }
      `}</style>

    </section>
  );
};

export default Hero;