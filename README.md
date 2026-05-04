# AI Career Navigator

AI Career Navigator is a full-stack AI resume analysis platform. Users upload a resume, select a target role, receive skill extraction, skill gap analysis, job readiness score, AI-generated recommendations, a week-by-week roadmap, and saved analysis history.

## Features

- Resume upload and PDF parsing
- Target role matching for SDE, AI/ML, Data Science, DevOps, Frontend, and Backend
- Skill extraction and gap analysis
- Job readiness score
- Gemini AI roadmap generation with OpenAI fallback
- Rule-based fallback roadmap if AI fails
- MongoDB analysis history
- Search, filter, pagination/load more for history
- Analysis detail page
- Toast notifications and confirmation modal
- Premium responsive UI with animations

## Tech Stack

### Frontend

- React + Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Hot Toast
- Lucide React

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- Multer
- pdf-parse
- Gemini API
- OpenAI API
- Helmet
- Express Rate Limit

## Local Setup

### 1. Clone and install frontend

```bash
git clone <your-repo-url>
cd ai-career-navigator
npm install
```

Create a frontend environment file from the example:

```bash
cp .env.example .env
```

Default frontend API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Install backend

```bash
cd backend
npm install
```

Create backend environment file:

```bash
cp .env.example .env
```

For local development, use local MongoDB:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ai-career-navigator
```

For deployment, replace local MongoDB with a MongoDB Atlas URI.

### 3. Start local MongoDB

Make sure MongoDB is running locally before starting the backend.

On Windows, you can check the MongoDB service from Services or run:

```bash
net start MongoDB
```

### 4. Start backend

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 5. Start frontend

```bash
cd ..
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

Backend variables are documented in:

```text
backend/.env.example
```

Frontend variables are documented in:

```text
.env.example
```

Never push real `.env` files to GitHub.

## Deployment Notes

Before deployment:

- Replace local `MONGO_URI` with MongoDB Atlas URI
- Add `CLIENT_URLS` for deployed frontend domain
- Add production API keys in hosting provider environment settings
- Keep `.env` files private

## Project Status

Completed phases:

- Phase 1: Frontend UI
- Phase 2: Backend + Resume Analysis
- Phase 3: AI Integration
- Phase 3.5: Premium UI/UX Polish
- Phase 4: Database + User History
- Phase 4.5: Product Hardening

Next recommended phase:

- Phase 5: Export roadmap as PDF
