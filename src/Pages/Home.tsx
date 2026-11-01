import { useMemo } from "react";

import VisitingCards from "../Categories/VisitingCards";
import WeddingCards from "../Categories/WeddingCards";
import Categories from "../Components/Categories";
import Hero from "../Components/Hero";
import SchoolStationery from "../Categories/SchoolStationery";
import SchoolProducts from "../Categories/SchoolProducts";
import Recommended from "../Components/Recommended";
import CashMemo from "../Categories/CashMemo";

function Home() {
  const sections = useMemo(() => {
    const items = [
      <WeddingCards key="wedding" />,
      <VisitingCards key="visiting" />,
      <SchoolStationery key="stationery" />,
      <SchoolProducts key="products" />,
      <Recommended key="recommended" />,
      <CashMemo key="cashmemo" />,
    ];

    return [...items].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div>
      <Hero />
      <Categories />
      

      {sections}
    </div>
  );
}

export default Home;