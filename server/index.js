import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();


import express from 'express';
import cors from 'cors';
import documentRoutes from './routes/documentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// API Routes (supports local, proxy, and serverless paths)
app.use(['/api/documents', '/.netlify/functions/api/documents', '/documents'], documentRoutes);
app.use(['/api/chat', '/.netlify/functions/api/chat', '/chat'], chatRoutes);

// Root & Health Check Endpoints
app.get(['/', '/api/health', '/.netlify/functions/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'SNU AI Admission Portal Backend API',
    message: 'Server is running smoothly! 🚀',
    time: new Date()
  });
});

// Fallback 404 for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found on SNU AI Backend' });
});

export { app };
export default app;

if (!process.env.NETLIFY && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 SNU AI Express Server running on http://localhost:${PORT}`);
  });
}


