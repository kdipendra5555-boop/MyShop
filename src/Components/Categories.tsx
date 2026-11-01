
import { Link } from "react-router-dom";
import {
  Heart,
  Image,
  Contact,
  ReceiptText,
} from "lucide-react";

const categories = [
  {
    title: "Wedding",
    subtitle: "Cards",
    icon: Heart,
    path: "/wedding-cards",
  },
  {
    title: "Posters",
    subtitle: "",
    icon: Image,
    path: "/posters",
  },
  {
    title: "Visiting",
    subtitle: "Cards",
    icon: Contact,
    path: "/visiting-cards",
  },
  {
    title: "Cash",
    subtitle: "Memo",
    icon: ReceiptText,
    path: "/cash-memo",
  },
];

const Categories = () => {
  return (
    <section className="px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-2 sm:gap-4">

        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.path}
              className="
                group min-w-0
                flex flex-col sm:flex-row
                items-center justify-center
                gap-2 sm:gap-3
                min-h-[105px] sm:min-h-[125px]
                px-1 sm:px-3 py-3
                rounded-2xl
                border border-[#eadfd8]
                bg-[#fdfaf7]
                hover:bg-[#f8eeeb]
                hover:border-[#d9b8b3]
                hover:-translate-y-1
                transition-all duration-300
              "
            >
              <Icon
                size={23}
                strokeWidth={1.7}
                className="
                  shrink-0
                  text-[#851c2b]
                  sm:w-9 sm:h-9
                  group-hover:scale-110
                  transition-transform
                "
              />

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="font-serif text-[10px] sm:text-lg text-[#241b19] leading-tight">
                  {item.title}
                </span>

                {item.subtitle && (
                  <span className="font-serif text-[10px] sm:text-lg text-[#241b19] leading-tight">
                    {item.subtitle}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

      </div>
    </section>
  );
};

export default Categories;
