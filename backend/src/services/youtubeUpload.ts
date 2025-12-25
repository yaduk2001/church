import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:8000/auth/youtube/callback'
);

// Set credentials if refresh token exists
if (process.env.YOUTUBE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
    });
}

export async function uploadToYouTube(
    filePath: string,
    title: string,
    description: string,
    tags: string[] = ['church', 'live stream']
): Promise<string> {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        const response = await youtube.videos.insert({
            part: ['snippet', 'status'],
            requestBody: {
                snippet: {
                    title,
                    description,
                    categoryId: '29', // Nonprofits & Activism
                    tags,
                },
                status: {
                    privacyStatus: 'unlisted', // Not public on YouTube search
                    selfDeclaredMadeForKids: false,
                },
            },
            media: {
                body: fs.createReadStream(filePath),
            },
        });

        const videoId = response.data.id;

        if (!videoId) {
            throw new Error('Failed to get video ID from YouTube');
        }

        console.log(`✅ Video uploaded to YouTube: ${videoId}`);
        return videoId;
    } catch (error) {
        console.error('❌ Error uploading to YouTube:', error);
        throw error;
    }
}

export async function deleteLocalRecording(filePath: string): Promise<void> {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted local recording: ${filePath}`);
        }
    } catch (error) {
        console.error('Error deleting local recording:', error);
    }
}

// Generate OAuth URL for first-time setup
export function getAuthUrl(): string {
    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
}
