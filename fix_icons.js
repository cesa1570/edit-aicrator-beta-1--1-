const fs = require('fs');
const path = require('path');

// Use relative path to avoid absolute path issues
const projectRoot = process.cwd();
const iconsDir = path.join(projectRoot, 'public', 'extension', 'icons');
const sourceImage = 'C:/Users/ASUS/.gemini/antigravity/brain/70bc8be3-4797-4aad-9e56-c1b9964734c4/uploaded_image_1767785787978.png';

console.log(`Checking icons directory: ${iconsDir}`);

try {
    // 1. Create Directory
    if (!fs.existsSync(iconsDir)) {
        console.log('Directory missing. Creating...');
        fs.mkdirSync(iconsDir, { recursive: true });
        console.log('Directory created.');
    } else {
        console.log('Directory exists.');
    }

    // 2. Copy Files
    ['icon16.png', 'icon48.png', 'icon128.png'].forEach(fileName => {
        const dest = path.join(iconsDir, fileName);
        fs.copyFileSync(sourceImage, dest);
        console.log(`Copied: ${fileName}`);
    });

    // 3. Verify
    console.log('--- Current Files in public/extension/icons ---');
    const files = fs.readdirSync(iconsDir);
    files.forEach(f => console.log(f));
    console.log('---------------------------------------------');

} catch (err) {
    console.error('ERROR:', err);
}
