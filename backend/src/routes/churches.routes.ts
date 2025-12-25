import express, { Request, Response } from 'express';
import Church from '../models/Church';

const router = express.Router();

// Get all churches
router.get('/', async (req: Request, res: Response) => {
    try {
        const churches = await Church.find().sort({ createdAt: -1 });
        res.json(churches);
    } catch (error) {
        console.error('Error fetching churches:', error);
        res.status(500).json({ message: 'Error fetching churches', error });
    }
});

// Get single church by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const church = await Church.findById(req.params.id);

        if (!church) {
            return res.status(404).json({ message: 'Church not found' });
        }

        res.json(church);
    } catch (error) {
        console.error('Error fetching church:', error);
        return res.status(500).json({ message: 'Error fetching church', error });
    }
});

// Create new church
router.post('/', async (req: Request, res: Response) => {
    try {
        const church = new Church(req.body);
        const savedChurch = await church.save();
        res.status(201).json(savedChurch);
    } catch (error) {
        console.error('Error creating church:', error);
        res.status(500).json({ message: 'Error creating church', error });
    }
});

// Update church
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updatedChurch = await Church.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedChurch) {
            return res.status(404).json({ message: 'Church not found' });
        }

        res.json(updatedChurch);
    } catch (error) {
        console.error('Error updating church:', error);
        return res.status(500).json({ message: 'Error updating church', error });
    }
});

// Delete church
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedChurch = await Church.findByIdAndDelete(req.params.id);

        if (!deletedChurch) {
            return res.status(404).json({ message: 'Church not found' });
        }

        res.json({ message: 'Church deleted successfully' });
    } catch (error) {
        console.error('Error deleting church:', error);
        return res.status(500).json({ message: 'Error deleting church', error });
    }
});

export default router;
