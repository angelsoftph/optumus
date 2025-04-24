"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice";
import { API_URL } from "@/lib/constants";

const useLogout = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    }

    localStorage.removeItem("optlib_auth_token");
    dispatch(logoutAction());

    router.push("/");
  };

  return logout;
};

export default useLogout;
