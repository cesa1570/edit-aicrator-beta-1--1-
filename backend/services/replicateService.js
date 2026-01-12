import Replicate from 'replicate';
import dotenv from 'dotenv';
dotenv.config();

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export const generateAiVideo = async (imageUrl) => {
    try {
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error("Missing REPLICATE_API_TOKEN");
        }

        console.log("🚀 Starting AI Video Generation for:", imageUrl);

        // Using stability-ai/stable-video-diffusion
        const output = await replicate.run(
            "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816f3afc54a3c532af424f702f15b4f358f77",
            {
                input: {
                    cond_aug: 0.02,
                    decoding_t: 7,
                    input_image: imageUrl,
                    video_length: "25_frames_with_svd_xt",
                    sizing_strategy: "maintain_aspect_ratio",
                    motion_bucket_id: 127,
                    frames_per_second: 6
                }
            }
        );

        console.log("✅ AI Video Generated:", output);
        return output; // Usually a URL string or array of one URL
    } catch (error) {
        console.error("Replicate Error:", error);
        throw error;
    }
};
