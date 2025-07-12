-- Add writer role and message system

-- Add role column to users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'reader'; -- 'admin', 'writer', 'reader'

-- Update existing admin users
UPDATE users SET role = 'admin' WHERE is_admin = 1;

-- Add author_id to novels table to link with writers
ALTER TABLE novels ADD COLUMN author_id INTEGER REFERENCES users(id);

-- Add author_id to chapters table for writer permissions
ALTER TABLE chapters ADD COLUMN author_id INTEGER REFERENCES users(id);

-- Create messages table for contact us / writer applications
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'contact', -- 'contact', 'writer_application', 'general'
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- 'unread', 'read', 'responded', 'archived'
    admin_response TEXT,
    admin_responder_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create writer applications table for detailed applications
CREATE TABLE IF NOT EXISTS writer_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    message_id INTEGER REFERENCES messages(id),
    pen_name TEXT,
    writing_experience TEXT,
    genre_interests TEXT,
    sample_work TEXT,
    why_verse TEXT, -- Why they want to write for Verse
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes TEXT,
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
