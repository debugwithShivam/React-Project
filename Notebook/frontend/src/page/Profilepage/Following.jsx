import React from "react";
import { useProfileData } from "./getProfiledata";
import { Eye, MessageCircle } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import useFollowMutation from './useFollowMutation'
import { useDispatch } from "react-redux";
import { setSelecUser } from "../../Redux/Slice";
import { Link } from "react-router-dom";
import axios from "axios";
import useUnreadMessages from './useUnreadMessages'

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

export default function Following() {
  const { data: unreadData } = useUnreadMessages();
  const { data, isLoading, isError } = useProfileData();
  const { unfollowMutation } = useFollowMutation();
  const dispatch = useDispatch();

  const unreadBySender = new Map(
    (unreadData?.data ?? []).map((item) => [String(item._id.sender), item.count])
  );

  if (isLoading) {
    return (
      <div className="w-4/5 lg:w-3/5 m-4 min-h-[300px] flex items-center justify-center">
        <p className="text-gray-300">Loading following...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-4/5 lg:w-3/5 m-4 min-h-[300px] flex items-center justify-center">
        <p className="text-red-400">Failed to load following.</p>
      </div>
    );
  }

  const following = data?.following ?? [];

  return (
    <div className="w-4/5 lg:w-3/5 m-4 min-h-[300px] pb-4">

      {following.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400">
            Not following anyone yet.
          </p>
        </div>
      ) : (
        following.map((person, index) => {
          const initial = (
            person?.name ||
            person?.username ||
            "A"
          )[0].toUpperCase();

          return (
            <div
              key={person?.id || person?._id || person?.username}
              className="
                                m-2 p-2
                                rounded-2xl
                                bg-white/25
                                backdrop-blur-sm
                                flex items-center justify-between
                                gap-3
                            "
            >
              <div className="flex items-center gap-3 min-w-0">
                {person?.profilePicture ? (
                  <img
                    src={person.profilePicture}
                    alt=""
                    className="w-12 h-12 shrink-0 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div
                    className={`
                                        w-12 h-12
                                        shrink-0
                                        flex items-center justify-center
                                        rounded-full
                                        border-2 border-white/30
                                        text-xl font-semibold
                                        text-white
                                        ${avatarColors[index % avatarColors.length]}
                                    `}
                  >
                    {initial}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="font-semibold truncate">
                    {person?.name}
                  </h2>

                  <h3 className="text-sm text-gray-400 truncate">
                    {person?.username}
                  </h3>
                </div>
              </div>

              <div className="flex justify-center items-center gap-3">

                <Link
                  to={`/UserProfile/${person?._id}`}
                  title="View profile"
                  className="
                                shrink-0
                                border-1
                                h-10
                                px-4
                                flex items-center justify-center
                                gap-2
                                rounded-full
                                bg-white/45
                                hover:bg-indigo-500/70
                                active:scale-95
                                transition
                                "
                >
                  <Eye size={16} />
                  <span>View</span>
                </Link>

                <button
                  onClick={() => {
                    unfollowMutation.mutate(person?._id);
                  }}
                  title="Unfollow"
                  className="
                                shrink-0
                                border-1
                                h-10
                                px-4
                                flex items-center justify-center
                                gap-2
                                rounded-full
                                bg-white/45
                                hover:bg-red-500/70
                                active:scale-95
                                transition
                                "
                >
                  <span>{unfollowMutation.isPending && String(unfollowMutation.variables) === String(person?._id)
                    ? "..."
                    : "Unfollow"}</span>
                </button>
                <Link to='/ChatSeaction'>
                  <div
                    onClick={() => {
                      dispatch(setSelecUser(person));
                    }}
                    className="relative flex justify-center items-center w-10 bg-white/24 rounded-full border-2 h-10 mr-2"
                  >
                    <MessageCircle size={18} />
                    {unreadBySender.get(String(person?._id)) > 0 && (
                      <span
                        className="
                    absolute
                    -top-2
                    -right-2
                    min-w-5
                    h-5
                    px-1
                    rounded-full
                    bg-red-500
                    text-white
                    text-xs
                    font-bold
                    flex
                    items-center
                    justify-center
                "
                      >
                        {unreadBySender.get(String(person?._id)) > 99
                          ? "99+"
                          : unreadBySender.get(String(person?._id))}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

