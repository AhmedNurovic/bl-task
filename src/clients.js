require('dotenv').config();
const axios = require('axios');

function getClient(store, token) {
  return axios.create({
    baseURL: `https://${store}/admin/api/2025-04`,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });
}

const pimClient = getClient(process.env.PIM_STORE, process.env.PIM_TOKEN);
const receiverClient = getClient(process.env.RECEIVER_STORE, process.env.RECEIVER_TOKEN);

module.exports = { pimClient, receiverClient };