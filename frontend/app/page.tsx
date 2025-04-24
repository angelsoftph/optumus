"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/shared/header";
import Loading from "./loading";

const HomePage: React.FC = () => {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (token) {
      router.push("/home");
    } else {
      setShowLoading(false);
    }
  }, [router]);

  if (showLoading) {
    return (
      <div className="flex flex-row h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header isLoggedIn={false} />
      <main className="flex flex-col h-screen bg-gradient-to-r from-slate-500 to-slate-800 items-center justify-center">
        <Image
          src="/logo.png"
          height={300}
          width={300}
          alt="Optumus Galactic Library Management System"
        />
        <h1 className="text-xl text-white font-semibold">
          Welcome to Optumus Galactic Library Management System
        </h1>
      </main>
    </div>
  );
};

export default HomePage;
