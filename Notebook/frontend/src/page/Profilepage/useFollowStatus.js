import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import VITE_API_URL from "../../config/backend_API_URL";
export default function useFollowStatus(userId) {
    return useQuery({
        queryKey: ["follow-status", userId],

        queryFn: async () => {
            const response = await axios.get(
                `${VITE_API_URL}/authRouter/follow-status/${userId}`,
                {
                    withCredentials: true,
                }
            );

            return response.data.following;
        },

        enabled: !!userId,
    });
}