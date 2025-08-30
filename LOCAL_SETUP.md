# Local Setup Instructions

## Quick Start

Follow these steps to run the application locally:

### 1. Update package.json

Since the package.json file is locked, you need to manually update it. Replace your current package.json with the contents of `package-server.json`:

```bash
mv package-server.json package.json
```

Or manually copy the contents from `package-server.json` to `package.json`.

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Edit the `.env` file and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 4. Replace App.tsx

Use the server-based version of the app:

```bash
mv App.server.tsx App.tsx
```

### 5. Update Vite Config

Replace vite.config.ts with the server version:

```bash
mv vite.config.server.ts vite.config.ts
```

### 6. Run the Application

Start both frontend and backend servers:

```bash
npm run dev:all
```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Alternative: Run Servers Separately

If you prefer to run the servers in separate terminals:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

## Testing the Application

1. Open http://localhost:5173 in your browser
2. Upload an image or take a photo
3. Select a generation mode (Time Traveler, Style Sculptor, etc.)
4. Click "Generate"
5. The images will be generated using your server-side API

## Troubleshooting

### "Cannot find module" errors
Make sure you've run `npm install` after updating package.json

### API errors
- Check that your GEMINI_API_KEY is set correctly in .env
- Ensure the backend server is running (check Terminal 2 or the dev:all output)
- Check the console for any CORS errors

### Port already in use
If port 3001 is already in use, you can change it in the .env file:
```
PORT=3002
```

Then update the proxy in vite.config.ts to match:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3002',
    changeOrigin: true,
  }
}
```