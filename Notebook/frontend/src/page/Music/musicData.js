import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import VITE_API_URL from "../../config/backend_API_URL";

const getPlayList = async () => {
    try {
        const response = await axios.get(`${VITE_API_URL}/authRouter/getMusic`, { withCredentials: true })
        return response.data.data
    } catch (error) {
        console.log(error)
        return []
    }
}

export function useMusic() {
    return useQuery({
        queryKey: ["insertMusic"],
        queryFn: getPlayList,
    });
}
