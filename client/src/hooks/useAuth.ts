import { useContext } from "react";
import { AuthContext } from "../context/Contexts";
import type { AuthContextType } from "../types/types";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
