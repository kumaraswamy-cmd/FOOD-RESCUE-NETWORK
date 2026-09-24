import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5001';
  }
  return 'http://localhost:5001';
};

export const API_BASE = getApiBase();

// ------------------------------------------------------------------
// DEFAULT SEEDS FOR INITIAL DATABASE POPULATION
// ------------------------------------------------------------------
const DEFAULT_NGOS = [
  {
    id: 'NGO-001',
    name: 'Asha Care Foundation',
    phone: '9849011223',
    darpan_id: 'AP/2024/001928',
    legal_reg_no: 'REG-AP-1029',
    pan_number: 'AAATA1029P',
    fcra_status: 'Compliant',
    verified: 1,
    status: 'verified',
    lat: 17.7200,
    lng: 83.3100,
    service_radius_km: 10
  },
  {
    id: 'NGO-002',
    name: 'Akshaya Patra Branch',
    phone: '9849022334',
    darpan_id: 'AP/2024/002441',
    legal_reg_no: 'REG-AP-2044',
    pan_number: 'AAATA2044P',
    fcra_status: 'Compliant',
    verified: 1,
    status: 'verified',
    lat: 17.7300,
    lng: 83.3200,
    service_radius_km: 15
  },
  {
    id: 'NGO-003',
    name: 'Annamrita Foundation',
    phone: '9849033445',
    darpan_id: 'AP/2026/008891',
    legal_reg_no: 'REG-AP-8891',
    pan_number: 'AAATA8891P',
    fcra_status: 'Compliant',
    verified: 0,
    status: 'pending',
    lat: 17.7100,
    lng: 83.3000,
    service_radius_km: 12
  }
];

const DEFAULT_DONATIONS = [
  { 
    id: 'DON-1001', 
    donor_id: 'DONOR-001', 
    donor_name: 'Kumar Thale',
    donor_phone: '9849012345',
    food_type: 'Vegetable Biryani & Salan', 
    quantity: 50, 
    packaging: 'Sealed Containers',
    pickup_lat: 17.7123, 
    pickup_lng: 83.3150, 
    pickup_address: 'Visakhapatnam Beach Road, Andhra Pradesh', 
    assigned_ngo_name: 'Asha Care Foundation', 
    status: 'delivered',
    inspection_status: 'passed',
    freshness_window_minutes: 120,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString() 
  },
  { 
    id: 'DON-1002', 
    donor_id: 'DONOR-001', 
    donor_name: 'Kumar Thale',
    donor_phone: '9849012345',
    food_type: 'Paneer Butter Masala & Naan', 
    quantity: 35, 
    packaging: 'Insulated Boxes',
    pickup_lat: 17.7250, 
    pickup_lng: 83.3012, 
    pickup_address: 'Srikakulam Highway Junction, Andhra Pradesh', 
    assigned_ngo_name: 'Akshaya Patra Branch', 
    status: 'accepted',
    inspection_status: 'passed',
    freshness_window_minutes: 180,
    created_at: new Date(Date.now() - 3600000).toISOString() 
  }
];

