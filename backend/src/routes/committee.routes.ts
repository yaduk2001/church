import express, { Request, Response } from 'express';
import CommitteeMember from '../models/CommitteeMember';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all committee members (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const members = await CommitteeMember.find({ isActive: true })
            .sort({ displayOrder: 1, position: 1 });

        res.json(members);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching committee members', error });
    }
});

// Get all committee members (admin - includes inactive)
router.get('/admin', authMiddleware, async (req: Request, res: Response) => {
    try {
        const members = await CommitteeMember.find().sort({ displayOrder: 1 });
        res.json(members);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching committee members', error });
    }
});

// Get single committee member
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const member = await CommitteeMember.findById(req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Committee member not found' });
        }

        res.json(member);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching committee member', error });
    }
});

// Create committee member (admin)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const member = new CommitteeMember(req.body);
        const savedMember = await member.save();
        res.status(201).json(savedMember);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating committee member', error });
    }
});

// Update committee member (admin)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const updatedMember = await CommitteeMember.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedMember) {
            return res.status(404).json({ message: 'Committee member not found' });
        }

        res.json(updatedMember);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating committee member', error });
    }
});

// Delete committee member (admin)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const deletedMember = await CommitteeMember.findByIdAndDelete(req.params.id);

        if (!deletedMember) {
            return res.status(404).json({ message: 'Committee member not found' });
        }

        res.json({ message: 'Committee member deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting committee member', error });
    }
});

export default router;
