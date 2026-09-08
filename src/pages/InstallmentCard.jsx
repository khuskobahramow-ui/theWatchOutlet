import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import PriceTag from "../comps/PriceTag";
import { formatUZS } from "../utils/currency";

const InstallmentCard = ({ item, onClick }) => {
  if (!item) return null;

  const image = item.images && item.images.length > 0 ? item.images[0] : "";

  // Minimal oylik to'lovni taxminiy hisoblash (Maksimal muddatga bo'lganda)
  const calculateApproxMonthly = () => {
    if (!item.totalPrice || !item.maxPeriod) return 0;
    const remainingPrice = item.totalPrice - (item.minDownPayment || 0);
    const interest = item.annualInterest
      ? remainingPrice * (item.annualInterest / 100) * (item.maxPeriod / 12)
      : 0;
    return Math.round((remainingPrice + interest) / item.maxPeriod);
  };

  const approxMonthly = calculateApproxMonthly();

  return (
    <div
      onClick={onClick}
      className="bg-[#0f192b] rounded-2xl overflow-hidden border border-slate-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Rasm qismi */}
        <div className="relative h-45 bg-slate-100 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Rasm yo'q
            </div>
          )}
          <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            Nasiya Savdo
          </span>
        </div>

        {/* Ma'lumot qismi */}
        <div className="p-2.5 space-y-1.5">
          <div>
            <h3 className="font-extrabold text-[13px] text-white truncate leading-snug">
              {item.name || "Nomi ko'rsatilmagan"}
            </h3>
          </div>

          {/* Boshlang'ich to'lov */}
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-200 font-medium">
              Boshlang'ich to'lov:
            </span>
            <span className="font-bold text-slate-200">
              ${Number(item.minDownPayment || 0).toLocaleString()}
            </span>
          </div>

          {/* Oylik to'lov — kartaning asosiy e'tibor markazi */}
          <div className="bg-[#112544] rounded-xl px-2.5 py-2 flex items-center justify-between border border-blue-100">
            <span className="text-[10px] text-white font-bold uppercase tracking-wide">
              ({item.maxPeriod || "?"} oy)
            </span>
            <div className="text-right leading-tight">
              <div className="text-[18px] font-black text-emerald-400 leading-none">
                ${approxMonthly.toLocaleString()}
              </div>
              <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">
                ≈ {formatUZS(approxMonthly)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Umumiy narx */}
      <div className="px-2.5 pb-2.5 pt-1 border-t border-slate-50">
        <div className="text-[10px] text-slate-200 font-semibold uppercase mb-0.5">
          Umumiy narxi
        </div>
        <PriceTag usd={item.totalPrice} size="xs" />
      </div>
    </div>
  );
};

export default InstallmentCard;
