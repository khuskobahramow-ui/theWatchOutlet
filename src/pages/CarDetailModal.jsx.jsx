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

/* 1. KATTALASHTIRILGAN GALEREYA (FULLSCREEN) */
const FullscreenGallery = ({ images, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);

  const goNext = () => setIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleDragEnd = (e, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      goNext();
    } else if (info.offset.x > swipeThreshold) {
      goPrev();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999999] bg-black flex flex-col justify-between select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* TEPADAGI BAR */}
      <div
        className="w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 ? (
          <div className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold shadow-md">
            {index + 1} / {images.length}
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-slate-900/90 border border-white/30 flex items-center justify-center text-white active:scale-95 transition-transform shadow-2xl"
        >
          <LuX size={24} />
        </button>
      </div>

      {/* ASOSIY KATTA RASM (DRAG/SWIPE ISHLAYDI) */}
      <div
        className="w-full flex-1 flex items-center justify-center p-2 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={`fs-img-${index}`}
          src={images[index]}
          alt=""
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="max-w-full max-h-[82vh] object-contain select-none rounded-md cursor-grab active:cursor-grabbing"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl z-50"
            >
              <LuChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl z-50"
            >
              <LuChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* PASTDAGI NUQTALAR */}
      <div
        className="w-full pb-6 pt-2 flex justify-center gap-2 z-50"
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

/* 2. ASOSIY CAR DETAIL MODAL */
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

  // SWIPE VA CLICK HARAKATLARINI AJRATISH MANTIQLARI
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 40; // Surish masofasi (piksel)

    if (info.offset.x < -swipeThreshold) {
      goNext(); // Chapga surilsa -> Keyingi rasm
    } else if (info.offset.x > swipeThreshold) {
      goPrev(); // O'ngga surilsa -> Oldingi rasm
    } else {
      // Agar deyarli surilmagan bo'lsa (shunchaki bosilgan bo'lsa) -> Galereyani ochish
      setShowGallery(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000000] bg-[#f8fafc] w-full h-full overflow-y-auto select-none"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="w-full min-h-full flex flex-col relative pb-10">
          {/* RASMLAR CONTAINER */}
          <div className="relative w-full h-[36vh] bg-slate-900 shrink-0 overflow-hidden">
            {images.length > 0 ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <motion.img
                  key={`main-car-img-${activeIndex}`}
                  src={images[activeIndex]}
                  alt={car.name}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={handleDragEnd}
                  className="w-full h-full object-cover select-none cursor-grab active:cursor-grabbing"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Rasm mavjud emas
              </div>
            )}

            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

            {/* CHIQISH TUGMASI */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform z-30"
            >
              <LuX size={22} />
            </button>

            {/* KATTALASHTIRISH TUGMASI */}
            {images.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGallery(true);
                }}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform z-30"
              >
                <LuExpand size={19} />
              </button>
            )}

            {/* INDIKATOR VA NUQTALAR */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 z-20 pointer-events-none">
                {activeIndex + 1} / {images.length}
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
                {images.map((_, i) => (
                  <button
                    key={`dot-btn-${i}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(i);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === activeIndex ? "w-5 bg-white" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ASOSIY MA'LUMOTLAR */}
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

            {car.description && (
              <div className="mb-10">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Tavsif
                </div>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                  {car.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* FULLSCREEN MODAL */}
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
