const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('🔥 GET / route hit');
  res.send('🎉 It works!');
});

app.listen(5050, () => {
  console.log('🚀 Minimal server running on http://localhost:5050');
});
