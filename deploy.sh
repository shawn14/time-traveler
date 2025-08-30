#!/bin/bash

# Cloud Run deployment script for Time Traveler app

# Configuration
PROJECT_ID="vibecoding-8dbf1"  # Your Google Cloud Project ID
SERVICE_NAME="time-traveler"
REGION="us-south1"
GEMINI_API_KEY="AIzaSyA6UNZCJfQHKwtMZT2F1yku667LVe4nWUA"

echo "🚀 Deploying Time Traveler to Cloud Run..."

# Build and submit the container image
echo "📦 Building container image..."
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME}

# Deploy to Cloud Run with environment variables
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=${GEMINI_API_KEY} \
  --memory 512Mi \
  --timeout 60s

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at the URL provided above"