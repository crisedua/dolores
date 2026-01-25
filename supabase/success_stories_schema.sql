-- Create success_stories table
CREATE TABLE IF NOT EXISTS success_stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    article_content TEXT NOT NULL, -- The raw content pasted by admin
    website_url TEXT,
    summary TEXT, -- AI Generated
    steps JSONB DEFAULT '[]'::jsonb, -- AI Generated List
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read
CREATE POLICY "Public can view success stories"
    ON success_stories FOR SELECT
    USING (true);

-- Only authenticated users (admins in this context) can insert/update
-- Note: Ideally this should be more restrictive (e.g. check specific email or role)
-- For now, we allow any authenticated user to act as admin for this specific table as per plan
CREATE POLICY "Authenticated users can manage success stories"
    ON success_stories FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS trigger_update_success_stories_modtime ON success_stories;
CREATE TRIGGER trigger_update_success_stories_modtime
    BEFORE UPDATE ON success_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
