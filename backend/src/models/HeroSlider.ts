import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroSlider extends Document {
    imageUrl: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
}

const HeroSliderSchema: Schema = new Schema({
    imageUrl: {
        type: String,
        required: true
    },
    displayOrder: {
        type: Number,
        required: true,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IHeroSlider>('HeroSlider', HeroSliderSchema);
