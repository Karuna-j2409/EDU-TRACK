-- EduTrack sample data (development only)
-- Admin login:  admin@edutrack.edu / Admin@123   (bcrypt hash below, cost factor 10)

INSERT INTO admins (name, email, password_hash) VALUES
('EduTrack Admin', 'admin@edutrack.edu', '$2a$10$I22DfheVUk/qHFFIeAYapOEjXiVv0iNA6Af6bNONBymEe0PoZMiC2');

INSERT INTO students (name, email, department, semester, cgpa) VALUES
('Karuna Sharma',  'karuna.sharma@college.edu',  'CSE',  5, 8.92),
('Aarav Mehta',    'aarav.mehta@college.edu',    'IT',   3, 7.45),
('Diya Iyer',      'diya.iyer@college.edu',      'ECE',  7, 9.10),
('Rohan Verma',    'rohan.verma@college.edu',    'CSE',  1, 6.80),
('Sneha Kulkarni', 'sneha.kulkarni@college.edu', 'MECH', 5, 8.05);
