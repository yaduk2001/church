import express, { Request, Response } from 'express';
import Admin from '../models/Admin';
import PrayerRequest from '../models/PrayerRequest';
import Thanksgiving from '../models/Thanksgiving';
import BloodBank from '../models/BloodBank';
import FamilyUnit from '../models/FamilyUnit';
import News from '../models/News';
import Gallery from '../models/Gallery';
import { generateToken } from '../utils/jwt';
import { authMiddleware, authorize } from '../middleware/auth';

const router = express.Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const admin = await Admin.findOne({ username, isActive: true });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate token
        const token = generateToken({
            id: admin._id.toString(),
            username: admin.username,
            email: admin.email,
            role: admin.role,
        });

        res.json({
            token,
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login failed', error });
    }
});

// Register new admin (super_admin only)
router.post('/register', authMiddleware, authorize('super_admin'), async (req: Request, res: Response) => {
    try {
        const { username, email, password, role, permissions } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });

        if (existingAdmin) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const admin = new Admin({
            username,
            email,
            password,
            role: role || 'admin',
            permissions: permissions || [],
        });

        await admin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Registration failed', error });
    }
});

// Verify token
router.get('/verify', authMiddleware, async (req: Request, res: Response) => {
    try {
        const admin = await Admin.findById(req.user?.id).select('-password');

        if (!admin || !admin.isActive) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        res.json({
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
            },
        });
    } catch (error) {
        return res.status(401).json({ message: 'Token verification failed' });
    }
});

// Dashboard statistics
router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
    // ... (existing dashboard code)
    try {
        const stats = {
            prayerRequests: {
                total: await PrayerRequest.countDocuments(),
                pending: await PrayerRequest.countDocuments({ status: 'pending' }),
                approved: await PrayerRequest.countDocuments({ status: 'approved' }),
            },
            thanksgivings: {
                total: await Thanksgiving.countDocuments(),
                pending: await Thanksgiving.countDocuments({ status: 'pending' }),
                approved: await Thanksgiving.countDocuments({ status: 'approved' }),
            },
            bloodBank: {
                total: await BloodBank.countDocuments(),
                available: await BloodBank.countDocuments({ isAvailable: true }),
            },
            families: {
                total: await FamilyUnit.countDocuments(),
            },
            news: {
                total: await News.countDocuments(),
                active: await News.countDocuments({ isActive: true }),
            },
            gallery: {
                total: await Gallery.countDocuments(),
            },
        };

        res.json(stats);
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({ message: 'Failed to fetch dashboard stats', error });
    }
});

// Get all families (for admin, unmasked)
router.get('/families', authMiddleware, async (req: Request, res: Response) => {
    try {
        const families = await FamilyUnit.find().sort({ familyName: 1 });
        res.json(families);
    } catch (error) {
        console.error('Error fetching families for admin:', error);
        res.status(500).json({ message: 'Failed to fetch families', error });
    }
});

// Create new family (Admin)
router.post('/families', authMiddleware, async (req: Request, res: Response) => {
    try {
        const family = new FamilyUnit(req.body);
        const savedFamily = await family.save();
        res.status(201).json(savedFamily);
    } catch (error) {
        console.error('Error creating family unit:', error);
        res.status(500).json({ message: 'Error creating family unit', error });
    }
});

// Update family (Admin)
router.put('/families/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const family = await FamilyUnit.findById(req.params.id);

        if (!family) {
            return res.status(404).json({ message: 'Family unit not found' });
        }

        // Update fields
        Object.assign(family, req.body);

        // Save to trigger hooks (age calc)
        const updatedFamily = await family.save();

        res.json(updatedFamily);
    } catch (error) {
        console.error('Error updating family unit:', error);
        res.status(500).json({ message: 'Error updating family unit', error });
    }
});

// Delete family (Admin)
router.delete('/families/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const deletedFamily = await FamilyUnit.findByIdAndDelete(req.params.id);

        if (!deletedFamily) {
            return res.status(404).json({ message: 'Family unit not found' });
        }

        res.json({ message: 'Family unit deleted successfully' });
    } catch (error) {
        console.error('Error deleting family unit:', error);
        res.status(500).json({ message: 'Error deleting family unit', error });
    }
});

// Delete specific member from family (Admin)
router.delete('/families/:id/members/:memberId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const familyId = req.params.id;
        const memberId = req.params.memberId;

        const updatedFamily = await FamilyUnit.findByIdAndUpdate(
            familyId,
            { $pull: { members: { _id: memberId } } },
            { new: true } // Return the updated document
        );

        if (!updatedFamily) {
            return res.status(404).json({ message: 'Family unit not found' });
        }

        res.json({ message: 'Member deleted successfully', family: updatedFamily });
    } catch (error) {
        console.error('Error deleting family member:', error);
        res.status(500).json({ message: 'Error deleting family member', error });
    }
});

// Get all admins (super_admin only)
router.get('/users', authMiddleware, authorize('super_admin'), async (req: Request, res: Response) => {
    try {
        const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
        res.json(admins);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch admins', error });
    }
});

// Update admin profile
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { username, email, currentPassword, newPassword } = req.body;

        const admin = await Admin.findById(req.user?.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update username if provided
        if (username) {
            // Check if username is taken
            if (username !== admin.username) {
                const existingUser = await Admin.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({ message: 'Username already exists' });
                }
                admin.username = username;
            }
        }

        // Update email if provided
        if (email) {
            admin.email = email;
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            const isPasswordValid = await admin.comparePassword(currentPassword);

            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            admin.password = newPassword;
        }

        await admin.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update profile', error });
    }
});

// Delete admin (super_admin only)
router.delete('/users/:id', authMiddleware, authorize('super_admin'), async (req: Request, res: Response) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete admin', error });
    }
});

export default router;
