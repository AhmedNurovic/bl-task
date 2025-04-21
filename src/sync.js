const { pimClient, receiverClient } = require('./clients');

async function getAllReceiverProducts() {
  let products = [];
  let sinceId = 0;

  while (true) {
    const resp = await receiverClient.get('/products.json', {
      params: { limit: 250, since_id: sinceId }
    });
    const batch = resp.data.products;
    if (!batch.length) break;
    products = products.concat(batch);
    sinceId = batch[batch.length - 1].id;
  }

  return products.reduce((map, p) => {
    map[p.handle] = p;
    return map;
  }, {});
}

async function syncProducts(req, res) {
  try {
    const pimResp = await pimClient.get('/products.json', { params: { limit: 250 } });
    const pimProducts = pimResp.data.products;

    const receiverMap = await getAllReceiverProducts();

    for (const p of pimProducts) {
      if (receiverMap[p.handle]) {
        await receiverClient.put(
          `/products/${receiverMap[p.handle].id}.json`,
          { product: { id: receiverMap[p.handle].id, title: p.title, body_html: p.body_html } }
        );
      } else {
        await receiverClient.post(
          '/products.json',
          { product: { title: p.title, body_html: p.body_html, handle: p.handle } }
        );
      }
    }

    res.status(200).send('Sync complete');
  } catch (err) {
    console.error('Sync error:', err.response?.data || err.message);
    res.status(500).send(err.response?.data || 'Error during sync');
  }
}

module.exports = { syncProducts };