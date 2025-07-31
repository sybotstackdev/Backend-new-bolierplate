-- Migration: Create files table
-- Description: Stores file metadata and information for file upload system

CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_filename ON files(filename);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_files_updated_at();

-- Add comments for documentation
COMMENT ON TABLE files IS 'Stores file metadata and information for the file upload system';
COMMENT ON COLUMN files.id IS 'Unique identifier for the file';
COMMENT ON COLUMN files.original_name IS 'Original filename as uploaded by user';
COMMENT ON COLUMN files.filename IS 'System-generated unique filename';
COMMENT ON COLUMN files.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN files.size IS 'File size in bytes';
COMMENT ON COLUMN files.category IS 'File category (image, document, video, audio, general)';
COMMENT ON COLUMN files.description IS 'Optional description of the file';
COMMENT ON COLUMN files.file_path IS 'Full path to the file on disk';
COMMENT ON COLUMN files.uploaded_by IS 'User ID who uploaded the file'; 