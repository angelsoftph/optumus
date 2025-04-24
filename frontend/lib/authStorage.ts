import { UserType } from "./types";

export const saveAuthToStorage = (token: string, user: UserType) => {
  localStorage.setItem("optlib_auth_token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getAuthFromStorage = () => {
  const token = localStorage.getItem("optlib_auth_token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) return null;

  try {
    return { token, user: JSON.parse(userData) };
  } catch {
    return null;
  }
};
