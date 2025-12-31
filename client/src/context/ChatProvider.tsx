import { useCallback, useEffect, useState } from "react";
import { ChatContext } from "./Contexts";
import type { MessageData, UserData, ChatContextType } from "../types/types";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import axios from "axios";

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});

  const { onSocketEvent, offSocketEvent } = useAuth();

  // Function to get all users for sidebar
  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  }, []);

  // Function to get messages for selected user
  const getMessages = useCallback(async (userId: string) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  }, []);

  // Function to send message to selected user
  const sendMessage = async (messageData: {
    text?: string;
    image?: string;
  }) => {
    try {
      if(!selectedUser) return;

      const { data } = await axios.post(
        `/api/messages/send/${selectedUser?._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const handleNewMessage = useCallback(
    (newMessage: MessageData) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] ?? 0) + 1,
        }));
      }
    },
    [selectedUser]
  );

  const resetChat = () => {
    setMessages([]);
    setSelectedUser(null);
    setUnseenMessages({});
  };

  useEffect(() => {
    onSocketEvent("newMessage", handleNewMessage);
    return () => offSocketEvent("newMessage", handleNewMessage);
  }, [handleNewMessage, onSocketEvent, offSocketEvent]);

  const value: ChatContextType = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    setUnseenMessages,
    resetChat
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
