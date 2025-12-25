import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Church from './models/Church';
import MassTiming from './models/MassTiming';
import Notification from './models/Notification';
import Gallery from './models/Gallery';
import CommitteeMember from './models/CommitteeMember';
import News from './models/News';
import BloodBank from './models/BloodBank';
import Document from './models/Document';
import FamilyUnit from './models/FamilyUnit';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/church_site';
        await mongoose.connect(mongoUrl);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Church.deleteMany({});
        await MassTiming.deleteMany({});
        await Notification.deleteMany({});
        await Gallery.deleteMany({});
        await CommitteeMember.deleteMany({});
        await News.deleteMany({});
        await BloodBank.deleteMany({});
        await Document.deleteMany({});
        await FamilyUnit.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Churches
        const churches = await Church.insertMany([
            {
                name: "St Mary's Jacobite Syrian Church",
                description: 'Our Parish Church',
                history: `Established to serve the community.`,
                address: 'Church Address, City - Pin Code',
                phone: '9876543210',
                email: 'contact@church.com',
                location: {
                    lat: 10.8505,
                    lng: 76.2711,
                },
                images: [
                    'https://cdn.pixabay.com/photo/2016/09/01/10/48/church-1637094_1280.jpg',
                ],
            }
        ]);

        console.log('✅ Created 1 church: St Mary\'s Jacobite Syrian Church');

        // Create Mass Timings for each church
        const massTimings = [];

        // C1 Mass Timings (Sample)
        massTimings.push(
            { churchId: churches[0]._id, day: 'Sunday', time: '7:00 AM', language: 'English', type: 'Regular' },
            { churchId: churches[0]._id, day: 'Sunday', time: '9:00 AM', language: 'Malayalam', type: 'Regular' },
            { churchId: churches[0]._id, day: 'Friday', time: '6:30 AM', language: 'English', type: 'Regular' }
        );

        await MassTiming.insertMany(massTimings);
        console.log(`✅ Created ${massTimings.length} mass timings for C1`);

        // Create Notifications
        const notifications = await Notification.insertMany([
            {
                title: 'Welcome to Our Church Website',
                message: 'We are pleased to announce the launch of our new church website. Stay connected with us!',
                type: 'announcement',
                priority: 'high',
                isActive: true,
            },
            {
                title: 'Christmas Mass Schedule',
                message: 'Special Christmas mass timings will be announced soon. Please check back for updates.',
                type: 'event',
                priority: 'high',
                isActive: true,
                expiryDate: new Date('2025-12-31'),
            },
            {
                title: 'Blood Donation Camp',
                message: 'Blood donation camp will be organized next month. Register now to save lives!',
                type: 'event',
                priority: 'medium',
                isActive: true,
                expiryDate: new Date('2025-12-31'),
            },
            {
                title: 'Parish Meeting',
                message: 'Monthly parish meeting will be held on the first Sunday of every month after 9 AM mass.',
                type: 'general',
                priority: 'medium',
                isActive: true,
            },
        ]);

        console.log(`✅ Created ${notifications.length} notifications`);

        // Create Gallery Images
        const galleryImages = await Gallery.insertMany([
            {
                title: 'Church Exterior',
                description: 'Beautiful view of our Kerala church',
                imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
                category: 'Church',
                uploadedBy: 'Admin',
            },
            {
                title: 'Sunday Mass',
                description: 'Sunday mass celebration',
                imageUrl: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800',
                category: 'Events',
                uploadedBy: 'Admin',
            },
            {
                title: 'Christmas Celebration',
                description: 'Christmas celebration 2024',
                imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
                category: 'Festivals',
                eventDate: new Date('2024-12-25'),
                uploadedBy: 'Admin',
            },
            {
                title: 'Community Gathering',
                description: 'Parish community gathering',
                imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800',
                category: 'Community',
                uploadedBy: 'Admin',
            },
            {
                title: 'Church Interior',
                description: 'Beautiful church interior',
                imageUrl: 'https://images.unsplash.com/photo-1597655601841-214a4cfe8b2c?w=800',
                category: 'Church',
                uploadedBy: 'Admin',
            },
            {
                title: 'Easter Sunday Procession',
                description: 'Easter Sunday celebration procession',
                imageUrl: 'https://images.unsplash.com/photo-1492112007959-c35ae067c37b?w=800',
                category: 'Festivals',
                eventDate: new Date('2024-04-21'),
                uploadedBy: 'Admin',
            },
            {
                title: 'First Holy Communion',
                description: 'Children receiving their First Holy Communion',
                imageUrl: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800',
                category: 'Sacraments',
                eventDate: new Date('2024-05-12'),
                uploadedBy: 'Admin',
            },
            {
                title: 'Youth Fellowship Meeting',
                description: 'Monthly youth fellowship and prayer meeting',
                imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
                category: 'Community',
                uploadedBy: 'Admin',
            },
            {
                title: 'Choir Practice',
                description: 'Parish choir practicing for Sunday mass',
                imageUrl: 'https://images.unsplash.com/photo-1507003397495-70c0ac4aa4e3?w=800',
                category: 'Events',
                uploadedBy: 'Admin',
            },
            {
                title: 'Confirmation Ceremony',
                description: 'Bishop administering the sacrament of Confirmation',
                imageUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                category: 'Sacraments',
                eventDate: new Date('2024-06-15'),
                uploadedBy: 'Admin',
            },
            {
                title: 'Annual Feast Day',
                description: 'Parish feast day celebration with procession',
                imageUrl: 'https://images.unsplash.com/photo-1533854775446-95c4609da544?w=800',
                category: 'Festivals',
                eventDate: new Date('2024-09-08'),
                uploadedBy: 'Admin',
            },
            {
                title: 'Charity Drive',
                description: 'Parish community organizing charity drive for the needy',
                imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
                category: 'Community',
                uploadedBy: 'Admin',
            },
            {
                title: 'Bible Study Group',
                description: 'Weekly Bible study and discussion group',
                imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800',
                category: 'Events',
                uploadedBy: 'Admin',
            },
        ]);

        console.log(`✅ Created ${galleryImages.length} gallery images`);

        // Create Committee Members
        const committeeMembers = await CommitteeMember.insertMany([
            {
                name: 'Rev. Fr. John Mathew',
                position: 'Spiritual Director',
                role: 'Parish Priest',
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                email: 'fr.john@church.com',
                phone: '9876543210',
                displayOrder: 1,
                isActive: true,
            },
            {
                name: 'Mr. Thomas Joseph',
                position: 'President',
                role: 'Parish Council',
                photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                email: 'thomas@church.com',
                phone: '9876543211',
                displayOrder: 2,
                isActive: true,
            },
            {
                name: 'Mrs. Mary Elizabeth',
                position: 'Secretary',
                role: 'Parish Council',
                photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
                email: 'mary@church.com',
                phone: '9876543212',
                displayOrder: 3,
                isActive: true,
            },
            {
                name: 'Mr. George Varghese',
                position: 'Treasurer',
                role: 'Parish Council',
                photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                email: 'george@church.com',
                phone: '9876543213',
                displayOrder: 4,
                isActive: true,
            },
            {
                name: 'Sr. Anna Maria',
                position: 'Member',
                role: 'Youth Ministry Coordinator',
                photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
                email: 'sr.anna@church.com',
                displayOrder: 5,
                isActive: true,
            },
            {
                name: 'Mr. Paul Sebastian',
                position: 'Member',
                role: 'Finance Committee Head',
                photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
                email: 'paul@church.com',
                phone: '9876543214',
                displayOrder: 6,
                isActive: true,
            },
        ]);

        console.log(`✅ Created ${committeeMembers.length} committee members`);

        // Create News Items
        const newsItems = await News.insertMany([
            {
                title: 'Christmas Celebration 2024 - A Joyous Event',
                content: `Our parish celebrated Christmas with great devotion and joy. The midnight mass was attended by over 500 parishioners. 
                The choir performed beautifully, and the nativity scene was a highlight of the celebration. 
                We thank all volunteers who made this event memorable.`,
                excerpt: 'Our parish celebrated Christmas with great devotion and joy. The midnight mass was attended by over 500 parishioners.',
                category: 'Celebration',
                author: 'Admin',
                imageUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800',
                publishDate: new Date('2024-12-26'),
                isPinned: true,
                isActive: true,
                views: 234,
            },
            {
                title: 'Blood Donation Camp - Save Lives',
                content: `A blood donation camp will be organized at St. Mary's Church on January 15th, 2025. 
                We encourage all healthy individuals aged 18-65 to participate and save lives. 
                Registration is open now. Contact the parish office for more details.`,
                excerpt: 'Blood donation camp will be organized at St. Mary\'s Church on January 15th, 2025.',
                category: 'Event',
                author: 'Admin',
                imageUrl: 'https://images.unsplash.com/photo-1615461065929-4cdaa4fadf36?w=800',
                publishDate: new Date('2025-01-05'),
                isPinned: true,
                isActive: true,
                views: 156,
            },
            {
                title: 'Youth Ministry Retreat Announced',
                content: `The Youth Ministry is organizing a 3-day retreat from February 14-16, 2025. 
                The retreat will focus on spiritual growth, leadership development, and community building. 
                Registration is open for youth aged 15-25. Limited seats available.`,
                excerpt: 'The Youth Ministry is organizing a 3-day retreat from February 14-16, 2025.',
                category: 'Event',
                author: 'Admin',
                imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
                publishDate: new Date('2025-01-10'),
                isPinned: false,
                isActive: true,
                views: 89,
            },
            {
                title: 'New Sunday School Classes Begin',
                content: `Sunday School classes for the new academic year will commence on February 1st, 2025. 
                Classes are available for children from kindergarten to 10th grade. 
                Parents are requested to register their children at the parish office.`,
                excerpt: 'Sunday School classes for the new academic year will commence on February 1st, 2025.',
                category: 'Announcement',
                author: 'Admin',
                imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
                publishDate: new Date('2025-01-12'),
                isPinned: false,
                isActive: true,
                views: 67,
            },
            {
                title: 'Parish Feast Celebration',
                content: `Our annual parish feast will be celebrated on March 25th, 2025, the feast of the Annunciation. 
                Special masses and cultural programs are being organized. 
                We invite all parishioners to participate and make this celebration memorable.`,
                excerpt: 'Our annual parish feast will be celebrated on March 25th, 2025.',
                category: 'Celebration',
                author: 'Admin',
                imageUrl: 'https://images.unsplash.com/photo-1531347138964-fd1d86ed2a06?w=800',
                publishDate: new Date('2025-01-15'),
                isPinned: false,
                isActive: true,
                views: 45,
            },
        ]);

        console.log(`✅ Created ${newsItems.length} news items`);

        // Create Blood Bank Donors
        const bloodDonors = await BloodBank.insertMany([
            {
                donorName: 'John Mathew',
                bloodGroup: 'A+',
                phone: '9876543210',
                email: 'john.m@email.com',
                dateOfBirth: new Date('1990-05-15'),
                age: 34,
                gender: 'Male',
                address: 'Kochi, Kerala',
                lastDonation: new Date('2024-09-15'),
                isAvailable: true,
            },
            {
                donorName: 'Mary Elizabeth',
                bloodGroup: 'O+',
                phone: '9876543211',
                email: 'mary.e@email.com',
                dateOfBirth: new Date('1988-03-22'),
                age: 36,
                gender: 'Female',
                address: 'Thrissur, Kerala',
                isAvailable: true,
            },
            {
                donorName: 'Thomas George',
                bloodGroup: 'B+',
                phone: '9876543212',
                email: 'thomas.g@email.com',
                dateOfBirth: new Date('1985-11-08'),
                age: 39,
                gender: 'Male',
                address: 'Ernakulam, Kerala',
                lastDonation: new Date('2024-10-20'),
                isAvailable: true,
            },
            {
                donorName: 'Sarah Thomas',
                bloodGroup: 'AB+',
                phone: '9876543213',
                email: 'sarah.t@email.com',
                dateOfBirth: new Date('1992-07-14'),
                age: 32,
                gender: 'Female',
                address: 'Kottayam, Kerala',
                isAvailable: true,
            },
            {
                donorName: 'Joseph Varghese',
                bloodGroup: 'A-',
                phone: '9876543214',
                email: 'joseph.v@email.com',
                dateOfBirth: new Date('1987-09-30'),
                age: 37,
                gender: 'Male',
                address: 'Kochi,Kerala',
                lastDonation: new Date('2024-08-05'),
                isAvailable: true,
            },
            {
                donorName: 'Anna Maria',
                bloodGroup: 'O-',
                phone: '9876543215',
                email: 'anna.m@email.com',
                dateOfBirth: new Date('1991-12-25'),
                age: 33,
                gender: 'Female',
                address: 'Alappuzha, Kerala',
                isAvailable: true,
            },
            {
                donorName: 'Paul Sebastian',
                bloodGroup: 'B-',
                phone: '9876543216',
                email: 'paul.s@email.com',
                dateOfBirth: new Date('1989-04-18'),
                age: 35,
                gender: 'Male',
                address: 'Thrissur, Kerala',
                lastDonation: new Date('2024-11-01'),
                isAvailable: true,
            },
            {
                donorName: 'Elizabeth Jose',
                bloodGroup: 'AB-',
                phone: '9876543217',
                email: 'elizabeth.j@email.com',
                dateOfBirth: new Date('1993-06-10'),
                age: 31,
                gender: 'Female',
                address: 'Ernakulam, Kerala',
                isAvailable: true,
            },
            {
                donorName: 'George Alex',
                bloodGroup: 'A+',
                phone: '9876543218',
                email: 'george.a@email.com',
                dateOfBirth: new Date('1986-02-28'),
                age: 38,
                gender: 'Male',
                address: 'Kochi, Kerala',
                isAvailable: true,
            },
            {
                donorName: 'Lucy Joseph',
                bloodGroup: 'O+',
                phone: '9876543219',
                email: 'lucy.j@email.com',
                dateOfBirth: new Date('1990-08-12'),
                age: 34,
                gender: 'Female',
                address: 'Kottayam, Kerala',
                lastDonation: new Date('2024-07-15'),
                isAvailable: true,
            },
            {
                donorName: 'James Mathew',
                bloodGroup: 'B+',
                phone: '9876543220',
                email: 'james.m@email.com',
                dateOfBirth: new Date('1984-10-05'),
                age: 40,
                gender: 'Male',
                address: 'Thrissur, Kerala',
                isAvailable: true,
            },
            {
                donorName: 'Rose Mary',
                bloodGroup: 'A+',
                phone: '9876543221',
                email: 'rose.m@email.com',
                dateOfBirth: new Date('1995-01-20'),
                age: 29,
                gender: 'Female',
                address: 'Alappuzha, Kerala',
                isAvailable: true,
            },
            {
                donorName: 'Michael John',
                bloodGroup: 'O+',
                phone: '9876543222',
                email: 'michael.j@email.com',
                dateOfBirth: new Date('1988-11-30'),
                age: 36,
                gender: 'Male',
                address: 'Kochi, Kerala',
                lastDonation: new Date('2024-09-25'),
                isAvailable: true,
            },
            {
                donorName: 'Susan Thomas',
                bloodGroup: 'AB+',
                phone: '9876543223',
                email: 'susan.t@email.com',
                dateOfBirth: new Date('1992-05-08'),
                age: 32,
                gender: 'Female',
                address: 'Ernakulam, Kerala',
                isAvailable: true,
            },
            {
                donorName: 'David George',
                bloodGroup: 'B+',
                phone: '9876543224',
                email: 'david.g@email.com',
                dateOfBirth: new Date('1987-03-15'),
                age: 37,
                gender: 'Male',
                address: 'Kottayam, Kerala',
                isAvailable: true,
            },
        ]);

        console.log(`✅ Created ${bloodDonors.length} blood donors`);

        // Create Documents
        const documents = await Document.insertMany([
            {
                title: 'Sunday Bulletin - December 2024',
                description: 'Weekly parish bulletin with mass timings, announcements, and prayer intentions',
                fileName: 'sunday-bulletin-dec-2024.pdf',
                fileUrl: 'https://example.com/documents/sunday-bulletin-dec-2024.pdf',
                category: 'Bulletin',
                uploadDate: new Date('2024-12-01'),
            },
            {
                title: 'Christmas Parish Newsletter',
                description: 'Special Christmas edition featuring community stories and festive events',
                fileName: 'christmas-newsletter-2024.pdf',
                fileUrl: 'https://example.com/documents/christmas-newsletter-2024.pdf',
                category: 'Newsletter',
                uploadDate: new Date('2024-12-05'),
            },
            {
                title: 'Baptism Application Form',
                description: 'Official form for baptism registration. Please fill and submit to parish office',
                fileName: 'baptism-form.pdf',
                fileUrl: 'https://example.com/documents/baptism-form.pdf',
                category: 'Forms',
                uploadDate: new Date('2024-11-15'),
            },
            {
                title: 'Marriage Registration Form',
                description: 'Application form for marriage sacrament registration',
                fileName: 'marriage-registration-form.pdf',
                fileUrl: 'https://example.com/documents/marriage-form.pdf',
                category: 'Forms',
                uploadDate: new Date('2024-11-20'),
            },
            {
                title: 'Parish Annual Report 2024',
                description: 'Comprehensive annual report covering all parish activities and financials',
                fileName: 'annual-report-2024.pdf',
                fileUrl: 'https://example.com/documents/annual-report-2024.pdf',
                category: 'Reports',
                uploadDate: new Date('2024-11-30'),
            },
            {
                title: 'Weekly Bulletin - Advent Season',
                description: 'Special Advent season bulletin with daily readings and reflections',
                fileName: 'advent-bulletin-2024.pdf',
                fileUrl: 'https://example.com/documents/advent-bulletin.pdf',
                category: 'Bulletin',
                uploadDate: new Date('2024-11-25'),
            },
            {
                title: 'Youth Ministry Newsletter - November',
                description: 'Monthly newsletter from youth ministry with upcoming events and activities',
                fileName: 'youth-newsletter-nov-2024.pdf',
                fileUrl: 'https://example.com/documents/youth-newsletter-nov.pdf',
                category: 'Newsletter',
                uploadDate: new Date('2024-11-10'),
            },
            {
                title: 'Catechism Registration Form',
                description: 'Registration form for children to enroll in catechism classes',
                fileName: 'catechism-registration.pdf',
                fileUrl: 'https://example.com/documents/catechism-form.pdf',
                category: 'Forms',
                uploadDate: new Date('2024-10-01'),
            },
            {
                title: 'Parish Council Meeting Minutes - October',
                description: 'Minutes from the monthly parish council meeting',
                fileName: 'council-minutes-oct-2024.pdf',
                fileUrl: 'https://example.com/documents/council-minutes-oct.pdf',
                category: 'Reports',
                uploadDate: new Date('2024-10-20'),
            },
            {
                title: 'Feast Day Celebration Bulletin',
                description: 'Special bulletin for patron saint feast day celebration',
                fileName: 'feast-day-bulletin.pdf',
                fileUrl: 'https://example.com/documents/feast-day-bulletin.pdf',
                category: 'Bulletin',
                uploadDate: new Date('2024-09-15'),
            },
            {
                title: 'Volunteer Registration Form',
                description: 'Form to register as a parish volunteer for various ministries',
                fileName: 'volunteer-registration.pdf',
                fileUrl: 'https://example.com/documents/volunteer-form.pdf',
                category: 'Forms',
                uploadDate: new Date('2024-09-01'),
            },
            {
                title: 'Financial Report Q3 2024',
                description: 'Third quarter financial report showing income, expenses, and projects',
                fileName: 'financial-report-q3-2024.pdf',
                fileUrl: 'https://example.com/documents/financial-q3-2024.pdf',
                category: 'Reports',
                uploadDate: new Date('2024-10-05'),
            },
        ]);

        console.log(`✅ Created ${documents.length} documents`);

        // Create Family Units
        const familyUnits = await FamilyUnit.insertMany([
            {
                familyName: 'Mathew Family',
                headOfFamily: 'John Mathew',
                parishUnit: 'Unit 1 - St. Mary',
                address: 'MG Road, House #12, Kochi - 682016',
                phone: '9876543210',
                members: [
                    {
                        name: 'John Mathew',
                        dateOfBirth: new Date('1975-05-15'),
                        age: 49,
                        gender: 'Male',
                        relationship: 'Father',
                        phone: '9876543210',
                        email: 'john.m@email.com',
                    },
                    {
                        name: 'Mary Mathew',
                        dateOfBirth: new Date('1978-08-20'),
                        age: 46,
                        gender: 'Female',
                        relationship: 'Mother',
                        phone: '9876543211',
                        email: 'mary.m@email.com',
                    },
                    {
                        name: 'Sarah Mathew',
                        dateOfBirth: new Date('2005-03-10'),
                        age: 19,
                        gender: 'Female',
                        relationship: 'Daughter',
                    },
                    {
                        name: 'David Mathew',
                        dateOfBirth: new Date('2008-11-25'),
                        age: 16,
                        gender: 'Male',
                        relationship: 'Son',
                    },
                ],
            },
            {
                familyName: 'Thomas Family',
                headOfFamily: 'George Thomas',
                parishUnit: 'Unit 2 - St. Joseph',
                address: 'Fort Kochi, Lane 5, Kochi - 682001',
                phone: '9876543212',
                members: [
                    {
                        name: 'George Thomas',
                        dateOfBirth: new Date('1980-07-12'),
                        age: 44,
                        gender: 'Male',
                        relationship: 'Father',
                        phone: '9876543212',
                        email: 'george.t@email.com',
                    },
                    {
                        name: 'Lucy Thomas',
                        dateOfBirth: new Date('1982-04-18'),
                        age: 42,
                        gender: 'Female',
                        relationship: 'Mother',
                        phone: '9876543213',
                    },
                    {
                        name: 'James Thomas',
                        dateOfBirth: new Date('2010-09-05'),
                        age: 14,
                        gender: 'Male',
                        relationship: 'Son',
                    },
                ],
            },
            {
                familyName: 'Joseph Family',
                headOfFamily: 'Paul Joseph',
                parishUnit: 'Unit 1 - St. Mary',
                address: 'Kadavanthra, Flat #205, Kochi - 682020',
                phone: '9876543214',
                members: [
                    {
                        name: 'Paul Joseph',
                        dateOfBirth: new Date('1972-12-30'),
                        age: 52,
                        gender: 'Male',
                        relationship: 'Father',
                        phone: '9876543214',
                        email: 'paul.j@email.com',
                    },
                    {
                        name: 'Anna Joseph',
                        dateOfBirth: new Date('1974-06-15'),
                        age: 50,
                        gender: 'Female',
                        relationship: 'Mother',
                    },
                    {
                        name: 'Michael Joseph',
                        dateOfBirth: new Date('2002-01-20'),
                        age: 22,
                        gender: 'Male',
                        relationship: 'Son',
                        phone: '9876543215',
                    },
                    {
                        name: 'Rose Joseph',
                        dateOfBirth: new Date('2006-08-10'),
                        age: 18,
                        gender: 'Female',
                        relationship: 'Daughter',
                    },
                    {
                        name: 'Vincent Joseph',
                        dateOfBirth: new Date('1945-03-05'),
                        age: 79,
                        gender: 'Male',
                        relationship: 'Grandfather',
                    },
                ],
            },
            {
                familyName: 'Sebastian Family',
                headOfFamily: 'James Sebastian',
                parishUnit: 'Unit 3 - Holy Family',
                address: 'Edappally, Cross Road, Kochi - 682024',
                phone: '9876543216',
                members: [
                    {
                        name: 'James Sebastian',
                        dateOfBirth: new Date('1985-09-22'),
                        age: 39,
                        gender: 'Male',
                        relationship: 'Father',
                        phone: '9876543216',
                        email: 'james.s@email.com',
                    },
                    {
                        name: 'Elizabeth Sebastian',
                        dateOfBirth: new Date('1987-11-08'),
                        age: 37,
                        gender: 'Female',
                        relationship: 'Mother',
                        phone: '9876543217',
                    },
                    {
                        name: 'Emma Sebastian',
                        dateOfBirth: new Date('2012-05-14'),
                        age: 12,
                        gender: 'Female',
                        relationship: 'Daughter',
                    },
                    {
                        name: 'Noah Sebastian',
                        dateOfBirth: new Date('2015-02-28'),
                        age: 9,
                        gender: 'Male',
                        relationship: 'Son',
                    },
                ],
            },
            {
                familyName: 'Varghese Family',
                headOfFamily: 'Dr. Thomas Varghese',
                parishUnit: 'Unit 2 - St. Joseph',
                address: 'Panampilly Nagar, Villa #8, Kochi - 682036',
                phone: '9876543218',
                members: [
                    {
                        name: 'Dr. Thomas Varghese',
                        dateOfBirth: new Date('1968-04-10'),
                        age: 56,
                        gender: 'Male',
                        relationship: 'Father',
                        phone: '9876543218',
                        email: 'thomas.v@email.com',
                    },
                    {
                        name: 'Susan Varghese',
                        dateOfBirth: new Date('1970-10-25'),
                        age: 54,
                        gender: 'Female',
                        relationship: 'Mother',
                        email: 'susan.v@email.com',
                    },
                    {
                        name: 'Rachel Varghese',
                        dateOfBirth: new Date('2000-07-18'),
                        age: 24,
                        gender: 'Female',
                        relationship: 'Daughter',
                        phone: '9876543219',
                        email: 'rachel.v@email.com',
                    },
                ],
            },
            {
                familyName: 'Alex Family',
                headOfFamily: 'Peter Alex',
                parishUnit: 'Unit 3 - Holy Family',
                address: 'Kakkanad, Garden View, Kochi - 682030',
                phone: '9876543220',
                members: [
                    {
                        name: 'Peter Alex',
                        dateOfBirth: new Date('1990-01-08'),
                        age: 34,
                        gender: 'Male',
                        relationship: 'Father',
                        phone: '9876543220',
                        email: 'peter.a@email.com',
                    },
                    {
                        name: 'Maria Alex',
                        dateOfBirth: new Date('1992-06-22'),
                        age: 32,
                        gender: 'Female',
                        relationship: 'Mother',
                        phone: '9876543221',
                    },
                    {
                        name: 'Sophia Alex',
                        dateOfBirth: new Date('2018-12-15'),
                        age: 6,
                        gender: 'Female',
                        relationship: 'Daughter',
                    },
                ],
            },
            {
                familyName: 'George Family',
                headOfFamily: 'David George',
                parishUnit: 'Unit 1 - St. Mary',
                address: 'Marine Drive, Apartment #401, Kochi - 682031',
                phone: '9876543222',
                members: [
                    {
                        name: 'David George',
                        dateOfBirth: new Date('1965-11-30'),
                        age: 59,
                        gender: 'Male',
                        relationship: 'Father',
                        phone: '9876543222',
                    },
                    {
                        name: 'Rosamma George',
                        dateOfBirth: new Date('1967-02-14'),
                        age: 57,
                        gender: 'Female',
                        relationship: 'Mother',
                    },
                    {
                        name: 'Anna George',
                        dateOfBirth: new Date('1998-08-08'),
                        age: 26,
                        gender: 'Female',
                        relationship: 'Daughter',
                        phone: '9876543223',
                        email: 'anna.g@email.com',
                    },
                    {
                        name: 'Jacob George',
                        dateOfBirth: new Date('2001-05-20'),
                        age: 23,
                        gender: 'Male',
                        relationship: 'Son',
                        phone: '9876543224',
                    },
                    {
                        name: 'Mary Kunjamma',
                        dateOfBirth: new Date('1940-09-10'),
                        age: 84,
                        gender: 'Female',
                        relationship: 'Grandmother',
                    },
                ],
            },
            {
                familyName: 'John Family',
                headOfFamily: 'Stephen John',
                parishUnit: 'Unit 2 - St. Joseph',
                address: 'Vyttila, Junction Road, Kochi - 682019',
                phone: '9876543225',
                members: [
                    {
                        name: 'Stephen John',
                        dateOfBirth: new Date('1988-03-17'),
                        age: 36,
                        gender: 'Male',
                        relationship: 'Father',
                        phone: '9876543225',
                        email: 'stephen.j@email.com',
                    },
                    {
                        name: 'Grace John',
                        dateOfBirth: new Date('1990-07-05'),
                        age: 34,
                        gender: 'Female',
                        relationship: 'Mother',
                    },
                    {
                        name: 'Ethan John',
                        dateOfBirth: new Date('2014-10-12'),
                        age: 10,
                        gender: 'Male',
                        relationship: 'Son',
                    },
                    {
                        name: 'Olivia John',
                        dateOfBirth: new Date('2017-04-30'),
                        age: 7,
                        gender: 'Female',
                        relationship: 'Daughter',
                    },
                ],
            },
        ]);

        console.log(`✅ Created ${familyUnits.length} family units`);

        console.log('\n🎉 Seed data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Churches: ${churches.length}`);
        console.log(`   - Mass Timings: ${massTimings.length}`);
        console.log(`   - Notifications: ${notifications.length}`);
        console.log(`   - Gallery Images: ${galleryImages.length}`);
        console.log(`   - Committee Members: ${committeeMembers.length}`);
        console.log(`   - News Items: ${newsItems.length}`);
        console.log(`   - Blood Donors: ${bloodDonors.length}`);
        console.log(`   - Documents: ${documents.length}`);
        console.log(`   - Family Units: ${familyUnits.length}`);

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
