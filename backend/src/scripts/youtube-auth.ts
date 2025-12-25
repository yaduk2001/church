import { getAuthUrl, getTokensFromCode } from '../services/youtubeUpload';
import readline from 'readline';

/**
 * YouTube API Setup Script
 * 
 * This script helps you set up YouTube API authentication for automatic video uploads.
 * 
 * Prerequisites:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a new project (or select existing)
 * 3. Enable "YouTube Data API v3"
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add http://localhost:8000/auth/youtube/callback to authorized redirect URIs
 * 6. Download credentials and add to .env:
 *    - YOUTUBE_CLIENT_ID
 *    - YOUTUBE_CLIENT_SECRET
 * 
 * Run this script: npm run youtube-auth
 */

async function setupYouTubeAuth() {
    console.log('\n🎬 YouTube API Setup\n');
    console.log('This script will help you authorize the app to upload videos to YouTube.\n');

    // Step 1: Generate auth URL
    const authUrl = getAuthUrl();
    console.log('📋 Step 1: Visit this URL to authorize the application:\n');
    console.log(authUrl);
    console.log('\n');

    // Step 2: Get authorization code
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('📝 Step 2: After authorizing, paste the authorization code here: ', async (code) => {
        try {
            console.log('\n⏳ Exchanging code for tokens...\n');

            const tokens = await getTokensFromCode(code);

            console.log('✅ Success! Add this to your .env file:\n');
            console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
            console.log('🎉 Setup complete! You can now upload videos to YouTube automatically.\n');

        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            rl.close();
            process.exit(0);
        }
    });
}

setupYouTubeAuth();
