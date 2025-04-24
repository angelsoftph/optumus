import { refreshAccessToken } from "@/lib/helpers/refreshAccessToken";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("optlib_auth_token");

  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      localStorage.removeItem("optlib_auth_token");
      window.location.href = "/login";
      return;
    }

    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  return response;
}
