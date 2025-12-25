import mongoose, { Schema, Document } from 'mongoose';

export interface INews extends Document {
    title: string;
    content: string;
    excerpt: string;
    imageUrl?: string;
    bibleVerse?: string;
    category: string;
    author: string;
    publishDate: Date;
    isActive: boolean;
    isPinned: boolean;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

const NewsSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        excerpt: {
            type: String,
            required: true,
            maxlength: 200,
        },
        imageUrl: {
            type: String,
        },
        bibleVerse: {
            type: String,
        },
        category: {
            type: String,
            required: true,
            enum: ['Announcement', 'Event', 'General', 'Urgent', 'Celebration'],
            default: 'General',
        },
        author: {
            type: String,
            required: true,
            default: 'Admin',
        },
        publishDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for better query performance
NewsSchema.index({ publishDate: -1, isActive: 1 });
NewsSchema.index({ isPinned: -1, publishDate: -1 });

export default mongoose.model<INews>('News', NewsSchema);
