import mongoose, { Schema, Document } from 'mongoose';

export interface IPrayerRequest extends Document {
    name: string;
    email: string;
    phone: string;
    prayerRequest: string;
    isAnonymous: boolean;
    status: 'pending' | 'approved' | 'archived';
    createdAt: Date;
}

const PrayerRequestSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
        },
        prayerRequest: {
            type: String,
            required: true,
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'archived'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IPrayerRequest>('PrayerRequest', PrayerRequestSchema);
