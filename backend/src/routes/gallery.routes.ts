import express, { Request, Response } from 'express';
import Gallery from '../models/Gallery';
import Notification from '../models/Notification';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all gallery images
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        const query = category ? { category } : {};
        const images = await Gallery.find(query).sort({ createdAt: -1 });

        res.json(images);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({ message: 'Error fetching gallery images', error });
    }
});

// Get gallery categories
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const categories = await Gallery.distinct('category');
        res.json(categories.sort());
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

// Upload new image
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const image = new Gallery(req.body);
        const savedImage = await image.save();

        // Create notification
        try {
            await Notification.create({
                title: 'New Gallery Photo',
                message: `A new photo has been added to the ${savedImage.category} gallery.`,
                type: 'event', // Changed to event for photos
                priority: 'medium'
            });
        } catch (notifError) {
            console.error('Error creating notification for gallery image:', notifError);
            // Don't fail the request if notification fails
        }

        res.status(201).json(savedImage);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image', error });
    }
});

// Update image details
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const updatedImage = await Gallery.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedImage) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json(updatedImage);
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ message: 'Error updating image', error });
    }
});

// Delete image
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const deletedImage = await Gallery.findByIdAndDelete(req.params.id);

        if (!deletedImage) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image', error });
    }
});

export default router;
