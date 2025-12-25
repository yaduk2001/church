import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Db } from 'mongodb';

const router = Router();

// Interfaces
interface StatusCheck {
    id: string;
    client_name: string;
    timestamp: string;
}

interface StatusCheckCreate {
    client_name: string;
}

// Helper to get db from request
const getDb = (req: Request): Db => {
    return (req as any).db;
};

// GET /api - Root API endpoint
router.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Hello World' });
});

// POST /api/status - Create a status check
router.post('/status', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb(req);
        const input: StatusCheckCreate = req.body;

        if (!input.client_name) {
            res.status(400).json({
                error: 'Validation Error',
                message: 'client_name is required',
            });
            return;
        }

        const statusCheck: StatusCheck = {
            id: uuidv4(),
            client_name: input.client_name,
            timestamp: new Date().toISOString(),
        };

        await db.collection('status_checks').insertOne(statusCheck);

        res.status(201).json(statusCheck);
    } catch (error) {
        console.error('Error creating status check:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create status check',
        });
    }
});

// GET /api/status - Get all status checks
router.get('/status', async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb(req);

        const statusChecks = await db
            .collection('status_checks')
            .find({}, { projection: { _id: 0 } })
            .limit(1000)
            .toArray();

        res.json(statusChecks);
    } catch (error) {
        console.error('Error fetching status checks:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch status checks',
        });
    }
});

export default router;
