"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandSignUpForm from "./signup-form";

export default function BrandSignUpPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return <BrandSignUpForm />;
}
