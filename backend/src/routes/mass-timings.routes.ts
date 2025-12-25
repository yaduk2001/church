import express, { Request, Response } from 'express';
import MassTiming from '../models/MassTiming';

const router = express.Router();

// Get all mass timings
router.get('/', async (req: Request, res: Response) => {
    try {
        const massTimings = await MassTiming.find({ isActive: true })
            .populate('churchId', 'name')
            .sort({ day: 1, time: 1 });
        res.json(massTimings);
    } catch (error) {
        console.error('Error fetching mass timings:', error);
        res.status(500).json({ message: 'Error fetching mass timings', error });
    }
});

// Get mass timings by church ID
router.get('/church/:churchId', async (req: Request, res: Response) => {
    try {
        const massTimings = await MassTiming.find({
            churchId: req.params.churchId,
            isActive: true,
        }).sort({ day: 1, time: 1 });

        res.json(massTimings);
    } catch (error) {
        console.error('Error fetching mass timings:', error);
        res.status(500).json({ message: 'Error fetching mass timings', error });
    }
});

// Create new mass timing
router.post('/', async (req: Request, res: Response) => {
    try {
        const massTiming = new MassTiming(req.body);
        const savedMassTiming = await massTiming.save();
        res.status(201).json(savedMassTiming);
    } catch (error) {
        console.error('Error creating mass timing:', error);
        res.status(500).json({ message: 'Error creating mass timing', error });
    }
});

// Update mass timing
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updatedMassTiming = await MassTiming.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedMassTiming) {
            return res.status(404).json({ message: 'Mass timing not found' });
        }

        res.json(updatedMassTiming);
    } catch (error) {
        console.error('Error updating mass timing:', error);
        res.status(500).json({ message: 'Error updating mass timing', error });
    }
});

// Delete mass timing
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedMassTiming = await MassTiming.findByIdAndDelete(req.params.id);

        if (!deletedMassTiming) {
            return res.status(404).json({ message: 'Mass timing not found' });
        }

        res.json({ message: 'Mass timing deleted successfully' });
    } catch (error) {
        console.error('Error deleting mass timing:', error);
        res.status(500).json({ message: 'Error deleting mass timing', error });
    }
});

export default router;
