# 🥗 Food Rescue Network (Surplus2Serve)
> **Community Project Report & Full-Stack Web Application**  
> *Maharaj Vijayaram Gajapathi Raj (MVGR) College of Engineering (Autonomous)*  
> **Department of Data Engineering & CSE-IoT (Batch 04, 2025-26)**

---

## 📌 Project Overview
**Food Rescue Network** is a full-stack community platform designed to connect surplus-food donors (function halls, caterers, restaurants, individuals) directly with verified NGOs, volunteers, and beneficiary shelters (orphanages, old-age homes).

### 🌟 Key Features & Architecture
- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Leaflet + OpenStreetMap.
- **Backend**: Node.js + Express REST API on Port 5001.
- **Database**: SQLite (`server/surplus2serve.db`) using native `node:sqlite` (PostgreSQL/Supabase compatible DDL schema).
- **Authentication**: Phone number + OTP SMS verification simulator (mock code `8492`).
- **Smart NGO Recommendation Engine**: Haversine distance formula matching the nearest 3–5 verified NGOs within their registered service radius.
- **FSSAI 4-Point Safety Audit**: Mandatory food safety audit checklist enforced prior to NGO pickup acceptance.
- **Volunteer Dispatch & Pipeline Tracking**: Real-time status pipeline (`posted` ➔ `ngo_notified` ➔ `accepted` ➔ `volunteer_assigned` ➔ `picked_up` ➔ `delivered`).
- **Multilingual Support**: English, Telugu (తెలుగు), and Hindi (हिन्दी) dictionaries.
- **4 Distinct Authenticated Portals**: Donor, NGO, Volunteer, Administrator.

---

## 🚀 Quick Start Guide (How to Run Locally)

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v26)
- **npm**: v9.0.0 or higher

### Installation & Launching Server + Client
```bash
# 1. Clone or navigate to the project workspace
cd "FOOD RESCUE NETWORK"

# 2. Install all dependencies for root, server, and client
npm run install:all

# 3. Seed the SQLite database with sample donors, NGOs, volunteers, and donations
npm run seed

# 4. Start both Express REST API Server (Port 5001) and Vite React Client (Port 3000)
npm run dev
```

The application will be running live at:
- **React Frontend**: `http://localhost:3000`
- **REST API Backend**: `http://localhost:5001/api/admin/stats`

---

## 👥 Student & Faculty Credits

### Team Members (Batch 04):
- **P. SARVWAN** (Reg No: 24331A4746)
- **CH. RAJAESHRI** (Reg No: 24331A4709)
- **T. KUMARA SWAMY** (Reg No: 24331A4760)
- **N. HANISH VARMA** (Reg No: 24331A4742)

### Faculty Guidance:
- **Project Guide**: Ms P. Monika (Assistant Professor, Dept of Data Engineering)
- **Project Coordinator**: Dr. T. Govindarao (Sr. Assistant Professor)
- **Head of Department**: Dr. V. Jyothi (Associate Professor)

---

## 📁 Repository Structure
```
FOOD RESCUE NETWORK/
├── package.json              # Monorepo runner (concurrently scripts)
├── README.md                 # Setup & running instructions
├── PROJECT_REPORT.md         # Full Academic Community Project Documentation
├── index.html                # Standalone backup high-fidelity UI prototype
├── server/                   # Express REST API Server
│   ├── package.json
│   ├── server.js             # Express API routes & Smart NGO Matching algorithm
│   ├── db.js                 # SQLite connection using node:sqlite
│   ├── seed.js               # Seed script (donors, NGOs, volunteers, donations)
│   └── surplus2serve.db      # Local SQLite database file
└── client/                   # Vite React Frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── i18n.js           # English, Telugu, Hindi dictionaries
        ├── components/       # Leaflet Map, StatusBadge, StepperProgress, Modals
        └── pages/            # Landing (Role Picker), Donor, NGO, Volunteer, Admin, Impact
```
