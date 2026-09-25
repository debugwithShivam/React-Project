import path from 'path';
import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

const extensionOfFile = (filename) => path.extname(filename || '').toLowerCase();

const fileFilter = (req, file, cb) => {
    const ext = extensionOfFile(file.originalname);
    if (!ALLOWED_MIME.includes(file.mimetype) || !ALLOWED_EXT.includes(ext)) {
        return cb(new Error('Only JPG, PNG, WEBP and PDF files are allowed'));
    }
    // Cross-check extension vs MIME to reject spoofed uploads.
    if (file.mimetype === 'application/pdf' && !ext.endsWith('.pdf')) {
        return cb(new Error('File extension does not match content type'));
    }
    if (!file.mimetype.includes('pdf') && ext === '.pdf') {
        return cb(new Error('File extension does not match content type'));
    }
    cb(null, true);
};

const commonLimits = {
    fileSize: 5 * 1024 * 1024,
    files: 10,
};

export const uploadDriverDocuments = multer({
    storage,
    fileFilter,
    limits: commonLimits,
}).fields([
    { name: 'dlFront', maxCount: 1 },
    { name: 'dlBack', maxCount: 1 },
    { name: 'rcFront', maxCount: 1 },
    { name: 'rcBack', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'insuranceFront', maxCount: 1 },
    { name: 'insuranceBack', maxCount: 1 },
]);

export const uploadSingleDocument = multer({
    storage,
    fileFilter,
    limits: commonLimits,
}).single('file');

export const uploadProfileImage = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = extensionOfFile(file.originalname);
        if (!file.mimetype.startsWith('image/') || !IMAGE_EXT.includes(ext)) {
            return cb(new Error('Only image files allowed (JPG, PNG, WEBP)'));
        }
        cb(null, true);
    },
    limits: { fileSize: 3 * 1024 * 1024, files: 1 },
}).single('profileImage');
