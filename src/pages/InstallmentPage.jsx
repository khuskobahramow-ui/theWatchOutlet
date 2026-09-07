import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import InstallmentCard from "./InstallmentCard";
import InstallmentDetailModal from "./InstallmentDetailModal";
import InstallmentFilterModal from "./InstallmentFilterModal";
import { NavLink } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FiFilter } from "react-icons/fi";

const InstallmentPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "installment_cars"),
      (snapshot) => {
        const list = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((item) => item.status !== "no-active");

        setCars(list);
        setLoading(false);
      },
      (error) => {
        console.error("Nasiya mashinalarini yuklashda xato:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-0 p-3">
      {/* Header bar - Filtr tugmasi bilan */}
      <div className="flex w-full left-0 justify-between items-center border-b bg-[#f8fafc] border-slate-200 sticky top-0 z-40 px-1">
        <NavLink
          to="/"
          className="flex justify-start font-bold py-3 items-center"
        >
          <IoIosArrowBack size={30} />
          Orqaga
        </NavLink>

        {/* Filtr Ochish Tugmasi */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold text-xs px-3 py-1.5 rounded-xl active:scale-95 transition-all"
        >
          <FiFilter size={16} />
          Filtr
        </button>
      </div>

      <div className="mb-5 mt-2">
        <h1 className="text-2xl font-black text-slate-900">Nasiya Savdo</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Qulay boshlang'ich to'lov va muddatli to'lov variantlari
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl h-64 animate-pulse border border-slate-100 p-3"
            />
          ))}
        </div>
      ) : cars && cars.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {cars.map((car) => (
            <InstallmentCard
              key={car.id || car.messageId}
              item={car}
              onClick={() => setSelectedCar(car)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 text-sm">
          Hozircha nasiya savdo uchun e'lonlar mavjud emas
        </div>
      )}

      {/* Detail Modal */}
      {selectedCar && (
        <InstallmentDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
        />
      )}

      {/* Nasiya Filtr Modali */}
      <InstallmentFilterModal
        cars={cars}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSelectCar={(car) => setSelectedCar(car)}
      />
    </div>
  );
};

export default InstallmentPage;
