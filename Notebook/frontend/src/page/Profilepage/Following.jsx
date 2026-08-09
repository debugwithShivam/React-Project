import React from "react";
import { getProfileData } from "./getProfiledata";
import { MessageCircle } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import useFollowMutation from './useFollowMutation'

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
  const { data, isLoading, isError } = getProfileData();
  const { unfollowMutation } = useFollowMutation();

  if (isLoading) {
    return (
      <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 flex items-center justify-center">
        <p className="text-gray-300">Loading following...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 flex items-center justify-center">
        <p className="text-red-400">Failed to load following.</p>
      </div>
    );
  }

  const following = data?.following ?? [];




  return (
    <div className="w-4/5 lg:w-3/5 m-4 h-80 md:h-45 lg:h-88 overflow-y-auto scrollbar-thin">

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
              key={person.id || person._id || person.username}
              className="
                                m-2 p-2
                                rounded-2xl
                                bg-white/25
                                backdrop-blur-sm
                                flex items-center justify-between
                                gap-3
                            "
            >
              {/* User information */}
              <div className="flex items-center gap-3 min-w-0">

                {/* Avatar */}
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

                {/* Name + username */}
                <div className="min-w-0">
                  <h2 className="font-semibold truncate">
                    {person?.name}
                  </h2>

                  <h3 className="text-sm text-gray-400 truncate">
                    {person?.username}
                  </h3>
                </div>
              </div>

              {/* Follow button */}
              <div className="flex justify-center items-center gap-3">

                <button
                  onClick={() => {
                    unfollowMutation.mutate(person._id);
                  }}
                  className="
                                shrink-0
                                border-1
                                h-10
                                px-4
                                flex items-center justify-center
                                gap-2
                                rounded-full
                                bg-white/45
                                hover:opacity-90
                                active:scale-95
                                transition
                                "
                >
                  <span>{unfollowMutation.isPending
                    ? "..."
                    : "Following"}</span>
                </button>
                <div className="flex justify-center items-center w-10 bg-white/24 rounded-full border-2 h-10 mr-2">
                  <MessageCircle size={18} />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

