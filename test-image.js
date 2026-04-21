const https = require('https');

const paths = [
  'upload/vod/20260420-1/f2b288cf6246c54f5abf2d8f1641a532.jpg'
];

const domains = [
  'phimimg.com',
  'img.phimapi.com',
  'img.ophim.live',
  'img.ophim.cc',
  'img.ophim1.com'
];

domains.forEach(domain => {
  const options = {
    hostname: domain,
    port: 443,
    path: '/' + paths[0],
    method: 'HEAD',
    rejectUnauthorized: false
  };

  const req = https.request(options, res => {
    console.log(`[${domain}] STATUS: ${res.statusCode} CONTENT-TYPE: ${res.headers['content-type']}`);
  });

  req.on('error', error => {
    console.error(`[${domain}] ERROR: ${error.message}`);
  });

  req.end();
});
