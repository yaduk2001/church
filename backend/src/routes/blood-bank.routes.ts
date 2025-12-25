import express, { Request, Response } from 'express';
import BloodBank from '../models/BloodBank';
import { maskPhone, isEligibleToDonate } from '../utils/helpers';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all blood donors (Admin - Unmasked)
router.get('/admin', authMiddleware, async (req: Request, res: Response) => {
    try {
        const donors = await BloodBank.find().sort({ createdAt: -1 });
        res.json(donors);
    } catch (error) {
        console.error('Error fetching blood donors for admin:', error);
        res.status(500).json({ message: 'Error fetching blood donors', error });
    }
});

// Get all blood donors (Public - Masked)
router.get('/', async (req: Request, res: Response) => {
    try {
        const donors = await BloodBank.find({ isAvailable: true }).sort({ createdAt: -1 });

        // Mask phone numbers for privacy
        const maskedDonors = donors.map(donor => ({
            ...donor.toObject(),
            phone: maskPhone(donor.phone),
            email: donor.email.replace(/(.{3})(.*)(@.*)/, '$1***$3'), // Mask email too
        }));

        res.json(maskedDonors);
    } catch (error) {
        console.error('Error fetching blood donors:', error);
        res.status(500).json({ message: 'Error fetching blood donors', error });
    }
});

// Search donors by blood group
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { bloodGroup } = req.query;

        if (!bloodGroup) {
            return res.status(400).json({ message: 'Blood group is required' });
        }

        const donors = await BloodBank.find({
            bloodGroup: bloodGroup as string,
            isAvailable: true,
        }).sort({ lastDonation: 1 });

        // Filter eligible donors and mask sensitive info
        const eligibleDonors = donors
            .filter(donor => isEligibleToDonate(donor.lastDonation))
            .map(donor => ({
                ...donor.toObject(),
                phone: maskPhone(donor.phone),
                email: donor.email.replace(/(.{3})(.*)(@.*)/, '$1***$3'),
            }));

        res.json(eligibleDonors);
    } catch (error) {
        console.error('Error searching blood donors:', error);
        res.status(500).json({ message: 'Error searching blood donors', error });
    }
});

// Get blood bank statistics
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await BloodBank.aggregate([
            {
                $group: {
                    _id: '$bloodGroup',
                    count: { $sum: 1 },
                    available: {
                        $sum: { $cond: ['$isAvailable', 1, 0] },
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        const totalDonors = await BloodBank.countDocuments();
        const availableDonors = await BloodBank.countDocuments({ isAvailable: true });

        res.json({
            byBloodGroup: stats,
            totalDonors,
            availableDonors,
        });
    } catch (error) {
        console.error('Error fetching blood bank stats:', error);
        res.status(500).json({ message: 'Error fetching blood bank stats', error });
    }
});

// Register new blood donor
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const donor = new BloodBank(req.body);
        const savedDonor = await donor.save();

        res.status(201).json({
            message: 'Blood donor registered successfully',
            donor: {
                ...savedDonor.toObject(),
                phone: maskPhone(savedDonor.phone),
            },
        });
    } catch (error) {
        console.error('Error registering blood donor:', error);
        res.status(500).json({ message: 'Error registering blood donor', error });
    }
});

// Update donor information
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const updatedDonor = await BloodBank.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedDonor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        res.json(updatedDonor);
    } catch (error) {
        console.error('Error updating donor:', error);
        res.status(500).json({ message: 'Error updating donor', error });
    }
});

// Delete donor
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const deletedDonor = await BloodBank.findByIdAndDelete(req.params.id);

        if (!deletedDonor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        res.json({ message: 'Donor deleted successfully' });
    } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).json({ message: 'Error deleting donor', error });
    }
});

export default router;
