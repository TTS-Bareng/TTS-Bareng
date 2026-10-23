const https = require('https');
const token = 'sk_cBRnwhlhrKQkoWGdzfJbGgZBSLiqN';
const projectId = 'proj5885884b';
const offeringId = 'ofrng64a4bd210a';

function req(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://api.revenuecat.com/v2' + path);
    const opts = {
      method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    };
    const r = https.request(url, opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    r.on('error', reject);
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

async function run() {
  const packagesToAttach = [
    { packageId: 'pkgedbf80af9ab', lookup_key: '$rc_monthly', productId: 'prod3134f88ca5' },
    { packageId: 'pkged8c0317ecb', lookup_key: '$rc_annual', productId: 'prodfb9ce631d9' },
    { packageId: 'pkge4912fd64fa', lookup_key: '$rc_lifetime', productId: 'prod1f9fe15d4e' }
  ];

  for (const item of packagesToAttach) {
    console.log(`\nAttaching ${item.productId} to ${item.lookup_key} (${item.packageId})...`);
    
    // Test Path 1: /projects/{projectId}/packages/{packageId}/actions/attach_products
    let res = await req(`/projects/${projectId}/packages/${item.packageId}/actions/attach_products`, 'POST', {
      products: [
        {
          product_id: item.productId,
          eligibility_criteria: 'all'
        }
      ]
    });
    
    if (res.status >= 400) {
      console.log('Path 1 failed with', res.status, res.data || res.raw);
      // Test Path 2: /packages/{packageId}/actions/attach_products
      res = await req(`/packages/${item.packageId}/actions/attach_products`, 'POST', {
        products: [
          {
            product_id: item.productId,
            eligibility_criteria: 'all'
          }
        ]
      });
    }

    console.log(`Result for ${item.lookup_key}:`, res.status, JSON.stringify(res.data, null, 2));
  }

  console.log('\n--- Verify products in each package ---');
  for (const item of packagesToAttach) {
    const listRes = await req(`/projects/${projectId}/packages/${item.packageId}/products`);
    console.log(`Products in ${item.lookup_key}:`, JSON.stringify(listRes.data, null, 2));
  }
}

run().catch(console.error);
