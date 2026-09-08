import { useState, useEffect, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, query, getDocs } from "firebase/firestore";

export function useCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Endi bot saqlayotgan "watches" kolleksiyasidan olamiz
    const q = query(collection(db, "watches"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const watchesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(
          "🔥 Firestore 'watches' dan kelgan soatlar soni:",
          watchesData.length
        );
        console.log("📦 Kelgan ma'lumotlar:", watchesData);

        setCars(watchesData);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("❌ Firestore xatosi:", error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const q = query(collection(db, "watches"));
      const snapshot = await getDocs(q);
      const watchesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCars(watchesData);
    } catch (error) {
      console.error("Yangilashda xatolik:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { cars, loading, refreshing, refresh };
}

export default useCars;
