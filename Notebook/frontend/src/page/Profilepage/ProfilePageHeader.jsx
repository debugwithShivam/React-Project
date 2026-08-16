import { useSelector } from "react-redux";
import {
    Settings,
    Ellipsis,
    BookOpen,
    Users,
    UserRoundPlus,
    MessageCircle,
} from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "./getProfiledata";
import Following from "./Following";
import Followers from "./Followers";
import Notes from "./Notes";
import Messages from "./Messages";
import { useState } from "react";
import useUnreadMessages from './useUnreadMessages'


export default function ProfilePageHeader() {
    const { data: unreadData, } = useUnreadMessages();
    console.log(unreadData)
    const totalUnread = unreadData?.total ?? 0;
    const [page, setPage] = useState("Notes")
    const { user } = useSelector((state) => state.state);

    const { data, isLoading, isError } = getProfileData()


    const stats = data?.stats || {};

    const initial = (user?.name || user?.username || "A")[0]?.toUpperCase();

    const navItems = [
        { icon: BookOpen, label: "Notes" },
        { icon: Users, label: "Followers" },
        { icon: UserRoundPlus, label: "Following" },
        { icon: MessageCircle, label: "Messages" },
    ];

    const statItems = [
        { label: "Notes", value: stats.notes ?? 0 },
        { label: "Followers", value: stats.followers ?? 0 },
        { label: "Following", value: stats.following ?? 0 },
    ];

    if (isLoading) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 w-4/5 lg:w-3/5 m-4 rounded-3xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-3">
                        <div className="h-6 w-40 bg-white/10 rounded" />
                        <div className="h-4 w-28 bg-white/10 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col  w-screen  items-center">
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 w-4/5 lg:w-3/5 m-4 rounded-3xl p-6 text-white">
                {/* Top: avatar, name, actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 ring-2 ring-white/20 flex items-center justify-center text-4xl font-semibold">
                                {initial}
                            </div>
                            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-black/40" />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                                    {user?.name || "Unnamed"}
                                </h1>
                                <span className="text-white/50 text-sm">
                                    @{user?.username}
                                </span>
                            </div>
                            {user?.email && (
                                <p className="text-white/40 text-sm mt-1">
                                    {user.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-sm font-medium">
                            <Settings size={18} />
                            <span>Edit profile</span>
                        </button>
                        <button
                            aria-label="More options"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
                        >
                            <Ellipsis size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center mt-6 pt-5 border-t border-white/10">
                    {statItems.map((item, i) => (
                        <div key={item.label} className="flex items-center">
                            {i > 0 && <span className="w-px h-10 bg-white/10 mx-4" />}
                            <div className="flex flex-col items-center min-w-[64px]">
                                <span className="text-2xl font-bold">{item.value}</span>
                                <span className="text-white/50 text-xs uppercase tracking-wide">
                                    {item.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Nav */}
                <div className="mt-5 bg-black/30 rounded-2xl flex items-center gap-1 p-1.5 overflow-x-auto">
                    {navItems.map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            onClick={() => {
                                setPage(label);
                            }}
                            className=" flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                            <Icon size={17} />
                            <span>{label}</span>
                            {label === "Messages" && totalUnread > 0 && (
                                <span
                                    className=" min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                                    {totalUnread > 99 ? "99+" : totalUnread}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {isError && (
                    <p className="mt-3 text-sm text-red-300/80">
                        Couldn't refresh your profile — showing the last known data.
                    </p>
                )}
            </div>
            {page == "Notes" && <Notes />}
            {page == "Followers" && <Followers />}
            {page == "Following" && <Following />}
        </div>
    );
}

