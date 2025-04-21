const express = require('express');
const { syncProducts } = require('./sync');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/sync-products', syncProducts);

app.listen(PORT, () => {
  console.log(`Sync service running on port ${PORT}`);
});