import { supabase } from './supabase';
import { ProjectData } from './projectService';

export interface RenderJob {
    id?: string;
    userId: string;
    projectId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    videoUrl?: string;
    error?: string;
    createdAt: string; // Changed to string for ISO
    projectData: ProjectData;
}

export const queueRender = async (userId: string, project: ProjectData): Promise<string> => {
    try {
        const jobData = {
            user_id: userId, // Supabase convention
            project_id: project.id,
            status: 'pending',
            progress: 0,
            created_at: new Date().toISOString(),
            project_data: project // JSONB
        };

        const { data, error } = await supabase
            .from('render_queue')
            .insert(jobData)
            .select() // Return the inserted row to get ID
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error("Error queuing render job:", error);
        throw error;
    }
};

export const listenToRenderJob = (jobId: string, callback: (job: RenderJob) => void) => {
    // Initial fetch
    supabase.from('render_queue').select('*').eq('id', jobId).single().then(({ data }) => {
        if (data) mapAndCallback(data, callback);
    });

    // Realtime listener
    const channel = supabase
        .channel('public:render_queue:' + jobId)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'render_queue', filter: `id=eq.${jobId}` }, payload => {
            mapAndCallback(payload.new, callback);
        })
        .subscribe();

    // Return unsubscribe function
    return () => {
        supabase.removeChannel(channel);
    };
};

// Helper to map DB row to RenderJob
const mapAndCallback = (row: any, callback: Function) => {
    callback({
        id: row.id,
        userId: row.user_id,
        projectId: row.project_id,
        status: row.status,
        progress: row.progress,
        videoUrl: row.video_url,
        error: row.error,
        createdAt: row.created_at,
        projectData: row.project_data
    } as RenderJob);
};
