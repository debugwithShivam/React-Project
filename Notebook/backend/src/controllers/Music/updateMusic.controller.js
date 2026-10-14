async function updateMusic(req, res) {
    return res.status(501).json({
        success: false,
        message: "Track updates are not supported yet",
    });
}

export default updateMusic;
