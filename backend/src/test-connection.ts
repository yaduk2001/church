import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const testConnection = async () => {
    console.log('🔍 Testing MongoDB Connection...\n');

    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'church_site';

    console.log(`📡 Connecting to: ${mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    console.log(`📊 Database: ${dbName}\n`);

    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();

        console.log('✅ Successfully connected to MongoDB!');

        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();

        console.log(`\n📁 Collections in database (${collections.length}):`);
        if (collections.length === 0) {
            console.log('   (No collections yet - this is normal for a new database)');
        } else {
            collections.forEach(col => console.log(`   - ${col.name}`));
        }

        // Test write
        console.log('\n🧪 Testing write operation...');
        const testCollection = db.collection('connection_test');
        await testCollection.insertOne({
            test: true,
            timestamp: new Date(),
            message: 'Connection test successful!'
        });
        console.log('✅ Write test successful!');

        // Test read
        console.log('\n🧪 Testing read operation...');
        const doc = await testCollection.findOne({ test: true });
        console.log('✅ Read test successful!');
        console.log(`   Retrieved: ${doc?.message}`);

        // Cleanup
        await testCollection.deleteMany({ test: true });

        await client.close();
        console.log('\n✅ All tests passed! Your MongoDB connection is working perfectly! 🎉\n');

    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error);
        console.log('\n💡 Troubleshooting tips:');
        console.log('   1. Check your MONGO_URL in .env file');
        console.log('   2. Make sure you replaced <password> with your actual password');
        console.log('   3. Verify Network Access is configured in MongoDB Atlas');
        console.log('   4. Check if your IP address is whitelisted\n');
        process.exit(1);
    }
};

testConnection();
