import express, { Request, Response } from 'express';
import LiveStream from '../models/LiveStream';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get active live stream (public)
router.get('/active', async (req: Request, res: Response) => {
    try {
        const activeStream = await LiveStream.findOne({ isLive: true });
        res.json(activeStream);
    } catch (error) {
        console.error('Error fetching active stream:', error);
        res.status(500).json({ message: 'Error fetching active stream', error });
    }
});

// Get all published videos (public)
router.get('/videos', async (req: Request, res: Response) => {
    try {
        const videos = await LiveStream.find({
            isPublished: true,
            youtubeVideoId: { $exists: true, $ne: null }
        }).sort({ startTime: -1 });

        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Error fetching videos', error });
    }
});

// Get single video by ID (public)
router.get('/videos/:id', async (req: Request, res: Response) => {
    try {
        const video = await LiveStream.findById(req.params.id);

        if (!video || !video.isPublished) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json(video);
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ message: 'Error fetching video', error });
    }
});

// Start live stream (admin only)
router.post('/admin/start', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { title, tag, publishDelayHours = 12 } = req.body;

        // Check if there's already an active stream
        const existingStream = await LiveStream.findOne({ isLive: true });
        if (existingStream) {
            return res.status(400).json({ message: 'A stream is already active' });
        }

        const now = new Date();
        const publishAfter = new Date(now.getTime() + publishDelayHours * 60 * 60 * 1000);

        const stream = new LiveStream({
            title,
            tag,
            startTime: now,
            publishAfter,
            isLive: true,
            viewerCount: 0
        });

        await stream.save();
        res.status(201).json(stream);
    } catch (error) {
        console.error('Error starting stream:', error);
        res.status(500).json({ message: 'Error starting stream', error });
    }
});

// Stop live stream (admin only)
router.post('/admin/stop/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const stream = await LiveStream.findById(req.params.id);

        if (!stream) {
            return res.status(404).json({ message: 'Stream not found' });
        }

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - stream.startTime.getTime()) / 60000);

        stream.isLive = false;
        stream.endTime = endTime;
        stream.duration = duration;

        await stream.save();

        // TODO: Trigger recording upload to YouTube
        // This will be handled by a separate service

        res.json(stream);
    } catch (error) {
        console.error('Error stopping stream:', error);
        res.status(500).json({ message: 'Error stopping stream', error });
    }
});

// Get stream status (admin only)
router.get('/admin/status', authMiddleware, async (req: Request, res: Response) => {
    try {
        const activeStream = await LiveStream.findOne({ isLive: true });
        const recentStreams = await LiveStream.find().sort({ startTime: -1 }).limit(5);

        res.json({
            activeStream,
            recentStreams
        });
    } catch (error) {
        console.error('Error fetching stream status:', error);
        res.status(500).json({ message: 'Error fetching stream status', error });
    }
});

// Update viewer count (internal)
router.put('/viewer-count/:id', async (req: Request, res: Response) => {
    try {
        const { count } = req.body;
        const stream = await LiveStream.findByIdAndUpdate(
            req.params.id,
            { viewerCount: count },
            { new: true }
        );

        res.json(stream);
    } catch (error) {
        console.error('Error updating viewer count:', error);
        res.status(500).json({ message: 'Error updating viewer count', error });
    }
});

export default router;
