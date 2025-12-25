import mongoose, { Schema, Document } from 'mongoose';

export interface IBloodBank extends Document {
    donorName: string;
    bloodGroup: string;
    phone: string;
    email: string;
    dateOfBirth: Date;
    age: number;
    gender: string;
    lastDonation?: Date;
    isAvailable: boolean;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

const BloodBankSchema: Schema = new Schema(
    {
        donorName: {
            type: String,
            required: true,
            trim: true,
        },
        bloodGroup: {
            type: String,
            required: true,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Bombay Blood (Oh) - Rare', 'Golden Blood (Rh-null) - Rare'],
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
        dateOfBirth: {
            type: Date,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        gender: {
            type: String,
            required: true,
            enum: ['Male', 'Female', 'Other'],
        },
        lastDonation: {
            type: Date,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        address: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-calculate age before saving
BloodBankSchema.pre('save', function (this: any, next: any) {
    if (this.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth as Date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        this.age = age;
    }
    next();
});

export default mongoose.model<IBloodBank>('BloodBank', BloodBankSchema);
