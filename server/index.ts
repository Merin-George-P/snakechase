import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Serve static files from the root directory (where index.html is located)
app.use(express.static(path.join(__dirname, '..')));

// Serve the game
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Snake Chase Game Server Running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Snake Chase Game Server running on http://0.0.0.0:${PORT}`);
  console.log(`🕹️  Game available at: http://localhost:${PORT}`);
});