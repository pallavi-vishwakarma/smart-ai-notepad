# 🧠 Smart AI Notepad

A production-ready, full-stack AI-powered note-taking application built with the **MERN stack** (MongoDB, Express, React, Node.js). Features a TipTap rich text editor, JWT authentication, real-time AI assistance via OpenAI GPT-4o-mini, and a sleek dark-mode UI.

---

## ✨ Feature Overview

| Feature | Details |
|---|---|
| 📝 Rich Editor | TipTap with Bold/Italic/Headings/Tables/Code/Checklists |
| 🤖 AI Modes | Explain (Hinglish), Diagram (Mermaid/ASCII), Solve, Improve |
| ⚡ Auto-save | 2-second debounce + localStorage draft fallback |
| 🔐 Auth | JWT login/register, per-user notes isolation |
| 🏷️ Tags | Inline tag editor, filter notes by tag |
| 📜 Versions | Up to 10 version snapshots per note, one-click restore |
| 📤 Export | PDF (print), Markdown, HTML download |
| 🔃 Drag & Drop | Reorder notes sidebar |
| ⌨️ Shortcuts | Ctrl+S, Ctrl+B/I/U, Ctrl+Z/Y |
| 🌑 Dark Mode | Full dark theme (light mode ready via Tailwind) |

---

## 🗂️ Folder Structure

```
smart-ai-notepad/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/              # Axios API wrappers
│   │   ├── components/
│   │   │   ├── ai/           # AIPanel, DiagramMode, AIResult
│   │   │   ├── editor/       # RichEditor, Toolbar, TagEditor
│   │   │   ├── notes/        # NotesList
│   │   │   └── layout/       # Header
│   │   ├── hooks/            # useAutoSave, useAI
│   │   ├── pages/            # AuthPage, Dashboard
│   │   ├── store/            # Zustand: authStore, notesStore
│   │   └── utils/            # debounce, exportNotes
│   └── package.json
│
├── server/                   # Node.js + Express backend
│   ├── config/               # MongoDB connection
│   ├── controllers/          # auth, notes, ai
│   ├── middleware/           # JWT auth, error handler
│   ├── models/               # User, Note (Mongoose schemas)
│   ├── routes/               # REST routes
│   ├── services/             # OpenAI AI service
│   ├── utils/                # Winston logger
│   ├── seed.js               # Demo data seeder
│   └── server.js             # Express entry point
│
├── docker-compose.yml
├── render.yaml               # Render deploy config
├── vercel.json               # Vercel deploy config
└── .env.example
```

---

## 🚀 Local Setup (Step-by-Step)

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas free tier)
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

---

### Step 1 — Clone & Install

```bash
git clone <your-repo-url>
cd smart-ai-notepad

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### Step 2 — Configure Environment

**Server** — Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-notepad
JWT_SECRET=your_super_long_random_secret_here_min_32_chars
JWT_EXPIRE=30d
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIENT_URL=http://localhost:5173
LOG_LEVEL=info
```

**Client** — Create `client/.env`:
```env
VITE_API_URL=/api
```

---

### Step 3 — Seed Demo Data (Optional)

```bash
cd server
node seed.js
# ✅ Creates: demo@test.com / demo123 with 4 sample notes
```

---

### Step 4 — Start Development Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 5 — Login

Use the demo credentials or register a new account:
- **Email:** `demo@test.com`
- **Password:** `demo123`

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/profile` | Get current user (protected) |
| PUT | `/api/auth/preferences` | Update theme/font (protected) |

### Notes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | List all notes (supports `?tag=` `?search=`) |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/:id` | Get single note with full content |
| PUT | `/api/notes/:id` | Update note (pass `saveVersion: true` for snapshot) |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/notes/:id/versions` | Get version history (up to 10) |
| POST | `/api/notes/reorder` | Drag-and-drop reorder |
| GET | `/api/notes/tags` | Get all unique tags |

### AI (all protected, rate limited 20 req/min)
| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/ai/explain` | `{ text }` |
| POST | `/api/ai/diagram` | `{ text, diagramType }` (flowchart/mindmap/sequence/ascii) |
| POST | `/api/ai/solve` | `{ text }` |
| POST | `/api/ai/improve` | `{ text }` |
| POST | `/api/ai/summarize` | `{ text }` |
| POST | `/api/ai/bullets` | `{ text }` |
| POST | `/api/ai/extract-problems` | `{ text }` |
| POST | `/api/ai/suggest-solutions` | `{ text }` |
| POST | `/api/ai/detect` | `{ text }` — returns content type + suggested action |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save note + create version snapshot |
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+N` | *(Toolbar button) New note* |

---

## 🤖 AI Modes Explained

### 💡 Explain Mode
Select any text → get a bilingual (Hindi + English) explanation with key concepts, real-world examples, and a Hindi summary.

### 📊 Diagram Mode
Generate from your text:
- **Flowchart** — Mermaid `flowchart TD` syntax, rendered visually
- **Mindmap** — Mermaid `mindmap` syntax
- **Sequence** — Mermaid `sequenceDiagram`
- **ASCII** — Text-based box-and-arrow diagram

### 🔧 Solve Mode
Paste a problem, bug, or error → get root cause analysis, step-by-step solution, verification steps, and prevention tips.

### ✨ Improve Mode
Paste any writing → get an improved version with grammar fixes, clarity improvements, structure changes, and a quality score comparison.

---

## 🐳 Docker Setup

```bash
# Copy and fill environment variables
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and JWT_SECRET

# Build and start all services
docker-compose up --build

# App: http://localhost:5173
# API: http://localhost:5000
# MongoDB: localhost:27017
```

---

## ☁️ Deployment

### Backend → Render (Free Tier)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set **Root Directory** to `server`
4. Add environment variables:
   - `MONGODB_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → a long random secret
   - `OPENAI_API_KEY` → your OpenAI key
   - `CLIENT_URL` → your Vercel frontend URL
5. Deploy! Your API will be at `https://your-app.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your repo, set **Root Directory** to `client`
3. Add environment variable:
   - `VITE_API_URL` → `https://your-app.onrender.com/api`
4. Deploy! Your app will be live at `https://your-app.vercel.app`

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Editor | TipTap (Bold, Italic, Underline, H1-H3, Lists, Tasks, Tables, Code) |
| State | Zustand with persist middleware |
| Backend | Node.js 20, Express 4 |
| Database | MongoDB 7 + Mongoose 8 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | OpenAI GPT-4o-mini |
| Diagrams | Mermaid.js |
| Logging | Winston |
| Deployment | Vercel (frontend) + Render (backend) + Docker |

---

## 📄 License

MIT — free to use, modify, and deploy.
