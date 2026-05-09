# AI Career Navigator

AI Career Navigator is a full-stack AI resume analysis platform. Users can upload a resume, select a target role, and receive skill extraction, skill gap analysis, a job readiness score, AI-generated recommendations, a week-by-week learning roadmap, saved analysis history, and downloadable PDF career reports.

## Features

- Resume upload and PDF parsing
- Target role matching for SDE, AI/ML, Data Science, DevOps, Frontend, and Backend roles
- Skill extraction from uploaded resumes
- Skill gap analysis based on the selected target role
- Job readiness score with explanation
- Gemini AI roadmap generation with OpenAI fallback
- Rule-based fallback roadmap if AI generation fails
- MongoDB-based analysis history
- Search, filter, pagination, and load-more support for history
- Analysis detail page for saved reports
- Frontend PDF roadmap export
- Backend Puppeteer PDF report export
- Frontend fallback PDF export for unsaved analysis
- Toast notifications and confirmation modal
- Premium responsive UI with animations

## PDF Roadmap Export

AI Career Navigator supports exporting the generated career roadmap as a clean downloadable PDF report.

The exported report includes:

- Candidate resume name
- Target role
- Role title
- Job readiness score
- Readiness reason
- Extracted skills
- Matched skills
- Missing skills
- AI career summary
- AI recommendations
- Week-by-week roadmap
- Difficulty level
- Time estimate
- Free learning resources
- Mini-project suggestions
- AI provider metadata
- Model used
- Prompt version
- Generated date

## PDF Export Flow

The project supports two PDF export flows.

### 1. Frontend PDF Export

The Dashboard page can export a printable roadmap report using:

- `jspdf`
- `html2canvas-pro`

This is useful for local analysis data and frontend fallback export.

Important frontend files:

```text
src/utils/exportPdf.js
src/components/dashboard/RoadmapReport.jsx
src/pages/Dashboard.jsx
```

### 2. Backend PDF Export

Saved analysis reports can be exported from the backend using Puppeteer.

Backend PDF route:

```http
GET /api/analysis/:id/pdf
```

Important backend files:

```text
backend/services/pdfReportService.js
backend/controllers/analysisController.js
backend/routes/analysisRoutes.js
backend/tests/analysisPdf.test.js
```

Frontend behavior:

```text
Saved analysis with MongoDB _id  -> backend Puppeteer PDF export
Local/unsaved analysis           -> frontend html2canvas-pro fallback export
```

## Major Implemented Modules

The project currently includes these major modules:

- Frontend dashboard and resume analysis UI
- Backend resume upload and analysis APIs
- AI integration for roadmap generation
- Premium UI/UX polish with responsive design
- Database-based analysis history
- Product hardening with validation, error handling, and security middleware
- Frontend roadmap PDF export
- Backend Puppeteer PDF export
- Frontend and backend test coverage for key flows

## Tech Stack

### Frontend

- React + Vite
- Tailwind CSS v4
- Framer Motion
- React Router
- React Hot Toast
- Lucide React
- jsPDF
- html2canvas-pro
- Vitest
- React Testing Library

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- Multer
- pdf-parse
- Gemini API
- OpenAI API
- Puppeteer
- Helmet
- Express Rate Limit
- Vitest
- Supertest

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

## API Routes

### Health Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Check backend health |

### Resume Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/resume/upload` | Upload resume |
| POST | `/api/resume/extract` | Extract resume text |
| POST | `/api/resume/analyze` | Analyze resume and generate roadmap |

### Analysis Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/analysis` | Get saved analysis history |
| GET | `/api/analysis/:id` | Get a single saved analysis |
| DELETE | `/api/analysis/:id` | Delete a saved analysis |
| GET | `/api/analysis/:id/pdf` | Download backend-generated PDF report |

### Role Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/roles` | Get supported target roles |

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

## Testing

### Run frontend tests

From the project root:

```bash
npm test
```

Frontend tests cover:

- Home page rendering
- Upload page behavior
- History page rendering
- Dashboard rendering
- Export PDF button visibility
- Backend PDF export call
- Frontend PDF fallback export
- PDF loading state

### Run backend tests

From the backend folder:

```bash
cd backend
npm test
```

Backend tests cover:

- Health route
- Resume upload/analyze flow
- Analysis routes
- Backend PDF export route
- Invalid analysis ID handling
- Missing analysis handling

## Deployment Notes

Before deployment:

- Replace local `MONGO_URI` with a MongoDB Atlas URI
- Add `CLIENT_URLS` for the deployed frontend domain
- Add production API keys in hosting provider environment settings
- Keep `.env` files private
- Ensure Puppeteer is supported on your backend hosting platform
- Configure backend memory/resources properly for PDF generation

## Important Project Files

### Frontend

```text
src/pages/Dashboard.jsx
src/pages/AnalysisDetail.jsx
src/pages/History.jsx
src/pages/Upload.jsx
src/services/api.js
src/utils/exportPdf.js
src/components/dashboard/RoadmapReport.jsx
src/pages/__tests__/Dashboard.test.jsx
```

### Backend

```text
backend/
├── controllers/
│   ├── analysisController.js     # Handles analysis history, detail, delete, and PDF export
│   └── resumeController.js       # Handles resume upload, extraction, and analysis
├── routes/
│   ├── analysisRoutes.js         # Analysis history and PDF export routes
│   ├── resumeRoutes.js           # Resume upload, extract, and analyze routes
│   └── roleRoutes.js             # Target role list API routes
├── services/
│   ├── resumeService.js          # Extracts and processes resume text
│   ├── aiRoadmapService.js       # Generates skill gap analysis and roadmap content
│   ├── pdfReportService.js       # Generates professional PDF roadmap reports
|── config/
|   └── aiConfig.js               # AI provider, model, fallback, and prompt configuration
└── tests/
    └── analysisPdf.test.js       # Tests backend PDF export functionality
```

## Current Project Status

AI Career Navigator currently supports the complete resume analysis flow:

- Resume upload
- Resume parsing
- Target role selection
- Skill extraction
- Skill gap analysis
- Job readiness scoring
- AI-generated roadmap
- Saved analysis history
- Analysis detail view
- Frontend PDF export
- Backend Puppeteer PDF export
- Test coverage for major flows

## Next Recommended Work

- Community dashboard
- Compare user roadmap progress with other learners
- User authentication
- Saved user profiles
- Roadmap progress tracking
- PDF design templates
- Email PDF report to user
- Admin dashboard
- Deployment with MongoDB Atlas
- Docker setup
- Accessibility testing with axe
- More frontend and backend test coverage

## Future Improvements

- Community dashboard for learners
- User authentication and personalized dashboards
- Save multiple resumes per user
- Track roadmap progress week by week
- Show community-based learning trends
- Add admin analytics dashboard
- Add email PDF report feature
- Add multiple PDF design templates
- Improve accessibility using axe testing
- Add Docker support for easier deployment
- Deploy frontend and backend with production environment variables
