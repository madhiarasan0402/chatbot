require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // The SDK doesn't have a direct listModels on the genAI object in some versions
        // but let's try to see if we can find it or use a different approach
        console.log("Attempting to list models...");
        // In newer SDKs, you might need to use the REST API or it might be internal
        // Let's just try gemini-1.0-pro which is very stable
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Model object created");
        const result = await model.generateContent("Hello");
        console.log("Result:", (await result.response).text());
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
