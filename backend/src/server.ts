import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Import routes
import apiRouter from './routes/api.routes';
import eventsRouter from './routes/events.routes';
import contactRouter from './routes/contact.routes';
import churchesRouter from './routes/churches.routes';
import massTimingsRouter from './routes/mass-timings.routes';
import prayerRequestsRouter from './routes/prayer-requests.routes';
import thanksgivingsRouter from './routes/thanksgivings.routes';
import vendaRouter from './routes/venda.routes';
import bloodBankRouter from './routes/blood-bank.routes';
import familyUnitsRouter from './routes/family-units.routes';
import familyAuthRouter from './routes/family-auth.routes';
import galleryRouter from './routes/gallery.routes';
import notificationsRouter from './routes/notifications.routes';
import documentsRouter from './routes/documents.routes';
import adminRouter from './routes/admin.routes';
import newsRouter from './routes/news.routes';
import committeeRouter from './routes/committee.routes';
import socialMediaRouter from './routes/social-media.routes';
import uploadRouter from './routes/upload.routes';
import heroSliderRouter from './routes/hero-slider.routes';
import liveStreamRouter from './routes/live-stream.routes';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 8000;

// MongoDB connection with Mongoose
const connectToMongoDB = async (): Promise<void> => {
    try {
        const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/church_site';

        await mongoose.connect(mongoUrl);

        console.log(`✅ Connected to MongoDB Atlas`);
        console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'church_site'}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies with increased limit for Base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// CORS configuration - Allow both Angular and Next.js frontends
const origins = process.env.CORS_ORIGINS?.split(',') || [];
const primaryFrontend = process.env.FRONTEND_URL;

if (primaryFrontend && !origins.includes(primaryFrontend)) {
    origins.push(primaryFrontend);
}

// Fallback if nothing is defined
if (origins.length === 0) {
    origins.push('http://localhost:3000');
}

const corsOptions = {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// API Routes
app.use('/api', apiRouter);
app.use('/api/events', eventsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/churches', churchesRouter);
app.use('/api/mass-timings', massTimingsRouter);
app.use('/api/prayer-requests', prayerRequestsRouter);
app.use('/api/thanksgivings', thanksgivingsRouter);
app.use('/api/venda', vendaRouter);
app.use('/api/blood-bank', bloodBankRouter);
app.use('/api/family-units', familyUnitsRouter);
app.use('/api/family-auth', familyAuthRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/news', newsRouter);
app.use('/api/committee-members', committeeRouter);
app.use('/api/social-media', socialMediaRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/hero-slider', heroSliderRouter);
app.use('/api/live-stream', liveStreamRouter);

// Serve uploaded files statically with CORS headers
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../public/uploads')));

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Church Site API',
        version: '1.0.0',
        status: 'running',
    });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
    }
    process.exit(0);
});

// Start server
const startServer = async (): Promise<void> => {
    await connectToMongoDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
};

startServer();

export default app;
