import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setIsAuthenticated } from "../Redux/Slice";

export default function AuthInitializer() {
    const dispatch = useDispatch();

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await axios.get(
                    "http://localhost:5000/authRouter/check-auth",
                    {
                        withCredentials: true,
                    }
                );

                dispatch(
                    setIsAuthenticated(
                        response.data.authenticated
                    )
                );

            } catch (error) {
                console.log("Auth check failed:", error);

                dispatch(setIsAuthenticated(false));
            }
        }

        checkAuth();
    }, [dispatch]);

    return null;
}