const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:4200',  // Allow requests from Angular app (localhost:4200)
    methods: ['GET', 'POST'],  // Allow only GET and POST requests
    allowedHeaders: ['Content-Type'],  // Allow Content-Type header
  }));

app.use(express.json());

app.get('/get', (req, res) => {
  res.status(200).send({ message: 'GET request successful', data: [] });
});

app.post('/sendData', (req, res) => {
  const newItem = req.body;
  // Process the new item (e.g., save to a database)
  res.status(201).send({ message: 'POST request successful', data: newItem });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});