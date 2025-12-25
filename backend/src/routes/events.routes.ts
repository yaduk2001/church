import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Db } from 'mongodb';

const router = Router();

// Interfaces
interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    createdAt: string;
    updatedAt: string;
}

interface EventCreate {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
}

// Helper to get db from request
const getDb = (req: Request): Db => {
    return (req as any).db;
};

// GET /api/events - Get all events
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb(req);

        const events = await db
            .collection('events')
            .find({}, { projection: { _id: 0 } })
            .sort({ date: 1 })
            .toArray();

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch events',
        });
    }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb(req);
        const { id } = req.params;

        const event = await db.collection('events').findOne(
            { id },
            { projection: { _id: 0 } }
        );

        if (!event) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Event not found',
            });
            return;
        }

        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch event',
        });
    }
});

// POST /api/events - Create new event
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb(req);
        const input: EventCreate = req.body;

        // Validation
        if (!input.title || !input.date || !input.time || !input.location) {
            res.status(400).json({
                error: 'Validation Error',
                message: 'Title, date, time, and location are required',
            });
            return;
        }

        const event: Event = {
            id: uuidv4(),
            title: input.title,
            description: input.description || '',
            date: input.date,
            time: input.time,
            location: input.location,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.collection('events').insertOne(event);

        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create event',
        });
    }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb(req);
        const { id } = req.params;
        const input: Partial<EventCreate> = req.body;

        const updateData: any = {
            ...input,
            updatedAt: new Date().toISOString(),
        };

        const result = await db.collection('events').findOneAndUpdate(
            { id },
            { $set: updateData },
            { returnDocument: 'after', projection: { _id: 0 } }
        );

        if (!result) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Event not found',
            });
            return;
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update event',
        });
    }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb(req);
        const { id } = req.params;

        const result = await db.collection('events').deleteOne({ id });

        if (result.deletedCount === 0) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Event not found',
            });
            return;
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete event',
        });
    }
});

export default router;
