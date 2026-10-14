import cloudinary from "../../config/cloudinary.js";
import userAuth from "../../module/User.js";

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

async function updateProfile(req, res) {
    try {
        const { name, username, bio } = req.body ?? {};
        const pictureFile = req.file;

        const updates = {};

        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty",
                });
            }
            updates.name = trimmedName;
        }

        if (username !== undefined) {
            const trimmedUsername = username.trim().toLowerCase();
            if (!trimmedUsername) {
                return res.status(400).json({
                    success: false,
                    message: "Username cannot be empty",
                });
            }

            const taken = await userAuth.findOne({ username: trimmedUsername });
            if (taken && taken._id.toString() !== req.user._id.toString()) {
                return res.status(409).json({
                    success: false,
                    message: "Username already taken",
                });
            }

            updates.username = trimmedUsername;
        }

        if (bio !== undefined) {
            updates.bio = bio.trim();
        }

        if (pictureFile) {
            const pictureResult = await uploadBufferToCloudinary(
                pictureFile.buffer,
                {
                    resource_type: "image",
                    folder: "notebook-app/avatars",
                }
            );

            updates.profilePicture = pictureResult.secure_url;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update",
            });
        }

        const user = await userAuth
            .findByIdAndUpdate(req.user._id, updates, { new: true })
            .select("_id name username email bio profilePicture");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export default updateProfile;
