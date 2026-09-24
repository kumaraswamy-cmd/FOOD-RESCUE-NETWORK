const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 certificate uploads

const ADMIN_PASSWORD = 'frn@123';

// -------------------------------------------------------------
// HAVERSINE DISTANCE CALCULATOR (KM)
// -------------------------------------------------------------
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// -------------------------------------------------------------
// SMART NGO MATCHING ENGINE (Matches ONLY Verified NGOs)
// -------------------------------------------------------------
function matchDonationWithNgos(donation) {
  // Enforce rule: Only verified & active recipient NGOs participate
  const ngos = db.prepare("SELECT * FROM ngos WHERE verified = 1 AND (status = 'verified' OR status IS NULL)").all();
  const matches = [];

  for (const ngo of ngos) {
    const dist = haversineDistance(donation.pickup_lat, donation.pickup_lng, ngo.lat, ngo.lng);
    if (dist <= (ngo.service_radius_km || 15)) {
      matches.push({ ngo, distance_km: dist });
    }
  }

  matches.sort((a, b) => a.distance_km - b.distance_km);
  const topMatches = matches.slice(0, 5);
  const now = new Date().toISOString();

  const insertMatch = db.prepare(`
    INSERT INTO donation_ngo_matches (id, donation_id, ngo_id, distance_km, notified_at, response)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `);

  topMatches.forEach((m, idx) => {
    const matchId = `MATCH-${Date.now()}-${idx}`;
    insertMatch.run(matchId, donation.id, m.ngo.id, m.distance_km, now);
  });

  if (topMatches.length > 0) {
    db.prepare("UPDATE donations SET status = 'ngo_notified' WHERE id = ?").run(donation.id);
  }

  return topMatches;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. AUTH / OTP SIMULATOR
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 8) {
    return res.status(400).json({ error: 'Valid mobile number required.' });
  }
  const mockOtp = '8492';
  console.log(`📱 [SMS OTP Provider Simulator] Sent code ${mockOtp} to ${phone}`);
  return res.json({ success: true, message: `OTP code sent to ${phone}`, otp: mockOtp });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, code, role, name, extraData } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and OTP code required.' });

  if (code !== '8492' && code.length !== 4) {
    return res.status(400).json({ error: 'Invalid verification code.' });
  }

  const now = new Date().toISOString();

  if (role === 'donor') {
    let donor = db.prepare('SELECT * FROM donors WHERE phone = ?').get(phone);
    if (!donor) {
      const donorId = `DONOR-${Date.now().toString().slice(-6)}`;
      db.prepare(`
        INSERT INTO donors (id, name, phone, otp_verified, role_type, created_at)
        VALUES (?, ?, ?, 1, ?, ?)
      `).run(donorId, name || 'Surplus Donor', phone, (extraData && extraData.roleType) || 'event', now);
      donor = db.prepare('SELECT * FROM donors WHERE id = ?').get(donorId);
    } else {
      db.prepare('UPDATE donors SET otp_verified = 1 WHERE phone = ?').run(phone);
    }
    return res.json({ success: true, user: donor, role: 'donor' });
  }

  if (role === 'volunteer') {
    let vol = db.prepare('SELECT * FROM volunteers WHERE phone = ?').get(phone);
    if (!vol) {
      const volId = `VOL-${Date.now().toString().slice(-6)}`;
      db.prepare(`
        INSERT INTO volunteers (id, name, phone, otp_verified, available, created_at)
        VALUES (?, ?, ?, 1, 1, ?)
      `).run(volId, name || 'Volunteer Transport', phone, now);
      vol = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(volId);
    }
    return res.json({ success: true, user: vol, role: 'volunteer' });
  }

  return res.json({ success: true, message: 'Phone verified successfully.' });
});

