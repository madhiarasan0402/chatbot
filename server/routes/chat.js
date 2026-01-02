const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processChat, generateImage } = require('../services/aiProvider');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.post('/chat', upload.array('files'), async (req, res) => {
    try {
        // Support both 'message' (requested by user) and 'content' (existing)
        // ✅ SAFE Access
        const content = req.body?.content || req.body?.message;
        const history = req.body?.history;

        if (!content) {
            return res.status(400).json({ error: "Message content is required" });
        }

        const files = req.files;

        const response = await processChat(content, files, JSON.parse(history || '[]'));
        console.log(`[API] Chat Response: ${response.content.substring(0, 50)}...`);
        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/generate-image', upload.array('files'), async (req, res) => {
    try {
        const content = req.body?.content;

        if (!content) {
            return res.status(400).json({ error: "Image prompt content is required" });
        }

        console.log(`[API] Image Generation Prompt: "${content}"`);
        const response = await generateImage(content);
        console.log(`[API] Image Gen Response: ${response.imageUrl || 'ERROR'}`);
        res.json(response);
    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).send('No URL provided');

    try {
        console.log(`[PROXY] Fetching: ${imageUrl}`);

        // Use a persistent fetch or https agent to skip SSL issues if needed
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const contentType = response.headers.get('content-type');

        if (!response.ok || (contentType && contentType.includes('text/html'))) {
            console.error(`[PROXY] Invalid response: ${response.status} | Content-Type: ${contentType}`);
            return res.status(404).send('Image source returned invalid content (likely a redirect or busy notice)');
        }

        res.set('Content-Type', contentType);

        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('[PROXY] Error proxying image:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
