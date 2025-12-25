import express from 'express';
import HeroSlider from '../models/HeroSlider';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public route - Get active slider images
router.get('/', async (req, res) => {
    try {
        const sliders = await HeroSlider.find({ isActive: true })
            .sort({ displayOrder: 1 })
            .select('-__v');
        res.json(sliders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin route - Get all slider images
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        const sliders = await HeroSlider.find()
            .sort({ displayOrder: 1 })
            .select('-__v');
        res.json(sliders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new slider image
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { imageUrl, displayOrder, isActive } = req.body;

        // Check if we already have 5 images
        const count = await HeroSlider.countDocuments();
        if (count >= 5) {
            return res.status(400).json({ message: 'Maximum 5 slider images allowed' });
        }

        const slider = new HeroSlider({
            imageUrl,
            displayOrder: displayOrder || count,
            isActive: isActive !== undefined ? isActive : true
        });

        await slider.save();
        res.status(201).json(slider);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update slider image
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { imageUrl, displayOrder, isActive } = req.body;

        const slider = await HeroSlider.findByIdAndUpdate(
            req.params.id,
            { imageUrl, displayOrder, isActive },
            { new: true }
        );

        if (!slider) {
            return res.status(404).json({ message: 'Slider not found' });
        }

        res.json(slider);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete slider image
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const slider = await HeroSlider.findByIdAndDelete(req.params.id);

        if (!slider) {
            return res.status(404).json({ message: 'Slider not found' });
        }

        res.json({ message: 'Slider deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
