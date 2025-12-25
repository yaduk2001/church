import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import FamilyUnit from '../models/FamilyUnit';
import { generateToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Register a new family
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { familyName, headOfFamily, phone, password, address, parishUnit } = req.body;

        // Check if family already exists
        const existingFamily = await FamilyUnit.findOne({ phone });
        if (existingFamily) {
            return res.status(400).json({ message: 'Family with this phone number already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newFamily = new FamilyUnit({
            familyName,
            headOfFamily,
            phone,
            password: hashedPassword,
            address,
            parishUnit: parishUnit || 'General',
            members: []
        });

        await newFamily.save();

        const token = generateToken({
            id: newFamily._id.toString(),
            phone: newFamily.phone,
            role: 'family'
        });

        res.status(201).json({
            message: 'Registration successful',
            token,
            family: {
                _id: newFamily._id,
                familyName: newFamily.familyName,
                headOfFamily: newFamily.headOfFamily,
                phone: newFamily.phone
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering family', error });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { phone, password } = req.body;

        const family = await FamilyUnit.findOne({ phone }).select('+password');
        if (!family) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, family.password as string);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({
            id: family._id.toString(),
            phone: family.phone,
            role: 'family'
        });

        res.json({
            message: 'Login successful',
            token,
            family: {
                _id: family._id,
                familyName: family.familyName,
                headOfFamily: family.headOfFamily,
                phone: family.phone
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Get Current Family (Me)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'family') {
            return res.status(404).json({ message: 'Family not found' });
        }

        const family = await FamilyUnit.findById(req.user.id);
        if (!family) return res.status(404).json({ message: 'Family not found' });

        res.json(family);

    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
