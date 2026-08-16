import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useUnreadMessages() {
    return useQuery({
        queryKey: ["unreadMessages"],

        queryFn: async () => {
            const response = await axios.get(
                "http://localhost:5000/authRouter/messages/unread",
                {
                    withCredentials: true,
                }
            );

            return response.data;
        },

        refetchOnWindowFocus: true,
    });
}