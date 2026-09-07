import React from "react";
import { NavLink } from "react-router-dom";
// LuHome -> LuHouse ga, LuStore -> LuShoppingBag ga almashtirildi
import { LuHouse, LuShoppingBag, LuPlus, LuHeart } from "react-icons/lu";
import { FaTelegramPlane } from "react-icons/fa";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto px-2 h-16 flex justify-between items-center relative">
        {/* 1. Asosiy */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              isActive
                ? "text-blue-600 font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <LuHouse className="text-xl mb-0.5" />
          <span className="text-[10px]">Asosiy</span>
        </NavLink>

        {/* 2. Bozor */}
        <NavLink
          to="/bozor"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              isActive
                ? "text-blue-600 font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <LuShoppingBag className="text-xl mb-0.5" />
          <span className="text-[10px]">Bozor</span>
        </NavLink>

        {/* 3. Sotish (O'rtadagi katta tugma) */}
        <div className="flex-1 flex justify-center items-center relative -top-4">
          <NavLink
            to="/sell"
            className="w-13 h-13 bg-linear-to-tr from-blue-600 to-blue-500 rounded-full flex flex-col items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border-4 border-slate-50"
          >
            <LuPlus className="text-2xl" />
          </NavLink>
        </div>

        {/* 4. Likelar */}
        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
              isActive
                ? "text-blue-600 font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`
          }
        >
          <LuHeart className="text-xl mb-0.5" />
          <span className="text-[10px]">Likelar</span>
        </NavLink>

        {/* 5. Telegram */}
        <a
          href="https://t.me/avtotekuz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-sky-500 transition-all duration-200"
        >
          <FaTelegramPlane className="text-xl mb-0.5 text-sky-500" />
          <span className="text-[10px]">Telegram</span>
        </a>
      </div>
    </div>
  );
};

export default BottomNav;
