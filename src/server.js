const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// Endpoint to write data to a file
app.post('/write-data', (req, res) => {
  const data = req.body;

  // Write the data to a JSON file
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

  res.json({ message: 'Data written successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
