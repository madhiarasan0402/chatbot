# Selfie AI - Advanced AI Assistant Platform

A full-stack AI assistant application powered by Google Gemini and free image generation services.

## 🌟 Features

- **AI Chat**: Powered by Google Gemini 2.0
- **Image Generation**: Free, watermark-free image generation
- **File Upload**: Analyze images and documents
- **Streaming Responses**: Real-time AI responses
- **Modern UI**: Beautiful, responsive interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/madhiarasan0402/chatbot.git
cd chatbot
```

2. **Install Dependencies**
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. **Configure Environment Variables**

Create `server/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the Application**

```bash
# Terminal 1 - Start the backend
cd server
npm start

# Terminal 2 - Start the frontend
cd client
npm run dev
```

5. **Open in Browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📦 Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables** in Vercel Dashboard:
- `GEMINI_API_KEY`: Your Google Gemini API key

### Option 2: Deploy Separately

**Frontend (Vercel/Netlify):**
- Build command: `cd client && npm install && npm run build`
- Output directory: `client/dist`
- Set environment variable: `VITE_API_URL=your_backend_url`

**Backend (Render/Railway):**
- Build command: `cd server && npm install`
- Start command: `cd server && npm start`
- Set environment variable: `GEMINI_API_KEY=your_key`

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- React Markdown
- Syntax Highlighting

### Backend
- Node.js
- Express
- Google Generative AI SDK
- Multer (file uploads)
- CORS

## 📁 Project Structure

```
selfie/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── server/          # Express backend
│   ├── routes/
│   ├── services/
│   ├── index.js
│   └── package.json
└── vercel.json      # Deployment config
```

## 🔧 Configuration

### Image Generation Models
The app tries multiple models in order:
1. `flux-pro` - Best accuracy
2. `flux` - Balanced
3. `turbo` - Fastest

### API Endpoints
- `POST /api/chat` - Send chat messages
- `POST /api/generate-image` - Generate images
- `GET /api/proxy-image` - Proxy image requests
- `GET /health` - Health check

## 💡 Usage Tips

### For Best Image Results:

**Logo/Text Requests:**
```
Create a logo with text "MyBrand"
Design a minimalist icon for "TechCo"
```

**General Images:**
```
A sunset over mountains with a lake, photorealistic, 8k
A futuristic robot in a neon-lit cyberpunk city
```

## 🐛 Troubleshooting

### Images not generating?
1. Check server logs for errors
2. Try a simpler prompt
3. Verify network connectivity

### Chat not working?
1. Verify GEMINI_API_KEY is set correctly
2. Check API quota at [Google AI Studio](https://aistudio.google.com/app/plan)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📧 Support

For issues, please open a GitHub issue or contact support.

---

Built with ❤️ using React, Node.js, and Google Gemini
