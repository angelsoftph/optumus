"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { PUSHER_KEY, PUSHER_CLUSTER, PUSHER_URL } from "@/lib/constants";
import { MessageType, UserType } from "@/lib/types";

type NotificationListenerProps = {
  channelName: string;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentUser: UserType;
};

const ChatNotificationListenerComponent: React.FC<
  NotificationListenerProps
> = ({ channelName, setMessages, currentUser }) => {
  useEffect(() => {
    Pusher.logToConsole = false;

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${PUSHER_URL}/pusher/auth`,
    });

    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (data: MessageType) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });
    });

    channel.bind("message-deleted", function (data: MessageType) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, message: "This message was deleted", is_deleted: 1 }
            : msg
        )
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [channelName, currentUser.id, setMessages]);

  return null;
};

export default ChatNotificationListenerComponent;
