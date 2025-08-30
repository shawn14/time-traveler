# Deployment Guide for Google Cloud Run

## Overview

This application has been converted from a client-side architecture to a server-side architecture to securely handle the Gemini API key on Google Cloud Run.

## Architecture Changes

### Before (Client-Side)
- Used `@google/genai` client SDK
- API key exposed in browser
- Direct API calls from frontend

### After (Server-Side)
- Express.js backend server
- API key stored securely on server
- Frontend communicates with backend via REST API
- Backend makes Gemini API calls

## Prerequisites

1. Google Cloud account with billing enabled
2. Google Cloud CLI (`gcloud`) installed
3. Docker installed (for local testing)
4. Gemini API key from Google AI Studio

## Deployment Steps

### 1. Set up Google Cloud Project

```bash
# Create a new project or select existing
gcloud projects create YOUR_PROJECT_ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Configure Authentication

```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud auth configure-docker
```

### 3. Build and Push Docker Image

```bash
# Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/time-traveler:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/time-traveler:latest
```

### 4. Deploy to Cloud Run

```bash
# Deploy with environment variables
gcloud run deploy time-traveler \
  --image gcr.io/YOUR_PROJECT_ID/time-traveler:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY \
  --port 3001 \
  --memory 512Mi \
  --max-instances 10
```

### 5. Alternative: Using Cloud Run Button

You can also use the Cloud Run console to deploy:

1. Go to Cloud Run in Google Cloud Console
2. Click "Create Service"
3. Select "Deploy one revision from an existing container image"
4. Enter your container image URL
5. Configure service settings
6. Add environment variable: `GEMINI_API_KEY`
7. Click "Create"

## Environment Variables

Set these in Cloud Run:

- `GEMINI_API_KEY` (required): Your Gemini API key
- `PORT` (auto-set by Cloud Run): The port to listen on
- `NODE_ENV`: Set to `production`

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Create .env file

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Run Development Servers

```bash
# Run both frontend and backend
npm run dev:all

# Or run separately:
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Testing the Deployment

1. Visit your Cloud Run URL
2. Upload an image
3. Select a generation mode
4. Click "Generate"
5. Verify images are generated successfully

## Monitoring and Logs

View logs in Cloud Run:

```bash
gcloud run services logs read time-traveler --region us-central1
```

Or use the Cloud Console for detailed metrics and logs.

## Security Considerations

1. **API Key Security**: The API key is now stored as an environment variable on the server, not exposed to clients
2. **CORS**: Configure CORS in production to restrict origins
3. **Rate Limiting**: Consider implementing rate limiting for the API endpoints
4. **Authentication**: Add authentication if needed for your use case

## Troubleshooting

### Images not generating
- Check Cloud Run logs for errors
- Verify GEMINI_API_KEY is set correctly
- Ensure the API key has proper permissions

### CORS errors
- Update CORS configuration in `server/index.ts`
- Add your domain to allowed origins

### Memory issues
- Increase Cloud Run memory allocation
- Optimize image resizing logic

## Cost Optimization

1. Set maximum instances to prevent runaway costs
2. Use Cloud Run's automatic scaling
3. Monitor usage in Google Cloud Console
4. Consider using Cloud CDN for static assets