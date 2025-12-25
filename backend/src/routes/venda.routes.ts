import express, { Request, Response } from 'express';
import Venda from '../models/Venda';

const router = express.Router();

// Get all offerings (admin only)
router.get('/admin', async (req: Request, res: Response) => {
    try {
        const offerings = await Venda.find().sort({ date: -1 });
        res.json(offerings);
    } catch (error) {
        console.error('Error fetching offerings:', error);
        res.status(500).json({ message: 'Error fetching offerings', error });
    }
});

// Get offering statistics (admin only)
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await Venda.aggregate([
            {
                $group: {
                    _id: '$purpose',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { totalAmount: -1 },
            },
        ]);

        const totalOfferings = await Venda.countDocuments();
        const totalAmount = await Venda.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);

        res.json({
            byPurpose: stats,
            totalOfferings,
            totalAmount: totalAmount[0]?.total || 0,
        });
    } catch (error) {
        console.error('Error fetching offering stats:', error);
        res.status(500).json({ message: 'Error fetching offering stats', error });
    }
});

// Submit new offering
router.post('/', async (req: Request, res: Response) => {
    try {
        const offering = new Venda(req.body);
        const savedOffering = await offering.save();

        res.status(201).json({
            message: 'Offering recorded successfully',
            offering: savedOffering,
            receiptNumber: savedOffering.receiptNumber,
        });
    } catch (error) {
        console.error('Error submitting offering:', error);
        res.status(500).json({ message: 'Error submitting offering', error });
    }
});

// Get offering by receipt number
router.get('/receipt/:receiptNumber', async (req: Request, res: Response) => {
    try {
        const offering = await Venda.findOne({ receiptNumber: req.params.receiptNumber });

        if (!offering) {
            return res.status(404).json({ message: 'Offering not found' });
        }

        // Hide donor name if anonymous
        const response = {
            ...offering.toObject(),
            donorName: offering.isAnonymous ? 'Anonymous' : offering.donorName,
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching offering:', error);
        res.status(500).json({ message: 'Error fetching offering', error });
    }
});

// Delete offering (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedOffering = await Venda.findByIdAndDelete(req.params.id);

        if (!deletedOffering) {
            return res.status(404).json({ message: 'Offering not found' });
        }

        res.json({ message: 'Offering deleted successfully' });
    } catch (error) {
        console.error('Error deleting offering:', error);
        res.status(500).json({ message: 'Error deleting offering', error });
    }
});

export default router;
