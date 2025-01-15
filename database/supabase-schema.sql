-- Enable Row Level Security
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_verifications ENABLE ROW LEVEL SECURITY;

-- Create tables with updated timestamps handled by Supabase
CREATE TABLE public.influencers (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    platform VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    follower_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.health_claims (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    influencer_id UUID REFERENCES public.influencers(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    source_url TEXT,
    posted_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.claim_verifications (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    claim_id UUID REFERENCES public.health_claims(id) ON DELETE CASCADE,
    verification_status VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(3,2),
    verification_notes TEXT,
    ai_response JSONB,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_influencers_username ON public.influencers(username);
CREATE INDEX idx_health_claims_influencer_id ON public.health_claims(influencer_id);
CREATE INDEX idx_claim_verifications_claim_id ON public.claim_verifications(claim_id);

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.influencers
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.health_claims
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.claim_verifications
    FOR SELECT USING (true);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_influencers_updated_at
    BEFORE UPDATE ON public.influencers
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();
