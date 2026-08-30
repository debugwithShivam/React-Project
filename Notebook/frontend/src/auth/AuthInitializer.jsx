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
                    "https://react-project-qnnx.onrender.com/authRouter/check-auth",
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