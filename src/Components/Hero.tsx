
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    label: "PREMIUM WEDDING CARDS",
    title: "Turn Your Special Moments",
    highlight: "Into Beautiful Memories",
    description:
      "Thoughtfully designed wedding cards that reflect your story with elegance and quality.",
    button: "Explore Wedding Cards",
    image:
      "https://images.unsplash.com/photo-1632769514641-1e252a8a8e4e?auto=format&fit=crop&w=1600&q=85",
  },
  {
    label: "ELEGANT INVITATIONS",
    title: "Make Every Invitation",
    highlight: "A Special Experience",
    description:
      "Beautiful invitations for your most memorable celebrations.",
    button: "Discover Designs",
    image:
      "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=1600&q=85",
  },
  {
    label: "PREMIUM PRINTING",
    title: "Your Ideas Deserve",
    highlight: "Beautiful Printing",
    description:
      "Premium materials and beautiful finishes for every occasion.",
    button: "Explore Products",
    image:
      "https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?auto=format&fit=crop&w=1600&q=85",
  },
  {
    label: "CUSTOM DESIGNS",
    title: "Designed Around",
    highlight: "Your Special Story",
    description:
      "Create personalised invitations that are uniquely yours.",
    button: "Customise Now",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85",
  },
];

const Hero = () => {
  const [active, setActive] = useState(0);

  const next = () => {
    setActive((prev) => (prev + 1) % slides.length);
  };

  const previous = () => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[active];

  return (
    <section className="px-3 sm:px-6 pt-3">

      <div className="relative max-w-7xl mx-auto h-[380px] sm:h-[480px] lg:h-[540px] rounded-xl overflow-hidden bg-[#f4e9df]">

        {/* Background Image */}
        <div
          key={active}
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${slide.image})`,
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f6ede4] via-[#f6ede4]/90 to-transparent" />

        {/* Content */}
        <div
          key={`content-${active}`}
          className="relative z-10 h-full flex items-center px-6 sm:px-12 lg:px-16 animate-fade"
        >
          <div className="max-w-[490px]">

            <div className="flex items-center gap-3 mb-5">
              <span className="w-5 h-[2px] bg-[#9a2937]" />
              <p className="text-[9px] sm:text-xs tracking-[3px] text-[#555] font-semibold">
                {slide.label}
              </p>
            </div>

            <h1 className="font-serif text-[34px] sm:text-5xl lg:text-6xl leading-[1.08] text-[#241b19]">
              {slide.title}
              <span className="block text-[#851c2b] mt-1">
                {slide.highlight}
              </span>
            </h1>

            <p className="mt-5 text-xs sm:text-sm text-[#555] leading-6 max-w-[340px]">
              {slide.description}
            </p>

            <a
              href="/wedding-cards"
              className="inline-flex items-center gap-3 mt-6 bg-[#851c2b] text-white px-5 py-3 rounded-full text-xs sm:text-sm hover:bg-[#650e19] transition"
            >
              {slide.button}
              <ArrowRight size={16} />
            </a>

          </div>
        </div>

        {/* Previous Button */}
        <button
          onClick={previous}
          aria-label="Previous slide"
          className="absolute z-20 left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 text-[#851c2b] flex items-center justify-center shadow-sm hover:bg-[#851c2b] hover:text-white transition"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Next Button */}
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute z-20 right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 text-[#851c2b] flex items-center justify-center shadow-sm hover:bg-[#851c2b] hover:text-white transition"
        >
          <ChevronRight size={22} />
        </button>

        {/* Indicators */}
        <div className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActive(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === index
                  ? "w-5 bg-[#851c2b]"
                  : "w-2 bg-[#bda9a0]"
              }`}
            />
          ))}
        </div>

      </div>

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

        .animate-fade {
          animation: fade 0.6s ease-out;
        }
      `}</style>

    </section>
  );
};

export default Hero;
