"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { UserType, MessageType } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

type ChatNotificationProps = {
  messages?: MessageType[];
  sender: UserType;
  recipient: UserType;
  deleteMessage: (id: number) => void;
};

const ChatLoopNotificationComponent: React.FC<ChatNotificationProps> = ({
  messages = [],
  sender,
  recipient,
  deleteMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = () => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    };

    scroll();
  }, [messages]);

  return (
    <>
      <ul className="space-y-1 px-0">
        {messages.map((msg) => (
          <li key={`${msg.id}-${msg.recipient_id}`} className="text-sm mb-4">
            <div className="flex flex-row gap-2 items-center">
              <Avatar className="flex items-start justify-center border-1 border-gray-300 rounded-full p-0.5 h-[48px] w-[48px] cursor-pointer">
                <AvatarImage
                  src={
                    msg.sender_id === sender.id ? sender.photo : recipient.photo
                  }
                  alt={`msg.sender_id === sender.id ? ${sender.fullname} : ${recipient.fullname}`}
                  className="rounded-full"
                />
                <AvatarFallback className="text-[20px] font-bold">
                  {msg.sender_id === sender.id ? (
                    <span>
                      {sender.fullname.split(" ")[0].charAt(0).toUpperCase()}
                      {sender.fullname.split(" ")[1].charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <span>
                      {recipient.fullname.split(" ")[0].charAt(0).toUpperCase()}
                      {recipient.fullname.split(" ")[1].charAt(0).toUpperCase()}
                    </span>
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0 grow text-left">
                <h4 className="text-[14px] mb-1">
                  @
                  {msg.sender_id === sender.id
                    ? sender.username
                    : recipient.username}
                </h4>
                <span className="text-[12px]">
                  {formatDate(msg.created_at)}
                </span>
              </div>
              <div className="flex flex-row">
                {msg.sender_id === sender.id && !msg.is_deleted && (
                  <span
                    className="cursor-pointer"
                    onClick={() => deleteMessage(msg.id)}
                  >
                    <Trash2 />
                  </span>
                )}
              </div>
            </div>
            <p
              className={`${
                msg.is_deleted ? "italic text-gray-500" : ""
              } mt-2 mb-5 text-[13px] text-left`}
            >
              {msg.message}
            </p>
          </li>
        ))}
      </ul>
      <div ref={messagesEndRef} />
    </>
  );
};

export default ChatLoopNotificationComponent;
