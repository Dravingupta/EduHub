# EduHub | The Token-Efficient Learning Intelligence Engine

EduHub is an AI-driven, progressive learning platform that dynamically tailors educational content to the user. It leverages a structured "Visual" lesson engine to deliver concepts, code examples, math (LaTeX), and diagrams (Mermaid.js) without the overwhelming text walls of typical AI wrappers.

## 🚀 Core Features

- **Universal & Custom Subjects:** Pre-computed universal sets (e.g. Physics JEE, Biology NEET) that load instantly with zero LLM API cost, while also supporting fully custom syllabus ingestion via AI generation.
- **Progressive Delivery:** Content is broken into bite-sized block components (Concepts, Examples, Diagrams, Mistakes, Summaries) that unlock sequentially.
- **Adaptive "Swap" Engine:** Experiencing a bad explanation or finding it too simple? Tune the "density" dial from Concise to Detailed, and instantly regenerate the single block customized to your requested reading level. 
- **Standardized Evaluation:** Deterministic 10-MCQ modular testing (4 Easy, 4 Medium, 2 Hard) that accurately calculates your true topic mastery.
- **AI Tutor Chat:** An inline, conversational AI widget attached to specific lessons or incorrect assignment questions to provide dedicated help without losing context.

## 🛠 Tech Stack

**Frontend:**
- React 18, Vite
- Tailwind CSS (Premium Matte Graphite Design System)
- React Router DOM
- Firebase Authentication
- Mermaid.js & KaTeX

**Backend:**
- Node.js, Express
- MongoDB & Mongoose
- Google Gemini LLM API (Structured JSON Generation)

## 📦 Setting Up Locally

### 1. Clone the repository
`git clone <your-repo-link>`

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder containing:
```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
GEMINI_API_KEY=your_gemini_api_key
MEGALLM_API_KEY=your_megallm_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate into the `frontend` folder:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` folder containing:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5000
```
Start the Vite dev server:
```bash
npm run dev
```

## 🌐 Deployment
- **Frontend** is configured for seamless deployment on **Vercel** via the included `vercel.json` SPA rewrite rules.
- **Backend** is configured for deployment on **Render** or similar platforms, utilizing robust `cors` middleware explicitly allowing custom origins.
