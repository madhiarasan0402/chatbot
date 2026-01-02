const express = require("express");
const app = express();
const PORT = 5000;

// ✅ Middleware to parse JSON
app.use(express.json());

// ✅ POST /api/chat route
app.post("/api/chat", (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }
    res.json({ reply: `You said: "${message}"` });
});

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
