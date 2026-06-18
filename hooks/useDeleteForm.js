import { useCallback } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { getTokenUserCookies, normalizeAppUrl } from "@/lib/utils";

const useDeleteForm = () => {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["currentUser"]);

  const deleteForm = useCallback(
    async (url, body) => {
      const token = getTokenUserCookies(cookies);

      try {
        const response = await fetch(normalizeAppUrl(url), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "DELETE",
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.status === 401) {
          removeCookie("currentUser");
          router.replace("/login");
        }
        return data;
      } catch (error) {
        console.log("useDeleteForm error", error);
      }
    },
    [cookies, removeCookie, router]
  );
  return { deleteForm };
};

export default useDeleteForm;
