import express, { Request, Response } from 'express';
import FamilyUnit from '../models/FamilyUnit';
import { maskPhone } from '../utils/helpers';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all family units
router.get('/', async (req: Request, res: Response) => {
    try {
        const { parishUnit } = req.query;

        const query = parishUnit ? { parishUnit } : {};
        const families = await FamilyUnit.find(query).sort({ familyName: 1 });

        // Mask phone numbers
        const maskedFamilies = families.map(family => ({
            ...family.toObject(),
            phone: maskPhone(family.phone),
            members: family.members.map(member => ({
                ...member,
                mobile: member.mobile ? maskPhone(member.mobile) : undefined,
            })),
        }));

        res.json(maskedFamilies);
    } catch (error) {
        console.error('Error fetching family units:', error);
        res.status(500).json({ message: 'Error fetching family units', error });
    }
});

// Get single family unit
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const family = await FamilyUnit.findById(req.params.id);

        if (!family) {
            return res.status(404).json({ message: 'Family unit not found' });
        }

        // Mask phone numbers
        const maskedFamily = {
            ...family.toObject(),
            phone: maskPhone(family.phone),
            members: family.members.map(member => ({
                ...member,
                mobile: member.mobile ? maskPhone(member.mobile) : undefined,
            })),
        };

        res.json(maskedFamily);
    } catch (error) {
        console.error('Error fetching family unit:', error);
        res.status(500).json({ message: 'Error fetching family unit', error });
    }
});

// Get parish units list
router.get('/parish/list', async (req: Request, res: Response) => {
    try {
        const parishUnits = await FamilyUnit.distinct('parishUnit');
        res.json(parishUnits.sort());
    } catch (error) {
        console.error('Error fetching parish units:', error);
        res.status(500).json({ message: 'Error fetching parish units', error });
    }
});

// Get family statistics
router.get('/stats/overview', async (req: Request, res: Response) => {
    try {
        const totalFamilies = await FamilyUnit.countDocuments();

        const memberStats = await FamilyUnit.aggregate([
            { $unwind: '$members' },
            {
                $group: {
                    _id: null,
                    totalMembers: { $sum: 1 },
                    maleCount: {
                        $sum: { $cond: [{ $eq: ['$members.gender', 'Male'] }, 1, 0] },
                    },
                    femaleCount: {
                        $sum: { $cond: [{ $eq: ['$members.gender', 'Female'] }, 1, 0] },
                    },
                    averageAge: { $avg: '$members.age' },
                },
            },
        ]);

        const parishStats = await FamilyUnit.aggregate([
            {
                $group: {
                    _id: '$parishUnit',
                    familyCount: { $sum: 1 },
                },
            },
            { $sort: { familyCount: -1 } },
        ]);

        res.json({
            totalFamilies,
            memberStats: memberStats[0] || {},
            parishStats,
        });
    } catch (error) {
        console.error('Error fetching family stats:', error);
        res.status(500).json({ message: 'Error fetching family stats', error });
    }
});

// Create new family unit
router.post('/', async (req: Request, res: Response) => {
    try {
        const family = new FamilyUnit(req.body);
        const savedFamily = await family.save();
        res.status(201).json(savedFamily);
    } catch (error) {
        console.error('Error creating family unit:', error);
        res.status(500).json({ message: 'Error creating family unit', error });
    }
});

// Update family unit
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updatedFamily = await FamilyUnit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedFamily) {
            return res.status(404).json({ message: 'Family unit not found' });
        }

        res.json(updatedFamily);
    } catch (error) {
        console.error('Error updating family unit:', error);
        res.status(500).json({ message: 'Error updating family unit', error });
    }
});

// Delete family unit
router.delete('/:id', async (req: Request, res: Response) => {
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

// Add new member to my family
router.post('/members', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'family') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const family = await FamilyUnit.findById(req.user.id);
        if (!family) return res.status(404).json({ message: 'Family not found' });

        const { name, dateOfBirth, gender, relationship, mobile, email } = req.body;

        const newMember: any = {
            name,
            dateOfBirth,
            gender,
            relationship,
            mobile,
            email,
            age: 0 // Will be calculated by pre-save hook
        };

        // You might want to manually calculate age here if push doesn't trigger pre-save on subdocs in some mongoose versions, 
        // but typically family.save() will trigger the pre('save') hook of the parent which iterates members.
        // Let's rely on the hook.

        family.members.push(newMember);
        await family.save();

        res.status(201).json(family);
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ message: 'Error adding member', error });
    }
});

// Update member
router.put('/members/:memberId', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'family') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const family = await FamilyUnit.findById(req.user.id);
        if (!family) return res.status(404).json({ message: 'Family not found' });

        const member = (family.members as any).id(req.params.memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const { name, dateOfBirth, gender, relationship, mobile, email } = req.body;

        if (name) member.name = name;
        if (dateOfBirth) member.dateOfBirth = dateOfBirth;
        if (gender) member.gender = gender;
        if (relationship) member.relationship = relationship;
        if (mobile !== undefined) member.mobile = mobile;
        if (email !== undefined) member.email = email;

        await family.save();

        res.json(family);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ message: 'Error updating member', error });
    }
});

// Delete member
router.delete('/members/:memberId', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'family') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const family = await FamilyUnit.findById(req.user.id);
        if (!family) return res.status(404).json({ message: 'Family not found' });

        // Mongoose pull
        (family.members as any).pull({ _id: req.params.memberId });
        await family.save();

        res.json(family);
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ message: 'Error deleting member', error });
    }
});

export default router;
