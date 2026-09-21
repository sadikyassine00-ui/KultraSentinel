const https = require('https');

const payload = {
  host: 'usekultra.com',
  key: 'e221993b4474596f8403d2ad2959089c',
  keyLocation: 'https://usekultra.com/e221993b4474596f8403d2ad2959089c.txt',
  urlList: [
    'https://usekultra.com',
    'https://usekultra.com/llms.txt',
    'https://usekultra.com/privacy',
    'https://usekultra.com/terms',
    'https://usekultra.com/refund',
  ],
};

function submitIndexNow() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.indexnow.org',
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

submitIndexNow()
  .then((res) => {
    console.log('IndexNow Response Status:', res.statusCode, res.statusMessage);
    if (res.body) {
      console.log('Response Body:', res.body);
    }
  })
  .catch((err) => {
    console.error('Submission error:', err);
    process.exit(1);
  });
