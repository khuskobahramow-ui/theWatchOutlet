import React, { useState } from "react";
import Navbar from "../comps/Navbar";
import MenuBar from "./MenuBar";
import SearchBar from "./SearchBar";
import CarCard from "./CarCard";
import SearchModal from "./SearchModal";
import FilterModal from "./FilterModal";
import { LuRefreshCw } from "react-icons/lu";
import useCars from "./UseCars";
import BottomNav from "./BottomNav";

const Home = () => {
  const { cars, loading, refreshing, refresh } = useCars();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const displayProducts = cars
    ? cars.filter((item) => !item.isAuction && item.type !== "auction")
    : [];

  return (
    <div>
      <Navbar />
      <MenuBar />

      <SearchBar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFilter={() => setIsFilterOpen(true)}
      />

      <div className="px-3 mt-2 pb-20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">
            Barcha e'lonlar - Yangi Soatlar
          </h2>
          <button
            type="button"
            onClick={refresh}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
          >
            <LuRefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>

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
              <CarCard key={product.id} car={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            E'lonlar topilmadi.
          </div>
        )}
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cars={displayProducts}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        cars={displayProducts}
      />

      <BottomNav />
    </div>
  );
};

export default Home;
