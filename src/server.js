const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the Online Course Platform!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
