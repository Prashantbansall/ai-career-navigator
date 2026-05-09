# AI Career Navigator Backend

Backend API for **AI Career Navigator**. It handles resume upload, PDF parsing, skill extraction, target-role analysis, AI roadmap generation, job readiness scoring, saved analysis history, and backend-generated PDF career reports.

## Features

- Resume PDF upload
- Resume text extraction
- Skill extraction
- Target role validation
- Skill gap analysis
- Job readiness score generation
- AI-powered roadmap generation
- Gemini AI support with OpenAI fallback
- Rule-based fallback roadmap if AI fails
- MongoDB analysis history
- Search, filter, pagination, and load-more support for saved analyses
- Single analysis detail API
- Delete saved analysis API
- Backend PDF report export using Puppeteer
- Health check route
- Role list API
- Centralized error handling
- Upload error handling
- MongoDB ObjectId validation
- Security middleware and rate limiting

## Setup

```bash
cd backend
npm install
cp .env.example .env
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

## Local MongoDB

For local development:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ai-career-navigator
```

For deployment, replace the local URI with a MongoDB Atlas connection string.

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-career-navigator
```

> Never push real database credentials to GitHub.

## Environment Variables

Create a `.env` file inside the `backend` folder.

Required/common variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-career-navigator
CLIENT_URLS=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

Use `backend/.env.example` as the reference file.

## Main APIs

```http
GET    /api/health
GET    /api/roles

POST   /api/resume/upload
POST   /api/resume/extract
POST   /api/resume/analyze

GET    /api/analysis?search=&role=All&page=1&limit=6
GET    /api/analysis/:id
GET    /api/analysis/:id/pdf
DELETE /api/analysis/:id
```

## API Routes

### Health Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend health |

### Role Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/roles` | Get supported target roles |

### Resume Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload resume PDF |
| POST | `/api/resume/extract` | Extract text from uploaded resume |
| POST | `/api/resume/analyze` | Analyze resume against selected target role |

### Analysis Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analysis` | Get saved analysis history with search, role filter, and pagination |
| GET | `/api/analysis/:id` | Get single saved analysis by ID |
| GET | `/api/analysis/:id/pdf` | Download backend-generated PDF report |
| DELETE | `/api/analysis/:id` | Delete saved analysis by ID |

## Backend PDF Export

The backend supports PDF report generation using **Puppeteer**.

PDF export endpoint:

```http
GET /api/analysis/:id/pdf
```

This endpoint generates and downloads a clean PDF report from saved MongoDB analysis data.

The PDF report includes:

- Resume name
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
- Free learning resource
- Mini-project suggestion
- AI provider used
- Model used
- Prompt version
- Generated date

Important PDF files:

```text
backend/services/pdfReportService.js
backend/controllers/analysisController.js
backend/routes/analysisRoutes.js
backend/tests/analysisPdf.test.js
```

## PDF Export Behavior

Saved analyses can be exported using the backend PDF route:

```http
GET /api/analysis/:id/pdf
```

Frontend behavior:

```text
Saved analysis with MongoDB _id  -> backend Puppeteer PDF export
Local/unsaved analysis           -> frontend fallback PDF export
```

Backend PDF export is better for saved reports because it generates the PDF directly from database data and supports cleaner page breaks using print-friendly HTML and CSS.

## AI Roadmap Generation

The backend supports AI roadmap generation using:

- Gemini API
- OpenAI API fallback
- Rule-based fallback if AI providers fail

The analysis response can include:

- Extracted skills
- Required skills
- Matched skills
- Missing skills
- Job readiness score
- Readiness reason
- AI summary
- AI recommendations
- AI roadmap
- AI provider metadata
- Model used
- Prompt version

## Security

The backend uses:

- Helmet
- Express rate limiting
- JSON body size limit
- CORS allowlist
- Multer PDF-only upload filter
- MongoDB ObjectId validation
- Target role validation
- Global error middleware
- Upload error middleware

## Testing

Run backend tests from the backend folder:

```bash
npm test
```

Backend tests cover:

- Health route
- Resume upload/analyze flow
- Analysis routes
- Backend PDF export route
- Invalid analysis ID handling
- Missing analysis handling

PDF export test file:

```text
backend/tests/analysisPdf.test.js
```

## Important Backend Files

```text
backend/app.js
backend/server.js

backend/config/db.js
backend/config/aiConfig.js

backend/controllers/resumeController.js
backend/controllers/analysisController.js
backend/controllers/roleController.js

backend/routes/resumeRoutes.js
backend/routes/analysisRoutes.js
backend/routes/roleRoutes.js
backend/routes/healthRoutes.js

backend/services/resumeService.js
backend/services/aiService.js
backend/services/aiRoadmapService.js
backend/services/pdfReportService.js

backend/middleware/asyncHandler.js
backend/middleware/errorMiddleware.js
backend/middleware/uploadErrorHandler.js
backend/middleware/validateObjectId.js
backend/middleware/validateTargetRole.js

backend/models/Analysis.js

backend/tests/analysis.test.js
backend/tests/analysisPdf.test.js
backend/tests/health.test.js
backend/tests/resume.test.js
backend/tests/resumeAnalyzeSuccess.test.js
```

## Deployment Notes

Before backend deployment:

- Replace local `MONGO_URI` with MongoDB Atlas URI
- Add deployed frontend URL to `CLIENT_URLS`
- Add production Gemini/OpenAI API keys
- Keep `.env` private
- Make sure the hosting platform supports Puppeteer
- Configure enough memory for Puppeteer PDF generation
- Test `/api/health` after deployment
- Test `/api/analysis/:id/pdf` after deployment

Some platforms may require additional Puppeteer configuration or a Chromium-compatible runtime.

## Current Backend Status

The backend currently supports:

- Resume upload
- Resume parsing
- Resume analysis
- AI roadmap generation
- Fallback roadmap generation
- Analysis history
- Analysis detail
- Analysis deletion
- Role list API
- Backend PDF export
- Backend tests for major routes
- Security and validation middleware
