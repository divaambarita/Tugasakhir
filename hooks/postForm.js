import { normalizeAppUrl } from "@/lib/utils";

export default async function PostForm(url, body) {
  try {
    const response = await fetch(normalizeAppUrl(url), {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (response.ok) {
      return { data: data, error: null };
    } else {
      throw {
        data: null,
        error: data,
      };
    }
  } catch (error) {
    console.log("error", error);
    return error;
  }
}
