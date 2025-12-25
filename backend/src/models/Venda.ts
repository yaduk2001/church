import mongoose, { Schema, Document } from 'mongoose';

export interface IVenda extends Document {
    donorName: string;
    amount: number;
    purpose: string;
    date: Date;
    isAnonymous: boolean;
    paymentMethod: string;
    receiptNumber: string;
    createdAt: Date;
}

const VendaSchema: Schema = new Schema(
    {
        donorName: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        purpose: {
            type: String,
            required: true,
            enum: ['General', 'Building Fund', 'Poor Fund', 'Mission', 'Special Offering', 'Other'],
            default: 'General',
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['Cash', 'Check', 'Online Transfer', 'UPI', 'Card'],
            default: 'Cash',
        },
        receiptNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate receipt number
VendaSchema.pre('save', async function (this: any, next: any) {
    if (!this.receiptNumber) {
        const count = await mongoose.model('Venda').countDocuments();
        this.receiptNumber = `VND${new Date().getFullYear()}${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

export default mongoose.model<IVenda>('Venda', VendaSchema);
