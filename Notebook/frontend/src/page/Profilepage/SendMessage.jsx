import React from 'react'
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
export default function SendMessage() {

    const sendMessage = useMutation({
        mutationFn: async ({ conversationId, receiverId, content }) => {
            const response = await axios.post(
                "http://localhost:5000/authRouter/message",
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
                        data: [...oldData.data, newMessage],
                    };
                }
            );

            setMeaage("");
        },
    });

    return (
        <div className=" absolute bottom-22 lg:bottom-18 left-0 w-full h-16 px-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm">
            <label
                htmlFor="search"
                className=" w-10 h-10 flex items-center justify-center rounded-full bg-white/10 cursor-pointer">
                <Search size={20} />
            </label>

            <input
                value={message}
                onChange={(e) => setMeaage(e.target.value)}
                type="text"
                id="search"
                className=" flex-1 h-10 px-4 rounded-full bg-white/10 outline-none text-white placeholder:text-gray-400"
                placeholder="Message..."
            />

            <button
                onClick={() => {
                    if (!message.trim()) return;
                    if (!conversationId) return;
                    sendMessage.mutate({
                        conversationId,
                        receiverId: selectUser._id,
                        content: message,
                    });
                }}
                className=" h-10 px-5 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">
                Send
            </button>
        </div>
    )
}
