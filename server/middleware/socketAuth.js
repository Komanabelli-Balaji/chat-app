import { verifyToken } from "../lib/utils.js";

const protectSocket = async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("No cookies sent"));
    }

    // Parse cookies
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => c.split("="))
    );

    const token = cookies.uid;
    if (!token) {
      return next(new Error("No auth token"));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error("Invalid token"));
    }

    // Attach authenticated user info to socket
    socket.userId = decoded._id;

    next(); // allow connection
  } catch (err) {
    next(new Error("Socket authentication failed"));
  }
};

export default protectSocket;
