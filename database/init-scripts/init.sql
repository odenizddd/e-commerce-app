CREATE DATABASE testdb;

\c testdb;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password) VALUES 
('johndoe93', 'johndoe93@example.com', 'Jd@2024Doe!'),
('sarah.smith', 'sarah.smith@example.com', 'S$mith2024#'),
('techguru88', 'techguru88@example.com', 'T3chGr88@!');
