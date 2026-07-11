# StadiumMind AI - Production Deployment Checklist

Follow this checklist to perform a secure and successful release of **StadiumMind AI** to Google Cloud Platform (GCP) and Firebase.

---

## 🔑 Phase 1: Secrets & Environment Setup

- [ ] **GCP Project**: Ensure you have a target GCP project ID (e.g. `stadiummind-ai`).
- [ ] **Gemini API Key**: Retrieve a production API key from Google AI Studio.
- [ ] **Firebase Service Account**:
  - Generate a service account key from the Firebase Console (Settings -> Service Accounts).
  - Save the key contents as a GitHub Repository secret: `FIREBASE_SERVICE_ACCOUNT_STADIUMMIND_AI`.
- [ ] **GCP GitHub Deploy Key**:
  - Create a Service Account in IAM with permissions for Artifact Registry and Cloud Run.
  - Generate a JSON key and add it as a GitHub secret: `GCP_SA_KEY`.
  - Add your GCP project ID as a GitHub secret: `GCP_PROJECT_ID`.
- [ ] **Secret Manager**:
  - In your GCP project, enable Secret Manager API.
  - Create a secret named `GEMINI_API_KEY` and add the production API key as its value.

---

## 🐋 Phase 2: Local Container Build & Verification

- [ ] **Local Build**: Run docker compose to build the backend:
  ```bash
  docker compose build
  ```
- [ ] **Local Run**: Test run the stack locally to verify:
  ```bash
  docker compose up -d
  ```
- [ ] **Verify Health Checks**: Ensure `/health` endpoint returns `status: operational`.
  ```bash
  curl http://localhost:8080/health
  ```
- [ ] **Inspect Container logs**: Ensure logs format as structured JSON:
  ```bash
  docker compose logs backend
  ```

---

## 🚀 Phase 3: Cloud Run Deployment (Backend)

- [ ] **Deploy Command**: If deploying manually via CLI:
  ```bash
  gcloud run deploy stadiummind-backend-api \
    --source ./backend \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "ENVIRONMENT=production,LOG_LEVEL=INFO,GEMINI_MODEL=gemini-1.5-flash" \
    --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"
  ```
- [ ] **Verify URL**: Save the generated Cloud Run service URL (e.g. `https://stadiummind-api-xyz.run.app`).

---

## 🎨 Phase 4: Firebase Hosting Deployment (Frontend)

- [ ] **Configure API Base URL**: In `frontend/.env.production`, set:
  ```env
  VITE_API_BASE_URL=https://stadiummind-api-xyz.run.app
  ```
- [ ] **Vite Production Compile**:
  ```bash
  cd frontend
  npm ci
  npm run build
  ```
- [ ] **Firebase Deploy**:
  ```bash
  firebase deploy --only hosting
  ```

---

## 🛠️ Phase 5: CI/CD Pipeline Automation

- [ ] **Verify Github Push**: Push changes to the `main` branch:
  ```bash
  git add .
  git commit -m "chore: setup production deploy config"
  git push origin main
  ```
- [ ] **Actions Monitor**: Open the **Actions** tab on GitHub and ensure the `StadiumMind AI CI/CD` workflow runs and passes successfully.
