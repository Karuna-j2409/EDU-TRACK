-- EduTrack schema (MySQL 8+)
-- Run automatically by `npm run db:setup`.
-- Manual alternative:  CREATE DATABASE edutrack;  then  mysql -u root -p edutrack < database/schema.sql

DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admins;

-- Administrators who are allowed to manage student records
CREATE TABLE admins (
    admin_id       INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  CHAR(60)     NOT NULL,          -- bcrypt hash, never the plain password
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    student_id  INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(100)  NOT NULL UNIQUE,
    department  VARCHAR(50)   NOT NULL,
    semester    TINYINT       NOT NULL CHECK (semester BETWEEN 1 AND 8),
    cgpa        DECIMAL(4,2)  NOT NULL CHECK (cgpa BETWEEN 0 AND 10),
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_students_department (department)     -- speeds up search by department
);
