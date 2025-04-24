"use client";

import Image from "next/image";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";
import { BookType } from "@/lib/types";
import { useState } from "react";
import { API_URL } from "@/lib/constants";
import axiosWithAuth from "@/lib/axiosWithAuth";

type BookComponentProps = {
  bookData: BookType;
};

const BookComponent: React.FC<BookComponentProps> = ({ bookData }) => {
  const queryClient = useQueryClient();
  const [readMore, setReadMore] = useState(false);

  const borrowBook = async () => {
    const book_id = bookData.id;
    const response = await axiosWithAuth.post(
      `${API_URL}/api/borrow-book?book_id=${book_id}`
    );

    if (!response || response.status === 401) {
      throw new Error("Token expired or unauthorized");
    }

    if (response.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      Swal.fire({
        title: "Success",
        html: "Book successfully loaned.<br /><br />Our book delivery is now traveling at a speed of 1 megaparsec (3,085,677,581,491 kms) per hour toward your location.<br /><br />Please make sure to return the book within 7 days.",
        icon: "success",
        confirmButtonText: "Sure!",
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
      <CardHeader>
        <div className="flex flex-col items-center">
          <h3 className="text-[13px] xs:text-[15px] sm:text-[18px] h-[60px] mb-1 font-semibold text-center">
            {bookData.title}
          </h3>
          <h4 className="text-sm mb-3">{bookData.category_name}</h4>
          <Image
            className="rounded-xs hover:animate-pulse"
            src={bookData.photo}
            alt={bookData.title}
            width={147}
            height={200}
            priority={true}
          />
          <h4 className="h-[40px] my-2 text-[13px] text-center">
            By {bookData.author}
          </h4>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={clsx(
            "text-[13px]",
            readMore ? "" : "overflow-hidden line-clamp-2 mb-1"
          )}
        >
          {bookData.content}
        </p>
        <div className="flex items-center justify-center mt-3">
          <div
            className="text-sm text-cyan-600 hover:text-cyan-500 cursor-pointer"
            onClick={() => setReadMore((prev) => !prev)}
          >
            {readMore ? "Read less..." : "Read more..."}
          </div>
        </div>
        <Separator className="mt-5" />
      </CardContent>
      <CardFooter className="flex flex-col gap-5 justify-center">
        {bookData.status === "A" ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
            onClick={borrowBook}
          >
            Loan this Book
          </Button>
        ) : (
          <Button disabled={true} className="w-full bg-gray-950">
            Currently Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookComponent;
