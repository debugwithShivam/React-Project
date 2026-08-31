import { useEffect, useState, useContext, createContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        const newSocket = io("https://react-project-ckcb.onrender.com", {
            withCredentials: true,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected", newSocket.id);
        });

        newSocket.on("online-users", ({ userId }) => {
            console.log(userId)
            setOnlineUsers(new Set(userId.map(String)));
        });

        newSocket.on("user-online", ({ userId }) => {
            setOnlineUsers((prev) => {
                const next = new Set(prev);
                next.add(String(userId));
                return next;
            });
        });

        newSocket.on("user-offline", ({ userId }) => {
            setOnlineUsers((prev) => {
                const next = new Set(prev);
                next.delete(String(userId));
                return next;
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
