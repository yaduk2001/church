# Live Streaming System - Setup Guide

## Quick Start

### 1. Install Dependencies
Already done! ✅

### 2. Configure YouTube API

#### A. Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create new project: "Church Live Stream"
3. Enable "YouTube Data API v3"

#### B. Create OAuth Credentials
1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: "Web application"
3. Name: "Church Site Live Stream"
4. Authorized redirect URIs: `http://localhost:8000/auth/youtube/callback`
5. Click "Create" and download JSON

#### C. Add to .env
Copy values from downloaded JSON to your `.env` file:
```env
YOUTUBE_CLIENT_ID=your_client_id_from_json
YOUTUBE_CLIENT_SECRET=your_client_secret_from_json
YOUTUBE_REDIRECT_URI=http://localhost:8000/auth/youtube/callback
```

#### D. Run Auth Script (One-time)
```bash
cd backend
npx ts-node src/scripts/youtube-auth.ts
```
Follow the prompts to get your `YOUTUBE_REFRESH_TOKEN` and add it to `.env`.

### 3. Test the System

#### Admin Side:
1. Go to http://localhost:3000/admin/dashboard
2. Click "Live Stream" in sidebar
3. Enter title and select tag
4. Click "Start Live Stream"

#### Public Side:
1. Go to http://localhost:3000/watch-live
2. Network check will run automatically
3. If stream is active, you'll see the player

#### Videos Archive:
1. Go to http://localhost:3000/videos
2. View past recordings (after they're published)

## Features Implemented

✅ Admin live stream control page
✅ Network quality detection (blocks 2G/3G)
✅ Public watch-live page
✅ Videos archive with YouTube embeds
✅ Automatic YouTube upload (ready for integration)
✅ Delayed publishing (12-24 hours configurable)
✅ Live viewer count tracking
✅ Stream metadata management

## Next Steps (For Full Implementation)

### Media Server Integration
To enable actual video streaming, you'll need to integrate a media server like:
- node-media-server (already installed)
- OBS Studio for admin to broadcast
- HLS player for viewers

This requires additional configuration and is ready to be implemented when needed.

## Files Created

### Backend
- `models/LiveStream.ts` - Stream data model
- `routes/live-stream.routes.ts` - API endpoints
- `services/youtubeUpload.ts` - YouTube integration
- `scripts/youtube-auth.ts` - Setup script
- `.env.example` - Configuration template

### Frontend
- `app/admin/dashboard/live-stream/page.tsx` - Admin control
- `app/watch-live/page.tsx` - Public viewer
- `app/videos/page.tsx` - Archive
- `app/utils/networkDetection.ts` - Network checks

## Testing Checklist

- [ ] YouTube API credentials configured
- [ ] Admin can access live stream page
- [ ] Network detection works on watch-live page
- [ ] Videos page displays (empty initially)
- [ ] API endpoints respond correctly

## Support

All code is ready and integrated. The system is functional for managing streams and displaying YouTube videos. The actual video streaming requires media server configuration which can be added as needed.
