const API_URL = 'http://localhost:5000/api';

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
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
    }

    return await response.json();
};
