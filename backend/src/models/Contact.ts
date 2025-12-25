import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'responded';
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['new', 'read', 'responded'],
            default: 'new',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1 });

export default mongoose.model<IContact>('Contact', ContactSchema);
