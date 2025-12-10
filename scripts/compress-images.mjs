import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesToCompress = [
  // about folder - JPGs
  { src: 'public/about/state_grafic.jpg', quality: 60, maxWidth: 1200 },
  { src: 'public/about/state_music.jpg', quality: 60, maxWidth: 1200 },
  { src: 'public/about/state_CG.jpg', quality: 60, maxWidth: 1200 },
  { src: 'public/about/state_board.jpg', quality: 60, maxWidth: 1200 },
  { src: 'public/about/state1.jpg', quality: 70, maxWidth: 800 },
  { src: 'public/about/state2.jpg', quality: 70, maxWidth: 800 },
  { src: 'public/about/state_scenario.png', quality: 70, maxWidth: 1200 },
  { src: 'public/about/state_shinkan.jpg', quality: 70, maxWidth: 800 },
  { src: 'public/about/state_gassyuku.jpg', quality: 70, maxWidth: 800 },
  // welcome folder - PNGs
  { src: 'public/home/welcome/imageCAT.png', quality: 80, maxWidth: 800 },
  { src: 'public/home/welcome/backgroundBoard.png', quality: 80, maxWidth: 600 },
  { src: 'public/home/welcome/cacCat5.png', quality: 80, maxWidth: 600 },
  { src: 'public/home/welcome/cacCat1.png', quality: 80, maxWidth: 600 },
  { src: 'public/home/welcome/CACmainLogo.png', quality: 80, maxWidth: 600 },
];

async function compressImage(config) {
  const { src, quality, maxWidth } = config;

  if (!fs.existsSync(src)) {
    console.log(`Skip: ${src} (not found)`);
    return;
  }

  const ext = path.extname(src).toLowerCase();
  const backupPath = src.replace(ext, `_original${ext}`);

  // Backup original if not already backed up
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(src, backupPath);
  }

  const originalSize = fs.statSync(backupPath).size;

  try {
    let pipeline = sharp(backupPath).resize(maxWidth, null, { withoutEnlargement: true });

    if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality, mozjpeg: true }).toFile(src + '.tmp');
    } else if (ext === '.png') {
      await pipeline.png({ quality, compressionLevel: 9 }).toFile(src + '.tmp');
    }

    fs.renameSync(src + '.tmp', src);
    const newSize = fs.statSync(src).size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`${src}: ${(originalSize/1024).toFixed(0)}KB -> ${(newSize/1024).toFixed(0)}KB (${reduction}% reduced)`);
  } catch (err) {
    console.error(`Error compressing ${src}:`, err.message);
  }
}

async function main() {
  console.log('Starting image compression...\n');

  for (const config of imagesToCompress) {
    await compressImage(config);
  }

  console.log('\nDone!');
}

main();
