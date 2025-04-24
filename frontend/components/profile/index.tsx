"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorBoundary } from "react-error-boundary";
import PrivateChatComponent from "../chat";
import { UserType } from "@/lib/types";
import useGetLibrarian from "@/hooks/useGetLibrarian";

type ProfileComponentProps = {
  user: UserType;
  isPremium?: boolean;
  setShowChat?: React.Dispatch<React.SetStateAction<boolean>>;
};

const ErrorFallback = ({ error }: { error: Error }) => (
  <div role="alert">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
  </div>
);

const ProfileComponent: React.FC<ProfileComponentProps> = ({ user }) => {
  const { fullname, photo } = user;
  const admin = useGetLibrarian();
  const [showChat, setShowChat] = useState(false);

  const handleClose = () => {
    setShowChat(false);
  };

  return (
    <Card className="rounded-sm gap-0 p-0 pb-10 relative">
      <CardHeader className="flex flex-row relative p-0 rounded-t-sm items-center pointer-events-none">
        <div className="flex flex-col w-full items-center z-10">
          <div className="flex items-center justify-center relative rounded-full h-[120px] w-[120px] mt-5 overflow-hidden">
            <Avatar className="flex items-center justify-center border-3 border-gray-400 rounded-full h-[112px] w-[112px] cursor-pointer">
              <AvatarImage
                src={photo}
                className="rounded-full h-[100%] w-[100%] cursor-pointer"
              />
              <AvatarFallback className="h-[112px] w-[112px] text-[40px] antialiased font-bold">
                {fullname.split(" ")[0].charAt(0).toUpperCase()}
                {fullname.split(" ")[1].charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full z-0 border-4 border-transparent border-t-yellow-400 border-r-yellow-400 rotate-[40deg]"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 mt-4 text-center items-center">
        <h3 className="text-sm font-semibold">
          <span>Welcome back, {user.fullname}!</span>
        </h3>
        <Button className="w-full bg-cyan-600 hover:bg-cyan-500 cursor-pointer">
          <Link href="/loan-history">Loan History</Link>
        </Button>
        <Button className="w-full bg-cyan-600 hover:bg-cyan-500 cursor-pointer">
          <Link href="/loaned-books">Loaned Books</Link>
        </Button>
        <Button
          className="w-full bg-cyan-600 hover:bg-cyan-500 cursor-pointer"
          onClick={() => setShowChat(true)}
        >
          Contact Librarian
        </Button>
        {showChat && (
          <div className="w-full mt-1">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <PrivateChatComponent
                recipient={admin}
                currentUser={user}
                onHandleClose={handleClose}
              />
            </ErrorBoundary>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileComponent;
