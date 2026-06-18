/**
 * Safe utility functions to prevent hydration mismatches
 */

/**
 * Safely formats currency after component mounts
 */
export function formatCurrencySSR(amount, fallback = "Rp 0") {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch (error) {
    return fallback;
  }
}

/**
 * Safely formats dates after component mounts
 */
export function formatDateSSR(date, options = {}, fallback = "Loading...") {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return new Date(date).toLocaleString("id-ID", options);
  } catch (error) {
    return fallback;
  }
}

/**
 * Safely gets current date values
 */
export function getCurrentDateSSR() {
  if (typeof window === "undefined") {
    return {
      year: 2025,
      month: 1,
      isSSR: true,
    };
  }

  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    isSSR: false,
  };
}
