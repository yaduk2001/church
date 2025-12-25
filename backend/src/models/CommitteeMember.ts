import mongoose, { Schema, Document } from 'mongoose';

export interface ICommitteeMember extends Document {
    name: string;
    position: string;
    role: string;
    photoUrl?: string;
    email?: string;
    phone?: string;
    bio?: string;
    joinDate: Date;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const CommitteeMemberSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        position: {
            type: String,
            required: true,
            enum: [
                'President',
                'Vice President',
                'Secretary',
                'Treasurer',
                'Joint Secretary',
                'Member',
                'Patron',
                'Spiritual Director',
            ],
        },
        role: {
            type: String,
            required: true,
            trim: true,
        },
        photoUrl: {
            type: String,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: 'Invalid email format',
            },
        },
        phone: {
            type: String,
            validate: {
                validator: (v: string) => !v || /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')),
                message: 'Invalid phone number',
            },
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        joinDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for sorting by display order
CommitteeMemberSchema.index({ displayOrder: 1, position: 1 });

export default mongoose.model<ICommitteeMember>('CommitteeMember', CommitteeMemberSchema);
