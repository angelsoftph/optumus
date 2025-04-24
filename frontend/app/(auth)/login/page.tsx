"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "./signin-form";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return <SignInForm />;
}
