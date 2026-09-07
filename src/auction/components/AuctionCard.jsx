import React from "react";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import CountdownTimer from "./CountdownTimer";
import PriceTag from "../../comps/PriceTag";

const AuctionCard = ({ item, onClick }) => {
  if (!item) return null;

  const imageUrl =
    item.images && item.images.length > 0
      ? item.images[0]
      : item.image || "https://via.placeholder.com/300";

  const displayPrice =
    item.currentPrice || item.startingPrice || item.price || 0;

  // =========================================================
  // AUKSION TUGASH SANI VA SOATINI FORMATLASH
  // =========================================================
  const formatEndDate = (rawDate) => {
    if (!rawDate) return "Noma'lum";

    let dateObj = null;

    // 1. Firestore Timestamp bo'lsa
    if (typeof rawDate?.toDate === "function") {
      dateObj = rawDate.toDate();
    }
    // 2. { seconds: ... } shaklidagi Timestamp bo'lsa
    else if (rawDate?.seconds) {
      dateObj = new Date(rawDate.seconds * 1000);
    }
    // 3. ISO String yoki millisekund raqam bo'lsa
    else {
      dateObj = new Date(rawDate);
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      return String(rawDate);
    }

    // Kun.Oylar va Soat:Daqiqa formatida (Masalan: 12.09.2026 18:30)
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  // endTime, auctionEnd yoki endDate dagi tugash vaqtini olamiz
  const endDateTime = formatEndDate(
    item.endTime || item.auctionEnd || item.endDate
  );

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between cursor-pointer active:scale-98"
    >
      <div className="relative w-full h-44 bg-slate-100">
        <img
          src={imageUrl}
          alt={item.title || item.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 left-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
          🔥 Auksion
        </span>
      </div>

      <div className="p-2 flex-1 flex flex-col justify-between ">
        <div>
          <h3 className="font-bold text-slate-800 text-sm truncate">
            {item.title || item.name || "Nomsiz e'lon"}
          </h3>
          <div className="text-blue-600 font-extrabold text-base">
            <PriceTag usd={displayPrice} size="sm" />
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {item.year || "-"}-yil •{" "}
            {item.mileage ? `${item.mileage.toLocaleString()} km` : "0 km"}
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-slate-300" />{" "}
            {item.location || "Toshkent"}
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-500">
            <FaCalendarAlt className="text-indigo-500" /> {endDateTime}
          </span>
        </div>

        <div className="bg-indigo-50/70 rounded-xl p-1.5 flex items-center justify-between text-xs mt-1 border border-indigo-100">
          <span className="text-indigo-900 font-semibold text-[11px]">
            Qoldi:
          </span>
          <CountdownTimer endTime={item.endTime} />
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
