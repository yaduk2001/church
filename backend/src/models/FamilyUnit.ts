import mongoose, { Schema, Document } from 'mongoose';

interface IFamilyMember {
    name: string;
    gender: string;
    dob: Date; // dateOfBirth -> dob to match form, but we can keep dateOfBirth alias or just use dob. using dob for consistency with plan.
    age: number;
    relationship: string;
    education?: string;
    occupation?: string;
    bloodGroup?: string;
    mobile?: string;
    email?: string; // Optional for members
    baptismDate?: Date;
    marriageDate?: Date;
    houseName?: string; // In case member is from another house? usually not needed in this context but good to have flexibility. Removing to keep simple as per form.
}

export interface IFamilyUnit extends Document {
    registerNo: string; // Unique
    familyName: string; // Phone book name / House Name? "Veettu Per" = House Name.
    houseName: string; // Explicit House Name (Veettu per)
    headOfFamily: string; // Kept for backward compatibility/reference, but detailed fields below

    // Head of Family Details (Detailed)
    headName: string;
    headDob?: Date;
    headAge?: number;
    headBloodGroup?: string;
    headAadhaar?: string;
    headOccupation?: string;
    headEducation?: string;

    // Address & Location
    parishUnit: string;
    kara: string;
    village?: string;
    postOffice?: string;
    pincode?: string;
    panchayat?: string;
    district?: string;
    address: string; // Full address string

    // Contact
    phone: string; // Primary Landline/Phone - Unique for Login
    whatsapp?: string;
    email?: string;

    members: IFamilyMember[];

    password?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FamilyMemberSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    dob: { type: Date, required: true }, // Changed from dateOfBirth to dob
    age: { type: Number }, // Auto-calc
    relationship: {
        type: String,
        required: true,
        // Expanded enum might be needed, allowing simple String for flexibility for now or keeping enum
    },
    education: { type: String },
    occupation: { type: String },
    bloodGroup: { type: String },
    mobile: { type: String },
    email: { type: String, trim: true, lowercase: true },
    baptismDate: { type: Date },
    marriageDate: { type: Date }
});

const FamilyUnitSchema: Schema = new Schema(
    {
        registerNo: { type: String, required: true, unique: true, trim: true, sparse: true },
        familyName: { type: String, required: true, trim: true }, // Display Name
        houseName: { type: String, trim: true }, // Specific House Name
        headOfFamily: { type: String, trim: true }, // Keeping for query compatibility

        // Head Details
        headName: { type: String, required: true, trim: true },
        headDob: { type: Date },
        headAge: { type: Number },
        headBloodGroup: { type: String },
        headAadhaar: { type: String },
        headOccupation: { type: String },
        headEducation: { type: String },

        // Location
        parishUnit: { type: String, default: 'General' },
        kara: { type: String },
        village: { type: String },
        postOffice: { type: String },
        pincode: { type: String },
        panchayat: { type: String },
        district: { type: String },
        address: { type: String }, // Can be auto-generated or manual

        // Contact
        phone: { type: String, required: true, unique: true, trim: true },
        whatsapp: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },

        members: [FamilyMemberSchema],

        password: { type: String, required: true, select: false },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Auto-calculate age for all members before saving
FamilyUnitSchema.pre('save', function (this: any, next: any) {
    // Calc age for Head
    if (this.headDob) {
        this.headAge = calculateAge(this.headDob);
    }

    // Calc age for Members
    if (this.members) {
        this.members.forEach((member: any) => {
            if (member.dob) {
                member.age = calculateAge(member.dob);
            }
        });
    }
    next();
});

function calculateAge(dob: Date): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default mongoose.model<IFamilyUnit>('FamilyUnit', FamilyUnitSchema);
