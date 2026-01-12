
/**
 * Project Storage Service (Local Only - Offline Mode)
 * Stores projects in IndexedDB for offline persistence.
 * Cloud Sync has been disabled.
 */

const DB_NAME = 'AutoShortsStudioDB';
const STORE_PROJECTS = 'projects';
const STORE_QUEUE = 'youtube_queue';
const DB_VERSION = 2;

// --- IDB Helpers ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
      }
    };
  });
};

const sanitizeForIDB = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (typeof AudioBuffer !== 'undefined' && obj instanceof AudioBuffer) return undefined; // Cannot store generic AudioBuffer
  if (obj instanceof Blob || obj instanceof File) return obj; // IDB handles Blobs

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForIDB(item)).filter(item => item !== undefined);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = sanitizeForIDB(obj[key]);
      if (value !== undefined) sanitized[key] = value;
    }
  }
  return sanitized;
};


// --- Interfaces ---

export interface ProjectData {
  id: string;
  type: 'shorts' | 'long' | 'podcast';
  title: string;
  topic: string;
  lastUpdated: number;
  config: any;
  script: any;
  // Cloud sync flag
  isSynced?: boolean;
}

export interface YoutubeQueueItem {
  id: string;
  projectId: string;
  projectType: 'shorts' | 'long' | 'podcast';
  videoBlob?: Blob;
  metadata: {
    title: string;
    description: string;
    tags: string[];
    privacy_status: 'public' | 'private' | 'unlisted';
    publish_at?: string;
  };
  status: 'pending' | 'waiting' | 'generating' | 'rendering' | 'uploading' | 'completed' | 'error' | 'failed';
  error?: string;
  progress: number;
  system_note: string;
  addedAt: number;
  queued_at: string;
}

// --- Main Service Methods ---

// --- Cloud Helpers (Supabase) ---
import { supabase } from './supabase';

// --- Main Service Methods ---

export const saveProject = async (project: ProjectData): Promise<void> => {
  // 1. Save to Local IndexedDB (Speed & Offline)
  try {
    const dbLocal = await openDB();
    const safeProject = sanitizeForIDB(project);
    await new Promise<void>((resolve, reject) => {
      const transaction = dbLocal.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.put({ ...safeProject, lastUpdated: Date.now() }); // Update timestamp locally
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn("Local save failed", e);
  }

  // 2. Sync to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      // Upsert project metadata & data JSON
      // Note: We dump the whole project structure into a JSONB column 'data'
      const { error } = await supabase
        .from('projects')
        .upsert({
          id: project.id,
          user_id: user.id,
          title: project.title,
          data: project, // JSONB column
          updated_at: new Date().toISOString()
        });

      if (error) console.error("Supabase sync failed:", error);
      else console.log("Supabase sync successful");
    } catch (e) {
      console.error("Supabase sync error:", e);
    }
  }
};

export const getProject = async (id: string): Promise<ProjectData | undefined> => {
  // Priority: Local -> Cloud

  // 1. Try Local
  try {
    const dbLocal = await openDB();
    const localProject = await new Promise<ProjectData>((resolve, reject) => {
      const transaction = dbLocal.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (localProject) return localProject;
  } catch (e) { console.warn("Local get failed", e); }

  // 2. Try Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('data')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (data?.data) return data.data as ProjectData;
    } catch (e) { console.error("Supabase get failed", e); }
  }

  return undefined;
};

export const listProjects = async (type?: string): Promise<ProjectData[]> => {
  let projects: ProjectData[] = [];

  // 1. Fetch Cloud Projects (Source of Truth)
  const { data: { user } } = await supabase.auth.getUser();
  const cloudMap = new Map<string, ProjectData>();

  if (user) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('data, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (data) {
        data.forEach((row: any) => {
          const p = row.data as ProjectData;
          cloudMap.set(p.id, p);
        });
      }
    } catch (e) {
      console.error("Supabase list failed", e);
    }
  }

  // 2. Fetch Local Projects
  const localMap = new Map<string, ProjectData>();
  try {
    const dbLocal = await openDB();
    const localProjects = await new Promise<ProjectData[]>((resolve, reject) => {
      const transaction = dbLocal.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    localProjects.forEach(p => localMap.set(p.id, p));
  } catch (e) { console.warn("Local listing failed", e); }

  // 3. Merge Strategies (Last Write Wins)
  // We start with Cloud Map, then check Local Map.
  // If exists in both, compare timestamps.
  // If only in Local, add it.

  const mergedMap = new Map<string, ProjectData>(cloudMap);

  for (const [id, localProj] of localMap.entries()) {
    if (mergedMap.has(id)) {
      const cloudProj = mergedMap.get(id)!;
      // Compare Timestamps
      const localTime = localProj.lastUpdated || 0;
      const cloudTime = cloudProj.lastUpdated || 0;

      if (localTime > cloudTime) {
        mergedMap.set(id, { ...localProj, isSynced: false }); // Local is newer
      } else {
        // Cloud is newer, keep cloud version but mark as synced
        mergedMap.set(id, { ...cloudProj, isSynced: true });
      }
    } else {
      // Exists only locally (Offline created)
      mergedMap.set(id, { ...localProj, isSynced: false });
    }
  }

  projects = Array.from(mergedMap.values());

  if (type) {
    projects = projects.filter(p => p.type === type);
  }

  // Sort by lastUpdated desc
  return projects.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
};

export const deleteProject = async (id: string): Promise<void> => {
  // Delete Local
  try {
    const dbLocal = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = dbLocal.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) { }

  // Delete Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
  }
};

export const addToQueue = async (item: YoutubeQueueItem): Promise<void> => {
  const dbLocal = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbLocal.transaction(STORE_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getQueue = async (): Promise<YoutubeQueueItem[]> => {
  const dbLocal = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbLocal.transaction(STORE_QUEUE, 'readonly');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.sort((a: any, b: any) => a.addedAt - b.addedAt));
    request.onerror = () => reject(request.error);
  });
};

export const removeFromQueue = async (id: string): Promise<void> => {
  const dbLocal = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbLocal.transaction(STORE_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updateQueueItem = async (id: string, updates: Partial<YoutubeQueueItem>): Promise<void> => {
  const dbLocal = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbLocal.transaction(STORE_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        const updatedItem = { ...item, ...updates };
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject("Item not found");
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const validateYoutubeMetadata = (title: string, description: string, tags: string[]) => {
  const issues: string[] = [];
  if (title.length > 100) issues.push("Title exceeds 100 characters");
  if (description.length > 5000) issues.push("Description exceeds 5000 characters");

  return {
    isValid: issues.length === 0,
    note: `Title length valid (${title.length}/100). Tags count: ${tags.length}.`,
    issues
  };
};

export const exportProjectToJson = (project: ProjectData) => {
  // Strip functions or binary checks before export if needed
  const exportData = JSON.parse(JSON.stringify(project));
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title.replace(/\s+/g, '_')}_project.json`;
  a.click();
  URL.revokeObjectURL(url);
};
