-- Database schema for Influencer Health Claims Verification Tool

-- Influencers table
CREATE TABLE influencers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    platform VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    follower_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Claims table
CREATE TABLE health_claims (
    id SERIAL PRIMARY KEY,
    influencer_id INTEGER REFERENCES influencers(id),
    claim_text TEXT NOT NULL,
    source_url TEXT,
    posted_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claim Verifications table
CREATE TABLE claim_verifications (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES health_claims(id),
    verification_status VARCHAR(50) NOT NULL, -- 'verified', 'false', 'misleading', 'unverified'
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    verification_notes TEXT,
    ai_response JSON,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_influencers_username ON influencers(username);
CREATE INDEX idx_health_claims_influencer_id ON health_claims(influencer_id);
CREATE INDEX idx_claim_verifications_claim_id ON claim_verifications(claim_id);
