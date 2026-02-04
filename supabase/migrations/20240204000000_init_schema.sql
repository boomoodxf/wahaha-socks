-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    brand TEXT,
    item_no TEXT,
    crotch_type TEXT,
    thickness TEXT,
    material TEXT,
    cover_url TEXT NOT NULL,
    link TEXT,
    comment TEXT
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access (since it's a personal app/MVP, maybe public read is fine)
-- If we want to be strict, we can just allow all for now as per requirements implying a simple record app.
-- Let's allow SELECT for anon and authenticated.
CREATE POLICY "Allow public read access" ON products
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow insert for anon and authenticated (for MVP simplicity, otherwise we need auth)
CREATE POLICY "Allow public insert access" ON products
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Create storage bucket for product covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-covers', 'product-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Give public access to product-covers" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'product-covers');

CREATE POLICY "Allow uploads to product-covers" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'product-covers');
