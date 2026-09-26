const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'surplus2serve.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Helper to safely add column if it doesn't exist
function safeAddColumn(tableName, columnDef) {
  try {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef};`);
  } catch (e) {
    // Column likely already exists, ignore
  }
}

// Initialize Schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS donors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      otp_verified INTEGER DEFAULT 0,
      role_type TEXT DEFAULT 'event',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ngos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      darpan_id TEXT,
      legal_reg_no TEXT,
      pan_number TEXT,
      fcra_status TEXT DEFAULT 'Compliant',
      registration_doc_url TEXT,
      verified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      service_radius_km REAL DEFAULT 10.0,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      verification_notes TEXT,
      reverification_date TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_logs (
      id TEXT PRIMARY KEY,
      ngo_id TEXT NOT NULL,
      admin_id TEXT,
      action TEXT NOT NULL,
      notes TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS volunteers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      otp_verified INTEGER DEFAULT 1,
      available INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL,
      food_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      packaging TEXT NOT NULL,
      pickup_lat REAL NOT NULL,
      pickup_lng REAL NOT NULL,
      pickup_address TEXT NOT NULL,
      available_from TEXT NOT NULL,
      available_until TEXT NOT NULL,
      freshness_window_minutes INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'posted',
      inspection_status TEXT DEFAULT 'passed',
      flagged_reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS donation_ngo_matches (
      id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      ngo_id TEXT NOT NULL,
      distance_km REAL NOT NULL,
      notified_at TEXT NOT NULL,
      response TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL UNIQUE,
      volunteer_id TEXT,
      ngo_id TEXT NOT NULL,
      picked_up_at TEXT,
      delivered_at TEXT,
      beneficiary_name TEXT,
      delivery_confirmed INTEGER DEFAULT 0,
      FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
      FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      role TEXT NOT NULL,
      password TEXT,
      verified INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fssai_audits (
      id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      audit_status TEXT NOT NULL,
      audited_by TEXT NOT NULL,
      audited_at TEXT NOT NULL,
      checks_json TEXT NOT NULL,
      FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
    );
  `);

  // Migrate existing databases if columns missing
  safeAddColumn('ngos', "darpan_id TEXT");
  safeAddColumn('ngos', "legal_reg_no TEXT");
  safeAddColumn('ngos', "pan_number TEXT");
  safeAddColumn('ngos', "fcra_status TEXT DEFAULT 'Compliant'");
  safeAddColumn('ngos', "status TEXT DEFAULT 'pending'");
  safeAddColumn('ngos', "verification_notes TEXT");
  safeAddColumn('ngos', "reverification_date TEXT");

  safeAddColumn('donations', "inspection_status TEXT DEFAULT 'passed'");
  safeAddColumn('donations', "flagged_reason TEXT");
  safeAddColumn('donations', "pickup_otp TEXT");
  safeAddColumn('donations', "food_image_url TEXT");
  safeAddColumn('donations', "delivery_photo_url TEXT");
  safeAddColumn('donations', "food_items TEXT");
  safeAddColumn('donations', "accepted_by_ngo_id TEXT");
  safeAddColumn('donations', "accepted_at TEXT");
  safeAddColumn('donations', "audit_id TEXT");
  safeAddColumn('deliveries', "delivery_photo_url TEXT");
}

initSchema();

module.exports = db;
