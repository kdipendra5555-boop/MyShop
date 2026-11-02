import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";

import Home from "./Pages/Home";
import WeddingCards from "./Categories/WeddingCards";

import WeddingCardDetails from "./Pages/WeddingCardDetails";
import VisitingCardDetails from "./Pages/VisitingCardDetails";
import CashMemoDetails from "./Pages/CashMemoDetails";
import SchoolProductDetailsPage from "./Pages/SchoolProductDetailsPage";
import SchoolProductsPage from "./Pages/SchoolProductsPage";

function App() {
  return (
    <BrowserRouter>
      {/* Global Navbar */}
      <Navbar />

      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Wedding Cards */}
        <Route
          path="/wedding-cards"
          element={<WeddingCards />}
        />

        {/* Wedding Card Details */}
        <Route
          path="/wedding-cards/:id"
          element={<WeddingCardDetails />}
        />

        {/* Visiting Card Details */}
        <Route
          path="/visiting-cards/:id"
          element={<VisitingCardDetails />}
        />

        {/* Cash Memo Details */}
        <Route
          path="/cash-memo/:id"
          element={<CashMemoDetails />}
        />

        <Route
  path="/school-products"
  element={<SchoolProductsPage />}
/>

<Route
  path="/school-products/:productId"
  element={<SchoolProductDetailsPage />}
/>



        {/* 404 Page */}
        <Route
          path="*"
          element={
            <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7F4] px-5 text-center text-[#252522]">
              <h1 className="font-serif text-5xl">
                404
              </h1>

              <p className="mt-4 text-sm text-[#77736D]">
                Sorry, this page could not be found.
              </p>

              <a
                href="/"
                className="mt-6 rounded-full bg-[#252522] px-6 py-3 text-sm text-white transition hover:bg-[#A96B48]"
              >
                Back to Home
              </a>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;