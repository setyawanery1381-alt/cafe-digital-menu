const fs = require('fs');
const https = require('https');
const path = require('path');

const targetPath = path.resolve(__dirname, '../uploads/menu.pdf');

// Try downloading sample menu from poutercoffee or fallback to a generated PDF
const url = 'https://book.poutercoffee.id/pouter-book.pdf';

const file = fs.createWriteStream(targetPath);
https.get(url, { rejectUnauthorized: false }, (res) => {
  if (res.statusCode === 200) {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Sample menu.pdf downloaded successfully from poutercoffee! Size:', fs.statSync(targetPath).size);
    });
  } else {
    console.log('Status code:', res.statusCode);
  }
}).on('error', (err) => {
  console.log('Download error:', err.message);
});
