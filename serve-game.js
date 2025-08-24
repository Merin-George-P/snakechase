const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

// Serve static files from the root directory
app.use(express.static('.'));

// Serve the main game HTML file
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Game server running at http://localhost:${port}`);
});