function getStored(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

// ------------------------------------------------------------------
// FIRESTORE DATABASE ENGINE + LOCAL MOCK FALLBACK
// ------------------------------------------------------------------
async function handleFirestoreOperation(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const pathname = url.replace(/https?:\/\/[^\/]+/, '');

  try {
    // 1. POST /api/donations
    if (pathname === '/api/donations' && method === 'POST') {
      const freshness = parseInt(body.freshness_window_minutes) || 120;
      const isFlagged = freshness <= 20;
      const donId = `DON-${Date.now().toString().slice(-5)}`;

      const newDonation = {
        id: donId,
        donor_id: body.donor_id || 'DONOR-001',
        donor_name: body.donor_name || 'Kumar Thale',
        donor_phone: '9849012345',
        food_type: body.food_type,
        quantity: body.quantity,
        packaging: body.packaging || 'Sealed Package',
        pickup_lat: parseFloat(body.pickup_lat) || 17.7200,
        pickup_lng: parseFloat(body.pickup_lng) || 83.3100,
        pickup_address: body.pickup_address || 'Visakhapatnam, AP',
        freshness_window_minutes: freshness,
        status: isFlagged ? 'flagged' : 'posted',
        inspection_status: isFlagged ? 'flagged' : 'passed',
        flagged_reason: isFlagged ? 'Short Expiry Window (< 20 mins) requires rapid safety audit' : null,
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'donations', donId), newDonation);
      return { success: true, donation: newDonation, flagged: isFlagged, flagReason: newDonation.flagged_reason };
    }

    // 2. GET /api/donations/donor/:donorId or /api/admin/all-donations
    if (pathname.startsWith('/api/donations') || pathname === '/api/admin/all-donations') {
      const snap = await getDocs(collection(db, 'donations'));
      let donations = [];
      snap.forEach(d => donations.push(d.data()));

      if (donations.length === 0) {
        donations = getStored('frn_donations', DEFAULT_DONATIONS);
      }
      return { success: true, donations };
    }

    // 3. GET /api/ngos
    if (pathname === '/api/ngos' && method === 'GET') {
      const snap = await getDocs(collection(db, 'ngos'));
      let ngos = [];
      snap.forEach(d => ngos.push(d.data()));

      if (ngos.length === 0) {
        ngos = getStored('frn_ngos', DEFAULT_NGOS);
      }
      return { success: true, ngos };
    }

    // 4. POST /api/ngos/register
    if (pathname === '/api/ngos/register' && method === 'POST') {
      const ngoId = `NGO-${Date.now().toString().slice(-5)}`;
      const newNgo = {
        id: ngoId,
        name: body.name,
        phone: body.phone,
        darpan_id: body.darpan_id || 'AP/2026/089123',
        legal_reg_no: body.legal_reg_no || 'REG-AP-8812/2024',
        pan_number: body.pan_number || 'AAATN9988X',
        fcra_status: body.fcra_status || 'Compliant',
        registration_doc_url: body.registration_doc_url || 'https://docs.gov.in/ngo/certificate.pdf',
        verified: 0,
        status: 'pending',
        service_radius_km: parseFloat(body.service_radius_km) || 10,
        lat: parseFloat(body.lat) || 17.7200,
        lng: parseFloat(body.lng) || 83.3100,
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'ngos', ngoId), newNgo);
      return { success: true, message: '🏛️ NGO Application & Certificate submitted to Cloud Firestore!', ngo: newNgo };
    }

    // 5. GET /api/ngos/:ngoId/incoming-matches
    if (pathname.includes('/incoming-matches')) {
      const snap = await getDocs(collection(db, 'donations'));
      let donations = [];
      snap.forEach(d => donations.push(d.data()));
      if (donations.length === 0) donations = getStored('frn_donations', DEFAULT_DONATIONS);

      const incoming = donations.filter(d => d.status === 'posted' || d.status === 'ngo_notified');
      return { success: true, incoming };
    }

    // 6. GET /api/ngos/:ngoId/pickups
    if (pathname.includes('/pickups')) {
      const snap = await getDocs(collection(db, 'donations'));
      let donations = [];
      snap.forEach(d => donations.push(d.data()));
      if (donations.length === 0) donations = getStored('frn_donations', DEFAULT_DONATIONS);

      const pickups = donations.filter(d => d.status === 'accepted' || d.status === 'delivered');
      return { success: true, pickups };
    }

    // 7. POST /api/ngos/:ngoId/respond-match
    if (pathname.includes('/respond-match') && method === 'POST') {
      const { donation_id, action } = body;
      const ref = doc(db, 'donations', donation_id);
      await updateDoc(ref, {
        status: action === 'accept' ? 'accepted' : 'rejected',
        assigned_ngo_name: 'Asha Care Foundation'
      });
      return { success: true };
    }

    // 8. GET /api/volunteers/open-jobs
    if (pathname === '/api/volunteers/open-jobs') {
      const snap = await getDocs(collection(db, 'donations'));
      let donations = [];
      snap.forEach(d => donations.push(d.data()));
      if (donations.length === 0) donations = getStored('frn_donations', DEFAULT_DONATIONS);

      const jobs = donations.filter(d => d.status === 'accepted' || d.status === 'posted');
      return { success: true, jobs };
    }

    // 9. POST /api/volunteers/claim-job
    if (pathname === '/api/volunteers/claim-job' && method === 'POST') {
      const ref = doc(db, 'donations', body.donation_id);
      await updateDoc(ref, {
        status: 'accepted',
        volunteer_assigned: 'Ravi Kumar (Verified Volunteer)'
      });
      return { success: true };
    }

    // 10. POST /api/deliveries/update-status
    if (pathname === '/api/deliveries/update-status' && method === 'POST') {
      const ref = doc(db, 'donations', body.donation_id);
      await updateDoc(ref, { status: body.status || 'delivered' });
      return { success: true };
    }

    // 11. ADMIN ACTIONS
    if (pathname === '/api/admin/pending-ngos') {
      const snap = await getDocs(collection(db, 'ngos'));
      let ngos = [];
      snap.forEach(d => ngos.push(d.data()));
      if (ngos.length === 0) ngos = getStored('frn_ngos', DEFAULT_NGOS);

      const pending = ngos.filter(n => n.status === 'pending' || !n.verified);
      return { success: true, pending, ngos };
    }

    if (pathname === '/api/admin/verify-ngo') {
      const ref = doc(db, 'ngos', body.ngo_id);
      await updateDoc(ref, {
        status: body.action === 'approve' ? 'verified' : 'rejected',
        verified: body.action === 'approve' ? 1 : 0,
        verification_notes: body.notes || null
      });
      return { success: true, message: `NGO ${body.action}d in Cloud Firestore!` };
    }

    if (pathname === '/api/admin/stats') {
      const snap = await getDocs(collection(db, 'donations'));
      let donations = [];
      snap.forEach(d => donations.push(d.data()));
      if (donations.length === 0) donations = getStored('frn_donations', DEFAULT_DONATIONS);

      return {
        success: true,
        stats: {
          totalDonations: donations.length,
          totalNgos: 14,
          totalVolunteers: 18,
          totalMealsSaved: donations.reduce((sum, d) => sum + (d.quantity || 0), 0)
        }
      };
    }

  } catch(e) {
    console.warn('[Firestore Fallback] Using local storage engine:', e);
  }

  // Local Storage Mock Fallback Engine
  let ngos = getStored('frn_ngos', DEFAULT_NGOS);
  let donations = getStored('frn_donations', DEFAULT_DONATIONS);

  if (pathname === '/api/donations' && method === 'POST') {
    const donId = `DON-${Date.now().toString().slice(-5)}`;
    const newDon = { id: donId, ...body, status: 'posted', created_at: new Date().toISOString() };
    donations.unshift(newDon);
    setStored('frn_donations', donations);
    return { success: true, donation: newDon };
  }

  return { success: true, donations, ngos };
}

// ------------------------------------------------------------------
// UNIFIED API FETCH WRAPPER
// ------------------------------------------------------------------
export async function apiFetch(endpoint, options = {}) {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(fullUrl, options);
    if (response.ok) {
      return await response.json();
    }
    return await handleFirestoreOperation(fullUrl, options);
  } catch (err) {
    return await handleFirestoreOperation(fullUrl, options);
  }
}
