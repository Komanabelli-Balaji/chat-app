import { useEffect, useRef, useState, type ReactNode } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import type { AuthContextType, UserData } from "../types/types";
import { AuthContext } from "./Contexts";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<UserData | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = () => {
    if (socketRef.current) return;

    const socket = io(backendUrl, {
      withCredentials: true,
    });

    socket.on("getOnlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    socketRef.current = socket;
  };

  // const sendSocketEvent = (event: string, payload: unknown) => {
  //   socketRef.current?.emit(event, payload);
  // };

  const onSocketEvent = <T,>(event: string, handler: (data: T) => void) => {
    socketRef.current?.on(event, handler);
  };

  const offSocketEvent = <T,>(event: string, handler: (data: T) => void) => {
    socketRef.current?.off(event, handler);
  };

  const login = async (state: "signup" | "login", credentials: unknown) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.user);
        connectSocket();
        toast.success(data.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    }

    // catch (err: unknown) {
    //   if (axios.isAxiosError(err)) {
    //     toast.error(err.response?.data?.message || "Request failed");
    //   }
    // }
  };

  const logout = async () => {
    await axios.post("/api/auth/logout");
    socketRef.current?.disconnect();
    socketRef.current = null;
    setAuthUser(null);
    setOnlineUsers([]);
  };

  const updateProfile = async (body: unknown) => {
    const { data } = await axios.put("/api/auth/update-profile", body);
    if (data.success) {
      setAuthUser(data.user);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runAuthCheck = async () => {
      try {
        const { data } = await axios.get("/api/auth/check");

        if (!isMounted) return;

        setAuthUser(data.user);
        connectSocket();
      } catch {
        if (isMounted) {
          setAuthUser(null);
        }
      }
    };

    runAuthCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  const value: AuthContextType = {
    authUser,
    onlineUsers,
    onSocketEvent,
    offSocketEvent,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
