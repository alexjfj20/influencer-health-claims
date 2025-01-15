const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function verifyHealthClaim(claim) {
    try {
        const prompt = `Analyze this health claim and determine if it is scientifically accurate:
Claim: "${claim}"

Please provide:
1. Verification status (verified/false/misleading/unverified)
2. Confidence score (0-1)
3. Brief explanation

Format your response as JSON.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: "You are a health claim verification expert. Analyze claims based on current scientific evidence."
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
        console.error('OpenAI API error:', error);
        throw error;
    }
}

module.exports = {
    verifyHealthClaim
};
