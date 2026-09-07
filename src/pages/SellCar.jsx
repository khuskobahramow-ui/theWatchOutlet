import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  LuImagePlus,
  LuTrash2,
  LuCar,
  LuCalendar,
  LuGauge,
  LuUserCheck,
  LuDollarSign,
  LuMapPin,
  LuPhone,
  LuSend,
} from "react-icons/lu";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { NavLink } from "react-router-dom";
import BottomNav from "./BottomNav";

// TELEGRAM BOT SOZLAMALARI
// O'zingizning Bot Token va Chat ID'ingizni shu yerga kiriting:
const BOT_TOKEN = "8662301963:AAH2CDSG36iZR-tSoOavYI7sNxE1jzfeTNQ"; // masalan: "6123456789:AAXxxxx..."
const CHAT_ID = "-1004412216596"; // masalan: "123456789" yoki "-100xxxx..."

// Filter va Hub bo'limlaridagi ro'yxat bilan bir xil — nomlar mos kelishi uchun
const LOCATIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Samarqand",
  "Buxoro",
  "Navoiy",
  "Qashqadaryo",
  "Surxondaryo",
  "Jizzax",
  "Sirdaryo",
  "Xorazm",
  "Qoraqalpog'iston",
];

const SellCar = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form inputlari
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    year: "",
    mileage: "",
    ownerName: "O'zimning nomimda",
    location: "Toshkent shahri",
    phone: "",
    description: "",
  });

  // Xatolik bo'lgan inputlarni belgilash uchun
  const [errors, setErrors] = useState({});

  // RASM PREVIEW URL'LARI — faqat "images" ro'yxati o'zgarganda qayta hisoblanadi
  // (formData/typing tufayli bo'ladigan har bir re-renderda EMAS). Bu — inputlar
  // yozayotganda "qotib qolish" muammosining asosiy sababini bartaraf etadi:
  // avvalgi kodda URL.createObjectURL() HAR BIR renderda (shu jumladan har bir
  // harf yozilganda ham) qayta chaqirilib, xotirada tozalanmagan URL'lar
  // to'planib borar edi.
  const imagePreviews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  // Komponent yangilanganda/yopilganda eski URL'larni xotiradan tozalash
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Rasmlarni tanlash (kamida 4 ta, maksimal 10 ta)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      toast.warning("Ko'pi bilan 10 ta rasm yuklashingiz mumkin!");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  // Rasmni o'chirish
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Input qiymatlarini o'zgartirish
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Inputga yozishni boshlaganda xatolikni o'chirish
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  // Validation va Telegramga yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation (Tekshirish)
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim() && key !== "description") {
        newErrors[key] = true;
      }
    });

    // Rasm tekshiruvi (Kamida 4 ta)
    if (images.length < 4) {
      toast.error("Kamida 4 ta rasm yuklanishi shart!");
      return;
    }

    // Bo'sh kataklar bo'lsa
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }

    setLoading(true);

    try {
      // Telegramga yuboriladigan matn
      const messageText = `
🚗 *YANGI AVTOMOBIL E'LONI*

📌 *Model:* ${formData.title}
💰 *Narxi:* $${formData.price}
📅 *Yili:* ${formData.year}-yil
🛣 *Probeg:* ${formData.mileage} km
👤 *Ega:* ${formData.ownerName}
📍 *Viloyat:* ${formData.location}
📞 *Tel:* ${formData.phone}

📝 *Qo'shimcha:*
${formData.description || "Izoh yo'q"}
      `;

      // 1-qadam: Avval text xabarni Telegramga yuborish
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: messageText,
        parse_mode: "Markdown",
      });

      // 2-qadam: Rasmlarni Telegramga yuborish (MediaGroup formatida)
      if (images.length > 0) {
        const formDataMedia = new FormData();
        formDataMedia.append("chat_id", CHAT_ID);

        const mediaGroup = images.map((_, index) => ({
          type: "photo",
          media: `attach://file${index}`,
        }));

        formDataMedia.append("media", JSON.stringify(mediaGroup));

        images.forEach((file, index) => {
          formDataMedia.append(`file${index}`, file);
        });

        await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`,
          formDataMedia
        );
      }

      toast.success("E'loningiz muvaffaqiyatli yuborildi!");

      // Formani tozalash
      setFormData({
        title: "",
        price: "",
        year: "",
        mileage: "",
        ownerName: "O'zimning nomimda",
        location: "Toshkent shahri",
        phone: "",
        description: "",
      });
      setImages([]);
      setErrors({});
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi! Telegram Bot sozlamalarini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-xl mx-auto relative pt-0 px-4 py-6 pb-24"
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex w-full left-0 justify-between items-center border-b bg-[#f8fafc] border-slate-200 sticky top-0 z-40">
        <NavLink
          to="/"
          className="flex justify-center font-bold py-3 items-center w-25"
        >
          <IoIosArrowBack size={30} />
          Orqaga
        </NavLink>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1 mt-1.25">
        Tezkor Sotish
      </h1>
      <p className="text-xs text-slate-500 mb-5">
        Avtomobilingiz ma'lumotlarini kiriting va tez fursatda soting.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. RASMLAR YUKLASH BO'LIMI */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <LuImagePlus className="text-blue-600 text-lg" />
              Mashina rasmlari
            </span>
            <span
              className={`text-xs font-semibold ${
                images.length < 4 ? "text-rose-500" : "text-emerald-600"
              }`}
            >
              {images.length}/10 (kamida 4 ta)
            </span>
          </div>

          {/* Ogohlantirish matni */}
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 p-2.5 rounded-xl text-xs mb-3 border border-amber-200">
            <IoAlertCircleOutline className="text-base shrink-0" />
            <span>
              E'lon tasdiqlanishi uchun kamida 4 ta sifatli rasm yuklanishi
              kerak!
            </span>
          </div>

          {/* Rasmlar paneli */}
          <div className="grid grid-cols-4 gap-2">
            {images.map((file, idx) => (
              <div
                key={idx}
                className="relative h-20 rounded-xl overflow-hidden border border-slate-200 group"
              >
                <img
                  src={imagePreviews[idx]}
                  alt="car"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full text-xs shadow-md opacity-90 hover:opacity-100"
                >
                  <LuTrash2 />
                </button>
              </div>
            ))}

            {images.length < 10 && (
              <label className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50 transition-all">
                <LuImagePlus className="text-xl text-slate-400" />
                <span className="text-[10px] text-slate-500 mt-1">
                  Qo'shish
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* 2. MASHINA NOMi VA NARXI */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              Mashina nomi
            </label>
            <div className="relative">
              <LuCar className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="text"
                name="title"
                placeholder="Chevrolet Gentra"
                value={formData.title}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${
                  errors.title
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              Narxi ($)
            </label>
            <div className="relative">
              <LuDollarSign className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="number"
                name="price"
                placeholder="12500"
                value={formData.price}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${
                  errors.price
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3. YILI VA PROBEG */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              Moshina yili
            </label>
            <div className="relative">
              <LuCalendar className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="number"
                name="year"
                placeholder="2022"
                value={formData.year}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${
                  errors.year
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              Probeg (km)
            </label>
            <div className="relative">
              <LuGauge className="absolute left-3 top-3 text-slate-400 text-base" />
              <input
                type="number"
                name="mileage"
                placeholder="45000"
                value={formData.mileage}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${
                  errors.mileage
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 4. EGA ISMI VA VILOYAT */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              Mashina kimning nomida
            </label>
            <div className="relative">
              <LuUserCheck className="absolute left-3 top-3 text-slate-400 text-base pointer-events-none" />
              <select
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all appearance-none ${
                  errors.ownerName
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              >
                <option value="O'zimning nomimda">O'zimning nomimda</option>
                <option value="Ishonchnoma bo'yicha">
                  Ishonchnoma bo'yicha
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              Viloyat / Shahar
            </label>
            <div className="relative">
              <LuMapPin className="absolute left-3 top-3 text-slate-400 text-base pointer-events-none" />
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all appearance-none ${
                  errors.location
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 5. TELEFON RAQAM */}
        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            Telefon raqamingiz
          </label>
          <div className="relative">
            <LuPhone className="absolute left-3 top-3 text-slate-400 text-base" />
            <input
              type="tel"
              name="phone"
              placeholder="+998 90 123 45 67"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${
                errors.phone
                  ? "border-rose-500 ring-1 ring-rose-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
        </div>

        {/* 6. QO'SHIMCHA MA'LUMOT (TEXTAREA) */}
        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            Qo'shimcha ma'lumotlar
          </label>
          <textarea
            name="description"
            rows="3"
            placeholder="Kraskasi toza, kraska sepilmagan, navigatsiya va kalit bor..."
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all resize-none"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Yuborilmoqda...</span>
          ) : (
            <>
              <LuSend className="text-lg" />
              <span>E'lonni Yuborish</span>
            </>
          )}
        </button>
      </form>
      {/* Pastki Navigatsiya Menyusi */}
      <BottomNav />
    </motion.div>
  );
};

export default SellCar;
