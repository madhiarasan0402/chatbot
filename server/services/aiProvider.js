const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const { OpenAI } = require("openai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_KEY");

// Initialize OpenAI (for DALL-E)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "YOUR_OPENAI_KEY" });

async function processChat(content, files, history) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_')) {
        return {
            content: "Please provide a valid Google Gemini API key in the server's .env file to use the chat features.",
            role: 'assistant',
            type: 'text',
            error: true
        };
    }
    const modelNames = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp"
    ];
    let lastError;

    for (const modelName of modelNames) {
        try {
            console.log(`Attempting to use Gemini model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const chatHistory = history.map(h => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }]
            }));

            const chat = model.startChat({
                history: chatHistory,
            });

            let promptParts = [content];

            if (files && files.length > 0) {
                for (const file of files) {
                    if (file.mimetype.startsWith('image/')) {
                        const imageData = fs.readFileSync(file.path);
                        promptParts.push({
                            inlineData: {
                                data: imageData.toString('base64'),
                                mimeType: file.mimetype
                            }
                        });
                    }
                }
            }

            const result = await chat.sendMessage(promptParts);

            // ✅ SAFE extraction
            const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("Empty response from Gemini");
            }

            return {
                content: text,
                role: 'assistant',
                type: 'text'
            };
        } catch (error) {
            lastError = error;
            console.error(`Gemini Error with ${modelName}:`, error.message);

            // If it's a 404 or model not found, try the next one
            if (error.message.includes('404') || error.message.includes('not found')) {
                continue;
            }

            // If it's a quota or rate limit error, try a quick retry after a delay
            if (error.message.includes('quota') || error.message.includes('429')) {
                console.warn(`Rate limit hit for ${modelName}, retrying in 2s...`);
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    // One immediate retry for the same model
                    const result = await chat.sendMessage(promptParts);
                    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) throw new Error("Empty response from Gemini (retry)");
                    return { content: text, role: 'assistant', type: 'text' };
                } catch (retryError) {
                    console.error(`Retry failed for ${modelName}:`, retryError.message);
                    continue; // Try next model in the list
                }
            }

            throw error;
        }
    }

    // NEW: Keyless Text Fallback if Gemini fails
    try {
        console.warn("Gemini exhausted. Attempting Pollinations Text Fallback...");
        const fallbackResponse = await processChatFallback(content, history);
        return fallbackResponse;
    } catch (fallbackError) {
        console.error("Text Fallback failed:", fallbackError.message);

        if (lastError && (lastError.message.includes('quota') || lastError.message.includes('429'))) {
            return {
                content: "You've hit the Google Gemini API free tier rate limit. \n\n**Note:** I tried to use a fallback AI, but it's also currently unavailable. \n\n**To fix this:**\n1. Wait 60 seconds and try again.\n2. check your [Google AI Studio Console](https://aistudio.google.com/app/plan) to see your usage.",
                role: 'assistant',
                type: 'text',
                error: true,
                isQuotaError: true
            };
        }
        throw lastError;
    }
}

async function processChatFallback(content, history) {
    try {
        // Construct a clean prompt representing the conversation
        const lastFew = history.slice(-4).filter(h => !h.error);
        let promptLines = lastFew.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`);
        promptLines.push(`User: ${content}`);
        promptLines.push(`Assistant:`);

        const fullPrompt = promptLines.join('\n');

        // Use Pollinations Text API (No Key)
        // We use system prompt to keep it professional
        const systemPrompt = "You are Selfie AI, a professional assistant. Be concise and helpful.";
        const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?system=${encodeURIComponent(systemPrompt)}&model=openai&cache=true`;

        console.log("[FALLBACK] Requesting Pollinations Text...");
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Pollinations status: ${response.status}`);
        }

        const text = await response.text();
        return {
            content: text + "\n\n*(Selfie AI Light)*",
            role: 'assistant',
            type: 'text'
        };
    } catch (error) {
        console.error("[FALLBACK] Error:", error.message);
        throw error;
    }
}

