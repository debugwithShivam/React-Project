import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = 'http://localhost:5000'

const getPlayList = async () => {
    try {
        const response = await axios.get(`${API_BASE}/authRouter/getMusic`, { withCredentials: true })
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
