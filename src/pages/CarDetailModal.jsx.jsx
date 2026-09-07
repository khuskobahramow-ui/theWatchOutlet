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
} from "react-icons/lu";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import PriceTag from "../comps/PriceTag";

const FUTURE_FIELDS = [
  { key: "bodyType", label: "Kuzov turi" },
  { key: "certificateNo", label: "Sertifikat raqami" },
  { key: "ownersCount", label: "Egasi soni" },
];

const StatChip = ({ icon: Icon, label, value }) => {
  const hasValue = value && value !== "" && value !== "-";
  return (
    <div className="bg-white rounded-2xl p-3 flex flex-col gap-1.5 min-w-0 shadow-sm border border-slate-100">
      <div className="flex items-center gap-1.5 text-slate-400">
        {Icon && <Icon size={14} />}
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <span
        className={`text-sm font-bold truncate ${
          hasValue ? "text-slate-900" : "text-slate-300 font-medium"
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
      className="fixed inset-0 z-[110] bg-black flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* RASMNI KATTALASHTIRGANDAGI ALOHIDA TEPANGI BAR */}
      <div
        className="w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 ? (
          <div className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold shadow-md">
            {index + 1} / {images.length}
          </div>
        ) : (
          <div />
        )}

        {/* ALOHIDA SHAKLDA AJRATILGAN CHI QISH TUGMASI */}
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-slate-900/90 border border-white/30 flex items-center justify-center text-white active:scale-95 transition-transform shadow-2xl"
        >
          <LuX size={24} />
        </button>
      </div>

      {/* RASM KO'RINISHI */}
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
          className="max-w-full max-h-[80vh] object-contain pointer-events-none select-none rounded-md"
          draggable={false}
        />
      </motion.div>

      {/* TUGMALAR VA NUQTALAR */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl z-20"
          >
            <LuChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl z-20"
          >
            <LuChevronRight size={24} />
          </button>
        </>
      )}

      <div
        className="w-full pb-6 pt-2 flex justify-center gap-2 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 &&
          images.map((_, i) => (
            <div
              key={`fs-dot-${i}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
      </div>
    </motion.div>
  );
};

/* 2. TO'LIQ EKRANLI ASOSIY CAR DETAIL MODAL */
const CarDetailModal = ({ car, onClose }) => {
  const images =
    car?.images && car.images.length > 0
      ? car.images
      : car?.image
      ? [car.image]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!car) return null;

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

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100000000000] bg-[#f8fafc] w-full h-full overflow-y-auto"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="w-full min-h-full flex flex-col relative pb-10">
          {/* RASMLAR SLAYDERI */}
          <div className="relative w-full h-[36vh] bg-slate-900 shrink-0 overflow-hidden">
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
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Rasm mavjud emas
              </div>
            )}

            {/* TEPADAGI GRADIENT OYNASI */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

            {/* ALOHIDA AJRATILGAN CHI QISH TUGMASI (TEPA CHAPDA) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform z-20"
            >
              <LuX size={22} />
            </button>

            {/* RASMNI KATTALASHTIRISH TUGMASI (TEPA O'NGDA) */}
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setShowGallery(true)}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform z-20"
              >
                <LuExpand size={19} />
              </button>
            )}

            {/* INDIKATORLAR */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 z-10">
                {activeIndex + 1} / {images.length}
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={`dot-${i}`}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ASOSIY MA'LUMOT BO'LIMI */}
          <div className="px-4 pt-5 bg-[#f8fafc] rounded-t-3xl relative z-10 -mt-4 flex-1">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {car.name || "Avtomobil"}
              </h2>
            </div>
            {car.listingId && (
              <div className="text-[11px] text-slate-400 font-mono mb-1">
                {car.listingId}
              </div>
            )}
            <PriceTag usd={car.price} size="lg" className="mb-4" />

            {/* INSTAGRAM VA YOUTUBE TUGMALARI */}
            {(instagramUrl || youtubeUrl) && (
              <div className="flex gap-2 mb-5">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white text-xs font-semibold active:scale-95 transition-transform shadow-md cursor-pointer"
                  >
                    <FaInstagram size={18} /> Instagram
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-red-600 text-white text-xs font-semibold active:scale-95 transition-transform shadow-md cursor-pointer"
                  >
                    <FaYoutube size={18} /> Youtube
                  </a>
                )}
              </div>
            )}

            {/* TEXNIK XUSUSIYATLAR */}
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Xususiyatlari
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
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
            <div className="flex items-center justify-between text-sm text-slate-500 mb-5 px-1">
              <div className="flex items-center gap-1.5">
                <LuMapPin size={16} className="text-slate-400" />
                <span>{car.location || "O'zbekiston"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LuCalendar size={16} className="text-slate-400" />
                <span>{car.date || "Bugun"}</span>
              </div>
            </div>

            {/* TAVSIF */}
            {car.description && (
              <div className="mb-30 ">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Tavsif
                </div>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                  {car.description}
                </p>
              </div>
            )}

            {/* QO'SHIMCHA MAYDONLAR */}
            {/* <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Qo'shimcha
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {FUTURE_FIELDS.map((field) => (
                <StatChip
                  key={`future-${field.key}`}
                  label={field.label}
                  value={car[field.key]}
                />
              ))}
            </div> */}
          </div>
        </div>
      </motion.div>

      {/* FULLSCREEN GALLERY MODAL */}
      {showGallery && (
        <FullscreenGallery
          images={images}
          startIndex={activeIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </AnimatePresence>
  );
};

export default CarDetailModal;
