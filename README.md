# ⚽ FIFA Nexus AI

> **AI-powered Stadium Operating System for FIFA World Cup 2026**

FIFA Nexus AI is a comprehensive, intelligent platform unifying fans, volunteers, organizers, security staff, and venue operators through Google Gemini AI.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | FastAPI (Python 3.12) |
| AI | Google Gemini 1.5 Flash |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Deployment | Firebase Hosting + Google Cloud Run |

---

## 📁 Project Structure

```
FIFA-Nexus-AI/
├── frontend/                  # React + Vite SPA
│   ├── public/
│   └── src/
│       ├── assets/            # Static assets
│       ├── components/
│       │   ├── layout/        # Navbar, Sidebar, Footer, PageHeader
│       │   ├── shared/        # RoleCard, StatCard, AIAssistantButton
│       │   └── ui/            # Button, Card, Badge, Modal, Spinner…
│       ├── contexts/          # ThemeContext, AuthContext, AppContext
│       ├── hooks/             # useFirestore, useGemini, useAuth…
│       ├── layouts/           # MainLayout, DashboardLayout, AuthLayout
│       ├── pages/             # HomePage, DashboardPage, and role pages
│       └── services/          # firebase.js, api.js, gemini.js
│
├── backend/                   # FastAPI Python service
│   ├── app/
│   │   ├── ai/                # GeminiClient
│   │   ├── api/               # Request handlers
│   │   ├── config/            # Settings (pydantic-settings)
│   │   ├── models/            # Pydantic data models
│   │   ├── prompts/           # Gemini prompt templates
│   │   ├── routes/            # FastAPI routers
│   │   ├── services/          # Business logic layer
│   │   └── utils/             # Logger, response helpers, validators
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── .firebaserc
```

---

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env          # fill in your keys
uvicorn main:app --reload
```

---

## 🔑 Environment Variables

### `frontend/.env.local`
```
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

### `backend/.env`
```
GEMINI_API_KEY=
FIREBASE_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
CORS_ORIGINS=http://localhost:5173
ENVIRONMENT=development
```

---

## 👥 User Roles

| Role | Module | Key AI Features |
|------|--------|-----------------|
| Fan | `/fans` | Navigation, concession queues, match info |
| Security | `/security` | Incident assessment, crowd analysis |
| Volunteer | `/volunteers` | Task guidance, protocol lookup |
| Venue Operator | `/venue` | Facility monitoring, predictive maintenance |
| Organizer | `/organizers` | Cross-venue analytics, AI reports |

---

## 🌐 API Endpoints

| Prefix | Tag | Description |
|--------|-----|-------------|
| `/fans` | Fan Experience | Match info, navigation, Q&A |
| `/security` | Security Ops | Incidents, crowd status, alerts |
| `/volunteers` | Volunteer Mgmt | Tasks, schedules, AI guidance |
| `/venue` | Venue Ops | Facilities, status, issue reporting |
| `/organizers` | Organizer Tools | Dashboard, reports, insights |
| `/ai` | AI Assistant | Chat, summarize, translate |
| `/health` | System | Health check |

Interactive docs: `http://localhost:8000/docs`

---

## 📦 Deployment

### Firebase Hosting (Frontend)
```bash
cd frontend && npm run build
firebase deploy --only hosting
```

### Google Cloud Run (Backend)
```bash
cd backend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/fifa-nexus-ai-backend
gcloud run deploy fifa-nexus-ai-backend \
  --image gcr.io/[PROJECT_ID]/fifa-nexus-ai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📄 License
MIT © FIFA Nexus AI Team
