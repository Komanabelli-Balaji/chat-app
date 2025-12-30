import { useContext } from "react";
import { ChatContext } from "../context/Contexts";
import type { ChatContextType } from "../types/types";

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
