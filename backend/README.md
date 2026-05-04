# AI Career Navigator Backend

Backend API for resume upload, PDF parsing, skill extraction, AI roadmap generation, and analysis history.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Local MongoDB

For development:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ai-career-navigator
```

For deployment, replace this with MongoDB Atlas.

## Main APIs

```text
GET    /api/health
POST   /api/resume/upload
POST   /api/resume/extract
POST   /api/resume/analyze
GET    /api/analysis?search=&role=All&page=1&limit=6
GET    /api/analysis/:id
DELETE /api/analysis/:id
```

## Security

The backend uses:

- Helmet
- Rate limiting
- JSON body size limit
- Multer PDF-only upload filter
- MongoDB ObjectId validation
- Global error middleware
