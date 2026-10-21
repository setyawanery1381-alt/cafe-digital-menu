const fs = require('fs');
const https = require('https');
const path = require('path');

const targetPath = path.resolve(__dirname, '../public/assets/qrcode.min.js');

https.get('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js', (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(targetPath);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('QRCode.js downloaded successfully!');
    });
  }
}).on('error', (err) => {
  console.error('Error downloading qrcode.js:', err);
});
