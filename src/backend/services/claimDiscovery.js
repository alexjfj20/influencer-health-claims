const openai = require('./openai');
const db = require('../config/db');

async function extractHealthClaims(content) {
    try {
        const prompt = `Extract health claims from this content. For each claim, provide:
1. The claim text
2. The context it appears in
3. Any relevant URLs or references mentioned

Format your response as JSON with an array of claims.

Content: "${content}"`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert at identifying health claims in social media content."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Claim extraction error:', error);
        throw error;
    }
}

async function processInfluencerContent(username, content) {
    const claims = await extractHealthClaims(content);
    
    // Get influencer ID
    const influencer = await db.query(
        'SELECT id FROM influencers WHERE username = $1',
        [username]
    );

    if (influencer.rows.length === 0) {
        throw new Error('Influencer not found');
    }

    const influencerId = influencer.rows[0].id;

    // Store claims and verify them
    for (const claim of claims.claims) {
        // Store the claim
        const claimResult = await db.query(
            'INSERT INTO health_claims (influencer_id, claim_text, source_url, posted_date) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [influencerId, claim.text, claim.url]
        );

        // Verify the claim
        const verification = await openai.verifyHealthClaim(claim.text);

        // Store verification result
        await db.query(
            'INSERT INTO claim_verifications (claim_id, verification_status, confidence_score, verification_notes, ai_response) VALUES ($1, $2, $3, $4, $5)',
            [
                claimResult.rows[0].id,
                verification.status,
                verification.confidence_score,
                verification.explanation,
                verification
            ]
        );
    }

    return claims;
}

module.exports = {
    extractHealthClaims,
    processInfluencerContent
};
