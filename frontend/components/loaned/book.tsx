"use client";

import Image from "next/image";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { BookType } from "@/lib/types";
import { Button } from "../ui/button";
import axiosWithAuth from "@/lib/axiosWithAuth";
import { API_URL } from "@/lib/constants";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";

type BookComponentProps = {
  bookData: BookType;
};

const LoanedBookComponent: React.FC<BookComponentProps> = ({ bookData }) => {
  const queryClient = useQueryClient();

  const returnBook = async () => {
    const book_id = bookData.id;
    const response = await axiosWithAuth.post(
      `${API_URL}/api/return-book?book_id=${book_id}`
    );

    if (!response || response.status === 401) {
      throw new Error("Token expired or unauthorized");
    }

    if (response.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      Swal.fire({
        title: "Success",
        text: "Book successfully returned.",
        icon: "success",
        confirmButtonText: "Thanks!",
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <Card className="rounded-sm">
      <CardHeader className="hidden"></CardHeader>
      <CardContent>
        <div className="flex flex-row gap-4">
          <Image
            className="rounded-xs hover:animate-pulse"
            src={bookData.photo}
            alt={bookData.title}
            width={110}
            height={150}
            priority={true}
          />
          <div className="flex flex-col items-start">
            <h3 className="text-[13px] xs:text-[15px] sm:text-[18px] mb-2 font-semibold text-center">
              {bookData.title}
            </h3>
            <p className="text-[13px] text-center mb-2">{bookData.author}</p>
            <h4 className="text-sm mb-4">{bookData.category_name}</h4>
            <p className="text-[13px]">{bookData.content}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-5 justify-center">
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
          onClick={returnBook}
        >
          Return this Book
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoanedBookComponent;
