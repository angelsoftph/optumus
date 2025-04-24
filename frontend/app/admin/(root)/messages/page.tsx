"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/constants";
import { ThreadType, UserType } from "@/lib/types";
import MessageThreadComponent from "@/components/messages";
import PrivateChatComponent from "@/components/chat";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "../sidebar";
import { useRouter } from "next/navigation";
import InitAuthProvider from "@/lib/InitAuthProvider";
import * as jwt_decode from "jwt-decode";
import Loading from "@/app/loading";

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
}

export default function MessagesComponent() {
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
      const decodedToken: DecodedToken = jwt_decode.jwtDecode(token);
      const expiryTime = decodedToken.exp * 1000;

      if (expiryTime < Date.now()) {
        localStorage.removeItem("optlib_auth_token");
        router.push("/admin/login");
      }
    } else {
      router.push("/admin/login");
    }
  }, [user, router]);

  const loadThreads = async (): Promise<ThreadType[]> => {
    try {
      const response = await fetch(`${API_URL}/api/get-threads?user_id=1`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching message threads:", error);
      throw error;
    }
  };

  const {
    data: threads,
    isLoading,
    isError,
  } = useQuery<ThreadType[], Error>({
    queryKey: ["threads"],
    queryFn: () => loadThreads(),
    staleTime: 1000 * 60 * 5,
    enabled: !!user?.id,
  });

  const [showChat, setShowChat] = useState(false);
  const [currentThread, setCurrentThread] = useState<ThreadType>();
  const [recipient, setRecipient] = useState<UserType>();

  const handleSetRecipient = (recipient: UserType) => {
    setRecipient(recipient);
  };

  const handleClose = () => {
    setShowChat(false);
  };

  const getThreadData = (thread: ThreadType) => {
    setCurrentThread(thread);
  };

  useEffect(() => {
    const token = localStorage.getItem("optlib_auth_token");

    if (token) {
      setShowLoading(false);
    }
  }, [router, user]);

  useEffect(() => {
    setShowChat(true);
  }, [currentThread]);

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

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading messages...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">Error loading messages</p>;
  }

  return (
    <InitAuthProvider>
      <AdminSidebar />
      <main className="flex flex-col w-full h-screen">
        <SidebarTrigger className="text-black" />
        <div className="flex flex-col w-full h-screen gap-4 px-6 py-0 text-black">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <div className="flex flex-col mt-3">
            {showChat && currentThread && recipient ? (
              <PrivateChatComponent
                recipient={recipient}
                currentUser={user}
                onHandleClose={handleClose}
              />
            ) : (
              <ul className="flex flex-col gap-1 pb-10 overflow-auto">
                {threads?.map((thread: ThreadType, index) => (
                  <li
                    key={index}
                    className="w-full rounded-sm bg-gray-200 mb-0.5"
                    onClick={() => handleSetRecipient(thread.user2)}
                  >
                    <div
                      className="w-full cursor-pointer"
                      onClick={() => getThreadData(thread)}
                    >
                      <MessageThreadComponent data={thread} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </InitAuthProvider>
  );
}
