import mongoose, { Document, Schema } from 'mongoose';

export interface ILiveStream extends Document {
    title: string;
    tag: 'event' | 'regular' | 'special';
    startTime: Date;
    endTime?: Date;
    duration: number; // minutes
    isLive: boolean;
    recordingPath?: string;
    youtubeVideoId?: string;
    publishAfter: Date;
    isPublished: boolean;
    viewerCount: number;
    thumbnail?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    tag: {
        type: String,
        enum: ['event', 'regular', 'special'],
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number,
        default: 0
    },
    isLive: {
        type: Boolean,
        default: false
    },
    recordingPath: {
        type: String
    },
    youtubeVideoId: {
        type: String
    },
    publishAfter: {
        type: Date,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    viewerCount: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model<ILiveStream>('LiveStream', LiveStreamSchema);
