import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize separate client for backend (using Service Key)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase params missing in storageService');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const uploadMedia = async (filePath, destinationPath, bucket = 'renders') => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const fileBuffer = fs.readFileSync(filePath);
        const fileExt = path.extname(filePath);
        const contentType = fileExt === '.mp4' ? 'video/mp4' : 'image/png'; // basic detection

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(destinationPath, fileBuffer, {
                contentType: contentType,
                upsert: true
            });

        if (error) throw error;

        // Get Public URL
        const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(destinationPath);

        return publicData.publicUrl;
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
};

export const cleanupFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Cleaned up: ${filePath}`);
        }
    } catch (error) {
        console.error('Cleanup Error:', error);
    }
};
