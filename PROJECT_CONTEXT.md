# 🍽️ FOOD RESCUE NETWORK - COMPLETE PROJECT CONTEXT & ARCHITECTURE

> **Note for Antigravity AI Assistants & Developers**: This document contains the full project knowledge base, architectural rules, API endpoints, UI guidelines, and demo configuration.

---

## 📌 Project Overview
**Food Rescue Network** is a real-time surplus food redistribution platform connecting event venues/restaurants (Donors), shelter homes/charities (NGOs), and delivery volunteers (Volunteers), governed by an Admin audit portal.

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Leaflet/OpenStreetMap (`client/`)
- **Backend Server**: Node.js + Express + SQLite Database (`server/server.js` & `server/surplus2serve.db`)
- **Fallback Engine**: Firestore & LocalStorage Sync Engine (`client/src/utils/api.js`)
- **Official Brand Assets**: High-resolution transparent PNG logo at `client/public/logo.png` (emerald green & crisp white text for dark backgrounds).

---

## ⚡ Instant Demo Mode Rules
To enable seamless single-PC live demonstrations for panel presentations:
1. **Zero Access Barriers**: Route guards (`ProtectedRoute`) are disabled in `client/src/App.jsx`. All portals (`/donor`, `/ngo`, `/volunteer`, `/admin`, `/impact`) are directly accessible.
2. **Unified Real-Time Cross-Portal Data**:
   - Creating a donation in **Donor Page** immediately populates the **Real-Time Live Delivery Tracker** stepper and broadcasts the donation to all other portals.
   - **NGO Page** incoming matches radar displays all active posted food items without locking or requiring admin pre-approval.
   - **Volunteer Page** displays all open transport jobs. Claiming a job instantly moves it to Active Deliveries across all portals.
   - **Admin Page** is unlocked by default (`authenticated: true`), providing complete live master registry control, modification (edit), and deletion.

---

## 📂 File Structure & Key Modules
```
FOOD RESCUE NETWORK/
├── client/                     # Vite React Frontend
│   ├── public/
│   │   └── logo.png            # Official transparent logo
│   └── src/
│       ├── App.jsx             # Main router & theme/lang state
│       ├── utils/api.js        # Universal API fetch & Firestore fallback engine
│       ├── pages/
│       │   ├── DonorPage.jsx   # Surplus post publishing & live delivery steppers
│       │   ├── NgoPage.jsx     # FSSAI audit & pickup acceptance
│       │   ├── VolunteerPage.jsx# Job claiming & turn-by-turn navigation
│       │   ├── AdminPage.jsx   # Master registry, NGO verification, & stats
│       │   └── LoginPage.jsx   # 6-digit OTP auth & Google Login
│       └── components/
│           ├── MapView.jsx     # OpenStreetMap proximity map
│           ├── StepperProgress.jsx # 4-step live tracking stepper
│           ├── FssaiModal.jsx  # FSSAI safety confirmation modal
│           ├── PickupVerifyModal.jsx # 4-digit pickup code verification
│           └── DeliveryProofModal.jsx # Delivery photo proof upload
└── server/                     # Express Node.js Server & SQLite DB
    ├── server.js               # Express API endpoints
    ├── db.js                   # SQLite database configuration
    └── surplus2serve.db        # SQLite database file
```

---

## 🔌 API Endpoints Reference
- `POST /api/donations` — Create new surplus food post
- `GET /api/donations/donor/:donorId` — Fetch donations for donor/all
- `PUT /api/donations/:id` — Edit/modify food donation post
- `DELETE /api/donations/:id` — Permanently delete food donation post
- `GET /api/ngos` — Fetch registered NGOs
- `POST /api/ngos/register` — Submit new NGO application & certificate
- `GET /api/ngos/:ngoId/incoming-matches` — Fetch incoming surplus matches
- `POST /api/ngos/:ngoId/respond-match` — Accept or reject donation match
- `POST /api/ngos/assign-volunteer` — Assign volunteer to delivery
- `GET /api/ngos/:ngoId/pickups` — Fetch accepted NGO pickups
- `GET /api/volunteers/open-jobs` — Fetch open transport jobs
- `POST /api/volunteers/claim-job` — Claim volunteer delivery job
- `GET /api/volunteers/:volId/my-jobs` — Fetch active volunteer tasks
- `POST /api/deliveries/update-status` — Update status (`picked_up`, `delivered`)
- `GET /api/admin/pending-ngos` — Fetch pending & verified NGOs
- `POST /api/admin/verify-ngo` — Approve/reject/suspend NGO
- `GET /api/admin/flagged-donations` — Fetch flagged safety inspection queue
- `POST /api/admin/review-flagged-donation` — Pass/reject flagged post
- `GET /api/admin/all-donations` — Master registry list
- `GET /api/admin/stats` — Platform impact statistics

---

## 🚀 How to Run Locally
```bash
# Terminal 1: Run Express Backend API Server
node server/server.js

# Terminal 2: Run Vite React Frontend
npm run dev --prefix client
```
