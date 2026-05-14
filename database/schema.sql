-- SMART JEWELLERY INVENTORY OS - Database Schema
-- Copy and paste this entire file into Supabase SQL Editor and run it

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'owner', 'staff')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tenants Table (Business/Organization)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  subscription_plan TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  session_limits INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  gross_weight DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  purchase_price DECIMAL(12, 2) NOT NULL,
  selling_price DECIMAL(12, 2),
  vendor TEXT NOT NULL,
  storage_location TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Inventory Images Table
CREATE TABLE IF NOT EXISTS inventory_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  inventory_reference UUID NOT NULL,
  mismatch_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('green', 'yellow', 'orange', 'red')),
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_reference) REFERENCES inventory(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  billing_cycle TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create Indexes for Performance
CREATE INDEX idx_inventory_tenant ON inventory(tenant_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_deleted ON inventory(deleted_at);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (id = auth.uid());

-- RLS Policies for Inventory
CREATE POLICY "Users can read own tenant inventory" ON inventory
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert own tenant inventory" ON inventory
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own tenant inventory" ON inventory
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for Inventory Images
CREATE POLICY "Users can read own inventory images" ON inventory_images
  FOR SELECT USING (inventory_id IN (
    SELECT id FROM inventory WHERE tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  ));

-- RLS Policies for Audit Logs
CREATE POLICY "Users can read own tenant audits" ON audit_logs
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for Activity Logs
CREATE POLICY "Users can read own tenant activity" ON activity_logs
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Create Storage Bucket for Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory-images', 'inventory-images', true)
ON CONFLICT DO NOTHING;

-- RLS Policy for Storage
CREATE POLICY "Anyone can view inventory images" ON storage.objects
  FOR SELECT USING (bucket_id = 'inventory-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'inventory-images' AND
    auth.role() = 'authenticated'
  );

-- All Done! ✅
-- Your database is ready for the SMART JEWELLERY INVENTORY OS