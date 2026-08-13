import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useFollowStatus(userId) {
    return useQuery({
        queryKey: ["follow-status", userId],

        queryFn: async () => {
            const response = await axios.get(
                `http://localhost:5000/authRouter/follow-status/${userId}`,
                {
                    withCredentials: true,
                }
            );

            return response.data.following;
        },

        enabled: !!userId,
    });
}