# Data Model - QuickNotes

## Tables with UUID and Cascading FK

### users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

### notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

## Required Index Definitions
-- Speed up GET notes by user
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- Speed up sorting by recent
CREATE INDEX idx_notes_user_updated ON notes(user_id, updated_at DESC);

-- Speed up search by title
CREATE INDEX idx_notes_title_trigram ON notes USING gin (title gin_trgm_ops);

## Three Sample SQL Queries

### 1. Get all notes for a user
SELECT id, title, body, updated_at FROM notes WHERE user_id = '123e4567-e89b-12d3-a456-426614174000' ORDER BY updated_at DESC LIMIT 20;

### 2. Create a new note
INSERT INTO notes (user_id, title, body) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Meeting Notes', 'Discuss Q2 roadmap') RETURNING id, created_at;

### 3. Search notes by keyword
SELECT id, title FROM notes WHERE user_id = '123e4567-e89b-12d3-a456-426614174000' AND title ILIKE '%project%' ORDER BY updated_at DESC;
