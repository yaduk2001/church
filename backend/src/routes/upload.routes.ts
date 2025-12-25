import express, { Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Upload single image
// POST /api/upload
router.post('/', authMiddleware, upload.single('image'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the accessible URL
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file', error });
    }
});

export default router;
