import React, { useState } from "react";
import axios from "axios";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { Search } from "lucide-react";
import VITE_API_URL from "../../config/backend_API_URL";
export default function SendMessage({
    conversationId,
    receiverId,
}) {
    const [message, setMessage] = useState("");

    const queryClient = useQueryClient();

    const sendMessage = useMutation({
        mutationFn: async ({
            conversationId,
            receiverId,
            content,
        }) => {
            const response = await axios.post(
                `${VITE_API_URL}/authRouter/message`,
                {
                    conversationId,
                    receiverId,
                    content,
                },
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        onSuccess: (response) => {
            const newMessage = response.data;

            queryClient.setQueryData(
                ["messages", conversationId],
                (oldData) => {
                    if (!oldData) {
                        return {
                            success: true,
                            data: [newMessage],
                        };
                    }

                    return {
                        ...oldData,
                        data: [
                            ...oldData.data,
                            newMessage,
                        ],
                    };
                }
            );

            setMessage("");
        },
    });

    const handleSendMessage = () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) return;
        if (!conversationId) return;
        if (!receiverId) return;

        sendMessage.mutate({
            conversationId,
            receiverId,
            content: trimmedMessage,
        });
    };

    return (
        <div className="
            absolute
            bottom-22
            lg:bottom-18
            left-0
            w-full
            h-16
            px-3
            flex
            items-center
            gap-2
            bg-black/60
            backdrop-blur-sm
        ">
            <label
                htmlFor="message"
                className="
                    w-10
                    h-10
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-white/10
                    cursor-pointer
                "
            >
                <Search size={20} />
            </label>

            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSendMessage();
                    }
                }}
                type="text"
                id="message"
                className="
                    flex-1
                    h-10
                    px-4
                    rounded-full
                    bg-white/10
                    outline-none
                    text-white
                    placeholder:text-gray-400
                "
                placeholder="Message..."
            />

            <button
                onClick={handleSendMessage}
                disabled={sendMessage.isPending}
                className="
                    h-10
                    px-5
                    rounded-full
                    bg-orange-500
                    text-white
                    font-semibold
                    hover:bg-orange-600
                    transition
                    disabled:opacity-50
                "
            >
                {sendMessage.isPending ? "..." : "Send"}
            </button>
        </div>
    );
}