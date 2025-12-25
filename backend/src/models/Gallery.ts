import mongoose, { Schema, Document } from 'mongoose';

export interface IGallery extends Document {
    description?: string;
    imageUrl: string;
    category: string; // Event name (e.g., "Holy Mass", "Easter Sunday")
    label?: string; // Predefined label (Events, Church, Community, etc.)
    dateTaken?: Date;
    location?: string;
    uploadedBy: string;
    createdAt: Date;
}

const GallerySchema: Schema = new Schema(
    {
        description: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        label: {
            type: String,
            enum: ['Events', 'Church', 'Community', 'Festivals', 'Sacraments', 'Other'],
            default: 'Events',
        },
        dateTaken: {
            type: Date,
        },
        location: {
            type: String,
            trim: true,
        },
        uploadedBy: {
            type: String,
            required: true,
            default: 'Admin',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IGallery>('Gallery', GallerySchema);
