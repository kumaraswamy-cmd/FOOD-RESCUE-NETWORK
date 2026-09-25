const db = require('./db');

function seedDatabase() {
  console.log('🌱 Seeding Food Rescue Network SQLite Database...');

  // Clear existing data safely
  db.exec('DELETE FROM verification_logs;');
  db.exec('DELETE FROM deliveries;');
  db.exec('DELETE FROM donation_ngo_matches;');
  db.exec('DELETE FROM donations;');
  db.exec('DELETE FROM volunteers;');
  db.exec('DELETE FROM ngos;');
  db.exec('DELETE FROM donors;');
  db.exec('DELETE FROM admins;');
  db.exec('DELETE FROM users;');

  const now = new Date().toISOString();
  const threeHoursAgo = new Date(Date.now() - 3600000 * 3).toISOString();
  const twoHoursAgo = new Date(Date.now() - 3600000 * 2).toISOString();
  const ninetyMinsAgo = new Date(Date.now() - 5400000).toISOString();
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const fortyFiveMinsAgo = new Date(Date.now() - 2700000).toISOString();
  const fiveHoursAgo = new Date(Date.now() - 18000000).toISOString();
  const fourHoursAgo = new Date(Date.now() - 14400000).toISOString();
  const thirtyMinsAgo = new Date(Date.now() - 1800000).toISOString();
  const eightHoursAgo = new Date(Date.now() - 28800000).toISOString();

  // 1. Seed 5 Donors
  const insertDonor = db.prepare(`
    INSERT INTO donors (id, name, phone, otp_verified, role_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertDonor.run('DONOR-001', 'N Convention Centre', '9849012345', 1, 'event', now);
  insertDonor.run('DONOR-002', 'HITEX Exhibition Center', '9849023456', 1, 'event', now);
  insertDonor.run('DONOR-003', 'Novotel Hyderabad Convention Centre', '9849034567', 1, 'hotel', now);
  insertDonor.run('DONOR-004', 'The Park Hyderabad', '9849045678', 1, 'hotel', now);
  insertDonor.run('DONOR-005', 'Taj Falaknuma Palace', '9849056789', 1, 'hotel', now);

  // 2. Seed 5 Recipient Organisations (ALL Verified)
  const insertNgo = db.prepare(`
    INSERT INTO ngos (
      id, name, phone, darpan_id, legal_reg_no, pan_number, fcra_status,
      registration_doc_url, verified, status, service_radius_km, lat, lng,
      verification_notes, reverification_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

  insertNgo.run(
    'NGO-001', 'Little Sisters of the Poor – Secunderabad', '9849067890',
    'TS/2024/001928', 'REG-TS-1029', 'AAATL1029P', 'Compliant',
    'https://docs.gov.in/ngo/TS2024098.pdf', 1, 'verified', 10.0, 17.4400, 78.5000,
    'Verified legal identity & Care Home permit.', nextYear, now
  );

  insertNgo.run(
    'NGO-002', 'Don Bosco Navajeevan for Boys', '9849078901',
    'TS/2024/002441', 'REG-TS-2044', 'AAATD2044P', 'Compliant',
    'https://docs.gov.in/ngo/TS2024452.pdf', 1, 'verified', 15.0, 17.4320, 78.5030,
    'Official government registration cross-checked & verified by Admin.', nextYear, now
  );

  insertNgo.run(
    'NGO-003', "St. Joseph's Orphanage for Girls", '9849089012',
    'TS/2025/005512', 'REG-TS-5512', 'AAATS5512P', 'Compliant',
    'https://docs.gov.in/ngo/TS2025112.pdf', 1, 'verified', 12.0, 17.3940, 78.4750,
    'Audited annual report & Orphanage License confirmed.', nextYear, now
  );

  insertNgo.run(
    'NGO-004', 'Tharuni', '9849090123',
    'TS/2025/007890', 'REG-TS-7890', 'AAATT7890P', 'Compliant',
    'https://docs.gov.in/ngo/TS2025789.pdf', 1, 'verified', 10.0, 17.4020, 78.4840,
    'Verified NGO Darpan ID and Social Enterprise status.', nextYear, now
  );

  insertNgo.run(
    'NGO-005', 'Robin Hood Army – Hyderabad', '9849001234',
    'TS/2026/009941', 'REG-TS-9941', 'AAATR9941P', 'Compliant',
    'https://docs.gov.in/ngo/TS2026994.pdf', 1, 'verified', 15.0, 17.4310, 78.4070,
    'Verified Zero-Funds Food Rescue Organisation.', nextYear, now
  );

  // 3. Seed Verification Logs
  const insertLog = db.prepare(`
    INSERT INTO verification_logs (id, ngo_id, admin_id, action, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLog.run('LOG-001', 'NGO-001', 'ADMIN-001', 'approved', 'Darpan ID TS/2024/001928 verified with NITI Aayog portal.', now);
  insertLog.run('LOG-002', 'NGO-002', 'ADMIN-001', 'approved', 'FCRA compliance certificate verified.', now);
  insertLog.run('LOG-003', 'NGO-003', 'ADMIN-001', 'approved', 'Orphanage permit and Darpan ID cross-checked.', now);
  insertLog.run('LOG-004', 'NGO-004', 'ADMIN-001', 'approved', 'TS Social Organisation permit verified.', now);
  insertLog.run('LOG-005', 'NGO-005', 'ADMIN-001', 'approved', 'Food Rescue Chapter accreditation approved.', now);

  // 4. Seed Volunteers & Default Users
  const insertVolunteer = db.prepare(`
    INSERT INTO volunteers (id, name, phone, otp_verified, available, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertVolunteer.run('VOL-001', 'Rajesh Kumar', '9849099999', 1, 1, now);
  insertVolunteer.run('VOL-002', 'Suresh Varma', '9123412345', 1, 1, now);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, phone, role, password, verified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);

  insertUser.run('DONOR-USER-001', 'Rahul Mehta', 'donor@nconvention.org', '9849012345', 'donor', 'frn@123', now);
  insertUser.run('NGO-USER-001', 'Ananya Sharma', 'ngo@donbosco.org', '9849078901', 'ngo', 'frn@123', now);
  insertUser.run('VOL-USER-001', 'Rajesh Kumar', 'volunteer@frn.org', '9849099999', 'volunteer', 'frn@123', now);

  // 5. Seed Admin
  const insertAdmin = db.prepare(`
    INSERT INTO admins (id, name, phone)
    VALUES (?, ?, ?)
  `);

  insertAdmin.run('ADMIN-001', 'Dr. T. Govindarao', '9999999999');

  // 6. Seed 10 Food Donations
  const insertDonation = db.prepare(`
    INSERT INTO donations (
      id, donor_id, food_type, quantity, food_items, packaging, pickup_lat, pickup_lng, pickup_address,
      available_from, available_until, freshness_window_minutes, status, inspection_status, flagged_reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // DON-1001: 120 meals, delivered
  insertDonation.run(
    'DON-1001', 'DONOR-001', 'Paneer Butter Masala (40 plates), Vegetable Biryani (50 plates), Butter Naan (30 pieces)', 120,
    JSON.stringify([
      { itemName: 'Paneer Butter Masala', quantity: 40, unit: 'plates', description: 'Rich tomato gravy' },
      { itemName: 'Vegetable Biryani', quantity: 50, unit: 'plates', description: 'Hyderabadi style with raita' },
      { itemName: 'Butter Naan', quantity: 30, unit: 'pieces', description: 'Freshly baked' }
    ]),
    'Insulated Hot Containers', 17.4560, 78.3840, 'Madhapur, Hyderabad',
    threeHoursAgo, new Date(Date.now() + 3600000).toISOString(), 120, 'delivered', 'passed', null, threeHoursAgo
  );

  // DON-1002: 180 meals, picked_up
  insertDonation.run(
    'DON-1002', 'DONOR-002', 'Steamed Rice & Dal (80 meals), Mixed Vegetable Curry (60 plates), Whole Wheat Roti (40 pieces)', 180,
    JSON.stringify([
      { itemName: 'Steamed Rice & Dal', quantity: 80, unit: 'meals', description: 'Hot corporate lunch' },
      { itemName: 'Mixed Vegetable Curry', quantity: 60, unit: 'plates', description: 'Seasonal veggies' },
      { itemName: 'Whole Wheat Roti', quantity: 40, unit: 'pieces', description: 'Soft rotis' }
    ]),
    'Sealed Foil Trays', 17.4700, 78.3750, 'Izzat Nagar, Hyderabad',
    twoHoursAgo, new Date(Date.now() + 7200000).toISOString(), 180, 'picked_up', 'passed', null, twoHoursAgo
  );

  // DON-1003: 250 meals, volunteer_assigned
  insertDonation.run(
    'DON-1003', 'DONOR-003', 'Penne Pasta in White Sauce (100 plates), Veg Fried Rice (90 plates), Stir-Fried Vegetables (60 kg)', 250,
    JSON.stringify([
      { itemName: 'Penne Pasta in White Sauce', quantity: 100, unit: 'plates', description: 'Cheesy pasta' },
      { itemName: 'Veg Fried Rice', quantity: 90, unit: 'plates', description: 'Indo-Chinese' },
      { itemName: 'Stir-Fried Vegetables', quantity: 60, unit: 'kg', description: 'Fresh broccoli & peppers' }
    ]),
    'Food-Grade Catering Boxes', 17.4720, 78.3730, 'HITEC City, Hyderabad',
    ninetyMinsAgo, new Date(Date.now() + 5400000).toISOString(), 150, 'volunteer_assigned', 'passed', null, ninetyMinsAgo
  );

  // DON-1004: 100 meals, accepted
  insertDonation.run(
    'DON-1004', 'DONOR-004', 'South Indian Idli (40 pieces), Meduk Vada (30 pieces), Sambar & Chutney (30 litres)', 100,
    JSON.stringify([
      { itemName: 'South Indian Idli', quantity: 40, unit: 'pieces', description: 'Steamed rice cakes' },
      { itemName: 'Meduk Vada', quantity: 30, unit: 'pieces', description: 'Crispy vadas' },
      { itemName: 'Sambar & Chutney', quantity: 30, unit: 'litres', description: 'Lentil soup' }
    ]),
    'Clean Plastic Containers', 17.4240, 78.4610, 'Somajiguda, Hyderabad',
    oneHourAgo, new Date(Date.now() + 3600000).toISOString(), 120, 'accepted', 'passed', null, oneHourAgo
  );

  // DON-1005: 150 meals, posted
  insertDonation.run(
    'DON-1005', 'DONOR-005', 'Hyderabadi Veg Pulao (70 plates), Dal Tadka (40 litres), Tandoori Roti (40 pieces)', 150,
    JSON.stringify([
      { itemName: 'Hyderabadi Veg Pulao', quantity: 70, unit: 'plates', description: 'Fragrant basmati rice' },
      { itemName: 'Dal Tadka', quantity: 40, unit: 'litres', description: 'Tempered yellow lentils' },
      { itemName: 'Tandoori Roti', quantity: 40, unit: 'pieces', description: 'Clay oven bread' }
    ]),
    'Insulated Casseroles', 17.3315, 78.4673, 'Falaknuma, Hyderabad',
    fortyFiveMinsAgo, new Date(Date.now() + 10800000).toISOString(), 240, 'posted', 'passed', null, fortyFiveMinsAgo
  );

  // DON-1006: 80 meals, delivered
  insertDonation.run(
    'DON-1006', 'DONOR-001', 'Crispy Veg Samosas (40 pieces), Vegetable Cutlets (25 pieces), Plum Tea Cake (15 packets)', 80,
    JSON.stringify([
      { itemName: 'Crispy Veg Samosas', quantity: 40, unit: 'pieces', description: 'Spiced potato filing' },
      { itemName: 'Vegetable Cutlets', quantity: 25, unit: 'pieces', description: 'Golden fried' },
      { itemName: 'Plum Tea Cake', quantity: 15, unit: 'packets', description: 'Bakery cake slices' }
    ]),
    'Food Grade Cardboard Boxes', 17.4560, 78.3840, 'Madhapur, Hyderabad',
    fiveHoursAgo, now, 90, 'delivered', 'passed', null, fiveHoursAgo
  );

  // DON-1007: 200 meals, accepted
  insertDonation.run(
    'DON-1007', 'DONOR-002', 'Assorted Veg Sandwiches (80 packets), Fresh Fruit Bowl (50 kg), Pulao Boxes (70 meals)', 200,
    JSON.stringify([
      { itemName: 'Assorted Veg Sandwiches', quantity: 80, unit: 'packets', description: 'Fresh cucumber & cheese' },
      { itemName: 'Fresh Fruit Bowl', quantity: 50, unit: 'kg', description: 'Seasonal fruit mix' },
      { itemName: 'Pulao Boxes', quantity: 70, unit: 'meals', description: 'Packed lunch boxes' }
    ]),
    'Individual Packed Boxes', 17.4700, 78.3750, 'Izzat Nagar, Hyderabad',
    twoHoursAgo, new Date(Date.now() + 7200000).toISOString(), 180, 'accepted', 'passed', null, twoHoursAgo
  );

  // DON-1008: 90 meals, posted
  insertDonation.run(
    'DON-1008', 'DONOR-003', 'French Pastries (50 pieces), Savory Cheese Puffs (40 pieces)', 90,
    JSON.stringify([
      { itemName: 'French Pastries', quantity: 50, unit: 'pieces', description: 'Assorted chocolate & fruit' },
      { itemName: 'Savory Cheese Puffs', quantity: 40, unit: 'pieces', description: 'Flaky puff pastry' }
    ]),
    'Bakery Boxes', 17.4720, 78.3730, 'HITEC City, Hyderabad',
    thirtyMinsAgo, new Date(Date.now() + 3600000).toISOString(), 120, 'posted', 'passed', null, thirtyMinsAgo
  );

  // DON-1009: 70 meals, picked_up
  insertDonation.run(
    'DON-1009', 'DONOR-004', 'Jeera Rice (30 plates), Chana Masala (25 plates), Lachha Paratha (15 pieces)', 70,
    JSON.stringify([
      { itemName: 'Jeera Rice', quantity: 30, unit: 'plates', description: 'Cumin rice' },
      { itemName: 'Chana Masala', quantity: 25, unit: 'plates', description: 'Spiced chickpeas' },
      { itemName: 'Lachha Paratha', quantity: 15, unit: 'pieces', description: 'Layered flatbread' }
    ]),
    'Hot Foil Packs', 17.4240, 78.4610, 'Somajiguda, Hyderabad',
    ninetyMinsAgo, new Date(Date.now() + 3600000).toISOString(), 150, 'picked_up', 'passed', null, ninetyMinsAgo
  );

  // DON-1010: 130 meals, expired
  insertDonation.run(
    'DON-1010', 'DONOR-005', 'Double Ka Meetha (80 pieces), Badam Kheer (50 litres)', 130,
    JSON.stringify([
      { itemName: 'Double Ka Meetha', quantity: 80, unit: 'pieces', description: 'Hyderabadi bread pudding' },
      { itemName: 'Badam Kheer', quantity: 50, unit: 'litres', description: 'Rich almond milk sweet' }
    ]),
    'Covered Plastic Trays', 17.3315, 78.4673, 'Falaknuma, Hyderabad',
    eightHoursAgo, now, 60, 'expired', 'passed', null, eightHoursAgo
  );

  // Seed Matches
  const insertMatch = db.prepare(`
    INSERT INTO donation_ngo_matches (id, donation_id, ngo_id, distance_km, notified_at, response)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertMatch.run('MATCH-1001', 'DON-1001', 'NGO-001', 3.2, threeHoursAgo, 'accepted');
  insertMatch.run('MATCH-1002', 'DON-1002', 'NGO-002', 4.1, twoHoursAgo, 'accepted');
  insertMatch.run('MATCH-1003', 'DON-1003', 'NGO-005', 2.8, ninetyMinsAgo, 'accepted');
  insertMatch.run('MATCH-1004', 'DON-1004', 'NGO-003', 3.5, oneHourAgo, 'accepted');
  insertMatch.run('MATCH-1005', 'DON-1005', 'NGO-004', 5.0, fortyFiveMinsAgo, 'pending');
  insertMatch.run('MATCH-1006', 'DON-1006', 'NGO-002', 4.5, fiveHoursAgo, 'accepted');
  insertMatch.run('MATCH-1007', 'DON-1007', 'NGO-004', 3.0, twoHoursAgo, 'accepted');
  insertMatch.run('MATCH-1009', 'DON-1009', 'NGO-003', 2.5, ninetyMinsAgo, 'accepted');

  // Seed Deliveries
  const insertDelivery = db.prepare(`
    INSERT INTO deliveries (id, donation_id, volunteer_id, ngo_id, picked_up_at, delivered_at, beneficiary_name, delivery_confirmed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDelivery.run('DEL-1001', 'DON-1001', 'VOL-001', 'NGO-001', threeHoursAgo, twoHoursAgo, 'Little Sisters Old Age Home', 1);
  insertDelivery.run('DEL-1006', 'DON-1006', 'VOL-001', 'NGO-002', fiveHoursAgo, fourHoursAgo, 'Don Bosco Boys Home', 1);
  insertDelivery.run('DEL-1002', 'DON-1002', 'VOL-001', 'NGO-002', twoHoursAgo, null, 'Don Bosco Boys Home', 0);
  insertDelivery.run('DEL-1003', 'DON-1003', 'VOL-001', 'NGO-005', ninetyMinsAgo, null, 'Robin Hood Night Shelter', 0);
  insertDelivery.run('DEL-1009', 'DON-1009', 'VOL-001', 'NGO-003', ninetyMinsAgo, null, 'St. Joseph Girls Home', 0);

  console.log('✅ SQLite Seed completed successfully with 5 Donors, 5 Verified Recipient NGOs, 10 Food Donations, and 3 Default Users!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

