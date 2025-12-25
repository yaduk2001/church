import mongoose from 'mongoose';
import Admin from './models/Admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function createAdmin() {
    try {
        const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/church_site';
        await mongoose.connect(mongoUrl);

        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            process.exit(0);
        }

        // Create super admin
        const admin = new Admin({
            username: 'admin123',
            email: 'admin@church.com',
            password: 'admin123',
            role: 'super_admin',
            permissions: [
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
            isActive: true,
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📝 Login Credentials:');
        console.log('   Username: admin123');
        console.log('   Password: admin123');
        console.log('');
        console.log('🔐 Test login with:');
        console.log('   curl -X POST http://localhost:8000/api/admin/login \\');
        console.log('     -H "Content-Type: application/json" \\');
        console.log('     -d \'{"username":"admin","password":"admin123"}\'');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
