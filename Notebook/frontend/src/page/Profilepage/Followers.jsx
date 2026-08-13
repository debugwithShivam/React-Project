import React from "react";
import { User } from "lucide-react";
import { getProfileData } from "./getProfiledata";
import useFollowMutation from "./useFollowMutation";
import useFollowStatus from "./useFollowStatus";
import { useSocket } from "../../context/Socket";

function FollowerItem({ follower }) {
    const { onlineUsers } = useSocket();

    const {
        data: isFollowing = false,
        isLoading: followStatusLoading,
    } = useFollowStatus(follower?._id);

    const {
        followMutation,
        unfollowMutation,
    } = useFollowMutation();

    const initial = (
        follower?.name ||
        follower?.username ||
        "A"
    )[0].toUpperCase();

    const isOnline = onlineUsers.has(String(follower?._id));

    const isPending =
        followMutation.isPending ||
        unfollowMutation.isPending;

    const handleFollowToggle = () => {
        if (isFollowing) {
            unfollowMutation.mutate(follower?._id);
        } else {
            followMutation.mutate(follower?._id);
        }
    };

    return (
        <div
            className="
                m-2
                p-2
                rounded-2xl
                bg-white/25
                backdrop-blur-sm
                flex
                items-center
                justify-between
                gap-3
            "
        >
            <div className="flex items-center gap-3 min-w-0">

                <div className="relative">

                    <div
                        className="
                            w-12
                            h-12
                            shrink-0
                            flex
                            items-center
                            justify-center
                            rounded-full
                            border-2
                            border-white/30
                            text-xl
                            font-semibold
                            bg-[linear-gradient(90deg,rgba(2,0,36,1)_0%,rgba(9,9,121,1)_35%,rgba(0,212,255,1)_100%)]
                        "
                    >
                        {initial}
                    </div>

                    <span
                        className={`
                            absolute
                            bottom-0
                            right-0
                            w-3
                            h-3
                            rounded-full
                            border-2
                            border-black
                            ${isOnline
                                ? "bg-green-500"
                                : "bg-red-500"
                            }
                        `}
                    />
                </div>

                <div className="min-w-0">

                    <h2 className="font-semibold truncate">
                        {follower?.name}
                    </h2>

                    <h3 className="text-sm text-gray-400 truncate">
                        {follower?.username}
                    </h3>

                </div>
            </div>

            <button
                onClick={handleFollowToggle}
                disabled={followStatusLoading || isPending}
                className="
                    shrink-0
                    h-10
                    px-4
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[linear-gradient(117deg,rgba(129,125,250,1)_0%,rgba(28,21,214,1)_100%)]
                    hover:opacity-90
                    active:scale-95
                    transition
                "
            >
                <User size={18} />

                <span>
                    {followStatusLoading
                        ? "..."
                        : isPending
                            ? "..."
                            : isFollowing
                                ? "Unfollow"
                                : "Follow"
                    }
                </span>
            </button>
        </div>
    );
}

export default function Followers() {
    const {
        data,
        isLoading,
        isError,
    } = getProfileData();

    if (isLoading) {
        return (
            <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 flex items-center justify-center">
                <p className="text-gray-300">
                    Loading followers...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 flex items-center justify-center">
                <p className="text-red-400">
                    Failed to load followers.
                </p>
            </div>
        );
    }

    const followers = data?.followers ?? [];

    return (
        <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 overflow-y-auto scrollbar-thin">

            {followers.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">
                        No followers yet.
                    </p>
                </div>
            ) : (
                followers.map((follower) => (
                    <FollowerItem
                        key={follower?._id}
                        follower={follower}
                    />
                ))
            )}

        </div>
    );
}