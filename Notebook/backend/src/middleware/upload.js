import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
});

const imageUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed"));
            return;
        }
        cb(null, true);
    },
});

function uploadImage(field, label) {
    return (req, res, next) => {
        imageUpload.single(field)(req, res, (error) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.code === "LIMIT_FILE_SIZE"
                        ? `${label} must be smaller than 5 MB`
                        : `${label}: ${error.message}`,
                });
            }

            next();
        });
    };
}

export const uploadAvatar = uploadImage("profilePicture", "Profile picture");

export const uploadPostMedia = uploadImage("media", "Post image");

export default upload;