async function generateImage(prompt, baseUrl = '') {
    console.log(`[IMAGE GEN] Original Prompt: "${prompt}"`);

    // If OpenAI key exists, try DALL-E 3 first (most accurate)
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) {
        try {
            console.log("[IMAGE GEN] Attempting OpenAI DALL-E 3...");
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });

            return {
                content: "Here is your generated image (DALL-E 3):",
                role: 'assistant',
                type: 'image',
                imageUrl: response.data[0].url
            };
        } catch (error) {
            console.error("[IMAGE GEN] OpenAI Error:", error.message);
            // Fall through to free alternatives
        }
    }

    // Multi-service fallback strategy
    const services = [
        {
            name: "Pollinations Flux-Pro",
            getUrl: (prompt) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux-pro&seed=${Date.now()}`,
            model: "flux-pro"
        },
        {
            name: "Pollinations Flux",
            getUrl: (prompt) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Date.now()}`,
            model: "flux"
        },
        {
            name: "Pollinations Turbo",
            getUrl: (prompt) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=turbo&seed=${Date.now()}`,
            model: "turbo"
        }
    ];

    // Smart Prompt Enhancement
    const lowerPrompt = prompt.toLowerCase();
    let enhancedPrompt = prompt;

    // Check for quoted text (usually for logos/text-based images)
    const quotedTextMatch = prompt.match(/["']([^"']+)["']/);
    const quotedText = quotedTextMatch ? quotedTextMatch[1] : '';

    // Detect intent
    const isLogoRequest = lowerPrompt.includes('logo') || lowerPrompt.includes('brand') || lowerPrompt.includes('icon');
    const isTextRequest = lowerPrompt.includes('text') || lowerPrompt.includes('sign') || lowerPrompt.includes('letter') || lowerPrompt.includes('word');

    if (quotedText && (isLogoRequest || isTextRequest)) {
        // For logo/text requests with specific text
        enhancedPrompt = `Professional typography design featuring the exact text "${quotedText}". Perfect spelling required. ${prompt.includes('logo') ? 'Minimalist logo style, vector art, clean design.' : 'Clear typography, high contrast.'} High quality, 4k.`;
        console.log(`[IMAGE GEN] Text/Logo Mode - Target Text: "${quotedText}"`);
    } else if (isLogoRequest) {
        // Generic logo request
        enhancedPrompt = `${prompt}, professional minimalist logo design, vector style, clean layout, high quality`;
    } else {
        // Regular image request - enhance for quality
        if (!lowerPrompt.includes('high quality') && !lowerPrompt.includes('8k') && !lowerPrompt.includes('4k') && !lowerPrompt.includes('detailed')) {
            enhancedPrompt = `${prompt}, highly detailed, photorealistic, 8k quality`;
        }
    }

    console.log(`[IMAGE GEN] Enhanced Prompt: "${enhancedPrompt}"`);

    // Try each service in order
    for (const service of services) {
        try {
            console.log(`[IMAGE GEN] Trying ${service.name}...`);
            const targetUrl = service.getUrl(enhancedPrompt);

            // Route through proxy for consistency
            const encodedTargetUrl = encodeURIComponent(targetUrl);
            const proxiedUrl = `${baseUrl}/api/proxy-image?url=${encodedTargetUrl}`;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));

            return {
                content: `I've generated this image for you using ${service.model}:`,
                role: 'assistant',
                type: 'image',
                imageUrl: proxiedUrl
            };
        } catch (error) {
            console.error(`[IMAGE GEN] ${service.name} error:`, error.message);
            continue; // Try next service
        }
    }

    // All services failed
    console.error("[IMAGE GEN] All services exhausted");
    return {
        content: "I apologize, but I'm having trouble generating images right now. This could be due to:\n\n1. **The free image generation services being overloaded**\n2. **Network connectivity issues**\n3. **The specific prompt being too complex**\n\n**Suggestions:**\n- Try simplifying your prompt\n- Wait a moment and try again\n- If asking for text/logos, try using simpler, shorter text\n- Be more descriptive about what you want\n\n**Example prompts that work well:**\n- \"a sunset over mountains with a lake\"\n- \"a futuristic robot in a city\"\n- \"a minimalist logo with text 'MyBrand'\"\n\nWould you like me to help with something else instead?",
        role: 'assistant',
        type: 'text',
        error: true
    };
}

module.exports = {
    processChat,
    generateImage
};
