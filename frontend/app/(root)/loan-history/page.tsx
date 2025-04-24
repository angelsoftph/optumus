"use client";

import { useEffect, useState } from "react";
import Header from "@/components/shared/header";
import InitAuthProvider from "@/lib/InitAuthProvider";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import ProfileComponent from "@/components/profile";
import LoanHistoryComponent from "@/components/history";

const LoanHistoryPage: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("optlib_auth_token")
      : null;
  const [showLoading, setShowLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (token) {
      setShowLoading(false);
    }
  }, [router, user]);

  if (!token || !user) {
    return <p>Unauthorized</p>;
  }

  if (showLoading) {
    return (
      <div className="flex flex-row h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <InitAuthProvider>
      <div className="flex flex-col h-screen">
        <Header showSearch={showSearch} setShowSearch={setShowSearch} />
        <main className="flex flex-col md:flex-row h-full">
          <div className="flex flex-col md:flex-row w-full">
            <div className="flex flex-col w-full md:w-1/3 lg:w-1/4 xl:w-1/5 p-4 gap-4">
              <ProfileComponent user={user} />
            </div>
            <div className="flex flex-col w-full md:w-2/3 lg:w-3/4 xl:w-4/5 gap-4">
              <div className="flex flex-col p-4 w-full">
                <h1 className="text-2xl font-semibold mb-3">Loan History</h1>
                <p className="text-sm mb-6">
                  List of books you have loaned in the past.
                </p>
                <LoanHistoryComponent />
              </div>
            </div>
          </div>
        </main>
      </div>
    </InitAuthProvider>
  );
};

export default LoanHistoryPage;
