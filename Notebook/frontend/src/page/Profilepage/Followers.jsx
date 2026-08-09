
import React from "react";
import { getProfileData } from "./getProfiledata";
import { User } from "lucide-react";
import useFollowMutation from "./useFollowMutation";

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

export default function Followers() {
    const { data, isLoading, isError } = getProfileData();

    if (isLoading) {
        return (
            <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 flex items-center justify-center">
                <p className="text-gray-300">Loading followers...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 flex items-center justify-center">
                <p className="text-red-400">Failed to load followers.</p>
            </div>
        );
    }

    const { followMutation } = useFollowMutation()


    const followers = data?.followers ?? [];

    return (
        <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 overflow-y-auto scrollbar-thin">
            {followers.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No followers yet.</p>
                </div>
            ) : (
                followers.map((follower) => {
                    const initial = (
                        follower?.name ||
                        follower?.username ||
                        "A"
                    )[0].toUpperCase();

                    return (
                        <div
                            key={follower._id || follower.id || follower.username}
                            className="m-2 p-2 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-between gap-3"
                        >
                            {/* User information */}
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Avatar */}
                                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full border-2 border-white/30 text-xl font-semibold bg-[linear-gradient(90deg,_rgba(2,0,36,1)_0%,_rgba(9,9,121,1)_35%,_rgba(0,212,255,1)_100%)]">
                                    {initial}
                                </div>

                                {/* Name + username */}
                                <div className="min-w-0">
                                    <h2 className="font-semibold truncate">
                                        {follower?.name}
                                    </h2>

                                    <h3 className="text-sm text-gray-400 truncate">
                                        {follower?.username}
                                    </h3>
                                </div>
                            </div>

                            {/* Follow button */}
                            <button
                                onClick={() => {
                                    followMutation.mutate(follower._id);
                                }}
                                disabled={followMutation.isPending}
                                className="shrink-0
                                    h-10
                                    px-4
                                    flex items-center justify-center gap-2
                                    rounded-full
                                    bg-[linear-gradient(117deg,_rgba(129,125,250,1)_0%,_rgba(28,21,214,1)_100%)]
                                    hover:opacity-90
                                    active:scale-95
                                    transition
                                "
                            >
                                <User size={18} />
                                <span> {followMutation.isPending
                                    ? "..."
                                    : "Follow"}</span>
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    );
}

