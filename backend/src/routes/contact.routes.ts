import express from 'express';
import Contact from '../models/Contact';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Submit a new contact message (Public)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        const contact = new Contact({
            name,
            email,
            subject,
            message,
            status: 'new',
        });

        await contact.save();

        res.status(201).json({
            message: 'Thank you for contacting us! We will get back to you soon.',
            id: contact._id,
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ message: 'Failed to submit contact form' });
    }
});

// Get all contact messages (Admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status } = req.query;

        const filter: any = {};
        if (status && (status === 'new' || status === 'read' || status === 'responded')) {
            filter.status = status;
        }

        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Failed to fetch contacts' });
    }
});

// Update contact status (Admin only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (status !== 'new' && status !== 'read' && status !== 'responded') {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json({ message: 'Status updated successfully', contact });
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({ message: 'Failed to update status' });
    }
});

// Delete contact (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: 'Failed to delete contact' });
    }
});

export default router;
