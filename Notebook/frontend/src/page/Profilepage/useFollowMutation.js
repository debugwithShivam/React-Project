import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import VITE_API_URL from "../../config/backend_API_URL";
export default function useFollowMutation() {
    const queryClient = useQueryClient();

    const followMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await axios.post(
                `${VITE_API_URL}/$authRouter/follow/${userId}`,
                {},
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({
                queryKey: ["follow-status", userId],
            });

            queryClient.invalidateQueries({
                queryKey: ["profile"],
            });
        },

        onError: (error) => {
            console.log(
                "Follow error:",
                error.response?.data || error.message
            );
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await axios.delete(
                `${VITE_API_URL}/$authRouter/unfollow/${userId}`,
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({
                queryKey: ["follow-status", userId],
            });

            queryClient.invalidateQueries({
                queryKey: ["profile"],
            });
        },

        onError: (error) => {
            console.log(
                "Unfollow error:",
                error.response?.data || error.message
            );
        },
    });

    return {
        followMutation,
        unfollowMutation,
    };
}
