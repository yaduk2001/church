import express, { Request, Response } from 'express';
import Notification from '../models/Notification';

const router = express.Router();

// Get active notifications
router.get('/', async (req: Request, res: Response) => {
    try {
        const now = new Date();

        const notifications = await Notification.find({
            isActive: true,
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: null },
                { expiryDate: { $gte: now } },
            ],
        }).sort({ priority: -1, createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
});

// Get all notifications (admin)
router.get('/admin', async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
});

// Create new notification
router.post('/', async (req: Request, res: Response) => {
    try {
        const notification = new Notification(req.body);
        const savedNotification = await notification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Error creating notification', error });
    }
});

// Update notification
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updatedNotification = await Notification.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(updatedNotification);
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Error updating notification', error });
    }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(req.params.id);

        if (!deletedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error deleting notification', error });
    }
});

export default router;
