"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/loading";

export default function MemberPagesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (!token) {
      router.push("/");
    }

    setShowLoading(false);
  }, [router]);

  if (showLoading) {
    return (
      <div className="flex flex-row h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <div className="flex-center min-h-screen w-full">{children}</div>;
}
