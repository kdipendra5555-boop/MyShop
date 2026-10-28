
import { ArrowRight, MessageCircle, Printer } from "lucide-react";

const categories = [
  {
    number: "01",
    title: "Wedding Cards",
    description: "Make every invitation memorable.",
  },
  {
    number: "02",
    title: "Visiting Cards",
    description: "A professional first impression.",
  },
  {
    number: "03",
    title: "Posters",
    description: "Print your ideas with impact.",
  },
  {
    number: "04",
    title: "Cash Memo",
    description: "Custom bills for your business.",
  },
];

export default function Hero() {
  const whatsappNumber = ""; // Add your WhatsApp number with country code

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Hello Dot Print, I want to enquire about printing services."
    );

    if (!whatsappNumber) {
      alert("Please add your WhatsApp number in Hero.tsx.");
      return;
    }

    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="overflow-hidden bg-[#F8F7F4] text-[#20201E]">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:px-10 sm:pt-24 lg:px-16 lg:pb-28 lg:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="relative z-10">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-9 bg-[#B76E45]" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8D5B40]">
                Thoughtfully printed
              </p>
            </div>

            <h1 className="max-w-xl text-5xl font-medium leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Every print.
              <br />
              <span className="font-serif italic text-[#A96B48]">
                A lasting
              </span>
              <br />
              impression.
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-[#77736D] sm:text-lg">
              From beautiful wedding invitations to professional business
              stationery, bring your ideas to life with Dot Print.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() =>
                  document
                    .getElementById("print-categories")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="group inline-flex items-center gap-3 rounded-full bg-[#252522] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#A96B48]"
              >
                Explore our collection
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 rounded-full border border-[#DCD8D1] px-5 py-4 text-sm font-medium transition hover:border-[#A96B48] hover:text-[#A96B48]"
              >
                <MessageCircle size={17} />
                Enquire now
              </button>
            </div>

            <div className="mt-12 flex items-center gap-4 border-t border-[#E6E1D9] pt-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EDE5DC]">
                <Printer size={20} className="text-[#A96B48]" />
              </div>
              <div>
                <p className="text-sm font-semibold">Your ideas, beautifully printed.</p>
                <p className="mt-1 text-xs text-[#88837B]">
                  Personalised printing for every occasion.
                </p>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -right-5 -top-5 h-36 w-36 rounded-full bg-[#E9D8C8]/60 blur-3xl" />
            <div className="absolute -bottom-5 -left-5 h-40 w-40 rounded-full bg-[#E6C9B6]/50 blur-3xl" />

            <div className="relative rounded-[2rem] border border-[#E7E0D7] bg-[#F0ECE5] p-5 shadow-[0_24px_70px_-35px_rgba(70,50,35,0.25)] sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#93887B]">
                    The art of print
                  </p>
                  <p className="mt-1 text-sm font-medium">Made with intention.</p>
                </div>
                <span className="text-xs text-[#93887B]">DP. / 01</span>
              </div>

              {/* Editorial print composition */}
              <div className="relative flex aspect-[4/4.6] items-center justify-center overflow-hidden rounded-xl bg-[#D8C3AC] p-5 sm:p-8">
                <div className="absolute inset-3 border border-[#F7F0E6]/60" />

                <div className="absolute -right-12 -top-10 h-52 w-52 rounded-full border border-[#F6EADD]/60" />
                <div className="absolute -right-5 -top-3 h-40 w-40 rounded-full border border-[#F6EADD]/60" />
                <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full border border-[#F6EADD]/50" />

                <div className="relative z-10 flex h-[80%] w-[76%] flex-col items-center justify-center border border-[#F9F0E4] bg-[#F7F1E8] px-4 text-center shadow-xl sm:px-8">
                  <span className="text-[9px] uppercase tracking-[0.35em] text-[#9D7657]">
                    A special occasion
                  </span>

                  <div className="my-5 h-px w-12 bg-[#B78B68]" />

                  <p className="font-serif text-3xl italic leading-tight text-[#76523E] sm:text-4xl">
                    Made
                    <br />
                    with love
                  </p>

                  <p className="mt-4 text-[8px] uppercase tracking-[0.3em] text-[#9D7657]">
                    Designed to be remembered
                  </p>

                  <div className="mt-5 h-px w-12 bg-[#B78B68]" />
                  <p className="mt-3 text-[9px] font-semibold tracking-[0.25em] text-[#76523E]">
                    DOT PRINT
                  </p>
                </div>

                <span className="absolute bottom-6 right-6 text-[9px] tracking-[0.25em] text-[#F7F1E8]">
                  PREMIUM COLLECTION
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Designed for you.</p>
                  <p className="mt-1 text-xs text-[#898076]">
                    Details that make a difference.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCD1C4]">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="print-categories"
        className="border-t border-[#E8E3DC] bg-white px-6 py-16 sm:px-10 lg:px-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A96B48]">
                What we print
              </p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
                Print for every purpose.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#77736D]">
              Thoughtful designs, personalised details and printing for your
              everyday business and special occasions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <a
                key={category.number}
                href="#print-categories"
                className="group border-t border-[#E8E3DC] px-4 py-6 transition hover:bg-[#F8F7F4] sm:px-5 lg:border-r lg:last:border-r-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A96B48]">
                    {category.number}
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-[#A39A90] transition-transform group-hover:translate-x-1 group-hover:text-[#A96B48]"
                  />
                </div>
                <h3 className="mt-7 text-lg font-medium">{category.title}</h3>
                <p className="mt-2 text-sm text-[#88837B]">
                  {category.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
