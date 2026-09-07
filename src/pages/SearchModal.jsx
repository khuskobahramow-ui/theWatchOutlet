import React, { useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import CarCard from "./CarCard";

const SearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  cars,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCars = cars.filter((car) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();

    const name = (car.name || "").toLowerCase();
    const id = (car.id || "").toLowerCase();
    const listingId = (car.listingId || "").toLowerCase();
    const vin = (car.vin || "").toLowerCase();

    return (
      name.includes(query) ||
      id.includes(query) ||
      listingId.includes(query) ||
      vin.includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center gap-2 p-3 border-b border-slate-100 bg-white shadow-sm">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nomi, ID (masalan: AT-0001) yoki VIN..."
            className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {searchQuery.trim() && (
          <p className="text-xs text-slate-400 mb-3">
            Topilgan natijalar:{" "}
            <span className="font-semibold text-slate-700">
              {filteredCars.length} ta
            </span>
          </p>
        )}

        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pb-10">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-sm">
            "{searchQuery}" bo'yicha hech narsa topilmadi.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