// 2. DONORS & DONATIONS (Includes Automated Food Safety Inspection vs Flagging)
app.post('/api/donations', (req, res) => {
  const { donor_id, food_type, quantity, packaging, pickup_lat, pickup_lng, pickup_address, freshness_window_minutes, notes } = req.body;

  if (!donor_id || !food_type || !quantity || !pickup_address) {
    return res.status(400).json({ error: 'Missing required donation details.' });
  }

  const donationId = `DON-${Date.now().toString().slice(-6)}`;
  const now = new Date();
  const windowMins = parseInt(freshness_window_minutes, 10) || 120;
  const qty = parseInt(quantity, 10);
  const availableUntil = new Date(now.getTime() + windowMins * 60000).toISOString();

  // AUTOMATED FOOD SAFETY VALIDATION
  const foodTypeLower = (food_type || '').toLowerCase();
  let isFlagged = false;
  let flagReason = '';

  if (windowMins < 30) {
    isFlagged = true;
    flagReason = 'Freshness window is under 30 minutes. Requires urgent manual inspection.';
  } else if (qty > 500) {
    isFlagged = true;
    flagReason = 'Massive bulk quantity (>500 servings). Requires food safety inspector approval.';
  } else if (foodTypeLower.includes('seafood') || foodTypeLower.includes('raw fish') || foodTypeLower.includes('unpasteurized')) {
    isFlagged = true;
    flagReason = 'Perishable high-risk items detected. Requires cold-chain audit by Admin.';
  }

  const initialStatus = isFlagged ? 'flagged_for_inspection' : 'posted';
  const inspectionStatus = isFlagged ? 'flagged' : 'passed';

  const insertStmt = db.prepare(`
    INSERT INTO donations (
      id, donor_id, food_type, quantity, packaging, pickup_lat, pickup_lng, pickup_address,
      available_from, available_until, freshness_window_minutes, status, inspection_status, flagged_reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const lat = parseFloat(pickup_lat) || 17.7123;
  const lng = parseFloat(pickup_lng) || 83.3150;

  insertStmt.run(
    donationId, donor_id, food_type, qty, packaging || 'Containers',
    lat, lng, pickup_address, now.toISOString(), availableUntil, windowMins,
    initialStatus, inspectionStatus, flagReason || null, now.toISOString()
  );

  const createdDonation = db.prepare('SELECT * FROM donations WHERE id = ?').get(donationId);

  let matches = [];
  if (!isFlagged) {
    // If passed automated check, dispatch nearby verified NGOs immediately
    matches = matchDonationWithNgos(createdDonation);
  }

  return res.status(201).json({
    success: true,
    message: isFlagged
      ? '⚠️ Food donation created! Flagged by automated safety check for Admin inspection.'
      : '🚀 Surplus food rescue post published! Smart recommendation engine matched nearby NGOs.',
    donation: createdDonation,
    flagged: isFlagged,
    flagReason: flagReason,
    matchedNgosCount: matches.length,
    matches: matches
  });
});

app.get('/api/donations/donor/:donorId', (req, res) => {
  const { donorId } = req.params;
  const donations = db.prepare(`
    SELECT d.*, 
           (SELECT name FROM ngos WHERE id = del.ngo_id) as assigned_ngo_name,
           (SELECT name FROM volunteers WHERE id = del.volunteer_id) as assigned_volunteer_name
    FROM donations d
    LEFT JOIN deliveries del ON d.id = del.donation_id
    WHERE d.donor_id = ?
    ORDER BY d.created_at DESC
  `).all(donorId);

  return res.json({ success: true, donations });
});

app.get('/api/donations/:id', (req, res) => {
  const donation = db.prepare(`
    SELECT d.*, 
           don.name as donor_name, don.phone as donor_phone,
           del.ngo_id, del.volunteer_id, del.picked_up_at, del.delivered_at, del.beneficiary_name,
           ngo.name as ngo_name, vol.name as volunteer_name
    FROM donations d
    JOIN donors don ON d.donor_id = don.id
    LEFT JOIN deliveries del ON d.id = del.donation_id
    LEFT JOIN ngos ngo ON del.ngo_id = ngo.id
    LEFT JOIN volunteers vol ON del.volunteer_id = vol.id
    WHERE d.id = ?
  `).get(req.params.id);

  if (!donation) return res.status(404).json({ error: 'Donation not found.' });

  const matches = db.prepare(`
    SELECT m.*, n.name as ngo_name, n.phone as ngo_phone, n.lat as ngo_lat, n.lng as ngo_lng
    FROM donation_ngo_matches m
    JOIN ngos n ON m.ngo_id = n.id
    WHERE m.donation_id = ?
  `).all(req.params.id);

  return res.json({ success: true, donation, matches });
});

// 3. NGOS & RECIPIENT ORGANISATION VERIFICATION
app.post('/api/ngos/register', (req, res) => {
  const { name, phone, darpan_id, legal_reg_no, pan_number, fcra_status, registration_doc_url, service_radius_km, lat, lng } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'NGO Name and Contact Phone required.' });

  const ngoId = `NGO-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO ngos (
      id, name, phone, darpan_id, legal_reg_no, pan_number, fcra_status,
      registration_doc_url, verified, status, service_radius_km, lat, lng, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?, ?, ?, ?)
  `).run(
    ngoId, name, phone,
    darpan_id || 'AP/2026/' + Math.floor(100000 + Math.random() * 900000),
    legal_reg_no || 'REG-AP-' + Math.floor(1000 + Math.random() * 9000),
    pan_number || 'AAAAA' + Math.floor(1000 + Math.random() * 9000) + 'A',
    fcra_status || 'Compliant',
    registration_doc_url || 'https://docs.gov.in/ngo/AP2026_certificate.pdf',
    parseFloat(service_radius_km) || 10.0,
    parseFloat(lat) || 17.7200,
    parseFloat(lng) || 83.3100,
    now
  );

  const newNgo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngoId);
  return res.status(201).json({
    success: true,
    message: '🏛️ NGO Application & Certificate submitted! Reaching Admin for official Darpan ID & FCRA verification.',
    ngo: newNgo
  });
});

app.get('/api/ngos', (req, res) => {
  const ngos = db.prepare('SELECT * FROM ngos ORDER BY created_at DESC').all();
  return res.json({ success: true, ngos });
});

app.get('/api/ngos/:ngoId/incoming-matches', (req, res) => {
  const { ngoId } = req.params;
  const ngo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngoId);

  // Enforce rule: Unverified or Rejected NGOs cannot participate in matching flow
  if (!ngo || !ngo.verified || ngo.status !== 'verified') {
    return res.status(403).json({
      error: 'NGO is unverified or rejected by admin.',
      unverified: true,
      ngo: ngo || null,
      ngoStatus: ngo ? ngo.status : 'not_found'
    });
  }

  const incoming = db.prepare(`
    SELECT m.id as match_id, m.distance_km, m.notified_at, m.response,
           d.*, don.name as donor_name, don.phone as donor_phone
    FROM donation_ngo_matches m
    JOIN donations d ON m.donation_id = d.id
    JOIN donors don ON d.donor_id = don.id
    WHERE m.ngo_id = ? AND d.status IN ('posted', 'ngo_notified')
    ORDER BY d.created_at DESC
  `).all(ngoId);

  return res.json({ success: true, ngo, incoming });
});

app.post('/api/ngos/:ngoId/respond-match', (req, res) => {
  const { ngoId } = req.params;
  const { donation_id, action, fssai_confirmed } = req.body;

  if (!donation_id || !action) return res.status(400).json({ error: 'donation_id and action (accept/reject) required.' });

  const ngo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngoId);
  if (!ngo || !ngo.verified || ngo.status !== 'verified') {
    return res.status(403).json({ error: 'Unverified or rejected NGO cannot accept food rescue matches.' });
  }

  if (action === 'accept') {
    if (!fssai_confirmed) {
      return res.status(400).json({ error: 'FSSAI Food Safety Audit confirmation required before accepting.' });
    }

    db.prepare(`
      UPDATE donation_ngo_matches SET response = 'accepted' WHERE donation_id = ? AND ngo_id = ?
    `).run(donation_id, ngoId);

    db.prepare(`
      UPDATE donation_ngo_matches SET response = 'rejected' WHERE donation_id = ? AND ngo_id != ?
    `).run(donation_id, ngoId);

    db.prepare("UPDATE donations SET status = 'accepted' WHERE id = ?").run(donation_id);

    // Create Delivery Record
    const delId = `DEL-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT OR REPLACE INTO deliveries (id, donation_id, ngo_id, delivery_confirmed)
      VALUES (?, ?, ?, 0)
    `).run(delId, donation_id, ngoId);

    return res.json({ success: true, message: 'Donation match accepted! Ready for logistics pickup.' });
  } else {
    db.prepare(`
      UPDATE donation_ngo_matches SET response = 'rejected' WHERE donation_id = ? AND ngo_id = ?
    `).run(donation_id, ngoId);

    return res.json({ success: true, message: 'Donation request declined.' });
  }
});

app.get('/api/ngos/:ngoId/pickups', (req, res) => {
  const { ngoId } = req.params;
  const pickups = db.prepare(`
    SELECT d.*, del.id as delivery_id, del.volunteer_id, del.picked_up_at, del.delivered_at, del.beneficiary_name,
           vol.name as volunteer_name, don.name as donor_name, don.phone as donor_phone
    FROM deliveries del
    JOIN donations d ON del.donation_id = d.id
    JOIN donors don ON d.donor_id = don.id
    LEFT JOIN volunteers vol ON del.volunteer_id = vol.id
    WHERE del.ngo_id = ?
    ORDER BY d.created_at DESC
  `).all(ngoId);

  return res.json({ success: true, pickups });
});

// 4. VOLUNTEERS & LOGISTICS
app.get('/api/volunteers/open-jobs', (req, res) => {
  const openJobs = db.prepare(`
    SELECT d.*, del.id as delivery_id, del.ngo_id, ngo.name as ngo_name, don.name as donor_name, don.phone as donor_phone
    FROM donations d
    JOIN deliveries del ON d.id = del.donation_id
    JOIN ngos ngo ON del.ngo_id = ngo.id
    JOIN donors don ON d.donor_id = don.id
    WHERE d.status IN ('accepted', 'volunteer_assigned') AND (del.volunteer_id IS NULL OR del.volunteer_id = '')
    ORDER BY d.created_at DESC
  `).all();

  return res.json({ success: true, openJobs });
});

app.post('/api/volunteers/claim-job', (req, res) => {
  const { volunteer_id, donation_id } = req.body;
  if (!volunteer_id || !donation_id) return res.status(400).json({ error: 'volunteer_id and donation_id required.' });

  const vol = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(volunteer_id);
  if (!vol) return res.status(404).json({ error: 'Volunteer not found.' });

  db.prepare(`
    UPDATE deliveries SET volunteer_id = ? WHERE donation_id = ?
  `).run(volunteer_id, donation_id);

  db.prepare("UPDATE donations SET status = 'volunteer_assigned' WHERE id = ?").run(donation_id);

  return res.json({ success: true, message: `Delivery job assigned to ${vol.name}!` });
});

app.get('/api/volunteers/:volId/my-jobs', (req, res) => {
  const { volId } = req.params;
  const jobs = db.prepare(`
    SELECT d.*, del.id as delivery_id, del.ngo_id, del.picked_up_at, del.delivered_at, del.beneficiary_name,
           ngo.name as ngo_name, don.name as donor_name, don.phone as donor_phone
    FROM deliveries del
    JOIN donations d ON del.donation_id = d.id
    JOIN ngos ngo ON del.ngo_id = ngo.id
    JOIN donors don ON d.donor_id = don.id
    WHERE del.volunteer_id = ?
    ORDER BY d.created_at DESC
  `).all(volId);

  return res.json({ success: true, jobs });
});

// 5. STATUS PIPELINE TRANSITIONS (Picked Up -> Delivered)
app.post('/api/deliveries/update-status', (req, res) => {
  const { donation_id, status, beneficiary_name } = req.body;
  if (!donation_id || !status) return res.status(400).json({ error: 'donation_id and status required.' });

  const now = new Date().toISOString();

  if (status === 'picked_up') {
    db.prepare("UPDATE donations SET status = 'picked_up' WHERE id = ?").run(donation_id);
    db.prepare('UPDATE deliveries SET picked_up_at = ? WHERE donation_id = ?').run(now, donation_id);
    return res.json({ success: true, message: 'Status updated to Picked Up.' });
  }

  if (status === 'delivered') {
    db.prepare("UPDATE donations SET status = 'delivered' WHERE id = ?").run(donation_id);
    db.prepare(`
      UPDATE deliveries 
      SET delivered_at = ?, beneficiary_name = ?, delivery_confirmed = 1 
      WHERE donation_id = ?
    `).run(now, beneficiary_name || 'Shelter Beneficiaries', donation_id);
    return res.json({ success: true, message: 'Status updated to Delivered!' });
  }

  return res.status(400).json({ error: 'Invalid status.' });
});

// 6. ADMIN GOVERNANCE & AUDIT PORTAL (Protected by Password: frn@123)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: 'ADMIN_SESSION_TOKEN_FRN_123', message: 'Admin authentication successful!' });
  }
  return res.status(401).json({ error: 'Invalid Admin Password. Access Denied.' });
});

app.get('/api/admin/pending-ngos', (req, res) => {
  const pending = db.prepare("SELECT * FROM ngos WHERE verified = 0 OR status = 'pending' ORDER BY created_at DESC").all();
  const verified = db.prepare("SELECT * FROM ngos WHERE verified = 1 AND status = 'verified' ORDER BY created_at DESC").all();
  const allNgos = db.prepare("SELECT * FROM ngos ORDER BY created_at DESC").all();
  const logs = db.prepare("SELECT l.*, n.name as ngo_name FROM verification_logs l JOIN ngos n ON l.ngo_id = n.id ORDER BY l.timestamp DESC").all();

  return res.json({ success: true, pending, verified, allNgos, logs });
});

// Admin Review & Verification Action for NGO Certificates & Darpan IDs
app.post('/api/admin/verify-ngo', (req, res) => {
  const { ngo_id, action, notes, admin_password } = req.body;

  if (admin_password && admin_password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized. Invalid Admin password.' });
  }

  if (!ngo_id) return res.status(400).json({ error: 'ngo_id required.' });

  const ngo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngo_id);
  if (!ngo) return res.status(404).json({ error: 'NGO not found.' });

  const now = new Date().toISOString();
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
  const logId = `LOG-${Date.now().toString().slice(-6)}`;

  let isVerified = 0;
  let statusText = 'pending';
  let messageText = '';

  if (action === 'approve' || action === true) {
    isVerified = 1;
    statusText = 'verified';
    messageText = `✓ NGO "${ngo.name}" approved and verified! Certificate & Darpan ID confirmed.`;
    db.prepare(`
      UPDATE ngos SET verified = 1, status = 'verified', verification_notes = ?, reverification_date = ? WHERE id = ?
    `).run(notes || 'Official registration documents & Darpan ID verified.', nextYear, ngo_id);

    db.prepare(`
      INSERT INTO verification_logs (id, ngo_id, admin_id, action, notes, timestamp)
      VALUES (?, ?, 'ADMIN-001', 'approved', ?, ?)
    `).run(logId, ngo_id, notes || 'Approved official certificate & Darpan ID.', now);

  } else if (action === 'reject' || action === false) {
    isVerified = 0;
    statusText = 'rejected';
    messageText = `❌ NGO "${ngo.name}" verification rejected.`;
    db.prepare(`
      UPDATE ngos SET verified = 0, status = 'rejected', verification_notes = ? WHERE id = ?
    `).run(notes || 'Registration documents declined or incomplete.', ngo_id);

    db.prepare(`
      INSERT INTO verification_logs (id, ngo_id, admin_id, action, notes, timestamp)
      VALUES (?, ?, 'ADMIN-001', 'rejected', ?, ?)
    `).run(logId, ngo_id, notes || 'Rejected registration certificate.', now);

  } else if (action === 'suspend') {
    isVerified = 0;
    statusText = 'suspended';
    messageText = `⚠️ NGO "${ngo.name}" suspended.`;
    db.prepare(`
      UPDATE ngos SET verified = 0, status = 'suspended', verification_notes = ? WHERE id = ?
    `).run(notes || 'Suspended due to audit query.', ngo_id);

    db.prepare(`
      INSERT INTO verification_logs (id, ngo_id, admin_id, action, notes, timestamp)
      VALUES (?, ?, 'ADMIN-001', 'suspended', ?, ?)
    `).run(logId, ngo_id, notes || 'Suspended NGO authorization.', now);
  }

  const updatedNgo = db.prepare('SELECT * FROM ngos WHERE id = ?').get(ngo_id);
  return res.json({ success: true, message: messageText, ngo: updatedNgo });
});

// Food Safety Manual Review Queue
app.get('/api/admin/flagged-donations', (req, res) => {
  const flagged = db.prepare(`
    SELECT d.*, don.name as donor_name, don.phone as donor_phone
    FROM donations d
    JOIN donors don ON d.donor_id = don.id
    WHERE d.status = 'flagged_for_inspection' OR d.inspection_status = 'flagged'
    ORDER BY d.created_at DESC
  `).all();

  return res.json({ success: true, flagged });
});

app.post('/api/admin/review-flagged-donation', (req, res) => {
  const { donation_id, action, admin_password } = req.body;

  if (admin_password && admin_password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(donation_id);
  if (!donation) return res.status(404).json({ error: 'Donation post not found.' });

  if (action === 'approve') {
    db.prepare("UPDATE donations SET status = 'posted', inspection_status = 'passed' WHERE id = ?").run(donation_id);
    const updated = db.prepare('SELECT * FROM donations WHERE id = ?').get(donation_id);
    const matches = matchDonationWithNgos(updated);
    return res.json({
      success: true,
      message: '✅ Manual Food Safety Inspection passed! Post dispatched to nearby verified NGOs.',
      matchesCount: matches.length
    });
  } else {
    db.prepare("UPDATE donations SET status = 'rejected', inspection_status = 'rejected' WHERE id = ?").run(donation_id);
    return res.json({ success: true, message: '❌ Flagged food donation post rejected by Admin inspector.' });
  }
});

// Admin All Donations & Stats
app.get('/api/admin/all-donations', (req, res) => {
  const donations = db.prepare(`
    SELECT d.*, don.name as donor_name, don.phone as donor_phone,
           ngo.name as assigned_ngo_name, vol.name as assigned_volunteer_name
    FROM donations d
    JOIN donors don ON d.donor_id = don.id
    LEFT JOIN deliveries del ON d.id = del.donation_id
    LEFT JOIN ngos ngo ON del.ngo_id = ngo.id
    LEFT JOIN volunteers vol ON del.volunteer_id = vol.id
    ORDER BY d.created_at DESC
  `).all();

  return res.json({ success: true, donations });
});

app.get('/api/admin/stats', (req, res) => {
  const totalDonations = db.prepare('SELECT COUNT(*) as count FROM donations').get().count;
  const deliveredDonations = db.prepare("SELECT COUNT(*) as count FROM donations WHERE status = 'delivered'").get().count;
  const sumServings = db.prepare("SELECT SUM(quantity) as total FROM donations WHERE status = 'delivered'").get().total || 0;
  const activeNgos = db.prepare("SELECT COUNT(*) as count FROM ngos WHERE verified = 1 AND (status = 'verified' OR status IS NULL)").get().count;
  const activeVolunteers = db.prepare('SELECT COUNT(*) as count FROM volunteers WHERE available = 1').get().count;

  const successRate = totalDonations > 0 ? Math.round((deliveredDonations / totalDonations) * 100) : 100;
  const totalMealsSaved = sumServings > 0 ? sumServings : 2450;
  const kgRescued = Math.round(totalMealsSaved * 0.35);

  return res.json({
    success: true,
    stats: {
      totalDonations,
      deliveredDonations,
      totalMealsSaved,
      kgRescued,
      activeNgos,
      activeVolunteers,
      successRate
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Surplus2Serve API Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
