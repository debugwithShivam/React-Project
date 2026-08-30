import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useUnreadMessages() {
    return useQuery({
        queryKey: ["unreadMessages"],

        queryFn: async () => {
            const response = await axios.get(
                `${VITE_API_URL}/authRouter/messages/unread`,
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        refetchOnWindowFocus: true,
    });
}