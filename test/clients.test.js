const { pimClient, receiverClient } = require('../src/clients');
require('dotenv').config();

test('PIM client is configured correctly', () => {
  expect(pimClient.defaults.baseURL).toBe(
    `https://${process.env.PIM_STORE}/admin/api/2025-04`
  );
  expect(pimClient.defaults.headers['X-Shopify-Access-Token']).toBe(
    process.env.PIM_TOKEN
  );
});

test('Receiver client is configured correctly', () => {
  expect(receiverClient.defaults.baseURL).toBe(
    `https://${process.env.RECEIVER_STORE}/admin/api/2025-04`
  );
  expect(receiverClient.defaults.headers['X-Shopify-Access-Token']).toBe(
    process.env.RECEIVER_TOKEN
  );
});