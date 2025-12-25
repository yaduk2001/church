import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Gallery from '../models/Gallery'; // Adjust path if needed relative to execution
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const images = [
    { file: '4B1A2382.JPG', category: 'General', label: 'Church' },
    { file: '4B1A2383.JPG', category: 'General', label: 'Church' },
    { file: '4B1A2385.JPG', category: 'Events', label: 'Events' },
    { file: '4B1A2387.JPG', category: 'Events', label: 'Events' },
    { file: '4B1A2388.JPG', category: 'Events', label: 'Events' },
    { file: '4B1A2393.JPG', category: 'Events', label: 'Events' },
    { file: '4B1A7425.JPG', category: 'Ceremony', label: 'Sacraments' },
    { file: '4B1A7426.JPG', category: 'Ceremony', label: 'Sacraments' },
    { file: '4B1A7427.JPG', category: 'Ceremony', label: 'Sacraments' },
    { file: '4B1A7429.JPG', category: 'Ceremony', label: 'Sacraments' },
    { file: '4B1A7430.JPG', category: 'Ceremony', label: 'Sacraments' },
];

const seedGallery = async () => {
    try {
        const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/church_site'; // Use IPv4
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing? Maybe not, just add new ones or check existence.
        // Let's check if they exist to avoid duplicates
        for (const img of images) {
            const imageUrl = `/images/gallery/${img.file}`;
            const exists = await Gallery.findOne({ imageUrl });
            if (!exists) {
                await Gallery.create({
                    imageUrl,
                    category: img.category,
                    label: img.label,
                    description: `Church Gallery Image - ${img.file}`,
                    uploadedBy: 'System Seed',
                    dateTaken: new Date(),
                    createdAt: new Date()
                });
                console.log(`Added: ${img.file}`);
            } else {
                console.log(`Skipped (Exists): ${img.file}`);
            }
        }

        console.log('Gallery seeding completed.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding gallery:', error);
        process.exit(1);
    }
};

seedGallery();
