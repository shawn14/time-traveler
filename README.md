# Time Traveler

AI-powered photo transformation app that reimagines your photos across different decades, styles, and locations using Google's Gemini AI.

## Features

- **Time Traveler Mode**: Transform your photos to different decades (1950s-2000s)
- **Style Sculptor**: Apply artistic styles like Cyberpunk, Film Noir, Anime, and more
- **World Wanderer**: Place yourself in breathtaking locations around the world
- **Character Creator**: Experiment with new looks and hairstyles

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Express.js with TypeScript
- **AI**: Google Gemini API (gemini-2.5-flash-image-preview)
- **Deployment**: Google Cloud Run with Docker

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shawn14/time-traveler.git
cd time-traveler
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_api_key_here
```

### Development

Run both frontend and backend servers:
```bash
npm run dev:all
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:3001

### Building for Production

```bash
npm run build
```

### Deployment to Google Cloud Run

1. Build the Docker image:
```bash
docker build -t time-traveler .
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy time-traveler --image time-traveler --platform managed
```

## Project Structure

```
time-traveler/
├── components/          # React components
├── server/             # Express backend
│   ├── routes/         # API routes
│   └── services/       # Gemini service
├── services/           # Frontend services
├── lib/                # Utility functions
├── public/             # Static assets
├── Dockerfile          # Container configuration
└── package.json        # Dependencies and scripts
```

## License

Apache-2.0