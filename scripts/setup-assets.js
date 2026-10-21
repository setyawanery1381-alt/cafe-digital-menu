const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.resolve(__dirname, '../public/assets');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status code: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading pdf.min.js...');
  await download('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', path.join(targetDir, 'pdf.min.js'));
  console.log('Downloading pdf.worker.min.js...');
  await download('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js', path.join(targetDir, 'pdf.worker.min.js'));
  console.log('Finished downloading PDF assets successfully!');
  console.log('Files in target directory:', fs.readdirSync(targetDir));
}

run().catch((err) => {
  console.error('Error during download:', err);
  process.exit(1);
});
