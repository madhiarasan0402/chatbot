const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

export const sendMessage = async (content, files = [], history = [], forceType) => {
    const formData = new FormData();
    formData.append('content', content);

    // Clean history to avoid circular refs, error messages, or unnecessary data
    const cleanedHistory = history
        .filter(h => !h.error)
        .map(h => ({
            role: h.role,
            content: h.content,
            type: h.type
        }));
    formData.append('history', JSON.stringify(cleanedHistory));

    files.forEach((file) => {
        formData.append('files', file);
    });

    const lowerContent = content.toLowerCase();

    // Comprehensive image generation detection
    const imageNouns = ['image', 'picture', 'photo', 'illustration', 'art', 'portrait', 'drawing',
        'painting', 'sketch', 'wallpaper', 'logo', 'avatar', 'banner', 'concept',
        'icon', 'graphic', 'design', 'render', 'visualization'];

    const imageVerbs = ['generat', 'creat', 'draw', 'make', 'show', 'paint', 'sketch',
        'render', 'design', 'build', 'illustrat', 'visualiz'];

    const hasImageNoun = imageNouns.some(n => lowerContent.includes(n));
    const hasImageVerb = imageVerbs.some(v => lowerContent.includes(v));

    // Explicit image request patterns
    const explicitPatterns = [
        '/image ',
        'image of ',
        'picture of ',
        'photo of ',
        'generate a',
        'generate an',
        'create a',
        'create an',
        'draw a',
        'draw an',
        'make a',
        'make an',
        'design a',
        'design an',
        'logo with',
        'logo for'
    ];

    const hasExplicitPattern = explicitPatterns.some(pattern => lowerContent.includes(pattern));

    const isImageRequest = forceType === 'image' ||
        hasExplicitPattern ||
        (hasImageNoun && hasImageVerb);

    console.log(`[CLIENT API] Request: "${content}"`);
    console.log(`[CLIENT API] Has Noun: ${hasImageNoun}, Has Verb: ${hasImageVerb}, Explicit: ${hasExplicitPattern}`);
    console.log(`[CLIENT API] Route: ${isImageRequest ? 'IMAGE GENERATION' : 'CHAT'}`);

    const endpoint = isImageRequest ? '/generate-image' : '/chat';

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        let errorMsg = `Server error: ${response.status} ${response.statusText}`;
        try {
            const error = await response.json();
            errorMsg = error.message || errorMsg;
        } catch (e) {
            // If JSON parse fails, try reading text
            const text = await response.text();
            console.error('Non-JSON error response:', text);
            if (response.status === 404) {
                errorMsg = 'Backend endpoint not found. Check your API URL configuration.';
            } else if (text.includes('<!DOCTYPE html>')) {
                errorMsg = 'Received HTML instead of JSON. Check your API URL and server status.';
            }
        }
        throw new Error(errorMsg);
    }

    try {
        return await response.json();
    } catch (e) {
        throw new Error('Invalid JSON response from server');
    }
};
