import { getTokenUserCookies, normalizeAppUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";

function useFetch(url, { method, body } = {}) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);

  const token = getTokenUserCookies(cookies);

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchData = async () => {
      try {
        const response = await fetch(normalizeAppUrl(url), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: method,
          body: body,
        });
        const dataJson = await response.json();
        
        if (response.ok) {
          setData(dataJson);
        } else if (response.status === 401) {
          removeCookie(["currentUser"]);
          router.replace("/login");
        } else {
          throw dataJson;
        }
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, method, body, token, router, removeCookie]);

  return { data, error, isLoading };
}

export default useFetch;
