"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ellipsis } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ThreadType } from "@/lib/types";

interface MessageThreadProps {
  data: ThreadType;
}

const MessageThreadComponent: React.FC<MessageThreadProps> = ({ data }) => {
  return (
    <div className="flex flex-col relative">
      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-row gap-3">
          <div className="flex flex-row w-1/2 items-center gap-3 mb-1">
            <div className="rounded-full h-[50px] w-[50px] border-2 p-0.5">
              <Avatar className="h-[100%] w-[100%]">
                <AvatarImage
                  src={data.user2.photo}
                  className="rounded-full cursor-pointer"
                />
                <AvatarFallback className="flex flex-row h-[100%] w-[100%] rounded-full font-semibold items-center justify-center">
                  {data.user2.fullname.split(" ")[0].charAt(0).toUpperCase()}
                  {data.user2.fullname.split(" ")[1].charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <h4 className="font-semibold antialiased">
                @{data.user2.username}
              </h4>
              <p className="text-[13px]">{formatDate(data.created_at)}</p>
            </div>
          </div>
          <div className="flex flex-row w-1/2 justify-end">
            <Ellipsis />
          </div>
        </div>
        <div className="flex flex-col text-[14px]">{data.last_message}</div>
      </div>
    </div>
  );
};

export default MessageThreadComponent;
