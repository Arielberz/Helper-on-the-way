import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL;

export default function IconChat() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    // Fetch initial unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE}/api/chat/unread-count`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUnreadCount(data.data?.unreadCount || 0);
                }
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };

        fetchUnreadCount();

        // Refetch every 30 seconds as fallback
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Setup Socket.IO connection for real-time updates
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const newSocket = io(API_BASE, {
            auth: { token },
        });

        setSocket(newSocket);

        // Listen for new messages
        newSocket.on("new_message", (message) => {
            // Increment unread count if message is not from current user
            setUnreadCount((prev) => prev + 1);
        });

        // Listen for messages marked as read
        newSocket.on("messages_read", () => {
            setUnreadCount(0);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    // Listen for demo message event (for testing)
    useEffect(() => {
        const handleDemoMessage = () => {
            setUnreadCount((prev) => prev + 1);
            alert("🎉 Demo message received! Check the red notification badge!");
        };

        window.addEventListener('demoMessage', handleDemoMessage);
        return () => window.removeEventListener('demoMessage', handleDemoMessage);
    }, []);

    const handleClick = () => {
        navigate("/chat");
    };

    return (
        <button
            onClick={handleClick}
            className="relative h-12 w-12 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30"
            aria-label="Chat"
        >
            {/* Only show badge if there are unread messages */}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white bg-red-500 text-white text-xs font-bold z-10">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-4l-4 4-4-4H9z"
                />
            </svg>
        </button>
    );
}       





