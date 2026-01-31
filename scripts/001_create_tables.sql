-- Workers table for registration
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  aadhaar_number TEXT UNIQUE,
  mobile_number TEXT,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  photo_url TEXT,
  
  -- Address
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT,
  pincode TEXT,
  
  -- Work details
  job_type TEXT NOT NULL,
  contractor_id TEXT,
  employer_name TEXT,
  worksite_location TEXT,
  
  -- Stay validity
  stay_valid_from DATE,
  stay_valid_until DATE,
  
  -- Registration status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Risk flag (previously "black mark")
  has_risk_flag BOOLEAN DEFAULT FALSE,
  risk_flag_reason TEXT,
  risk_flag_date TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  
  -- Complaint details
  complaint_type TEXT NOT NULL CHECK (complaint_type IN ('wage_dispute', 'harassment', 'missing_person', 'workplace_accident', 'death_case', 'other')),
  description TEXT NOT NULL,
  
  -- Involved parties
  complainant_name TEXT NOT NULL,
  complainant_type TEXT NOT NULL CHECK (complainant_type IN ('worker', 'manager', 'employer', 'family', 'other')),
  complainant_contact TEXT,
  
  -- Against whom
  against_name TEXT,
  against_role TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  assigned_officer_id UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Renewals table
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  
  -- Current validity
  current_valid_from DATE NOT NULL,
  current_valid_until DATE NOT NULL,
  
  -- New validity (after approval)
  new_valid_from DATE,
  new_valid_until DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;

-- Admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'officer' CHECK (role IN ('officer', 'admin', 'super_admin')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workers
CREATE POLICY "Admins can view all workers" ON workers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert workers" ON workers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update workers" ON workers FOR UPDATE TO authenticated USING (true);

-- RLS Policies for complaints
CREATE POLICY "Admins can view all complaints" ON complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert complaints" ON complaints FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update complaints" ON complaints FOR UPDATE TO authenticated USING (true);

-- RLS Policies for renewals
CREATE POLICY "Admins can view all renewals" ON renewals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert renewals" ON renewals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update renewals" ON renewals FOR UPDATE TO authenticated USING (true);

-- RLS Policies for admin_profiles
CREATE POLICY "Admins can view all profiles" ON admin_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert own profile" ON admin_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update own profile" ON admin_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_workers_state ON workers(state);
CREATE INDEX IF NOT EXISTS idx_workers_risk_flag ON workers(has_risk_flag);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON renewals(status);
CREATE INDEX IF NOT EXISTS idx_renewals_valid_until ON renewals(current_valid_until);
