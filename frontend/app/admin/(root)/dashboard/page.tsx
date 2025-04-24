"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "../sidebar";
import Loading from "@/app/loading";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

const AdminDashboard = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("optlib_auth_token")
      : null;
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (token) {
      setShowLoading(false);
    }
  }, [router, user]);

  if (!token || !user || (user && user.usertype !== "A")) {
    return <p className="p-5">You are not authorized to access this page.</p>;
  }

  if (showLoading) {
    return (
      <div className="flex flex-row h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <AdminSidebar />
      <main className="flex flex-col w-full h-screen">
        <SidebarTrigger className="text-black" />
        <div className="flex flex-col w-full h-screen gap-4 px-6 py-0 text-black">
          <h1 className="text-2xl font-semibold">Welcome back, Admin!</h1>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
