import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuX,
  LuMapPin,
  LuCalendar,
  LuGauge,
  LuFuel,
  LuPalette,
  LuSettings2,
  LuChevronLeft,
  LuChevronRight,
  LuExpand,
  LuCalculator,
  LuArrowUpDown,
} from "react-icons/lu";
import { FaInstagram, FaYoutube } from "react-icons/fa";

const USD_TO_UZS = 12700; // Valyuta kursi

const StatChip = ({ icon: Icon, label, value }) => {
  const hasValue = value && value !== "" && value !== "-";
  return (
    <div className="bg-white rounded-2xl p-3.5 flex flex-col gap-1.5 min-w-0 shadow-sm border border-slate-100/80">
      <div className="flex items-center gap-1.5 text-slate-400">
        {Icon && <Icon size={15} />}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span
        className={`text-sm font-bold truncate ${
          hasValue ? "text-slate-800" : "text-slate-300 font-medium"
        }`}
      >
        {hasValue ? value : "Kiritilmagan"}
      </span>
    </div>
  );
};

/* 1. KATTALASHTIRILGAN RASM REJIMI (FULLSCREEN GALLERY) */
const FullscreenGallery = ({ images, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  const goNext = () => setIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleDragEnd = (event, info) => {
    const threshold = 40;
    if (info.offset.x < -threshold) goNext();
    else if (info.offset.x > threshold) goPrev();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        className="w-full p-4 flex justify-between items-center z-[310] bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 ? (
          <div className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
            {index + 1} / {images.length}
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-2xl"
        >
          <LuX size={22} />
        </button>
      </div>

      <motion.div
        key={`fs-img-${index}`}
        className="w-full flex-1 flex items-center justify-center p-2 relative"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={images[index]}
          alt=""
          className="max-w-full max-h-[80vh] object-contain pointer-events-none select-none rounded-lg"
          draggable={false}
        />
      </motion.div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all shadow-xl z-20"
          >
            <LuChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all shadow-xl z-20"
          >
            <LuChevronRight size={24} />
          </button>
        </>
      )}

      <div
        className="w-full pb-6 pt-2 flex justify-center gap-1.5 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 &&
          images.map((_, i) => (
            <div
              key={`fs-dot-${i}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
      </div>
    </motion.div>
  );
};

/* 2. TO'LIQ EKRANLI NASIYA SAVDO DETAIL MODAL */
const InstallmentDetailModal = ({ car, onClose }) => {
  if (!car) return null;

  const images =
    car?.images && car.images.length > 0
      ? car.images
      : car?.image
      ? [car.image]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [currency, setCurrency] = useState("USD"); // "USD" yoki "UZS"

  // Dynamic Kalkulyator Statelari
  const minDownUSD = Number(car?.minDownPayment || 0);
  const totalUSD = Number(car?.totalPrice || car?.price || 0);
  const minMonths = Number(car?.minPeriod || 6);
  const maxMonths = Number(car?.maxPeriod || 60);
  const interestRate = Number(car?.annualInterest || 0);

  const [downPaymentUSD, setDownPaymentUSD] = useState(minDownUSD);
  const [months, setMonths] = useState(maxMonths);

  useEffect(() => {
    if (car) {
      setDownPaymentUSD(Number(car.minDownPayment || 0));
      setMonths(Number(car.maxPeriod || 60));
    }
  }, [car]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const instagramUrl = car.instagram || car.Instagram || "";
  const youtubeUrl = car.youtube || car.Youtube || car.YouTube || "";

  const goNext = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleDragEnd = (event, info) => {
    const threshold = 40;
    if (info.offset.x < -threshold) goNext();
    else if (info.offset.x > threshold) goPrev();
  };

  // Oylik to'lov hisoblash
  const calculateMonthlyUSD = () => {
    const remaining = totalUSD - downPaymentUSD;
    if (remaining <= 0) return 0;
    const totalInterest = remaining * (interestRate / 100) * (months / 12);
    return Math.round((remaining + totalInterest) / months);
  };

  const handleDownPaymentInputChange = (val) => {
    let num = Number(val.replace(/\D/g, ""));
    if (currency === "UZS") {
      num = Math.round(num / USD_TO_UZS);
    }
    if (num < minDownUSD) setDownPaymentUSD(minDownUSD);
    else if (num > totalUSD) setDownPaymentUSD(totalUSD);
    else setDownPaymentUSD(num);
  };

  // Narx formatlash funksiyasi
  const formatPrice = (usdValue) => {
    if (currency === "UZS") {
      return `${(usdValue * USD_TO_UZS).toLocaleString()} so'm`;
    }
    return `$${usdValue.toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] bg-[#F8FAFC] w-full h-full overflow-y-auto"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
      >
        <div className="w-full min-h-full flex flex-col relative pb-12">
          {/* RASMLAR SLAYDERI */}
          <div className="relative w-full h-[38vh] bg-slate-950 shrink-0 overflow-hidden">
            {images.length > 0 ? (
              <motion.div
                key={`main-img-${activeIndex}`}
                className="w-full h-full cursor-pointer"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.05}
                onDragEnd={handleDragEnd}
                onClick={() => setShowGallery(true)}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <img
                  src={images[activeIndex]}
                  alt={car.name}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-medium">
                Rasm mavjud emas
              </div>
            )}

            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none z-10" />

            {/* CHIQISH TUGMASI */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-all z-20"
            >
              <LuX size={20} />
            </button>

            {/* FULLSCREEN TUGMASI */}
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setShowGallery(true)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-all z-20"
              >
                <LuExpand size={18} />
              </button>
            )}

            {/* INDIKATORLAR */}
            {images.length > 1 && (
              <div className="absolute bottom-6 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 z-10">
                {activeIndex + 1} / {images.length}
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-6 left-4 flex gap-1.5 z-20">
                {images.map((_, i) => (
                  <button
                    type="button"
                    key={`dot-${i}`}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ASOSIY MA'LUMOT BO'LIMI */}
          <div className="px-4 pt-6 bg-[#F8FAFC] rounded-t-3xl relative z-10 -mt-5 flex-1">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {car.name || "Avtomobil"}
              </h2>
            </div>

            {car.listingId && (
              <div className="text-[11px] text-slate-400 font-mono tracking-wider mb-2">
                ID: {car.listingId}
              </div>
            )}

            {/* NARX VA VALYUTA TOGGLE */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-blue-600 font-black text-3xl tracking-tight">
                {formatPrice(totalUSD)}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrency((prev) => (prev === "USD" ? "UZS" : "USD"))
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 text-xs font-bold active:scale-95 transition-all shadow-sm"
              >
                <LuArrowUpDown size={14} />
                <span>{currency === "USD" ? "USD ($)" : "UZS (so'm)"}</span>
              </button>
            </div>

            {/* INSTAGRAM VA YOUTUBE TUGMALARI */}
            {(instagramUrl || youtubeUrl) && (
              <div className="flex gap-2.5 mb-6">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-bold active:scale-95 transition-transform shadow-md"
                  >
                    <FaInstagram size={17} /> Instagram
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold active:scale-95 transition-transform shadow-md"
                  >
                    <FaYoutube size={17} /> Youtube
                  </a>
                )}
              </div>
            )}

            {/* NASIYA SAVDO KALKULYATORI */}
            <div className="mb-6 bg-[#0f172a] text-white p-5 rounded-3xl shadow-xl shadow-slate-900/10 space-y-5 border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <LuCalculator size={17} /> Nasiya Kalkulyatori
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  {interestRate}% yillik
                </span>
              </div>

              {/* Boshlang'ich to'lov slider va input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    Boshlang'ich to'lov:
                  </span>
                  <div className="flex items-center gap-1 font-black text-blue-400 text-sm bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
                    <input
                      type="text"
                      value={
                        currency === "UZS"
                          ? (downPaymentUSD * USD_TO_UZS).toLocaleString()
                          : downPaymentUSD.toLocaleString()
                      }
                      onChange={(e) =>
                        handleDownPaymentInputChange(e.target.value)
                      }
                      className="bg-transparent text-right outline-none text-blue-400 w-28 font-bold"
                    />
                    <span className="text-xs text-slate-400 font-medium">
                      {currency === "UZS" ? "so'm" : "$"}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={minDownUSD}
                  max={totalUSD}
                  step={100}
                  value={downPaymentUSD}
                  onChange={(e) => setDownPaymentUSD(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Min: {formatPrice(minDownUSD)}</span>
                  <span>Max: {formatPrice(totalUSD)}</span>
                </div>
              </div>

              {/* To'lov muddati (Oy) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    To'lov muddati:
                  </span>
                  <span className="font-black text-blue-400 text-sm bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
                    {months} oy
                  </span>
                </div>

                <input
                  type="range"
                  min={minMonths}
                  max={maxMonths}
                  step={1}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Min: {minMonths} oy</span>
                  <span>Max: {maxMonths} oy</span>
                </div>
              </div>

              {/* Oylik to'lov natijasi */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 p-4 rounded-2xl flex justify-between items-center border border-slate-700/80 shadow-inner">
                <span className="text-xs text-slate-300 font-semibold">
                  Oylik to'lov:
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {formatPrice(calculateMonthlyUSD())}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    /oy
                  </span>
                </span>
              </div>
            </div>

            {/* TEXNIK XUSUSIYATLAR */}
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
              Xususiyatlari
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <StatChip icon={LuCalendar} label="Yili" value={car.year} />
              <StatChip
                icon={LuGauge}
                label="Probeg"
                value={
                  car.mileage
                    ? `${Number(car.mileage).toLocaleString()} km`
                    : ""
                }
              />
              <StatChip
                icon={LuSettings2}
                label="Korobka"
                value={car.gearbox}
              />
              <StatChip icon={LuPalette} label="Rangi" value={car.color} />
              <StatChip icon={LuSettings2} label="Motor" value={car.engine} />
              <StatChip icon={LuFuel} label="Yoqilg'i" value={car.fuel} />
              <StatChip icon={LuSettings2} label="VIN raqami" value={car.vin} />
            </div>

            {/* JOY VA SANA */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-6 px-1">
              <div className="flex items-center gap-1.5">
                <LuMapPin size={15} className="text-slate-400" />
                <span>{car.location || "O'zbekiston"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LuCalendar size={15} className="text-slate-400" />
                <span>{car.date || "Bugun"}</span>
              </div>
            </div>

            {/* TAVSIF */}
            {car.description && (
              <div className="mb-20">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                  Tavsif
                </div>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  {car.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FULLSCREEN GALLERY MODAL */}
        {showGallery && (
          <FullscreenGallery
            images={images}
            startIndex={activeIndex}
            onClose={() => setShowGallery(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallmentDetailModal;
