import { getTokenUserCookies, normalizeAppUrl } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";

function useFetchStable(url, options = {}) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);

  const token = getTokenUserCookies(cookies);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);

  useEffect(() => {
    // Skip fetching jika url null atau tidak ada token
    if (!url || !token) {
      console.log("Skipping fetch - URL:", url, "Token:", !!token);
      setIsLoading(false);
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      console.log("Fetching from:", url);
      console.log("With options:", memoizedOptions);

      try {
        setIsLoading(true);
        setError(null); // Reset error state

        const response = await fetch(normalizeAppUrl(url), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            // Add cache busting headers
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          ...memoizedOptions,
        });

        console.log("Response status:", response.status);

        const dataJson = await response.json();

        console.log("Response data:", dataJson);

        if (response.ok) {
          setData(dataJson);
          setError(null);
        } else if (response.status === 401) {
          console.log("Unauthorized, redirecting...");
          removeCookie(["currentUser"]);
          router.replace("/login");
        } else {
          throw dataJson;
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, token, memoizedOptions, router, removeCookie]);

  return { data, error, isLoading };
}

export default useFetchStable;
