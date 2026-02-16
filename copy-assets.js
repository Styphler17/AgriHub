const fs = require('fs');
const path = require('path');

const srcDir = './docs';
const destDir = './public';

const files = [
  { src: 'logo.png', dest: 'logo.png' },
  { src: 'favicon.ico', dest: 'favicon.ico' },
  { src: 'apple-touch-icon.png', dest: 'apple-touch-icon.png' },
  { src: 'favicon.svg', dest: 'favicon.svg' },
  { src: 'web-app-manifest-192x192.png', dest: 'icon-192.png' },
  { src: 'web-app-manifest-512x512.png', dest: 'icon-512.png' }
];

files.forEach(f => {
  try {
    const srcPath = path.join(srcDir, f.src);
    const destPath = path.join(destDir, f.dest);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${f.src} to ${f.dest}`);
  } catch (err) {
    console.error(`Failed to copy ${f.src}: ${err.message}`);
  }
});
