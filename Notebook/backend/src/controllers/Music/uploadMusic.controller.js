import Music from "../../module/music.schema.js";
import config from "../../config/EVConfig.js";
import jwt from 'jsonwebtoken'
async function uploadMusic(req, res) {
    const { title, artist } = req.body
    console.log(req.body)
    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title is required"
        });
    }
    if (!req.files?.music) {
        return res.status(400).json({
            success: false,
            message: "Music file is required"
        });
    }
    const musicFile = req.files.music[0];
    const cover = req.files.coverImage ? req.files.coverImage[0] : null;
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
    try {
        let decoded = jwt.verify(accessToken, config.ACCESSTOKEN)

        const music = await Music.create({
            userId: decoded.id,
            title,
            artist,
            fileUrl: `/uploads/music/${musicFile.filename}`,
            coverImage: cover
                ? `/uploads/images/${cover.filename}`
                : ""
        });
        res.status(201).json({
            success: true,
            data: music
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export default uploadMusic