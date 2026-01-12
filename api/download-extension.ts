import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

export const config = {
    runtime: 'nodejs',
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const zip = new AdmZip();

        // Define path to the extension folder
        // In local development "npm run dev", process.cwd() is usually project root
        // "public" is in project root.
        const extensionPath = path.join(process.cwd(), 'public', 'extension');

        console.log(`Zipping directory: ${extensionPath}`);

        if (!fs.existsSync(extensionPath)) {
            console.error('Extension directory not found');
            res.status(404).json({ message: 'Extension source not found' });
            return;
        }

        // Add local folder to zip
        zip.addLocalFolder(extensionPath);

        // Create buffer
        const zipBuffer = zip.toBuffer();
        const downloadName = 'AI-Affiliate-Extension.zip';

        // Set headers for download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${downloadName}`);
        res.setHeader('Content-Length', zipBuffer.length);

        // Send buffer
        res.send(zipBuffer);

    } catch (error) {
        console.error('Zip generation error:', error);
        res.status(500).json({ message: 'Failed to generate zip file', error: error.message });
    }
}
