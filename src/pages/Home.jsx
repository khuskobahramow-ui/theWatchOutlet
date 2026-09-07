import React, { useState } from "react";
import Navbar from "../comps/Navbar";
import MenuBar from "./MenuBar";
import SearchBar from "./SearchBar";
import CarCard from "./CarCard";
import SearchModal from "./SearchModal";
import FilterModal from "./FilterModal";
import { LuRefreshCw } from "react-icons/lu";
import { useCars } from "./UseCars";
import BottomNav from "./BottomNav";

function parseListingDate(car) {
  if (!car) return null;

  // 1. Agar matndan olingan car.date bo'lsa
  if (car.date) {
    const lowerStr = car.date.toString().trim().toLowerCase();

    if (lowerStr === "bugun") return new Date();
    if (lowerStr === "kecha") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    }

    const parts = lowerStr.split(".");
    if (parts.length === 3) {
      const [day, month, year] = parts.map((p) => parseInt(p, 10));
      if (day && month && year) {
        return new Date(year, month - 1, day);
      }
    }
  }

  // 2. Agar car.date bo'lmasa, Firestore createdAt dan foydalanish
  if (car.createdAt) {
    return car.createdAt.toDate
      ? car.createdAt.toDate()
      : new Date(car.createdAt);
  }

  return null;
}

function isTodayOrYesterday(car) {
  const listingDate = parseListingDate(car);
  if (!listingDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  listingDate.setHours(0, 0, 0, 0);

  return (
    listingDate.getTime() === today.getTime() ||
    listingDate.getTime() === yesterday.getTime()
  );
}

const Home = () => {
  const { cars, loading, refreshing, refresh } = useCars();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Faqat auksion bo'lmagan oddiy mashinalarni ajratish
  const marketCars = cars.filter(
    (car) => !car.isAuction && car.type !== "auction"
  );

  // 2. Bugun va kecha joylangan mashinalarni filtrlash
  const dailyCars = marketCars.filter((car) => isTodayOrYesterday(car));

  // 3. Agar bugun va kechagi mashinalar bo'lsa shularni, yo'q bo'lsa barcha mashinalarni ko'rsatish
  const displayCars = dailyCars.length > 0 ? dailyCars : marketCars;

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
          <h2 className="text-lg font-bold text-slate-900">
            {dailyCars.length > 0 ? "Kun takliflari" : "Barcha takliflar"}
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
                className="h-64 bg-slate-200 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : displayCars.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayCars.map((car) => (
              <CarCard key={car.id} car={car} />
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
        cars={marketCars}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        cars={marketCars}
      />

      {/* Pastki Navigatsiya Menyusi */}
      <BottomNav />
    </div>
  );
};

export default Home;
