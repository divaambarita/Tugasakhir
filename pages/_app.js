import "@/styles/globals.css";
import { CookiesProvider } from "react-cookie";

export default function App({ Component, pageProps }) {
  return (
    // tambahkan CookiesProvider untuk mengakses cookies di seluruh aplikasi.
    <CookiesProvider>
      <Component {...pageProps} />
    </CookiesProvider>
  );
}
