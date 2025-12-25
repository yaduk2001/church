import mongoose, { Schema, Document } from 'mongoose';

export interface IThanksgiving extends Document {
    name: string;
    email: string;
    message: string;
    isAnonymous: boolean;
    status: 'pending' | 'approved' | 'archived';
    createdAt: Date;
}

const ThanksgivingSchema: Schema = new Schema(
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
        message: {
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

export default mongoose.model<IThanksgiving>('Thanksgiving', ThanksgivingSchema);
