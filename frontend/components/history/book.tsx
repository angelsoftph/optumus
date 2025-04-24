"use client";

import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LoanedBookType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type BookComponentProps = {
  bookData: LoanedBookType;
};

const UserHistoryBookComponent: React.FC<BookComponentProps> = ({
  bookData,
}) => {
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
            <p className="text-[13px] mb-1">
              Loaded on: {formatDate(bookData.loan_date)}
            </p>
            <p className="text-[13px]">
              Returned on: {formatDate(bookData.return_date)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserHistoryBookComponent;
