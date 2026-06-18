/**
 * Middleware untuk mengatur alur navigasi pengguna berdasarkan status login.
 *
 * @param {Request} request - Objek request yang berisi informasi tentang permintaan HTTP.
 */
export async function middleware(request) {
  // Ambil data pengguna yang disimpan dalam cookie.
  const currentUser = request.cookies.get("currentUser")?.value;

  // Jika pengguna belum masuk, arahkan ke halaman login.
  if (
    !currentUser &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup")
  ) {
    return Response.redirect(new URL("/login", request.url));
  }

  /// Jika pengguna telah masuk dan statusnya "Rejected", arahkan ke halaman dashboard.
  const currentUserJson = JSON.parse(currentUser);
  if (
    currentUserJson?.status === "Rejected" &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return Response.redirect(new URL("/dashboard", request.url));
  }
}

/// matcher untuk middleware semua halaman kecuali hal yang berawalan dengan /api, /_next/static, /_next/image, file gambar dan signup/*.
/// https://nextjs.org/docs/pages/building-your-application/authentication#defining-protected-routes
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.jpeg$|login|signup).*)",
  ],
};
