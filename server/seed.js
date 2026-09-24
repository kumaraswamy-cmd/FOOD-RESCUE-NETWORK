const db = require('./db');

function seedDatabase() {
  console.log('🌱 Seeding Surplus2Serve SQLite Database...');

  // Clear existing data safely
  db.exec('DELETE FROM verification_logs;');
  db.exec('DELETE FROM deliveries;');
  db.exec('DELETE FROM donation_ngo_matches;');
  db.exec('DELETE FROM donations;');
  db.exec('DELETE FROM volunteers;');
  db.exec('DELETE FROM ngos;');
  db.exec('DELETE FROM donors;');
  db.exec('DELETE FROM admins;');

  const now = new Date().toISOString();

  // 1. Seed Donors
  const insertDonor = db.prepare(`
    INSERT INTO donors (id, name, phone, otp_verified, role_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertDonor.run('DONOR-001', 'Royal Grand Palace Hall', '9848022338', 1, 'event', now);
  insertDonor.run('DONOR-002', 'Spice Garden Caterers', '9100876543', 1, 'restaurant', now);
  insertDonor.run('DONOR-003', 'Novotel Convention Hotel', '9988776655', 1, 'hotel', now);

  // 2. Seed NGOs (Coordinates around Visakhapatnam / Vizag region)
  const insertNgo = db.prepare(`
    INSERT INTO ngos (
      id, name, phone, darpan_id, legal_reg_no, pan_number, fcra_status,
      registration_doc_url, verified, status, service_radius_km, lat, lng,
      verification_notes, reverification_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

  // Asha Care Foundation (Verified & Compliant)
  insertNgo.run(
    'NGO-001', 'Asha Care Foundation', '9849011223',
    'AP/2024/001928', 'REG-AP-1029/2021', 'AAAAA1111A', 'Compliant',
    'https://docs.gov.in/ngo/AP2024098.pdf', 1, 'verified', 10.0, 17.7200, 83.3100,
    'Official government registration cross-checked & verified by Admin.', nextYear, now
  );

  // Akshaya Shelter Trust (Verified & Compliant)
  insertNgo.run(
    'NGO-002', 'Akshaya Shelter Trust', '9440122334',
    'AP/2023/004521', 'REG-AP-2045/2019', 'BBBBB2222B', 'Compliant',
    'https://docs.gov.in/ngo/AP2023452.pdf', 1, 'verified', 12.0, 17.6900, 83.2300,
    'Audited annual report & Darpan ID confirmed.', nextYear, now
  );

  // Mother Theresa Orphanage (Verified)
  insertNgo.run(
    'NGO-003', 'Mother Theresa Orphanage', '9123456780',
    'AP/2025/001120', 'REG-AP-3091/2022', 'CCCCC3333C', 'Exempt',
    'https://docs.gov.in/ngo/AP2025112.pdf', 1, 'verified', 8.0, 17.7300, 83.3200,
    'Verified legal identity & Orphanage License.', nextYear, now
  );

  // Little Hearts Foundation (UNVERIFIED / Pending Admin Review!)
  insertNgo.run(
    'NGO-004', 'Little Hearts Foundation', '9876509876',
    'AP/2026/008891', 'REG-AP-4012/2024', 'DDDDD4444D', 'Compliant',
    'https://docs.gov.in/ngo/AP2026889_pending.pdf', 0, 'pending', 5.0, 17.7050, 83.2900,
    'Certificate submitted by NGO. Awaiting Darpan ID official cross-check by Admin.', null, now
  );

  // 3. Seed Verification Logs
  const insertLog = db.prepare(`
    INSERT INTO verification_logs (id, ngo_id, admin_id, action, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLog.run('LOG-001', 'NGO-001', 'ADMIN-001', 'approved', 'Darpan ID AP/2024/001928 verified with NITI Aayog portal.', now);
  insertLog.run('LOG-002', 'NGO-002', 'ADMIN-001', 'approved', 'FCRA compliance certificate verified.', now);
  insertLog.run('LOG-003', 'NGO-003', 'ADMIN-001', 'approved', 'Legal registration and orphanage permit cross-checked.', now);

  // 4. Seed Volunteers
  const insertVolunteer = db.prepare(`
    INSERT INTO volunteers (id, name, phone, otp_verified, available, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertVolunteer.run('VOL-001', 'Ramesh Kumar', '9876543210', 1, 1, now);
  insertVolunteer.run('VOL-002', 'Suresh Varma', '9123412345', 1, 1, now);

  // 5. Seed Admin
  const insertAdmin = db.prepare(`
    INSERT INTO admins (id, name, phone)
    VALUES (?, ?, ?)
  `);

  insertAdmin.run('ADMIN-001', 'Dr. T. Govindarao', '9999999999');

  // 6. Seed Sample Donations
  const insertDonation = db.prepare(`
    INSERT INTO donations (
      id, donor_id, food_type, quantity, packaging, pickup_lat, pickup_lng, pickup_address,
      available_from, available_until, freshness_window_minutes, status, inspection_status, flagged_reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const fromTime = new Date(Date.now() - 15 * 60000).toISOString();
  const untilTime = new Date(Date.now() + 105 * 60000).toISOString();

  // Active Post 1 (posted, passed automated checks)
  insertDonation.run(
    'DON-101', 'DONOR-001', 'Paneer Biryani, Veg Kurma & Rotis', 120,
    'Stainless Steel Hot Vessels', 17.7123, 83.3150, 'Beach Road, Visakhapatnam',
    fromTime, untilTime, 120, 'posted', 'passed', null, now
  );

  // Active Post 2 (accepted by Asha Care Foundation)
  insertDonation.run(
    'DON-102', 'DONOR-002', 'Chicken Curry, Fried Rice & Sambar', 75,
    'Sealed Foil Containers', 17.7250, 83.3012, 'RTC Complex Road, Vizag',
    fromTime, untilTime, 90, 'accepted', 'passed', null, now
  );

  // Delivered Post 3 (delivered)
  insertDonation.run(
    'DON-103', 'DONOR-003', 'Assorted Buffet Lunch Meals & Salads', 180,
    'Sealed Food Containers', 17.7198, 83.3180, 'Siripuram Junction, Vizag',
    fromTime, untilTime, 180, 'delivered', 'passed', null, now
  );

  // Flagged Post 4 (Flagged for Manual Inspection due to short freshness window & high bulk quantity)
  insertDonation.run(
    'DON-104', 'DONOR-001', 'Seafood Paella & Raw Fish Platters', 350,
    'Open Metal Trays', 17.7150, 83.3120, 'Harbor Banquet, Visakhapatnam',
    fromTime, untilTime, 20, 'flagged_for_inspection', 'flagged',
    'Automated rule flagged: Freshness window under 30 mins & raw perishable seafood requiring temperature audit.', now
  );

  // Seed NGO Matches for DON-101
  const insertMatch = db.prepare(`
    INSERT INTO donation_ngo_matches (id, donation_id, ngo_id, distance_km, notified_at, response)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertMatch.run('MATCH-001', 'DON-101', 'NGO-001', 1.25, now, 'pending');
  insertMatch.run('MATCH-002', 'DON-101', 'NGO-003', 2.10, now, 'pending');

  // Match & Delivery for DON-102
  insertMatch.run('MATCH-003', 'DON-102', 'NGO-001', 0.95, now, 'accepted');
  
  const insertDelivery = db.prepare(`
    INSERT INTO deliveries (id, donation_id, volunteer_id, ngo_id, picked_up_at, delivered_at, beneficiary_name, delivery_confirmed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDelivery.run('DEL-001', 'DON-102', 'VOL-001', 'NGO-001', now, null, 'Asha Care Children Home', 0);
  insertDelivery.run('DEL-002', 'DON-103', 'VOL-002', 'NGO-002', now, now, 'Akshaya Old Age Shelter', 1);

  console.log('✅ Seed completed successfully with NGO Darpan IDs, PAN, FCRA status, and verification history!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
