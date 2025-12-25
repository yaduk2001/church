import mongoose, { Schema, Document } from 'mongoose';

export interface IChurch extends Document {
    name: string;
    description: string;
    history: string;
    address: string;
    phone: string;
    email: string;
    location: {
        lat: number;
        lng: number;
    };
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ChurchSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        history: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        location: {
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true,
            },
        },
        images: [{
            type: String,
        }],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IChurch>('Church', ChurchSchema);
