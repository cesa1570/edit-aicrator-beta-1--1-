
import { supabase } from './supabase';

const BUCKET_NAME = 'uploads'; // Temporary holding for processing

/**
 * Uploads a Base64 string (image/audio) to Supabase Storage.
 * Returns the public URL.
 */
export const uploadBase64ToSupabase = async (base64Data: string, fileName: string): Promise<string> => {
    try {
        // 1. Convert Base64 to Blob
        const fetchRes = await fetch(base64Data);
        const blob = await fetchRes.blob();

        // 2. Upload
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, blob, {
                upsert: true,
                cacheControl: '3600'
            });

        if (error) throw error;

        // 3. Get Public URL
        const { data: publicData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    } catch (error: any) {
        console.error('Upload failed:', error.message);
        throw error;
    }
};

/**
 * Uploads a generic Blob/File to Supabase Storage.
 */
export const uploadFileToSupabase = async (file: File | Blob, fileName: string): Promise<string> => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                upsert: true
            });

        if (error) throw error;

        const { data: publicData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    } catch (error: any) {
        console.error('Upload failed:', error.message);
        throw error;
    }
};
