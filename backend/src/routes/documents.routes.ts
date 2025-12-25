import express, { Request, Response } from 'express';
import Document from '../models/Document';
import { authMiddleware } from '../middleware/auth';
import { documentUpload } from '../middleware/documentUpload';

const router = express.Router();

// Get all documents (Public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, tags } = req.query;

        const query: any = {};
        if (category) query.category = category;
        if (tags) query.tags = { $in: (tags as string).split(',') };

        const documents = await Document.find(query).sort({ uploadDate: -1 });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching documents', error });
    }
});

// Get document categories (Public)
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const categories = await Document.distinct('category');
        res.json(categories.sort());
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

// Upload new document (Admin only)
router.post('/', authMiddleware, documentUpload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description, category, tags, uploadDate } = req.body;

        // Parse tags if it's a string
        const tagsArray = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags;

        const document = new Document({
            title,
            description,
            fileName: req.file.originalname,
            fileUrl: `/uploads/documents/${req.file.filename}`,
            category,
            tags: tagsArray,
            uploadDate: uploadDate || new Date(),
        });

        const savedDocument = await document.save();
        res.status(201).json(savedDocument);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document', error });
    }
});

// Update document details (Admin only)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const updatedDocument = await Document.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json(updatedDocument);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Error updating document', error });
    }
});

// Delete document (Admin only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const deletedDocument = await Document.findByIdAndDelete(req.params.id);

        if (!deletedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document', error });
    }
});

export default router;
