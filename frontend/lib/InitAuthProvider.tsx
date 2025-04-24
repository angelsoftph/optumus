"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserFromStorage } from "@/store/authSlice";
import { getAuthFromStorage } from "@/lib/authStorage";
import { ReactNode } from "react";

interface InitAuthProviderProps {
  children: ReactNode;
}

export default function InitAuthProvider({ children }: InitAuthProviderProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuthFromStorage();
    if (auth?.user) {
      dispatch(setUserFromStorage(auth.user));
    }
  }, [dispatch]);

  return <>{children}</>;
}
