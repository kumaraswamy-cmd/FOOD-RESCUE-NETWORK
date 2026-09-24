// Dynamic API helper supporting real Express backend on localhost and fallback mock storage on Vercel deployment

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5001';
  }
  return 'http://localhost:5001'; // Default target
};

export const API_BASE = getApiBase();

// ------------------------------------------------------------------
// INITIAL STORAGE SEEDS (FOR VERCEL OR OFFLINE FRONTEND DEMO)
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
// MOCK BACKEND ENGINE FALLBACK
// ------------------------------------------------------------------
function handleMockFallback(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const pathname = url.replace(/https?:\/\/[^\/]+/, '');

  let ngos = getStored('frn_ngos', DEFAULT_NGOS);
  let donations = getStored('frn_donations', DEFAULT_DONATIONS);
  let deliveries = getStored('frn_deliveries', []);

  // 1. POST /api/donations
  if (pathname === '/api/donations' && method === 'POST') {
    const freshness = parseInt(body.freshness_window_minutes) || 120;
    const isFlagged = freshness <= 20;
    const newDonation = {
      id: `DON-${Date.now().toString().slice(-5)}`,
      donor_id: body.donor_id || 'DONOR-001',
      donor_name: 'Kumar Thale',
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

    donations.unshift(newDonation);
    setStored('frn_donations', donations);

    return {
      success: true,
      donation: newDonation,
      flagged: isFlagged,
      flagReason: newDonation.flagged_reason
    };
  }

  // 2. GET /api/donations/donor/:donorId
  if (pathname.startsWith('/api/donations/donor/')) {
    return { success: true, donations };
  }

  // 3. GET /api/donations/:id
  if (pathname.match(/\/api\/donations\/[^\/]+$/) && method === 'GET') {
    const id = pathname.split('/').pop();
    const don = donations.find(d => d.id === id) || donations[0];
    const matches = ngos.filter(n => n.verified).map(n => ({
      match_id: `MATCH-${n.id}`,
      ngo_id: n.id,
      ngo_name: n.name,
      ngo_phone: n.phone,
      ngo_lat: n.lat,
      ngo_lng: n.lng,
      distance_km: 2.4,
      response: 'pending'
    }));
    return { success: true, donation: don, matches };
  }

  // 4. GET /api/ngos
  if (pathname === '/api/ngos' && method === 'GET') {
    return { success: true, ngos };
  }

  // 5. POST /api/ngos/register
  if (pathname === '/api/ngos/register' && method === 'POST') {
    const newNgo = {
      id: `NGO-${Date.now().toString().slice(-5)}`,
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
    ngos.unshift(newNgo);
    setStored('frn_ngos', ngos);
    return {
      success: true,
      message: '🏛️ NGO Application & Certificate submitted! Reaching Admin for official Darpan ID & FCRA verification.',
      ngo: newNgo
    };
  }

  // 6. GET /api/ngos/:ngoId/incoming-matches
  if (pathname.includes('/incoming-matches')) {
    const ngoId = pathname.split('/')[3];
    const targetNgo = ngos.find(n => n.id === ngoId) || ngos[0];
    const incoming = donations.filter(d => d.status === 'posted' || d.status === 'ngo_notified');
    return { success: true, ngo: targetNgo, incoming };
  }

  // 7. GET /api/ngos/:ngoId/pickups
  if (pathname.includes('/pickups')) {
    const pickups = donations.filter(d => d.status === 'accepted' || d.status === 'delivered');
    return { success: true, pickups };
  }

  // 8. POST /api/ngos/:ngoId/respond-match
  if (pathname.includes('/respond-match') && method === 'POST') {
    const { donation_id, action } = body;
    const don = donations.find(d => d.id === donation_id);
    if (don) {
      don.status = action === 'accept' ? 'accepted' : 'rejected';
      don.assigned_ngo_name = 'Asha Care Foundation';
      setStored('frn_donations', donations);
    }
    return { success: true };
  }

  // 9. GET /api/volunteers/open-jobs
  if (pathname === '/api/volunteers/open-jobs') {
    const jobs = donations.filter(d => d.status === 'accepted' || d.status === 'posted');
    return { success: true, jobs };
  }

  // 10. GET /api/volunteers/:id/my-jobs
  if (pathname.includes('/my-jobs')) {
    const jobs = donations.filter(d => d.status === 'accepted' || d.status === 'delivered');
    return { success: true, jobs };
  }

  // 11. POST /api/volunteers/claim-job
  if (pathname === '/api/volunteers/claim-job' && method === 'POST') {
    const don = donations.find(d => d.id === body.donation_id);
    if (don) {
      don.status = 'accepted';
      don.volunteer_assigned = 'Ravi Kumar (Verified Volunteer)';
      setStored('frn_donations', donations);
    }
    return { success: true };
  }

  // 12. POST /api/deliveries/update-status
  if (pathname === '/api/deliveries/update-status' && method === 'POST') {
    const don = donations.find(d => d.id === body.donation_id);
    if (don) {
      don.status = body.status || 'delivered';
      setStored('frn_donations', donations);
    }
    return { success: true };
  }

  // 13. ADMIN ENDPOINTS
  if (pathname === '/api/admin/pending-ngos') {
    const pending = ngos.filter(n => n.status === 'pending' || !n.verified);
    return { success: true, ngos: pending };
  }

  if (pathname === '/api/admin/flagged-donations') {
    const flagged = donations.filter(d => d.inspection_status === 'flagged');
    return { success: true, donations: flagged };
  }

  if (pathname === '/api/admin/all-donations') {
    return { success: true, donations };
  }

  if (pathname === '/api/admin/stats') {
    return {
      success: true,
      stats: {
        totalDonations: donations.length,
        totalNgos: ngos.length,
        totalVolunteers: 18,
        totalMealsRescued: donations.reduce((sum, d) => sum + (d.quantity || 0), 0)
      }
    };
  }

  if (pathname === '/api/admin/verify-ngo') {
    const target = ngos.find(n => n.id === body.ngo_id);
    if (target) {
      target.status = body.action === 'approve' ? 'verified' : 'rejected';
      target.verified = body.action === 'approve' ? 1 : 0;
      target.verification_notes = body.notes || null;
      setStored('frn_ngos', ngos);
    }
    return { success: true };
  }

  if (pathname === '/api/admin/review-flagged-donation') {
    const target = donations.find(d => d.id === body.donation_id);
    if (target) {
      target.inspection_status = body.action === 'approve' ? 'passed' : 'rejected';
      target.status = body.action === 'approve' ? 'posted' : 'rejected';
      setStored('frn_donations', donations);
    }
    return { success: true };
  }

  // Default fallback
  return { success: true };
}

// ------------------------------------------------------------------
// UNIFIED API FETCH WRAPPER WITH AUTOMATIC OFFLINE/VERCEL FALLBACK
// ------------------------------------------------------------------
export async function apiFetch(endpoint, options = {}) {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(fullUrl, options);
    if (response.ok) {
      return await response.json();
    }
    // If response status is not OK (e.g. 404 or 500), try fallback mock
    return handleMockFallback(fullUrl, options);
  } catch (err) {
    // Fetch failed due to network error, CORS, localhost unreachable, or Mixed Content on Vercel
    console.warn(`[FRN API] Network call to ${fullUrl} failed. Switching to local mock engine.`, err);
    return handleMockFallback(fullUrl, options);
  }
}
