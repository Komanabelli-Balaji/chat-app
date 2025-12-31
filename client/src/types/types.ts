import type React from "react";

export interface UserData {
  _id: string;
  email: string;
  fullName: string;
  profilePic: string;
  bio: string;
}

export interface MessageData {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string; // Optional because some messages are only images
  image?: string; // Optional because some messages are only text
  seen: boolean;
  createdAt: string;
}

export interface AuthContextType {
  authUser: UserData | null;
  onlineUsers: string[];
  login: (state: "signup" | "login", credentials: unknown) => Promise<void>;
  logout: () => void;
  updateProfile: (body: unknown) => Promise<void>;
  onSocketEvent: <T>(event: string, handler: (data: T) => void) => void;
  offSocketEvent: <T>(event: string, handler: (data: T) => void) => void;
}

// export interface ChatContextType {
//   messages: string[]; 1
//   users: string[]; 1
//   selectedUser: UserData | null; 1
//   getUsers; 1
//   setMessages; 0
//   sendMessage; 1
//   setSelectedUser; 1
//   unseenMessages; 1
//   setUnseenMessages; 0
// }

export interface ChatContextType {
  messages: MessageData[];
  users: UserData[];
  selectedUser: UserData | null;
  unseenMessages: Record<string, number>;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>; // 1
  sendMessage: (data: { text?: string; image?: string }) => Promise<void>;
  setSelectedUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  setUnseenMessages: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  resetChat: () => void;
}
