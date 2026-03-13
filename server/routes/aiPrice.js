const express = require('express');
const router = express.Router();

// Mock Market Price Data
const mockMandiPrices = {
    "tomato": { price: 25, market: "Koyambedu, Chennai", unit: "kg" },
    "onion": { price: 40, market: "Azadpur, Delhi", unit: "kg" },
    "potato": { price: 18, market: "Vashi, Mumbai", unit: "kg" },
    "rice": { price: 45, market: "Nellore, AP", unit: "kg" }
};

/**
 * Helper to simulate AI decision making
 */
const generateAIAdvice = (crop, price) => {
    // Simple logic: if price is higher than a threshold, suggest selling
    const thresholds = { tomato: 20, onion: 35, potato: 15, rice: 40 };
    const threshold = thresholds[crop.toLowerCase()] || 20;

    if (price >= threshold * 1.2) {
        return {
            adviceEn: "Prices are currently high. It is a great time to sell your harvest now for maximum profit.",
            adviceTa: "தற்போது விலை அதிகமாக உள்ளது. அதிக லாபம் பெற உங்கள் அறுவடையை இப்போது விற்பனை செய்ய இது ஒரு சிறந்த நேரம்.",
            status: "Sell Now"
        };
    } else if (price >= threshold) {
        return {
            adviceEn: "Prices are stable. You can sell soon or wait for a slight increase in the next 3 days.",
            adviceTa: "விலை சீராக உள்ளது. நீங்கள் விரைவில் விற்கலாம் அல்லது அடுத்த 3 நாட்களில் சிறிய விலை உயர்வுக்காக காத்திருக்கலாம்.",
            status: "Sell Soon"
        };
    } else {
        return {
            adviceEn: "Prices are currently low. We recommend holding your stock for 5-7 days for better recovery.",
            adviceTa: "தற்போது விலை குறைவாக உள்ளது. சிறந்த லாபத்திற்கு உங்கள் கையிருப்பை 5-7 நாட்கள் வைத்திருக்க பரிந்துரைக்கிறோம்.",
            status: "Hold"
        };
    }
};

/**
 * POST /api/ai-price/answer
 * Body: { queryText, preferredLanguage }
 */
router.post('/answer', async (req, res) => {
    try {
        const { queryText, preferredLanguage } = req.body;

        if (!queryText) {
            return res.status(400).json({ error: "No query text provided" });
        }

        // Simple Extraction Logic (Simulating NLP)
        const crops = ["tomato", "onion", "potato", "rice", "தக்காளி", "வெங்காயம்"];
        let detectedCrop = "tomato"; // Default
        
        const lowerText = queryText.toLowerCase();
        for (const crop of crops) {
            if (lowerText.includes(crop)) {
                // Map Tamil names back to English keys for mock data
                if (crop === "தக்காளி") detectedCrop = "tomato";
                else if (crop === "வெங்காயம்") detectedCrop = "onion";
                else detectedCrop = crop;
                break;
            }
        }

        // Simulate Market API Call
        const marketData = mockMandiPrices[detectedCrop] || { price: 22, market: "Local Mandi", unit: "kg" };
        
        // Simulate AI Reasoning
        const advice = generateAIAdvice(detectedCrop, marketData.price);

        res.json({
            success: true,
            detectedCrop: detectedCrop.charAt(0).toUpperCase() + detectedCrop.slice(1),
            currentPrice: marketData.price,
            market: marketData.market,
            unit: marketData.unit,
            aiAdviceEn: advice.adviceEn,
            aiAdviceTa: advice.adviceTa,
            status: advice.status,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("AI Price Advisor Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
