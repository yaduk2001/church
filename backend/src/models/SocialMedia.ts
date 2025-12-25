import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialMedia extends Document {
    platform: string;
    url: string;
    icon: string;
    isActive: boolean;
}

const SocialMediaSchema: Schema = new Schema(
    {
        platform: {
            type: String,
            required: true,
            unique: true, // One entry per platform (e.g., 'facebook')
            trim: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
        icon: {
            type: String, // Class name or emoji
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ISocialMedia>('SocialMedia', SocialMediaSchema);
