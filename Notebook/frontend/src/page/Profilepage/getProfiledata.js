import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export function getProfileData(){
     return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await axios.get(
                "http://localhost:5000/authRouter/profile",
                { withCredentials: true }
            );
            return response.data;
        },
        staleTime: 0,
        refetchOnMount: true,
    });
}