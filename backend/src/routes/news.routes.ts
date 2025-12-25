import express, { Request, Response } from 'express';
import News from '../models/News';
import Notification from '../models/Notification';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all news (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, limit = 10 } = req.query;

        const query: any = { isActive: true };
        if (category) {
            query.category = category;
        }

        const news = await News.find(query)
            .sort({ isPinned: -1, publishDate: -1 })
            .limit(Number(limit));

        res.json(news);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching news', error });
    }
});

// Get all news (admin - includes inactive)
router.get('/admin', authMiddleware, async (req: Request, res: Response) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching news', error });
    }
});

// Get single news by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        res.json(news);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching news', error });
    }
});

// Increment views
router.put('/:id/views', async (req: Request, res: Response) => {
    try {
        const news = await News.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        res.json(news);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating views', error });
    }
});

// Create news (admin)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const news = new News(req.body);
        const savedNews = await news.save();

        // Create notification if active
        if (savedNews.isActive) {
            try {
                await Notification.create({
                    title: savedNews.title,
                    message: savedNews.excerpt || savedNews.content.substring(0, 100) + '...',
                    type: savedNews.category === 'event' ? 'event' : 'announcement',
                    priority: savedNews.isPinned ? 'high' : 'medium'
                });
            } catch (notifError) {
                console.error('Error creating notification for news:', notifError);
            }
        }

        res.status(201).json(savedNews);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating news', error });
    }
});

// Update news (admin)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const updatedNews = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedNews) {
            return res.status(404).json({ message: 'News not found' });
        }

        res.json(updatedNews);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating news', error });
    }
});

// Delete news (admin)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);

        if (!deletedNews) {
            return res.status(404).json({ message: 'News not found' });
        }

        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting news', error });
    }
});

export default router;
