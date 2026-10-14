import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import VITE_API_URL from "../../config/backend_API_URL";

export default function useConversations() {
    return useQuery({
        queryKey: ["conversations"],

        queryFn: async () => {
            const response = await axios.get(
                `${VITE_API_URL}/authRouter/conversations`,
                { withCredentials: true }
            );

            return response.data;
        },
    });
}
