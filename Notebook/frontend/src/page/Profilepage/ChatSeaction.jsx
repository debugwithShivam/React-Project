import React, { useEffect, useState } from 'react'
import {
    ArrowLeft,
    Search,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Smile,
    Send,
} from "lucide-react";
import { Link } from 'react-router-dom';
import { getProfileData } from './getProfiledata';
import { useSelector, useDispatch } from 'react-redux';
import { setSelecUser } from '../../Redux/Slice';
import { useSocket } from '../../context/Socket'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import SendMessage from './SendMessage';



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

export default function ChatSeaction() {
    const { onlineUsers, socket } = useSocket()
    const { selectUser } = useSelector((state) => state.state);
    const userFirstLetter = selectUser?.name?.[0] ?? "A"
    const isOnline = selectUser ? onlineUsers.has(String(selectUser._id)) : false
    const [conversationId, setConversationId] = useState(null);
    const queryClient = useQueryClient();
    const dispatch = useDispatch()



    async function getMessage() {
        const response = await axios.get(`http://localhost:5000/authRouter/messages/${conversationId}`,
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

    const {
        data: unreadData,
    } = useQuery({
        queryKey: ["unreadMessages"],
        queryFn: async () => {
            const response = await axios.get(
                "http://localhost:5000/authRouter/messages/unread",
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },
    });

    const messages = messagesData?.data ?? [];


    const createConversation = useMutation({
        mutationFn: async () => {

            const response = await axios.post(
                `http://localhost:5000/authRouter/conversation/${selectUser._id}`,
                {},
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        onSuccess: (response) => {
            setConversationId(response.data._id);
        },
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (conversationId) => {
            const response = await axios.patch(
                `http://localhost:5000/authRouter/messages/${conversationId}/read`,
                {},
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["unreadMessages"],
            });
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
        createConversation.mutate();
    }, [selectUser?._id]);






    useEffect(() => {
        if (!conversationId) return;

        markAsReadMutation.mutate(conversationId);
    }, [conversationId]);

    const { data, isLoading, isError, } = getProfileData();
    const followers = data?.followers ?? [];

    console.log(followers)


    if (!selectUser) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <p>Select a user to start chatting.</p>
            </div>
        );
    }

    return (
        <div className='w-screen h-screen flex'>
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
                    <input type="search" className=' w-full p-2 rounded-3xl placeholder:text-black-300 pl-5 pt-3 pb-3 outline-none' name="" placeholder='Search Conversation' id="" />
                </div>
                <div>
                    {followers.map((person, index) => {
                        const initial = (
                            person?.name ||
                            person?.username ||
                            "A"
                        )[0].toUpperCase();
                        const getUnreadCount = (personId) => {
                            const item = unreadData?.data?.find(
                                (item) =>
                                    String(item._id.sender) === String(personId)
                            );

                            return item?.count ?? 0;
                        };
                        const unreadCount = getUnreadCount(person._id);
                        return (
                            <div key={index} onClick={()=>dispatch(setSelecUser(person))}>
                                <div className='flex  p-2 m-2 rounded-2xl bg-white/30 gap-2 justify-between'>
                                    <div className='flex gap-2'>

                                        <div className=' flex justify-center items-center'>
                                            <span className={`p-2 flex justify-center items-center rounded-full w-11 ${avatarColors[index % avatarColors.length]}`}>{initial}</span>
                                        </div>
                                        <div>
                                            <h1 className='font-semibold' >{person?.name}</h1>
                                            <h1 className='text-sm text-gray-400 '>Bahi kal Milta hai</h1>
                                        </div>
                                    </div>
                                    <div className=''>
                                        <div className='flex flex-col text-end'>
                                            <span>
                                                2:14
                                            </span>
                                            {unreadCount > 0 && (
                                                <span className=" ml-2 shrink-0 text-xs font-semibold bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                                    {unreadCount > 99 ? "99+" : unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className='w-full h-full  relative'>
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
                            <div
                                className={`
                                  w-11 h-11
                                  flex items-center justify-center
                                  rounded-full
                                   border-white/30
                                  text-lg font-semibold
                                  bg-red-500
                                `}
                            >
                                {userFirstLetter}
                            </div>
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
                        <button
                            className="
                                w-9 h-9 flex items-center justify-center
                                rounded-full bg-white/10 hover:bg-white/20
                                transition
                              "
                        >
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>
                <div className='flex-1 overflow-y-auto  h-141 lg:h-147 p-4 space-y-3'>
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
                    {!messagesLoading && messages.length === 0 && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400">
                                No messages yet.
                            </p>
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isMine = String(msg.sender?._id) !== String(selectUser?._id)
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMine
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl bg-orange-500`}>
                                    <p>
                                        {msg.content}
                                    </p>

                                    <span className="text-[10px] opacity-60">
                                        {new Date(
                                            msg.createdAt
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <SendMessage
                    conversationId={conversationId}
                    receiverId={selectUser?._id}
                />
            </div>
        </div>
    )
}
