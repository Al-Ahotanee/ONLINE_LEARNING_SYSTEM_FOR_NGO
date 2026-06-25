-- ============================================================
-- NGO Training Platform — Database Schema
-- Run this in your Neon SQL Editor before first deployment
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  full_name        VARCHAR(255) NOT NULL,
  role             VARCHAR(50) NOT NULL DEFAULT 'FieldStaff',
  organization_id  INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  estimated_hours  NUMERIC(5, 1) NOT NULL DEFAULT 1.0,
  created_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  organization_id  INTEGER,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id           INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  status              VARCHAR(50) NOT NULL DEFAULT 'In Progress',
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id  ON enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_published  ON courses (is_published);
CREATE INDEX IF NOT EXISTS idx_users_email           ON users (email);

-- ============================================================
-- SEED: Create a default NGOAdmin account
-- Email: admin@ngo.org  |  Password: Admin1234!
-- IMPORTANT: Change this password immediately after first login.
-- ============================================================
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@ngo.org',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/u3vDe5.',
  'System Administrator',
  'NGOAdmin'
) ON CONFLICT (email) DO NOTHING;
