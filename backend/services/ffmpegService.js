import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

// Ensure renders directory exists
const RENDER_DIR = path.join(process.cwd(), 'renders');
if (!fs.existsSync(RENDER_DIR)) {
    fs.mkdirSync(RENDER_DIR);
}

// Helper to get output path
const getOutputPath = (prefix) => path.join(RENDER_DIR, `${prefix}_${Date.now()}.mp4`);

/**
 * Applies a Ken Burns (Zoom/Pan) effect to an image and creates a video.
 * Constrained to 720p (1280x720) for RAM optimization.
 */
export const createKenBurnsVideo = (imagePath, duration = 5, aspectRatio = '9:16') => {
    return new Promise((resolve, reject) => {
        const outputPath = getOutputPath('kenburns');

        // Determine resolution based on AR
        // 9:16 -> 720x1280
        // 16:9 -> 1280x720
        const [w, h] = aspectRatio === '16:9' ? [1280, 720] : [720, 1280];

        // Simple scale and zoom effect
        // d=${duration*25}: Duration in frames (assuming 25fps)

        ffmpeg(imagePath)
            .loop(duration)
            .fps(25)
            .videoFilters([
                // Scale to fit target box, properly dealing with padding if needed
                `scale=${w}:${h}:force_original_aspect_ratio=increase`,
                `crop=${w}:${h}`,
                // Zoompan needs exact resolution in 's' parameter
                `zoompan=z='min(zoom+0.0015,1.5)':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${w}x${h}`
            ])
            .outputOptions('-c:v libx264')
            .outputOptions('-pix_fmt yuv420p')
            .outputOptions('-shortest')
            .save(outputPath)
            .on('end', () => {
                console.log(`🎥 Ken Burns video created: ${outputPath}`);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('FFmpeg Error:', err);
                reject(err);
            });
    });
};

/**
 * Merges a video file with an audio file.
 * Handles resizing to 720p if not already.
 */
export const mergeVideoAudio = (videoPath, audioPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = getOutputPath('final');

        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .outputOptions('-c:v copy') // Copy video stream if compatible
            .outputOptions('-c:a aac')  // Encode audio to AAC
            .outputOptions('-shortest') // Cut to shortest stream
            .save(outputPath)
            .on('end', () => {
                console.log(`🎬 Final Merged video: ${outputPath}`);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('Merge Error:', err);
                reject(err);
            });
    });
};

/**
 * Creates a video from a static image with audio (Alternative to Ken Burns if that fails or is too heavy)
 */
export const createStaticVideo = (imagePath, audioPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = getOutputPath('static');

        ffmpeg(imagePath)
            .input(audioPath)
            .videoFilters(['scale=1280:720:force_original_aspect_ratio=decrease', 'pad=1280:720:(ow-iw)/2:(oh-ih)/2']) // Fit to 720p
            .outputOptions('-c:v libx264')
            .outputOptions('-pix_fmt yuv420p')
            .outputOptions('-c:a aac')
            .outputOptions('-shortest') // Loop image to audio length
            .save(outputPath)
            .on('end', () => {
                resolve(outputPath);
            })
            .on('error', reject);
    });
}
