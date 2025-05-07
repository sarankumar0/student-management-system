// Routes/aiGenerationRoutes.js (New File)
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { verifyToken, isAdmin } = require('./authRoutes');
dotenv.config();
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
// const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); // Use a suitable model
// console.log("Using Gemini Model: gemini-1.0-pro");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
console.log("Using Gemini Model: gemini-1.5-flash-latest");
function tryParseJson(text) {
    if (!text || typeof text !== 'string') {
        console.error("tryParseJson: Input text is empty or not a string.");
        return null;
    }
    try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        const arrayStart = text.indexOf('[');
        const arrayEnd = text.lastIndexOf(']');

        let jsonText = null;
         if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonText = text.substring(jsonStart, jsonEnd + 1);
        } else if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
            jsonText = text.substring(arrayStart, arrayEnd + 1);
        }
        if (!jsonText) {
            console.error("tryParseJson: Could not find valid JSON object/array delimiters {} or [] in the text.");
            console.log("Raw AI Text:", text); // Log the problematic text
            return null;
        }
        console.log("tryParseJson: Attempting to parse extracted text:", jsonText.substring(0, 100) + "..."); // Log start of text
        return JSON.parse(jsonText);

    } catch (e) {
        console.error("tryParseJson: JSON.parse failed:", e);
        console.log("Raw AI Text causing parse error:", text);
        // If jsonText was extracted, log that too: console.log("Extracted text causing parse error:", jsonText);
        return null; // Return null on failure
    }
}

// --- POST /api/ai/generate-course-outline (Route to generate course outline) ---
// This route will receive the topic and other parameters from the frontend
router.post('/generate-course-outline', verifyToken, isAdmin, async (req, res) => {
    console.log("--- Request: POST /api/ai/generate-course-outline ---");
    const { topic, targetAudience = 'general', numModules = 5, includeVideos = true, targetPlanSuggestion = 'basic' } = req.body;
    if (!topic || topic.trim().length < 3) {
        return res.status(400).json({ message: "Please provide a valid topic (at least 3 characters)." });
    }
    const moduleCount = parseInt(numModules, 10);
    if (isNaN(moduleCount) || moduleCount < 1 || moduleCount > 15) { // Limit module count
        return res.status(400).json({ message: "Number of modules must be between 1 and 15." });
    }

    console.log(`Generating outline for Topic: "${topic}", Audience: ${targetAudience}, Modules: ${moduleCount}, Videos: ${includeVideos}, Plan Suggestion: ${targetPlanSuggestion}`);
    const prompt = `
        Generate a course outline about "${topic}" suitable for a ${targetAudience} audience, targeting educational plan level "${targetPlanSuggestion}".
        The course should have exactly ${moduleCount} modules.
        For each module, provide a relevant title.
        For each module, generate around 3-5 relevant lesson titles.
        For each lesson, suggest a 'contentType' ('text' or 'video').
        For 'text' lessons, provide a very brief 1-2 sentence summary or list 2-3 key bullet points for the content. DO NOT write full paragraphs.
        ${includeVideos ? "For 'video' lessons, provide a short 'videoDescription' which is a concise topic description or specific search term suitable for finding a relevant YouTube video. DO NOT provide actual URLs." : "Do not include video suggestions."}

        Return the entire output strictly as a single JSON object with the following structure:
        {
          "courseTitle": "Generated Course Title",
          "courseDescription": "Generated brief course description (1-2 sentences).",
          "modules": [
            {
              "moduleTitle": "Module 1 Title",
              "lessons": [
                { "lessonTitle": "Lesson 1.1 Title", "contentType": "text", "textContent": "Brief summary/key points..." },
                { "lessonTitle": "Lesson 1.2 Title", "contentType": "video", "videoDescription": "Search term/topic for YouTube..." },
                { "lessonTitle": "Lesson 1.3 Title", "contentType": "text", "textContent": "Brief summary/key points..." }
              ]
            },
            // ... more modules following the same structure ...
          ]
        }
        Ensure the JSON is valid and contains no extra text or commentary outside the JSON structure itself.
    `;

    console.log("--- Sending Prompt to AI ---");
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiText = response.text();
        console.log("--- Received RAW AI Response Text (first 500 chars): ---");
        console.log(aiText.substring(0, 500) + (aiText.length > 500 ? "..." : ""));
        const parsedData = tryParseJson(aiText);

        if (!parsedData || !parsedData.modules || !Array.isArray(parsedData.modules)) {
            console.error("AI response was null after parsing or missing 'modules' array.");
            return res.status(500).json({ message: "AI failed to generate a valid course structure. Please check logs or try again." });
        }
        console.log("--- Successfully Parsed AI Response ---");
        // Basic validation of structure (can add more checks)
        if (parsedData.modules.length !== moduleCount) {
             console.warn(`AI generated ${parsedData.modules.length} modules, but ${moduleCount} were requested.`);
             // Proceed anyway, but maybe flag it?
         }

        console.log("--- Parsed AI Response ---");
        console.log(JSON.stringify(parsedData, null, 2)); 
        res.status(200).json({ courseOutline: parsedData }); 
    } catch (error) {
        console.error("Error calling Generative AI API:", error);
        // Handle specific API errors if possible (e.g., rate limits, API key issues)
        let errorMessage = 'Failed to generate course outline due to an AI service error.';
        if (error.message.includes('429') || error.toString().includes('RESOURCE_EXHAUSTED')) { // Example check
             errorMessage = 'AI service is busy or rate limit exceeded. Please try again later.';
         } else if (error.message.includes('API key not valid')) {
              errorMessage = 'AI service configuration error (API Key). Please contact support.';
          }
        res.status(502).json({ message: errorMessage, error: error.message }); // 502 Bad Gateway often used for upstream errors
    }
});


module.exports = router;