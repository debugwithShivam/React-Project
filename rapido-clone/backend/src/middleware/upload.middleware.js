import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, WEBP and PDF files are allowed'));
    }
};

export const uploadDriverDocuments = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).fields([
    { name: 'dlFront', maxCount: 1 },
    { name: 'dlBack', maxCount: 1 },

    { name: 'rcFront', maxCount: 1 },
    { name: 'rcBack', maxCount: 1 },

    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },

    { name: 'insuranceFront', maxCount: 1 },
    { name: 'insuranceBack', maxCount: 1 }
]);