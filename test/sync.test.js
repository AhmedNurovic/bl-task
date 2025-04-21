const nock = require('nock');
const request = require('supertest');
const express = require('express');
const { syncProducts } = require('../src/sync');
require('dotenv').config();

const app = express();
app.get('/sync-products', syncProducts);

describe('syncProducts endpoint', () => {
  beforeEach(() => nock.cleanAll());

  it('creates new products when none exist', async () => {
    nock(`https://${process.env.PIM_STORE}`)
      .get('/admin/api/2025-04/products.json')
      .query({ limit: 250 })
      .reply(200, { products: [ { id: 1, handle: 'foo', title: 'Foo', body_html: '<p>Foo</p>' } ] });

    nock(`https://${process.env.RECEIVER_STORE}`)
      .get('/admin/api/2025-04/products.json')
      .query({ limit: 250, since_id: 0 })
      .reply(200, { products: [] });

    nock(`https://${process.env.RECEIVER_STORE}`)
      .post('/admin/api/2025-04/products.json', body => body.product.handle === 'foo')
      .reply(201, {});

    const res = await request(app).get('/sync-products');
    expect(res.status).toBe(200);
  });

  it('updates existing products when found', async () => {
    nock(`https://${process.env.PIM_STORE}`)
      .get('/admin/api/2025-04/products.json')
      .query({ limit: 250 })
      .reply(200, { products: [{ id: 2, handle: 'bar', title: 'Bar', body_html: '<p>Bar</p>' }] });
  
    const receiverMock = nock(`https://${process.env.RECEIVER_STORE}`)
      .get('/admin/api/2025-04/products.json')
      .query({ limit: 250, since_id: 0 })
      .reply(200, { products: [{ id: 42, handle: 'bar' }] })
      .get('/admin/api/2025-04/products.json')
      .query({ limit: 250, since_id: 42 })
      .reply(200, { products: [] });
  
    nock(`https://${process.env.RECEIVER_STORE}`)
      .put('/admin/api/2025-04/products/42.json', body => body.product.id === 42)
      .reply(200, {});
  
    const res = await request(app).get('/sync-products');
    expect(res.status).toBe(200);
  });
});