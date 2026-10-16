-- ====================================================================
-- Sankalp Educational Platform — PostgreSQL Database Schema
-- Compatible with PostgreSQL 13+ (Neon, Supabase, Render, AWS RDS)
-- ====================================================================

-- 1. COURSES / SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(64) PRIMARY KEY,                    -- e.g. 'embedded-systems'
    title VARCHAR(255) NOT NULL,                  -- 'Embedded Systems'
    academic_year SMALLINT NOT NULL CHECK (academic_year BETWEEN 1 AND 4),
    price NUMERIC(10, 2) NOT NULL DEFAULT 499.00,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating BETWEEN 0.00 AND 5.00),
    badge VARCHAR(64) NOT NULL DEFAULT 'Core',     -- '1st Year', '2nd Year', etc.
    thumbnail_url TEXT,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. MODULES TABLE
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(64) PRIMARY KEY,                    -- e.g. 'es-m1', 'cad-m1'
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_number SMALLINT NOT NULL,              -- 1, 2, 3...
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_course_module UNIQUE (course_id, module_number)
);

-- 3. RESOURCES TABLE (Lecture Notes & Video Lectures)
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(64) PRIMARY KEY,                    -- e.g. 'ES-M1', 'ES-V-M1'
    module_id VARCHAR(64) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,              -- e.g. 'M1 - Setup.pptx', 'M1.mp4'
    resource_type VARCHAR(32) NOT NULL CHECK (resource_type IN ('pptx', 'pdf', 'pcb', 'mp4')),
    section_type VARCHAR(32) NOT NULL CHECK (section_type IN ('lecture_note', 'video_lecture')),
    duration VARCHAR(64),                         -- e.g. '28 mins' (for video_lecture)
    drive_url TEXT,                               -- Google Drive stream or view URL
    drive_file_id VARCHAR(128),                   -- Extracted Google Drive File ID
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_module_file UNIQUE (module_id, file_name)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_courses_year ON courses(academic_year, status);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id, display_order);
CREATE INDEX IF NOT EXISTS idx_resources_module ON resources(module_id, section_type, display_order);
CREATE INDEX IF NOT EXISTS idx_resources_course ON resources(course_id);

-- ====================================================================
-- IDEMPOTENT INITIAL SEED DATA FOR THE 3 CORE SUBJECTS
-- ====================================================================

-- 1. Embedded Systems
INSERT INTO courses (id, title, academic_year, price, rating, badge, thumbnail_url, description, status, display_order)
VALUES (
    'embedded-systems',
    'Embedded Systems',
    2,
    599.00,
    4.90,
    '2nd Year',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    'Learn microcontroller architecture, peripheral interfacing, interrupt vectors, high-speed PCB differential routing, and embedded programming protocols.',
    'published',
    1
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    academic_year = EXCLUDED.academic_year,
    price = EXCLUDED.price,
    updated_at = CURRENT_TIMESTAMP;

-- 2. CAD Designing
INSERT INTO courses (id, title, academic_year, price, rating, badge, thumbnail_url, description, status, display_order)
VALUES (
    'cad-designing',
    'CAD Designing',
    1,
    499.00,
    4.80,
    '1st Year',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop',
    'Master 2D drafting, 3D parametric feature trees, mechanical assemblies, joint constraints, GD&T tolerancing, and manufacturing-ready production drawings.',
    'published',
    2
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    academic_year = EXCLUDED.academic_year,
    price = EXCLUDED.price,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Robot Vision
INSERT INTO courses (id, title, academic_year, price, rating, badge, thumbnail_url, description, status, display_order)
VALUES (
    'robot-vision',
    'Robot Vision',
    3,
    649.00,
    4.90,
    '3rd Year',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop',
    'Comprehensive robot perception program: image processing, camera calibration, feature extraction, neural networks, 3D vision, and visual SLAM.',
    'published',
    3
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    academic_year = EXCLUDED.academic_year,
    price = EXCLUDED.price,
    updated_at = CURRENT_TIMESTAMP;
