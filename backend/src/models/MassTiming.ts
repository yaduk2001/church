import mongoose, { Schema, Document } from 'mongoose';

export interface IMassTiming extends Document {
    churchId: mongoose.Types.ObjectId;
    day?: string;
    date?: Date;
    time: string;
    language: string;
    type: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
}

const MassTimingSchema: Schema = new Schema(
    {
        churchId: {
            type: Schema.Types.ObjectId,
            ref: 'Church',
            required: true,
        },
        day: {
            type: String,
            required: false, // Not required if date is present
            enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
        date: {
            type: Date,
            required: false,
        },
        time: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
            default: 'English',
        },
        type: {
            type: String,
            required: true,
            enum: ['Regular', 'Special', 'Festival'],
            default: 'Regular',
        },
        description: {
            type: String,
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IMassTiming>('MassTiming', MassTimingSchema);
