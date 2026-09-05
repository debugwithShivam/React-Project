import Music from "../../module/music.schema.js";
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
    try {
        const { title, artist } = req.body;

        if (!title || !artist) {
            return res.status(400).json({
                success: false,
                message: "Title and artist are required"
            });
        }

        const musicFile = req.files?.music?.[0];
        const coverFile = req.files?.coverImage?.[0];

        if (!musicFile) {
            return res.status(400).json({
                success: false,
                message: "Music file is required"
            });
        }

        if (!coverFile) {
            return res.status(400).json({
                success: false,
                message: "Cover image is required"
            });
        }

        const musicResult = await uploadBufferToCloudinary(
            musicFile.buffer,
            {
                resource_type: "video",
                folder: "music-app/music",
            }
        );

        const coverResult = await uploadBufferToCloudinary(
            coverFile.buffer,
            {
                resource_type: "image",
                folder: "music-app/images",
            }
        );

        const music = await Music.create({
            userId: req.user.id,
            title,
            artist,
            fileUrl: musicResult.secure_url,
            coverImage: coverResult.secure_url,
        });

        return res.status(201).json({
            success: true,
            data: music,
        });

    } catch (error) {
        console.error("Upload music error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export default uploadMusic;