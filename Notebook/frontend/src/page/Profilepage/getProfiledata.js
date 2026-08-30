import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import VITE_API_URL from "../../config/backend_API_URL";
export function getProfileData(){
     return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await axios.get(
                `${VITE_API_URL}/authRouter/profile`,
                { withCredentials: true }
            );
            return response.data;
        },
        staleTime: 0,
        refetchOnMount: true,
    });
}