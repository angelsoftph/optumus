import { API_URL } from "../constants";

export async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/api/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Refresh failed");

    const data = await response.json();
    localStorage.setItem("optlib_auth_token", data.token);

    return data.token;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    return null;
  }
}
