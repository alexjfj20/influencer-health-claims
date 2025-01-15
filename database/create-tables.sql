-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.claim_verifications;
DROP TABLE IF EXISTS public.health_claims;
DROP TABLE IF EXISTS public.influencers;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables with updated timestamps handled by Supabase
CREATE TABLE public.influencers (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    platform VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    profile_image_url TEXT,
    trust_score DECIMAL(5,2) DEFAULT 0,
    total_claims INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.health_claims (
    id BIGSERIAL PRIMARY KEY,
    influencer_id BIGINT REFERENCES public.influencers(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    source_url TEXT,
    posted_date TIMESTAMP WITH TIME ZONE,
    trust_score DECIMAL(5,2) DEFAULT 0,
    scientific_accuracy DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.claim_verifications (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES public.health_claims(id) ON DELETE CASCADE,
    verification_status VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(3,2),
    verification_notes TEXT,
    scientific_sources JSONB,
    ai_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_influencers_username ON public.influencers(username);
CREATE INDEX idx_influencers_trust_score ON public.influencers(trust_score);
CREATE INDEX idx_health_claims_influencer_id ON public.health_claims(influencer_id);
CREATE INDEX idx_claim_verifications_claim_id ON public.claim_verifications(claim_id);

-- Enable Row Level Security but allow all operations for now
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development)
CREATE POLICY "Allow all operations for influencers" ON public.influencers
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for health_claims" ON public.health_claims
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for claim_verifications" ON public.claim_verifications
    FOR ALL USING (true);

-- Create function to update influencer trust score
CREATE OR REPLACE FUNCTION update_influencer_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.influencers
    SET 
        trust_score = (
            SELECT AVG(scientific_accuracy)
            FROM public.health_claims
            WHERE influencer_id = NEW.influencer_id
        ),
        verified_claims = (
            SELECT COUNT(*)
            FROM public.health_claims
            WHERE influencer_id = NEW.influencer_id
            AND scientific_accuracy > 0
        ),
        total_claims = (
            SELECT COUNT(*)
            FROM public.health_claims
            WHERE influencer_id = NEW.influencer_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.influencer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update trust score
CREATE TRIGGER update_trust_score_trigger
AFTER INSERT OR UPDATE ON public.health_claims
FOR EACH ROW
EXECUTE FUNCTION update_influencer_trust_score();

-- Create function and trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_influencers_updated_at
    BEFORE UPDATE ON public.influencers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_claims_updated_at
    BEFORE UPDATE ON public.health_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_verifications_updated_at
    BEFORE UPDATE ON public.claim_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
