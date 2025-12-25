import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists for documents
const documentsDir = path.join(__dirname, '../../public/uploads/documents');
if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
}

// Storage configuration for documents
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, documentsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'doc-' + uniqueSuffix + ext);
    }
});

// File filter for documents
const documentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        cb(null, true);
    } else {
        cb(new Error('Only document files are allowed (PDF, DOC, DOCX, XLS, XLSX, TXT)'));
    }
};

export const documentUpload = multer({
    storage: documentStorage,
    fileFilter: documentFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
