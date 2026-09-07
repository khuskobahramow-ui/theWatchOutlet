import { useState, useEffect, useCallback } from "react";
import { db } from "../firebaseConfig"; // Firebase konfiguratsiyangiz yo'li
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

export function useCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Firestore 'cars' kolleksiyasini vaqt bo'yicha saralab eshitish
    // MUHIM: bot.js hujjatga faqat "updatedAt" yozadi, "createdAt" emas —
    // shuning uchun orderBy shu maydon bo'yicha bo'lishi SHART, aks holda
    // Firestore bu maydoni yo'q hujjatlarni natijadan butunlay tashlab yuboradi.
    const q = query(collection(db, "cars"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const carsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Faqat 'no-active' bo'lmagan (active bo'lgan) e'lonlarni ko'rsatish
          .filter((car) => car.status !== "no-active");

        setCars(carsData);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("Firestore xatosi:", error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Qo'lda yangilash tugmasi uchun — bir martalik qayta so'rov.
  // (onSnapshot allaqachon real-time yangilanadi, bu faqat foydalanuvchi
  // "refresh" tugmasini bosganda darhol qayta tekshirish uchun)
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const q = query(collection(db, "cars"), orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      const carsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((car) => car.status !== "no-active");
      setCars(carsData);
    } catch (error) {
      console.error("Yangilashda xatolik:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { cars, loading, refreshing, refresh };
}
