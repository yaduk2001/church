import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    title: string;
    message: string;
    type: string;
    priority: string;
    isActive: boolean;
    expiryDate?: Date;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['announcement', 'event', 'urgent', 'general'],
            default: 'general',
        },
        priority: {
            type: String,
            required: true,
            enum: ['high', 'medium', 'low'],
            default: 'medium',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiryDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
