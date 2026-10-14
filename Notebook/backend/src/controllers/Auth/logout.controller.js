const cookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
};

async function logout(req, res) {
    try {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default logout;
