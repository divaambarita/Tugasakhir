import { getTokenUserCookies, normalizeAppUrl } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";

function useFetchWithAutoRefresh(
  url,
  { method = "GET", body, interval = 30000 } = {}
) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const bodyRef = useRef(body);

  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);

  const token = getTokenUserCookies(cookies);

  // Update body ref when body changes
  useEffect(() => {
    bodyRef.current = body;
  }, [body]);

  const fetchData = async () => {
    if (!token) {
      console.log("No token available, skipping fetch");
      return;
    }

    console.log("Fetching data from:", url);

    try {
      const response = await fetch(normalizeAppUrl(url), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        method: method,
        body: bodyRef.current,
      });
      const dataJson = await response.json();

      console.log("Response data:", dataJson);

      if (!isMountedRef.current) return;

      if (response.ok) {
        setData(dataJson);
        setError(null);
      } else if (response.status === 401) {
        console.log("Unauthorized, redirecting to login");
        removeCookie(["currentUser"]);
        router.replace("/login");
      } else {
        console.error("Response error:", dataJson);
        throw dataJson;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      if (isMountedRef.current) {
        setError(error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token) return; // Jangan fetch jika tidak ada token

    // Initial fetch
    fetchData();

    // Set up auto-refresh interval
    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, interval);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [url, method, token, interval]); // Hapus body dari dependency

  // Listen for window focus to refresh data
  useEffect(() => {
    const handleFocus = () => {
      if (isMountedRef.current) {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Listen for custom data update events
  useEffect(() => {
    const handleDataUpdate = (event) => {
      if (isMountedRef.current) {
        fetchData();
      }
    };

    window.addEventListener("dataUpdate", handleDataUpdate);
    return () => window.removeEventListener("dataUpdate", handleDataUpdate);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { data, error, isLoading, refetch: fetchData };
}

export default useFetchWithAutoRefresh;
