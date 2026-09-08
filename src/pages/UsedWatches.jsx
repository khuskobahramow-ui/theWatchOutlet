import React, { useState, useMemo } from "react";
import Navbar from "../comps/Navbar";
import SearchBar from "./SearchBar";
import CarCard from "./CarCard";
import SearchModal from "./SearchModal";
import FilterModal from "./FilterModal";
import useCars from "./UseCars";
import BottomNav from "./BottomNav";

const UsedWatches = () => {
  const { cars, loading } = useCars();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");

  // Faqat б/у (ishlatilgan) soatlarni ajratib olish
  const usedProducts = useMemo(() => {
    const raw = Array.isArray(cars) ? cars : [];
    return raw.filter(
      (item) =>
        item?.type === "used" ||
        item?.isUsed === true ||
        String(item?.condition).toLowerCase() === "used" ||
        String(item?.status).toLowerCase().includes("used")
    );
  }, [cars]);

  // Faqat б/у soatlarda mavjud brendlar ro'yxatini shakllantirish
  const availableBrands = useMemo(() => {
    const brandsSet = new Set();
    usedProducts.forEach((item) => {
      if (item?.brand && String(item.brand).trim() !== "") {
        brandsSet.add(String(item.brand).trim());
      }
    });
    return ["All", ...Array.from(brandsSet)];
  }, [usedProducts]);

  // Tanlangan brend bo'yicha filtrlash
  const displayProducts = useMemo(() => {
    if (selectedBrand === "All") return usedProducts;
    return usedProducts.filter(
      (item) =>
        item?.brand &&
        String(item.brand).toLowerCase() === selectedBrand.toLowerCase()
    );
  }, [usedProducts, selectedBrand]);

  return (
    <div className="min-h-screen bg-[#0b1329]">
      <Navbar />

      <div className="mt-2">
        <SearchBar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenFilter={() => setIsFilterOpen(true)}
        />
      </div>

      {/* Yopishqoq (Sticky) va Scroll bo'ladigan brendlar filtri */}
      <div className="sticky border-[1px] border-[#657591] top-0 z-10 mt-[5px] mx-[5px] rounded-[15px] bg-[#0b1329]/95 backdrop-blur-md px-3 py-2">
        <div className="flex items-center gap-2 pl-[3px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {availableBrands.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedBrand === brand
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                  : "bg-[#0f192b] text-white border border-slate-400/60 hover:bg-[#182640]"
              }`}
            >
              {brand === "All" ? "All" : brand}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 mt-3 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-64 bg-[#0f192b] animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayProducts.map((product) => (
              <CarCard key={product.id || Math.random()} car={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            B/u soatlar topilmadi.
          </div>
        )}
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cars={usedProducts}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        cars={usedProducts}
      />

      <BottomNav />
    </div>
  );
};

export default UsedWatches;
