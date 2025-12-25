import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
    username: string;
    email: string;
    password: string;
    role: 'super_admin' | 'admin' | 'moderator';
    permissions: string[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: 'Invalid email format',
            },
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['super_admin', 'admin', 'moderator'],
            default: 'admin',
        },
        permissions: [{
            type: String,
            enum: [
                'manage_churches',
                'manage_mass_timings',
                'manage_prayer_requests',
                'manage_thanksgivings',
                'manage_venda',
                'manage_blood_bank',
                'manage_family_units',
                'manage_gallery',
                'manage_documents',
                'manage_notifications',
                'manage_news',
                'manage_committee',
                'manage_admins',
            ],
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
AdminSchema.pre('save', async function (this: any, next: any) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdmin>('Admin', AdminSchema);
