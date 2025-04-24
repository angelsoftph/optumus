"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLoginForm from "./login-form";

export default function AdminLogInPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return <AdminLoginForm />;
}
