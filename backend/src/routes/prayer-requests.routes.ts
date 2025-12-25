import express, { Request, Response } from 'express';
import PrayerRequest from '../models/PrayerRequest';
import { maskPhone } from '../utils/helpers';

const router = express.Router();

// Get all prayer requests (admin only - includes all statuses)
router.get('/admin', async (req: Request, res: Response) => {
    try {
        const prayerRequests = await PrayerRequest.find().sort({ createdAt: -1 });
        res.json(prayerRequests);
    } catch (error) {
        console.error('Error fetching prayer requests:', error);
        res.status(500).json({ message: 'Error fetching prayer requests', error });
    }
});

// Get approved prayer requests (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const prayerRequests = await PrayerRequest.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(50);

        // Mask phone numbers and hide names if anonymous
        const maskedRequests = prayerRequests.map(request => ({
            ...request.toObject(),
            name: request.isAnonymous ? 'Anonymous' : request.name,
            email: request.isAnonymous ? '' : request.email,
            phone: maskPhone(request.phone),
        }));

        res.json(maskedRequests);
    } catch (error) {
        console.error('Error fetching prayer requests:', error);
        res.status(500).json({ message: 'Error fetching prayer requests', error });
    }
});

// Submit new prayer request
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, email, phone, request, isAnonymous } = req.body;

        // Validation
        if (!name || !email || !phone || !request) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (request.length < 10 || request.length > 1000) {
            return res.status(400).json({
                message: 'Prayer request must be between 10 and 1000 characters'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        // Phone validation (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, '').replace(/-/g, '').replace(/\+/g, ''))) {
            return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits' });
        }

        const prayerRequest = new PrayerRequest({
            name,
            email,
            phone,
            request,
            isAnonymous: isAnonymous || false,
        });

        const savedRequest = await prayerRequest.save();
        res.status(201).json({
            message: 'Prayer request submitted successfully. It will be reviewed by admin.',
            request: {
                _id: savedRequest._id,
                createdAt: savedRequest.createdAt
            },
        });
    } catch (error) {
        console.error('Error submitting prayer request:', error);
        res.status(500).json({ message: 'Error submitting prayer request', error });
    }
});

// Update prayer request status (admin only)
router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'archived'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedRequest = await PrayerRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Prayer request not found' });
        }

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating prayer request:', error);
        res.status(500).json({ message: 'Error updating prayer request', error });
    }
});

// Delete prayer request (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedRequest = await PrayerRequest.findByIdAndDelete(req.params.id);

        if (!deletedRequest) {
            return res.status(404).json({ message: 'Prayer request not found' });
        }

        res.json({ message: 'Prayer request deleted successfully' });
    } catch (error) {
        console.error('Error deleting prayer request:', error);
        res.status(500).json({ message: 'Error deleting prayer request', error });
    }
});

export default router;
