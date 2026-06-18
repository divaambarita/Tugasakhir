import { useEffect, useState } from "react";

/**
 * Custom hook to prevent hydration mismatch errors
 * Returns true only after component has mounted on client-side
 */
export function useHydration() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

/**
 * Custom hook for safely accessing cookies after hydration
 */
export function useSafeCookies(cookies) {
  const [safeValues, setSafeValues] = useState({
    idBsu: null,
    namaBsu: "",
    role: null,
    isReady: false,
  });

  useEffect(() => {
    setSafeValues({
      idBsu: cookies.currentUser?.idAkun || null,
      namaBsu: cookies.currentUser?.nama || "",
      role: cookies.currentUser?.role || null,
      isReady: true,
    });
  }, [cookies]);

  return safeValues;
}

/**
 * Custom hook for safely getting current date values after hydration
 */
export function useSafeDate() {
  const [dateValues, setDateValues] = useState({
    currentYear: 2025,
    currentMonth: 1,
    isReady: false,
  });

  useEffect(() => {
    const now = new Date();
    setDateValues({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      isReady: true,
    });
  }, []);

  return dateValues;
}
