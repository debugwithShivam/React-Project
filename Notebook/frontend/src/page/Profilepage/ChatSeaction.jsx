import React, { useEffect, useRef, useState } from 'react'
import {
    ArrowLeft,
    Search,
    Phone,
    Video,
    MoreVertical,
    Trash2,
    Eraser,
} from "lucide-react";
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSelecUser } from '../../Redux/Slice';
import { useSocket } from '../../context/Socket'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import SendMessage from './SendMessage';
import useConversations from './useConversations';
import VITE_API_URL from '../../config/backend_API_URL';


const avatarColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-indigo-500",
];

function formatTime(value) {
    if (!value) return "";

    const date = new Date(value);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
}

export default function ChatSeaction() {
    const { onlineUsers, socket } = useSocket()
    const { selectUser } = useSelector((state) => state.state);
    const currentUser = useSelector((state) => state.state.user);
    const userFirstLetter = selectUser?.name?.[0] ?? "A"
    const isOnline = selectUser ? onlineUsers.has(String(selectUser._id)) : false
    const [conversationId, setConversationId] = useState(null);
    const [conversationError, setConversationError] = useState(null);
    const [search, setSearch] = useState("");
    const [chatMenuOpen, setChatMenuOpen] = useState(false);
    const [chatActionError, setChatActionError] = useState(null);
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();
    const dispatch = useDispatch()

    async function getMessage() {
        const response = await axios.get(`${VITE_API_URL}/authRouter/messages/${conversationId}`,
            {
                withCredentials: true,
            })
        return response.data;
    }

    const { data: messagesData, isLoading: messagesLoading, isError: messagesError } = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: getMessage,
        enabled: !!conversationId,
    })

    const { data: conversationsData } = useConversations();
    const conversations = conversationsData?.data ?? [];

    const messages = messagesData?.data ?? [];

    const createConversation = useMutation({
        mutationFn: async () => {

            const response = await axios.post(
                `${VITE_API_URL}/authRouter/conversation/${selectUser._id}`,
                {},
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        onSuccess: (response) => {
            setConversationError(null);
            setConversationId(response.data._id);
        },

        onError: (error) => {
            setConversationId(null);
            setConversationError(
                error.response?.data?.message ?? "Could not open this chat."
            );
        },
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (conversationId) => {
            const response = await axios.patch(
                `${VITE_API_URL}/authRouter/messages/${conversationId}/read`,
                {},
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        onSuccess: (_data, readConversationId) => {
            // Zero the badge locally, otherwise an in-flight GET can put the old
            // unread count back on screen after this chat is opened.
            queryClient.setQueryData(
                ["conversations"],
                (oldData) => {
                    if (!oldData?.data) return oldData;

                    return {
                        ...oldData,
                        data: oldData.data.map((conversation) =>
                            String(conversation.conversationId ?? conversation._id) ===
                                String(readConversationId)
                                ? { ...conversation, unreadCount: 0 }
                                : conversation
                        ),
                    };
                }
            );

            queryClient.setQueryData(
                ["unreadMessages"],
                (oldData) => {
                    if (!oldData?.data) return oldData;

                    const kept = oldData.data.filter(
                        (item) =>
                            String(item._id?.conversation) !== String(readConversationId)
                    );

                    return {
                        ...oldData,
                        total: kept.reduce((sum, item) => sum + item.count, 0),
                        data: kept,
                    };
                }
            );

            queryClient.invalidateQueries({
                queryKey: ["unreadMessages"],
            });

            queryClient.invalidateQueries({
                queryKey: ["conversations"],
            });
        },
    });

    const clearChatMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(
                `${VITE_API_URL}/authRouter/clearChat/${conversationId}`,
                { withCredentials: true }
            );

            return response.data;
        },

        onSuccess: () => {
            setChatActionError(null);
            queryClient.setQueryData(["messages", conversationId], {
                success: true,
                data: [],
            });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            setChatMenuOpen(false);
        },

        onError: (error) => {
            setChatMenuOpen(false);
            setChatActionError(
                error.response?.data?.message ?? "Could not clear this chat."
            );
        },
    });
    const deleteMessageMutation = useMutation({
        mutationFn: async (messageId) => {
            const response = await axios.delete(
                `${VITE_API_URL}/authRouter/message/${messageId}`,
                { withCredentials: true }
            );

            return response.data;
        },

        onSuccess: (_data, messageId) => {
            setChatActionError(null);
            queryClient.setQueryData(
                ["messages", conversationId],
                (oldData) => {
                    if (!oldData?.data) return oldData;

                    return {
                        ...oldData,
                        data: oldData.data.filter(
                            (message) => String(message._id) !== String(messageId)
                        ),
                    };
                }
            );
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },

        onError: (error) => {
            setChatActionError(
                error.response?.data?.message ?? "Could not delete this message."
            );
        },
    });

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            const incomingConversationId =
                String(data.conversationId);

            const newMessage = data.message;

            // Current chat open hai
            if (
                conversationId &&
                incomingConversationId === String(conversationId)
            ) {
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

                markAsReadMutation.mutate(conversationId);

                return;
            }

            queryClient.invalidateQueries({
                queryKey: ["unreadMessages"],
            });

            queryClient.invalidateQueries({
                queryKey: ["conversations"],
            });
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [
        socket,
        conversationId,
        queryClient,
    ]);

    useEffect(() => {
        if (!selectUser?._id) return;

        setConversationId(null);
        setConversationError(null);
        setChatActionError(null);
        createConversation.mutate();
    }, [selectUser?._id]);

    useEffect(() => {
        if (!conversationId) return;

        markAsReadMutation.mutate(conversationId);
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    useEffect(() => {
        if (!chatMenuOpen) return;

        const closeOnClick = () => setChatMenuOpen(false);
        document.addEventListener("click", closeOnClick);
        return () => document.removeEventListener("click", closeOnClick);
    }, [chatMenuOpen]);

    if (!selectUser) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <p>Select a user to start chatting.</p>
            </div>
        );
    }

    const avatarColor =
        avatarColors[
        conversations.findIndex(
            (conversation) =>
                String(conversation.user?._id) === String(selectUser._id)
        ) % avatarColors.length
        ] ?? "bg-red-500";

    const searchTerm = search.trim().toLowerCase();
    const visibleConversations = searchTerm
        ? conversations.filter(
            (conversation) =>
                (conversation.user?.name ?? "")
                    .toLowerCase()
                    .includes(searchTerm) ||
                (conversation.user?.username ?? "")
                    .toLowerCase()
                    .includes(searchTerm)
        )
        : conversations;

    return (
        <div className='h-[calc(100vh-64px)] flex'>
            <div className='w-120 hidden lg:block h-full  bg-black/30'>
                <div className='flex justify-between p-2 items-center'>
                    <div className='flex gap-3 items-center'>
                        <span className='flex justify-center items-center p-2 rounded-full bg-white/35'>
                            <Link
                                to="/ProfilePage"
                            >
                                <ArrowLeft size={18} />
                            </Link>
                        </span>
                        <h1 className='text-2xl'>Messages</h1>
                    </div>
                    <div>
                        <span className='flex justify-center items-center p-2 rounded-full bg-white/35'>
                            <Search />
                        </span>
                    </div>
                </div>
                <div className='p-3'>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className=' w-full p-2 rounded-3xl placeholder:text-gray-500 pl-5 pt-3 pb-3 outline-none'
                        placeholder='Search Conversation'
                    />
                </div>
                <div>
                    {visibleConversations.length === 0 && (
                        <p className="p-4 text-sm text-gray-400">
                            No conversations yet. Follow a user to start chatting.
                        </p>
                    )}
                    {visibleConversations.map((conversation, index) => {
                        const person = conversation.user;
                        const initial = (
                            person?.name ||
                            person?.username ||
                            "A"
                        )[0].toUpperCase();
                        const isActive =
                            String(person?._id) === String(selectUser._id);

                        return (
                            <div
                                key={conversation.conversationId}
                                onClick={() => dispatch(setSelecUser(person))}
                                className={`flex p-2 m-2 rounded-2xl gap-2 justify-between cursor-pointer ${isActive ? "bg-white/50" : "bg-white/30 hover:bg-white/40"}`}
                            >
                                <div className='flex gap-2'>

                                    <div className='flex justify-center items-center'>
                                        {person?.profilePicture ? (
                                            <img
                                                src={person.profilePicture}
                                                alt=""
                                                className='w-11 h-11 rounded-full object-cover'
                                            />
                                        ) : (
                                            <span className={`p-2 flex justify-center items-center rounded-full w-11 ${avatarColors[index % avatarColors.length]}`}>{initial}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className='font-semibold' >{person?.name}</h1>
                                        <h1 className='text-sm text-gray-500 truncate max-w-60'>
                                            {conversation.lastMessage?.content || "No messages yet"}
                                        </h1>
                                    </div>
                                </div>
                                <div className=''>
                                    <div className='flex flex-col text-end'>
                                        <span className="text-xs text-gray-500">
                                            {formatTime(conversation.lastMessageAt)}
                                        </span>
                                        {conversation.unreadCount > 0 && (
                                            <span className=" ml-2 shrink-0 text-xs font-semibold bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className='flex-1 h-full flex flex-col'>
                <div
                    className="
                            flex items-center justify-between
                            px-4 md:px-6 py-3
                            border-b border-white/10
                            bg-black/10
                            backdrop-blur-sm
                          "
                >
                    <div className="flex items-center gap-3 min-w-0">


                        <div className="relative shrink-0">
                            {selectUser.profilePicture ? (
                                <img
                                    src={selectUser.profilePicture}
                                    alt=""
                                    className="w-11 h-11 rounded-full object-cover"
                                />
                            ) : (
                                <div
                                    className={`
                                  w-11 h-11
                                  flex items-center justify-center
                                  rounded-full
                                   border-white/30
                                  text-lg font-semibold
                                  ${avatarColor}
                                `}
                                >
                                    {userFirstLetter}
                                </div>
                            )}
                            {isOnline && (
                                <span
                                    className="
                                    absolute bottom-0 right-0
                                    w-3 h-3 rounded-full
                                    bg-green-400  border-black/40
                                  "
                                />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2 className="font-semibold truncate">
                                {selectUser.name}
                            </h2>
                            <p className="text-xs text-gray-400 truncate">
                                {isOnline ? "Active now" : "Offline"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            className="
                                w-9 h-9 flex items-center justify-center
                                rounded-full bg-white/10 hover:bg-white/20
                                transition
                              "
                        >
                            <Phone size={16} />
                        </button>
                        <button
                            className="
                                w-9 h-9 flex items-center justify-center
                                rounded-full bg-white/10 hover:bg-white/20
                                transition
                              "
                        >
                            <Video size={16} />
                        </button>
                        <div className="relative">
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setChatMenuOpen((open) => !open);
                                }}
                                aria-label="Chat options"
                                className="
                                w-9 h-9 flex items-center justify-center
                                rounded-full bg-white/10 hover:bg-white/20
                                transition
                              "
                            >
                                <MoreVertical size={16} />
                            </button>

                            {chatMenuOpen && (
                                <div
                                    className="
                                    absolute right-0 top-11 z-20 w-52 rounded-2xl
                                    border border-white/15 bg-black/80 p-2 shadow-xl backdrop-blur-md
                                  "
                                >
                                    <button
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    "Clear this whole chat for you? This cannot be undone."
                                                )
                                            ) {
                                                clearChatMutation.mutate();
                                            }
                                        }}
                                        disabled={clearChatMutation.isPending}
                                        className="
                                        flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm
                                        text-white/85 transition-colors hover:bg-white/15 disabled:opacity-50
                                      "
                                    >
                                        <Eraser size={14} />
                                        {clearChatMutation.isPending
                                            ? "Clearing..."
                                            : "Clear chat"}
                                    </button>
                                    <p className="px-3 pb-1 pt-2 text-xs text-white/45">
                                        Removes every message in this chat, for both of you.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {conversationError && (
                    <p className="px-4 py-2 text-sm text-red-300 bg-red-500/15">
                        {conversationError}
                    </p>
                )}

                {chatActionError && (
                    <p className="px-4 py-2 text-sm text-red-300 bg-red-500/15">
                        {chatActionError}
                    </p>
                )}

                <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                    {messagesLoading && (
                        <p className='text-gray-400 text-center'>
                            Loading message...
                        </p>
                    )}
                    {messagesError && (
                        <p className="text-red-400 text-center">
                            Failed to load messages.
                        </p>
                    )}
                    {!messagesLoading && !conversationError && messages.length === 0 && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400">
                                No messages yet.
                            </p>
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isMine =
                            String(msg.sender?._id ?? msg.sender) ===
                            String(currentUser?.id ?? currentUser?._id);
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMine
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`group/msg max-w-[70%] px-4 py-2 rounded-2xl ${isMine ? "bg-orange-500" : "bg-white/20"}`}>
                                    <p>
                                        {msg.content}
                                    </p>

                                    <div className="flex items-end justify-between gap-3">
                                        <span className="text-[10px] opacity-60">
                                            {new Date(
                                                msg.createdAt
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>

                                        {isMine && (
                                            <button
                                                onClick={() => deleteMessageMutation.mutate(msg._id)}
                                                disabled={deleteMessageMutation.isPending}
                                                aria-label="Delete message"
                                                title="Delete message"
                                                className="
                                                    opacity-0 transition-opacity group-hover/msg:opacity-100
                                                    rounded-full bg-black/20 p-1 text-white hover:bg-black/40
                                                    disabled:opacity-40
                                                "
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <SendMessage
                    conversationId={conversationId}
                    receiverId={selectUser?._id}
                />
            </div>
        </div>
    )
}
