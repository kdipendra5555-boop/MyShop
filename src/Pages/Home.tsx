import { useMemo } from "react";

import VisitingCards from "../Categories/VisitingCards";
import WeddingCards from "../Categories/WeddingCards";
import Categories from "../Components/Categories";
import Hero from "../Components/Hero";
import Recommended from "../Components/Recommended";
import CashMemo from "../Categories/CashMemo";
import MyDesigns from "./MyDesigns";
import ProductsPage from "../Categories/ProductsPage";
import Footer from "../Components/Footer";


function Home() {
  const sections = useMemo(() => {
    const items = [
      <WeddingCards key="wedding" />,
      <VisitingCards key="visiting" />,
      <Recommended key="recommended" />,
      <CashMemo key="cashmemo" />,
      <ProductsPage key="school" />,
    ];

    return [...items].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div>
      <Hero />
      <Categories />
      <MyDesigns/>
      {sections}
      <Footer/>
    </div>
  );
}

export default Home;