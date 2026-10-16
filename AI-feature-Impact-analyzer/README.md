# AI Feature Impact Analyzer — Portfolio Health & Unit Economics

An ultra-clean, executive-grade multi-product management dashboard for SaaS leaders, CTOs, and financial executives to monitor AI unit economics, eliminate negative margin cash drains, and run strategic audits 100% locally and offline using Ollama and the `gemma4:12b` model.

---

## 🎯 Key Capabilities

- **Strict 3-Color Uniform Palette**: Deep neutral surfaces (`#0B0F17`, `#161F30`, `#24324D`), high-contrast pure white/slate typography, emerald green (`#10B981`) for profit/scale indicators, and coral red (`#F43F5E`) for capital at risk.
- **Multi-Product Management Directory**: Switch dynamically between products (e.g. *Core Web Platform*, *Mobile App Suite*, *Enterprise Data Engine*) with real-time portfolio net yields.
- **Executive Onboarding (`+ Add Product`)**: Dedicated modal to onboard products with industry, currency, and multi-row initial AI feature economics.
- **Top 3 KPI Cards Only**:
  1. **Net Commercial Margin** (bold emerald accent)
  2. **Total Monthly Spend** (bold white font)
  3. **Capital at Risk** (coral-red alert font)
- **Feature Health & Unit Economics Table**: Individual feature inference spend, attributed revenue, net margin, and status tags (`Scale`, `Optimize`, `Action Needed`) with inline *Inspect* and *Disable/Enable* actions.
- **Strategic Executive Audit**: Generates 3 high-impact commercial audit bullet points powered by local Ollama `gemma4:12b` with zero model names exposed in the UI.
- **100% Offline & Internet-Free**:
  - Operates completely offline without requiring internet access.
  - No external fonts, CDNs, or remote API dependencies.
  - Native communication with local Ollama (`http://localhost:11434` / `http://127.0.0.1:11434`).
  - Seamless deterministic fallback if Ollama service is stopped.

---

## 🖥️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons |
| **Backend** | Python 3.13, FastAPI, Uvicorn, HTTPX, Pydantic |
| **Local LLM** | Ollama with **Gemma 12B** (`gemma4:12b`) |
| **Theme** | Deep Neutral Dark (`#0B0F17`), Emerald Teal (`#10B981`), Coral Red (`#F43F5E`) |

---

## 📁 Project Structure

```
anti gravity/
├── backend/
│   ├── config.py                 # Backend & Ollama host configuration (120s timeout, localhost/127.0.0.1)
│   ├── main.py                   # FastAPI server with /api/health and /api/audit routes
│   ├── run_server.py             # Server launcher script
│   ├── schemas.py                # Pydantic validation schemas
│   ├── services/
│   │   ├── ollama_service.py     # Ollama API interface with thinking suppression
│   │   └── rules_engine.py       # High-precision analytical rules fallback
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Local environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx                # Clean executive header
│   │   │   ├── ProductsSidebar.tsx       # Multi-product directory
│   │   │   ├── KPICards.tsx              # Top 3 KPI cards
│   │   │   ├── StrategicAuditCard.tsx    # 3-bullet executive audit card
│   │   │   ├── FeatureHealthTable.tsx    # Unit economics table
│   │   │   ├── AddProductModal.tsx       # Onboard new product modal
│   │   │   ├── AddFeatureModal.tsx       # Add feature modal
│   │   │   └── InspectFeatureModal.tsx   # Feature deep inspection modal
│   │   ├── data/sampleData.ts            # Multi-product initial data
│   │   ├── services/api.ts               # Backend client & offline fallback
│   │   ├── types/index.ts                # TypeScript data models
│   │   ├── App.tsx                       # Dashboard state & controller
│   │   ├── index.css                     # Minimalist 3-color theme
│   │   └── main.tsx
│   ├── index.html                        # 100% offline HTML (no CDN fonts)
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.ts
├── run.bat                               # Windows 1-click startup script
├── .env                                  # Root environment configuration
└── README.md
```

---

## 🚀 Running 100% Locally & Offline

### 1. Verify Installed Model
Ensure the `gemma4:12b` model is installed in your local Ollama:
```bash
ollama list
```
*(You should see `gemma4:12b` in the output).*

### 2. Configure Environment (`.env`)
The `.env` file in the project root is pre-configured for local offline execution:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:12b
API_HOST=0.0.0.0
API_PORT=8000
REQUEST_TIMEOUT_SECONDS=120.0
```

### 3. Start the Application
Run both backend and frontend servers:

**Backend:**
```bash
cd backend
python run_server.py
```
*API runs at http://localhost:8000*

**Frontend:**
```bash
cd frontend
npm run dev
```
*Dashboard runs at http://localhost:5173*

### 4. Windows 1-Click Launch
Double-click `run.bat` in the root folder to launch both servers simultaneously in Windows.
