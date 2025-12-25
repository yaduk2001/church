import express, { Request, Response } from 'express';
import Thanksgiving from '../models/Thanksgiving';

const router = express.Router();

// Get all thanksgivings (admin only)
router.get('/admin', async (req: Request, res: Response) => {
    try {
        const thanksgivings = await Thanksgiving.find().sort({ createdAt: -1 });
        res.json(thanksgivings);
    } catch (error) {
        console.error('Error fetching thanksgivings:', error);
        res.status(500).json({ message: 'Error fetching thanksgivings', error });
    }
});

// Get approved thanksgivings (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const thanksgivings = await Thanksgiving.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(50);

        // Hide names if anonymous
        const maskedThanksgivings = thanksgivings.map(thanksgiving => ({
            ...thanksgiving.toObject(),
            name: thanksgiving.isAnonymous ? 'Anonymous' : thanksgiving.name,
            email: thanksgiving.isAnonymous ? '' : thanksgiving.email,
        }));

        res.json(maskedThanksgivings);
    } catch (error) {
        console.error('Error fetching thanksgivings:', error);
        res.status(500).json({ message: 'Error fetching thanksgivings', error });
    }
});

// Submit new thanksgiving
router.post('/', async (req: Request, res: Response) => {
    try {
        const thanksgiving = new Thanksgiving(req.body);
        const savedThanksgiving = await thanksgiving.save();
        res.status(201).json({
            message: 'Thanksgiving submitted successfully. It will be reviewed by admin.',
            thanksgiving: savedThanksgiving,
        });
    } catch (error) {
        console.error('Error submitting thanksgiving:', error);
        res.status(500).json({ message: 'Error submitting thanksgiving', error });
    }
});

// Update thanksgiving status (admin only)
router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'archived'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedThanksgiving = await Thanksgiving.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedThanksgiving) {
            return res.status(404).json({ message: 'Thanksgiving not found' });
        }

        res.json(updatedThanksgiving);
    } catch (error) {
        console.error('Error updating thanksgiving:', error);
        res.status(500).json({ message: 'Error updating thanksgiving', error });
    }
});

// Delete thanksgiving (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedThanksgiving = await Thanksgiving.findByIdAndDelete(req.params.id);

        if (!deletedThanksgiving) {
            return res.status(404).json({ message: 'Thanksgiving not found' });
        }

        res.json({ message: 'Thanksgiving deleted successfully' });
    } catch (error) {
        console.error('Error deleting thanksgiving:', error);
        res.status(500).json({ message: 'Error deleting thanksgiving', error });
    }
});

export default router;
