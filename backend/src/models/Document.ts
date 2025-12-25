import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
    title: string;
    description: string;
    fileName: string;
    fileUrl: string;
    category: string;
    tags: string[];
    uploadDate: Date;
    createdAt: Date;
}

const DocumentSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['Bulletin', 'Newsletter', 'Forms', 'Reports', 'Other'],
            default: 'Other',
        },
        tags: {
            type: [String],
            default: [],
        },
        uploadDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);
