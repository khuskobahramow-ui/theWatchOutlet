import React, { useEffect, useState } from "react";
import { LuHeart, LuCalendar } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import CarDetailModal from "./CarDetailModal.jsx";
import { isCarLiked, toggleCarLike } from "./Likes";
import PriceTag from "../comps/PriceTag";

const CarCard = ({ car: watch }) => {
  // =========================================================
  // BO'SH YOKI YAROQSIZ OB'YEKTLARNI BLOKLASH
  // =========================================================
  const hasName = watch?.name && String(watch.name).trim() !== "";
  const hasPrice =
    Number(watch?.price || watch?.totalPrice || watch?.startingPrice || 0) > 0;

  // Agarda nomi ham, narxi ham bo'lmasa kartochka umuman chizilmaydi
  if (!watch || (!hasName && !hasPrice)) {
    return null;
  }

  // =========================================================
  // LIKE (YOQTIRILGANLAR)
  // =========================================================

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(isCarLiked(watch?.id));
  }, [watch?.id]);

  const handleToggleLike = (e) => {
    e.stopPropagation();
    const newState = toggleCarLike(watch?.id);
    setIsLiked(newState);
  };

  // =========================================================
  // DETAIL MODAL
  // =========================================================

  const [showDetail, setShowDetail] = useState(false);

  // =========================================================
  // RASM
  // =========================================================

  const imageUrl =
    (Array.isArray(watch?.images) && watch.images.length > 0
      ? watch.images[0]
      : null) ||
    watch?.image ||
    "";

  // =========================================================
  // CARD UI
  // =========================================================

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="bg-[#0f192b] rounded-2xl overflow-hidden border-[2px] border-[#657591] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
      >
        {/* =====================================================
            1. RASM QISMI
        ====================================================== */}

        <div className="relative w-full h-45 bg-slate-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={watch?.name || watch?.brand || "Soat"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(event) => {
                console.error("❌ CARD RASMI YUKLANMADI:", imageUrl);
                event.currentTarget.style.display = "none";
                const parent = event.currentTarget.parentElement;
                if (parent) {
                  parent.setAttribute("data-image-error", "true");
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Rasm mavjud emas
            </div>
          )}

          {/* BREND NOMI (Aksiya/Brend belgilari) */}
          {watch?.brand && (
            <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10 uppercase">
              {watch.brand}
            </span>
          )}

          {/* YURAKCHA (LIKE) */}
          <button
            type="button"
            onClick={handleToggleLike}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-90 transition-all shadow-sm"
          >
            {isLiked ? (
              <FaHeart className="text-rose-500 text-base" />
            ) : (
              <LuHeart className="text-base text-slate-700" />
            )}
          </button>
        </div>

        {/* =====================================================
            2. MA'LUMOTLAR QISMI
        ====================================================== */}

        <div className="p-2 leading-3 flex flex-col flex-1 justify-between">
          <div className="flex justify-center flex-col gap-1">
            {/* SOAT NOMI */}
            <h3 className="font-bold text-[13px] text-white leading-snug line-clamp-1 mb-0.5">
              {watch?.name ||
                `${watch?.brand || ""} ${watch?.model || ""}`.trim() ||
                "Nomsiz Soat"}
            </h3>

            {/* NARXI */}
            <PriceTag usd={watch?.price} size="sm" className="mb-0.5" />

            {/* MEXANIZM VA DIAMETR */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-3">
              <span>{watch?.mechanism || "Mexanika"}</span>

              {watch?.diameter && (
                <>
                  <span>•</span>
                  <span>{watch.diameter}</span>
                </>
              )}
            </div>
          </div>

          {/* PASTKI QISM (SANA) */}
          <div className="pt-2.5 border-t border-slate-700/60 flex justify-end items-center text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1 shrink-0">
              <LuCalendar className="text-slate-400" />
              <span>{watch?.date || "Bugun"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {showDetail && (
        <CarDetailModal car={watch} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

export default CarCard;
