"use client";

import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import axiosWithAuth from "@/lib/axiosWithAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { API_URL, PUSHER_URL } from "@/lib/constants";
import { MessageType, UserType } from "@/lib/types";
import { Send, SquareX } from "lucide-react";
import ChatNotificationListenerComponent from "../notifications/chat";
import ChatLoopNotificationComponent from "../notifications/chat/loop";
import { useQueryClient } from "@tanstack/react-query";

interface PrivateChatProps {
  recipient: UserType;
  currentUser: UserType;
  onHandleClose: () => void;
}

const PrivateChatComponent: React.FC<PrivateChatProps> = ({
  recipient,
  currentUser,
  onHandleClose,
}) => {
  const [content, setContent] = useState<string>("");
  const [channel, setChannel] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const queryClient = useQueryClient();

  const createMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const message_data = {
      message: content.trim(),
      recipient_id: recipient.id,
    };

    try {
      const res = await axiosWithAuth.post(
        `${API_URL}/api/create-message`,
        message_data
      );

      const createdMessage = {
        ...res.data,
        id: res.data.message_id,
        sender_id: currentUser.id,
        created_at: new Date().toISOString(),
        is_deleted: 0,
      };

      await axiosWithAuth.post(`${API_URL}/api/send-message`, {
        id: createdMessage.message_id,
        recipient_id: createdMessage.recipient_id,
        message: createdMessage.message,
      });

      setMessages((prev) => {
        if (prev.some((msg) => msg.id === createdMessage.id)) return prev;
        return [...prev, createdMessage];
      });

      setContent("");

      queryClient.invalidateQueries({ queryKey: ["threads"] });
    } catch (error) {
      console.error("Failed to create message:", error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await axiosWithAuth.delete(`${API_URL}/api/messages/${messageId}`);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, message: "This message was deleted", is_deleted: 1 }
            : msg
        )
      );

      await axios.post(`${PUSHER_URL}/delete-message`, {
        id: messageId,
        sender_id: currentUser.id,
        recipient_id: recipient.id,
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await axiosWithAuth.get(
          `${API_URL}/api/get-convo?recipient_id=${recipient.id}`
        );
        setMessages([...res.data]);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    loadMessages();
  }, [currentUser, currentUser.id, recipient, recipient.id]);

  useEffect(() => {
    const generateChannelName = (userId1: number, userId2: number) => {
      const [low, high] = [userId1, userId2].sort((a, b) => a - b);
      return `private-channel-${low}-${high}`;
    };

    const channelName = generateChannelName(currentUser.id, recipient.id);
    setChannel(channelName);
  }, [currentUser.id, recipient.id]);

  return (
    <Card className="w-full h-[500px] rounded-sm py-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-sm font-semibold">
          Chat with @{recipient.username}
        </h3>
        <SquareX onClick={onHandleClose} className="!w-8 !h-8 cursor-pointer" />
      </CardHeader>
      <CardContent>
        <ChatNotificationListenerComponent
          channelName={channel}
          setMessages={setMessages}
          currentUser={currentUser}
        />
        <div className="flex flex-col private-chat-container">
          <div className="messages h-[260px] overflow-y-auto">
            <ChatLoopNotificationComponent
              messages={messages}
              sender={currentUser}
              recipient={recipient}
              deleteMessage={deleteMessage}
            />
          </div>

          <form onSubmit={createMessage} style={{ marginTop: "1rem" }}>
            <div className="flex flex-col w-full gap-4 p-0">
              <Textarea
                autoFocus
                rows={3}
                placeholder="Type your message"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-1 border-amber-900"
              />
              <Button
                className="bg-yellow-600 hover:bg-yellow-500 w-full cursor-pointer"
                type="submit"
              >
                Send <Send />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivateChatComponent;
