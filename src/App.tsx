
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import WeddingCards from "./Categories/WeddingCards";
import WeddingCardDetails from "./Pages/WeddingCardDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Wedding Cards Collection */}
        <Route
          path="/wedding-cards"
          element={<WeddingCards />}
        />

        {/* Individual Wedding Card Details */}
        <Route
          path="/wedding-cards/:id"
          element={<WeddingCardDetails />}
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7F4] px-5 text-center text-[#252522]">
              <h1 className="font-serif text-5xl">404</h1>

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
