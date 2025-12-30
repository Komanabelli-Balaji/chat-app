import { createContext } from "react";
import type { AuthContextType, ChatContextType } from "../types/types";

export const AuthContext = createContext<AuthContextType | null>(null);
export const ChatContext = createContext<ChatContextType | null>(null);