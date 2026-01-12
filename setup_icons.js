const fs = require('fs');
const path = require('path');

const sourcePath = 'C:/Users/ASUS/.gemini/antigravity/brain/70bc8be3-4797-4aad-9e56-c1b9964734c4/uploaded_image_1767785787978.png';
const targetDir = 'd:/edit-aicrator-beta-1 (1)/public/extension/icons';
const targetFiles = ['icon16.png', 'icon48.png', 'icon128.png'];

try {
    if (!fs.existsSync(targetDir)) {
        console.log(`Creating directory: ${targetDir}`);
        fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.existsSync(sourcePath)) {
        targetFiles.forEach(file => {
            const destPath = path.join(targetDir, file);
            fs.copyFileSync(sourcePath, destPath);
            console.log(`Copied to: ${destPath}`);
        });
        console.log('All icons set up successfully.');
    } else {
        console.error(`Source file not found: ${sourcePath}`);
    }
} catch (error) {
    console.error('Error setting up icons:', error);
}
