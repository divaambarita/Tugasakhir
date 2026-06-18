import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function getCurrentUserFromCookies(cookies) {
  const currentUser = cookies?.currentUser;
  if (!currentUser) return null;
  if (typeof currentUser === "string") {
    try {
      return JSON.parse(currentUser);
    } catch {
      return null;
    }
  }
  return currentUser;
}

export function getIdUserCookies(cookies) {
  return getCurrentUserFromCookies(cookies)?.idAkun;
}

export async function getRoleNameUserCookies(cookies) {
  const role = await getCurrentUserFromCookies(cookies)?.role;
  return role;
}

export function isRoleAdmin(cookies) {
  return getCurrentUserFromCookies(cookies)?.roleName === "admin";
}
export function isRoleBSU(cookies) {
  return getCurrentUserFromCookies(cookies)?.roleName === "bsu";
}
export function isStatusRejected(cookies) {
  return getCurrentUserFromCookies(cookies)?.status === "Rejected";
}
export function getTokenUserCookies(cookies) {
  return getCurrentUserFromCookies(cookies)?.token;
}

export function normalizeAppUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}