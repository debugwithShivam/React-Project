import React from 'react'
import axios from 'axios'
import { SearchIcon, Search, X, UserRound } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

export default function UserSearchResult({ user }) {

    const queryClient = useQueryClient()
    const { data: isFollowing = false, isLoading: followStatusLoading, } = useQuery({
        queryKey: ['follow-status', user._id],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:5000/authRouter/follow-status/${user._id}`, { withCredentials: true });
            return response.data.following;
        }
    })

    const followMutation = useMutation({
        mutationFn: (userId) => axios.post(`http://localhost:5000/authRouter/follow/${userId}`, {}, { withCredentials: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['follow-status', user._id]
            });
        },
        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: ["follow-status", user._id],
            });

            const previousStatus = queryClient.getQueryData([
                "follow-status",
                user._id,
            ]);

            queryClient.setQueryData(
                ["follow-status", user._id],
                true
            );

            return { previousStatus };
        },

        onError: (error, variables, context) => {
            queryClient.setQueryData(
                ["follow-status", user._id],
                context.previousStatus
            );

            console.log(
                "Follow error:",
                error.response?.data || error.message
            );
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["follow-status", user._id],
            });
        },
    });

    const unFollowMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`http://localhost:5000/authRouter/unfollow/${user._id}`,
                {
                    withCredentials: true,
                });
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['follow-status', user._id]
            });
        },

        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: ["follow-status", user._id],
            });

            const previousStatus = queryClient.getQueryData([
                "follow-status",
                user._id,
            ]);

            queryClient.setQueryData(
                ["follow-status", user._id],
                false
            );

            return { previousStatus };
        },

        onError: (error, variables, context) => {
            queryClient.setQueryData(
                ["follow-status", user._id],
                context.previousStatus
            );

            console.log(
                "Unfollow error:",
                error.response?.data || error.message
            );
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["follow-status", user._id],
            });
        },
    })

    const isPending = followMutation.isPending || unFollowMutation.isPending;
    function handleFollowClick() {
        if (isFollowing) {
            unFollowMutation.mutate()
        } else {
            followMutation.mutate(user._id)
        }
    }

    return (
        <div className=" group flex items-center justify-between rounded-2xl border border-white/55 bg-[#FFF9F4]/80 p-4 shadow-md shadow-black/8 backdrop-blur-xl transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#FFF9F4] hover:shadow-xl" >

            <div className="flex items-center gap-3">
                <div
                    className=" flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D9C2A8] to-[#745269] shadow-md ">
                    <UserRound
                        size={22}
                        className="text-white"
                    />
                </div>


                <div>
                    <h3 className="font-semibold text-[#241B24]  ">
                        {user.name}
                    </h3>

                    <p className="mt-0.5  text-sm  text-[#75636E] ">
                        @{user.username}
                    </p>
                </div>

            </div>
            <div className='flex gap-5'>
                <button className=" rounded-xl bg-[#493347] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#352433] active:scale-95">
                    View
                </button>
                <button
                    onClick={handleFollowClick}
                    disabled={followStatusLoading || isPending}
                    className="rounded-xl bg-[#493347] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#352433] active:scale-95 ">
                    {followStatusLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
            </div>

        </div>
    )
}
