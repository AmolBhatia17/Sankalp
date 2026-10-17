-- ====================================================================
-- Sankalp Educational Platform — MySQL Database Schema
-- Compatible with MySQL 8.0+
-- ====================================================================

-- 1. COURSES / SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    academic_year TINYINT NOT NULL CHECK (academic_year BETWEEN 1 AND 4),
    price DECIMAL(10, 2) NOT NULL DEFAULT 499.00,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating BETWEEN 0.00 AND 5.00),
    badge VARCHAR(64) NOT NULL DEFAULT 'Core',
    thumbnail_url TEXT,
    description TEXT,
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_courses_year (academic_year, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. MODULES TABLE
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL,
    module_number SMALLINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_module_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uq_course_module (course_id, module_number),
    INDEX idx_modules_course (course_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. RESOURCES TABLE (Lecture Notes & Video Lectures)
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) NOT NULL,
    course_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    resource_type ENUM('pptx', 'pdf', 'pcb', 'mp4') NOT NULL,
    section_type ENUM('lecture_note', 'video_lecture') NOT NULL,
    duration VARCHAR(64) DEFAULT NULL,
    drive_url TEXT DEFAULT NULL,
    drive_file_id VARCHAR(128) DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resource_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    CONSTRAINT fk_resource_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uq_module_file (module_id, file_name),
    INDEX idx_resources_module (module_id, section_type, display_order),
    INDEX idx_resources_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
