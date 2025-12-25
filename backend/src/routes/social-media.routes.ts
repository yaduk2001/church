import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import SocialMedia from '../models/SocialMedia';

const router = express.Router();

// Get all social media links (Public)
router.get('/', async (req: Request, res: Response) => {
    try {
        // Return all, let frontend filter by isActive if needed, or filter here.
        // Usually footer wants active ones.
        const links = await SocialMedia.find({ isActive: true });
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching social media links', error });
    }
});

// Get all for admin (including inactive)
router.get('/admin', authMiddleware, async (req: Request, res: Response) => {
    try {
        const links = await SocialMedia.find({});
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching social media links', error });
    }
});

// Upsert (Create or Update) social media link
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { platform, url, icon, isActive } = req.body;

        // Find by platform and update, or create if not exists
        const updatedLink = await SocialMedia.findOneAndUpdate(
            { platform },
            { url, icon, isActive },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(updatedLink);
    } catch (error) {
        res.status(500).json({ message: 'Error updating social media link', error });
    }
});

// Delete social media link
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        await SocialMedia.findByIdAndDelete(req.params.id);
        res.json({ message: 'Social media link deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting link', error });
    }
});

export default router;
