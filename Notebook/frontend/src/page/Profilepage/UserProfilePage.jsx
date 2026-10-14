import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { ArrowLeft, MessageCircle, UserRoundPlus, UserRoundCheck } from "lucide-react";
import VITE_API_URL from "../../config/backend_API_URL";
import PostGrid from "./PostGrid";
import PeopleList from "./PeopleList";
import useFollowStatus from "./useFollowStatus";
import useFollowMutation from "./useFollowMutation";
import { setSelecUser } from "../../Redux/Slice";

const tabs = ["Posts", "Followers", "Following"];

async function getUserProfile(userId) {
    const response = await axios.get(
        `${VITE_API_URL}/authRouter/profile/${userId}`,
        { withCredentials: true }
    );
    return response.data;
}

export default function UserProfilePage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [tab, setTab] = useState("Posts");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["profile", id],
        queryFn: () => getUserProfile(id),
    });

    const { data: isFollowing = false, isLoading: followStatusLoading } =
        useFollowStatus(id);
    const { followMutation, unfollowMutation } = useFollowMutation();

    const user = data?.user;
    const stats = data?.stats || {};
    const isSelf = data?.isSelf === true;
    const initial = (user?.name || user?.username || "A")[0]?.toUpperCase();
    const isPending = followMutation.isPending || unfollowMutation.isPending;

    function handleFollowToggle() {
        if (isFollowing) {
            unfollowMutation.mutate(id);
        } else {
            followMutation.mutate(id);
        }

        queryClient.invalidateQueries({ queryKey: ["profile", id] });
    }

    function openChat() {
        dispatch(setSelecUser(user));
        navigate("/ChatSeaction");
    }

    if (isLoading) {
        return (
            <div className="flex h-80 items-center justify-center text-white/70">
                Loading profile...
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-white/70">
                <p>Couldn't load this profile — the account may not exist.</p>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                >
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center pb-8 text-white">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="my-4 flex w-4/5 items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <div className="bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 w-4/5 lg:w-3/5 rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt=""
                                className="w-24 h-24 rounded-full object-cover ring-2 ring-white/20"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 ring-2 ring-white/20 flex items-center justify-center text-4xl font-semibold">
                                {initial}
                            </div>
                        )}

                        <div>
                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                                    {user.name || "Unnamed"}
                                </h1>
                                <span className="text-white/50 text-sm">
                                    @{user.username}
                                </span>
                            </div>
                            {user.bio && (
                                <p className="text-white/70 text-sm mt-2 max-w-md">
                                    {user.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isSelf ? (
                            <button
                                type="button"
                                onClick={() => navigate("/ProfilePage")}
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                            >
                                This is your profile — open editor
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleFollowToggle}
                                    disabled={followStatusLoading || isPending}
                                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                                >
                                    {isFollowing ? (
                                        <UserRoundCheck size={17} />
                                    ) : (
                                        <UserRoundPlus size={17} />
                                    )}
                                    {followStatusLoading || isPending
                                        ? "..."
                                        : isFollowing
                                          ? "Following"
                                          : "Follow"}
                                </button>

                                <button
                                    type="button"
                                    onClick={openChat}
                                    disabled={!isFollowing}
                                    title={
                                        isFollowing
                                            ? "Message"
                                            : "Follow this user to message them"
                                    }
                                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-40"
                                >
                                    <MessageCircle size={17} />
                                    Message
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center mt-6 pt-5 border-t border-white/10">
                    {tabs.map((label, i) => (
                        <div key={label} className="flex items-center">
                            {i > 0 && (
                                <span className="w-px h-10 bg-white/10 mx-4" />
                            )}
                            <button
                                type="button"
                                onClick={() => setTab(label)}
                                className={`flex min-w-[64px] flex-col items-center rounded-xl px-2 py-1 transition-colors hover:bg-white/10 ${tab === label ? "bg-white/10" : ""}`}
                            >
                                <span className="text-2xl font-bold">
                                    {stats[label.toLowerCase()] ?? 0}
                                </span>
                                <span className="text-white/50 text-xs uppercase tracking-wide">
                                    {label}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-4/5 lg:w-3/5 mt-6">
                <div className="mb-4 flex items-center gap-1 rounded-2xl bg-black/30 p-1.5">
                    {tabs.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setTab(item)}
                            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                tab === item
                                    ? "bg-white/20 text-white"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {tab === "Posts" && <PostGrid posts={data.posts ?? []} />}
                {tab === "Followers" && (
                    <PeopleList
                        people={data.followers ?? []}
                        emptyText="No followers yet."
                    />
                )}
                {tab === "Following" && (
                    <PeopleList
                        people={data.following ?? []}
                        emptyText="Not following anyone yet."
                    />
                )}
            </div>
        </div>
    );
}
