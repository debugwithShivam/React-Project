import Music from "../../module/music.schema.js";
import config from "../../config/EVConfig.js";
import jwt from 'jsonwebtoken'
import cloudinary from "../../config/cloudinary.js";

function uploadBufferToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
}

async function uploadMusic(req, res) {
    const { title, artist } = req.body
    console.log(req.body)
    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Title is required"
        });
    }
    if (!req.files?.music?.[0]) {
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

         const musicResult = await uploadBufferToCloudinary(
            musicFile.buffer,
            {
                resource_type: "video",
                folder: "music-app/music",
            }
        );

        console.log("Music uploaded:", musicResult.secure_url);
        let coverUrl = "";

         if (cover) {
            const coverResult = await uploadBufferToCloudinary(
                cover.buffer,
                {
                    resource_type: "image",
                    folder: "music-app/images",
                }
            );

            coverUrl = coverResult.secure_url;
            console.log("Cover uploaded:", coverUrl);
        }

             const music = await Music.create({
            userId: req.user.id,
            title,
            artist,
            fileUrl: musicResult.secure_url,
            coverImage: coverUrl,
        });

          return res.status(201).json({
            success: true,
            data: music,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export default uploadMusic