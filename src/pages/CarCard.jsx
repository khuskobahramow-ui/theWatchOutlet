import React, { useEffect, useState } from "react";

import { LuHeart, LuMapPin, LuCalendar } from "react-icons/lu";

import { FaHeart } from "react-icons/fa";
import CarDetailModal from "./CarDetailModal.jsx";
import { isCarLiked, toggleCarLike } from "./Likes";
import PriceTag from "../comps/PriceTag";

const CarCard = ({ car }) => {
  // =========================================================
  // BO'SH YOKI YAROQSIZ OB'YEKTLARNI BLOKLASH
  // =========================================================
  const hasName = car?.name && String(car.name).trim() !== "";
  const hasPrice =
    Number(car?.price || car?.totalPrice || car?.startingPrice || 0) > 0;

  // Agarda nomi ham, narxi ham bo'lmasa kartochka umuman chizilmaydi
  if (!car || (!hasName && !hasPrice)) {
    return null;
  }

  // =========================================================
  // LIKE
  // =========================================================

  const [isLiked, setIsLiked] = useState(false);

  // Component birinchi chizilganda, shu mashina avval like
  // qilinganmi — localStorage'dan tekshiramiz.
  useEffect(() => {
    setIsLiked(isCarLiked(car?.id));
  }, [car?.id]);

  const handleToggleLike = (e) => {
    e.stopPropagation();
    const newState = toggleCarLike(car?.id);
    setIsLiked(newState);
  };

  // =========================================================
  // DETAIL MODAL
  // =========================================================

  const [showDetail, setShowDetail] = useState(false);

  // =========================================================
  // RASM
  // =========================================================

  // bot.js "images" nomli MASSIV sifatida saqlaydi (bir nechta rasm URL'i),
  // shuning uchun birinchisini olamiz — mavjud bo'lmagan "car.image" (birlik) emas.
  // Eski/boshqa manbadan "image" (birlik) kelib qolsa ham ishlashi uchun fallback qoldirildi.
  const imageUrl =
    (Array.isArray(car?.images) && car.images.length > 0
      ? car.images[0]
      : null) ||
    car?.image ||
    "";

  // Probeg (km) — himoyalangan parsing: bazada eski/matnli qiymat
  // ("150000 km" kabi) qolib ketgan bo'lsa ham, faqat raqamlarni ajratib olamiz,
  // shunda NaN/"не число" chiqmaydi.
  const mileageNumber =
    Number(String(car?.mileage ?? 0).replace(/[^0-9]/g, "")) || 0;

  // =========================================================
  // CARD
  // =========================================================

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
      >
        {/* =====================================================
            1. RASM QISMI
        ====================================================== */}

        <div className="relative w-full h-45 bg-slate-100 overflow-hidden">
          {/* =================================================
              RASM BOR BO'LSA
          ================================================== */}

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={car?.name || "Avtomobil"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              // -------------------------------------------------
              // RASM YUKLANMAGANDA
              // -------------------------------------------------

              onError={(event) => {
                console.error("❌ CARD RASMI YUKLANMADI:", imageUrl);

                // Rasm o'rniga fallback
                event.currentTarget.style.display = "none";

                const parent = event.currentTarget.parentElement;

                if (parent) {
                  parent.setAttribute("data-image-error", "true");
                }
              }}
            />
          ) : (
            /* =================================================
               RASM URL YO'Q
            ================================================== */

            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Rasm mavjud emas
            </div>
          )}

          {/* ===================================================
              YURAKCHA
          ==================================================== */}

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
          <div className=" flex justify-center flex-col gap-1 ">
            {/* =================================================
                MOSHINA NOMI
            ================================================== */}

            <h3 className="font-bold text-[13px] text-slate-900 leading-snug line-clamp-1 mb-0.5">
              {car?.name || "Avtomobil"}
            </h3>

            {/* =================================================
                NARXI
            ================================================== */}

            <PriceTag usd={car?.price} size="sm" className="mb-0.5" />

            {/* =================================================
                YILI VA PROBEG
            ================================================== */}

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-3">
              <span>{car?.year || "-"}-yil</span>

              <span>•</span>

              <span>{mileageNumber.toLocaleString()} km</span>
            </div>
          </div>

          {/* ===================================================
              PASTKI QISM
          ==================================================== */}

          <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-medium">
            {/* =================================================
                JOY
            ================================================== */}

            <div className="flex items-center gap-1 truncate max-w-[55%]">
              <LuMapPin className="text-slate-400 shrink-0" />

              <span className="truncate">{car?.location || "O'zbekiston"}</span>
            </div>

            {/* =================================================
                SANA
            ================================================== */}

            <div className="flex items-center gap-1 shrink-0">
              <LuCalendar className="text-slate-400" />

              <span>{car?.date || "Bugun"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {showDetail && (
        <CarDetailModal car={car} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

export default CarCard;
