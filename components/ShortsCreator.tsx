import React, { useState, useRef, useEffect } from 'react';
import { ProjectState, GeneratorMode, Scene, SubtitleStyle, ScriptData } from '../types';
import PaymentModal from './PaymentModal';
import { CREDIT_COSTS } from '../services/stripeService';

import { generateShortsScript, generateImageForScene, generateVoiceover, generateVideoFromImage, generateVideoForScene, ERR_INVALID_KEY, refineVisualPrompt, pollVideoStatus } from '../services/geminiService';
import { uploadBase64ToSupabase } from '../services/uploadService';
// import { generateVideoWan } from '../services/wanService'; // Removed: service does not exist
import { decodeAudioData } from '../utils/audioUtils';
import VideoPlayer, { VideoPlayerRef } from './VideoPlayer';
import SceneManager from './SceneManager';
import MetadataManager from './MetadataManager';
import SubtitleEditor from './SubtitleEditor';
import YoutubeUploadModal from './YoutubeUploadModal';
import ArtStyleSelector, { StyleOption } from './ArtStyleSelector';
import VoiceSelector from './VoiceSelector';
import BGMSelector, { BGMTrack, BGM_LIBRARY } from './BGMSelector';
import SubtitleStyleSelector, { SUBTITLE_TEMPLATES } from './SubtitleStyleSelector';
import { useApp } from '../contexts/AppContext';
import { saveProject, listProjects, ProjectData, getProject, addToQueue } from '../services/projectService';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Wand2, Loader2, Save, History, X, Sparkles, Youtube,
  Smartphone, Bot, CheckCircle2, Zap, Download, Type, Move, Palette, Layers, BarChart3, Clock, Eye, EyeOff, Music, PlusCircle, Trash2, ChevronRight, Info,
  Mic, VolumeX, Volume2, Play, Rocket, Upload, FileAudio, ToggleLeft, ToggleRight,
  Anchor, BookOpen, Lightbulb, TrendingUp, Megaphone, Send, ListPlus, ShieldCheck,
  Paintbrush, Activity, Check, Camera
} from 'lucide-react';

const SaveStatusIndicator = ({ status }: { status: 'draft' | 'saving' | 'saved' | 'error' }) => {
  switch (status) {
    case 'saving': return <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 uppercase tracking-widest"><Loader2 size={10} className="animate-spin" /> Syncing</div>;
    case 'saved': return <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest"><CheckCircle2 size={10} /> Master Saved</div>;
    case 'error': return <div className="flex items-center gap-1.5 text-[10px] font-black text-red-400 uppercase tracking-widest">Storage Error</div>;
    default: return <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Draft</div>;
  }
};

interface ShortsCreatorProps {
  initialTopic?: string;
  initialLanguage?: 'Thai' | 'English';
  initialProject?: ProjectData | null;
  apiKey: string;
  onNavigate?: (tab: string) => void;
}

const ShortsCreator: React.FC<ShortsCreatorProps> = ({ initialTopic, initialLanguage = 'Thai', initialProject, apiKey, onNavigate }) => {
  const { openKeySelection, resetKeyStatus, hasSelectedKey, deductCredits } = useApp();

  // Initialize State from Project if available
  const [state, setState] = useState<ProjectState>({
    status: 'idle',
    topic: initialProject?.topic || initialTopic || '',
    script: initialProject?.script || null,
    id: initialProject?.id, // Restore ID
    currentStep: ''
  });
  // ...
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mode, setMode] = useState<GeneratorMode>(initialProject?.config?.mode || GeneratorMode.FACTS);
  const aspectRatio = '9:16';
  const [language, setLanguage] = useState<'Thai' | 'English'>(initialProject?.config?.language || initialLanguage);

  const [selectedVoice, setSelectedVoice] = useState(initialProject?.config?.selectedVoice || 'Kore');
  const [selectedVisualModel, setSelectedVisualModel] = useState(initialProject?.config?.selectedVisualModel || 'gemini-2.0-flash-exp');
  const [selectedTextModel, setSelectedTextModel] = useState(initialProject?.config?.selectedTextModel || 'gemini-2.0-flash');
  const [selectedStyle, setSelectedStyle] = useState(initialProject?.config?.selectedStyle || 'Cinematic');

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('Initializing');
  const [activeTab, setActiveTab] = useState<'scenes' | 'viral' | 'seo'>('scenes');
  const [currentVideoBlob, setCurrentVideoBlob] = useState<Blob | null>(null);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'draft' | 'saving' | 'saved' | 'error'>('saved');
  const [hideSubtitles, setHideSubtitles] = useState(initialProject?.config?.hideSubtitles || false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const { user } = useAuth();
  const { isPro } = useSubscription();

  // Motion Toggle (AI Motion via Replicate vs Static Ken Burns via FFmpeg)
  const [useMotion, setUseMotion] = useState(false);


  // Shared resources
  const audioContextRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<VideoPlayerRef>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  // BGM State
  const [bgmUrl, setBgmUrl] = useState<string | undefined>(undefined);
  const [bgmFile, setBgmFile] = useState<Blob | null>(null);
  const [bgmName, setBgmName] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState(0.15);
  const [selectedBgmTrack, setSelectedBgmTrack] = useState<BGMTrack | null>(null);
  const [showBGMSelector, setShowBGMSelector] = useState(false);

  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontSize: 84, textColor: '#FFFF00', backgroundColor: '#000000', backgroundOpacity: 0.0, verticalOffset: 35, fontFamily: 'Kanit', outlineColor: '#000000', outlineWidth: 6, shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.8)', fontWeight: '900'
  });
  const [showSubtitleStyleSelector, setShowSubtitleStyleSelector] = useState(false);

  useEffect(() => {
    if (bgmFile && !bgmUrl) {
      const url = URL.createObjectURL(bgmFile); setBgmUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [bgmFile]);

  useEffect(() => { setSaveStatus('draft'); }, [selectedVoice, selectedStyle, subtitleStyle, bgmVolume, hideSubtitles, selectedTextModel]);

  // Resume Pending Jobs on Load
  useEffect(() => {
    if (!state.script) return;
    state.script.scenes.forEach(scene => {
      // If scene has backendJobId but not completed, resume polling
      if (scene.backendJobId && scene.status !== 'completed' && !scene.videoUrl) {
        console.log(`Resuming job monitor for scene ${scene.id}: ${scene.backendJobId}`);
        updateScene(scene.id, { status: 'generating', statusDetail: "Resuming..." });

        pollVideoStatus(scene.backendJobId, (status, poll) => {
          updateScene(scene.id, { statusDetail: `Resumed... ${poll * 5}%` });
        }).then(videoUrl => {
          updateScene(scene.id, {
            status: 'completed',
            videoUrl: videoUrl,
            processingProgress: 100,
            statusDetail: "Ready"
          });
          handleSaveProject();
        }).catch(err => {
          console.error("Resumed job failed", err);
          updateScene(scene.id, { status: 'failed', error: err.message });
        });
      }
    });
  }, []); // Run once on mount (when project loads)

  const [isInitialGenerating, setIsInitialGenerating] = useState(false);

  // ... (previous state declarations)

  const handleGenerateScript = async () => {
    if (!state.topic) {
      alert('Topics are required!');
      return;
    }

    // Check credits/tokens
    const hasCredits = deductCredits(CREDIT_COSTS.SHORTS);
    if (!hasCredits) {
      setShowPaymentModal(true);
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'generating_script' }));

      // 1. Generate Script
      const scriptData = await generateShortsScript(state.topic, mode, aspectRatio, language, selectedStyle, selectedTextModel);

      // 2. Set Script State & Start Magic Generation
      setState(prev => ({ ...prev, script: scriptData, status: 'idle' }));
      setIsInitialGenerating(true);

      // 3. Auto-Synthesize All Scenes (Sequentially to avoid Rate Limits)
      const pendingScenes = scriptData.scenes || [];

      // Sequential Processing
      for (const scene of pendingScenes) {
        try {
          // Add a small delay between requests
          await new Promise(r => setTimeout(r, 1000));
          await processScene(scene);
        } catch (err) {
          console.error("Auto-synthesis error for scene:", scene.id, err);
        }
      }

      // 4. Save and Reveal
      handleSaveProject();
      setIsInitialGenerating(false);
      setSaveStatus('saved');

      // 5. Auto-navigate to Library
      if (onNavigate) {
        onNavigate('library');
      }

    } catch (error: any) {
      console.error('Script generation error:', error);
      if (error.code === ERR_INVALID_KEY) { resetKeyStatus(); openKeySelection(); }
      setState(prev => ({ ...prev, status: 'error', error: error.message }));
      setIsInitialGenerating(false);
    }
  };

  const handleRefinePrompt = async (scene: Scene) => {
    try {
      const refined = await refineVisualPrompt(state.topic, selectedStyle, scene.voiceover);
      updateScene(scene.id, { visual_prompt: refined });
    } catch (err) { console.error(err); }
  };

  const processScene = async (scene: Scene) => {
    // Safety check - skip if scene is invalid
    if (!scene || !scene.id) return;
    if (scene.status === 'completed') return;

    updateScene(scene.id, { status: 'generating', processingProgress: 5, statusDetail: "Connecting..." });
    try {
      const audioBase64 = await generateVoiceover(scene.voiceover || '', selectedVoice);
      const audioCtx = getAudioContext();
      if (audioCtx.state === 'suspended') await audioCtx.resume();

      const audioBuffer = await decodeAudioData(audioBase64, audioCtx);
      updateScene(scene.id, { processingProgress: 30, audioBase64, audioBuffer, statusDetail: "Rendering Visuals..." });

      // 1. Upload Audio to Cloud (Required for Backend Processing)
      let audioUrlVal = '';
      try {
        const audioFileName = `audio/${scene.id}_${Date.now()}.mp3`;
        // generateVoiceover returns base64 string
        audioUrlVal = await uploadBase64ToSupabase(`data:audio/mp3;base64,${audioBase64}`, audioFileName);
        console.log("Audio uploaded:", audioUrlVal);
      } catch (upErr) {
        console.warn("Audio upload failed, video gen might fail:", upErr);
      }

      let imageUrlVal = '';
      let videoUrlVal = '';

      const isVideo = selectedVisualModel.startsWith('veo') || selectedVisualModel.startsWith('wan') || useMotion; // Check useMotion flag

      // 2. Generate Visual
      if (selectedVisualModel.startsWith('veo')) {
        // Native Veo (Google Cloud) - Returns URL directly usually?
        // Existing logic...
        const result = await generateVideoForScene(scene.visual_prompt || '', aspectRatio, selectedVisualModel, selectedStyle, (p) => {
          updateScene(scene.id, { processingProgress: 30 + (p * 5), statusDetail: `Generating Frames...` });
        });
        videoUrlVal = result;
      } else {
        // Image Generation (Gemini) -> Base64
        const imageBase64 = await generateImageForScene(scene.visual_prompt || '', selectedVisualModel, aspectRatio, selectedStyle);

        if (!imageBase64) {
          throw new Error("Image generation failed");
        }

        // Upload Image to Cloud
        const imageFileName = `images/${scene.id}_${Date.now()}.png`;
        imageUrlVal = await uploadBase64ToSupabase(imageBase64, imageFileName);

        // 3. If Motion/Video requested, call Backend Pipeline
        if (useMotion || true) { // Always use backend for final render (Ken Burns or Motion)
          updateScene(scene.id, { statusDetail: "Rendering Video...", processingProgress: 60 });

          // Call Backend: Combine Image + Audio -> Video
          // If useMotion is true, it uses Replicate. If false, it uses FFmpeg Ken Burns.
          videoUrlVal = await generateVideoFromImage(
            imageUrlVal,
            useMotion,
            aspectRatio,
            audioUrlVal, // Pass audio to merge
            (status, poll) => {
              updateScene(scene.id, { statusDetail: `Rendering... ${poll * 5}%` });
            },
            (jobId) => {
              // On Job Created: Save ID for persistence
              updateScene(scene.id, { backendJobId: jobId, statusDetail: "Queued..." });
              handleSaveProject(); // Save to DB
            }
          );
        }
      }

      updateScene(scene.id, {
        status: 'completed',
        processingProgress: 100,
        statusDetail: "Ready",
        imageUrl: imageUrlVal,
        videoUrl: videoUrlVal || imageUrlVal // Fallback 
      });
    } catch (err: any) {
      console.error(`Scene ${scene.id} failed:`, err);
      updateScene(scene.id, { status: 'failed', error: err?.message || 'Unknown error', statusDetail: "Sync Error" });
      throw err;
    }
  };

  const handleGenerateAll = async () => {
    if (!state.script || isProcessingAll) return;
    setIsProcessingAll(true);
    try {
      const pending = state.script.scenes.filter(s => s.status !== 'completed' && s.status !== 'skipped');


      // Sequential (Standard Stability)
      for (const scene of pending) {
        try {
          await new Promise(r => setTimeout(r, 800)); // Rate limit buffer
          await processScene(scene);
        } catch (e) {
          console.error("Scene failed", e);
        }
      }

      handleSaveProject();
    } catch (e) {
      console.error("Batch synthesis failed", e);
    } finally {
      setIsProcessingAll(false);
    }
  };

  const updateScene = (sceneId: number, updates: Partial<Scene>) => {
    setState(prev => ({ ...prev, script: prev.script ? { ...prev.script, scenes: prev.script.scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s) } : null }));
  };

  const handleReorderScenes = (startIndex: number, endIndex: number) => {
    setState(prev => {
      if (!prev.script || !prev.script.scenes) return prev;
      const scenes = [...prev.script.scenes];
      const [removed] = scenes.splice(startIndex, 1);
      scenes.splice(endIndex, 0, removed);
      return { ...prev, script: { ...prev.script, scenes } };
    });
    setSaveStatus('draft');
  };

  const handleStepReorder = (sceneId: number, direction: 'up' | 'down') => {
    setState(prev => {
      if (!prev.script || !prev.script.scenes) return prev;
      const scenes = [...prev.script.scenes];
      const idx = scenes.findIndex(s => s.id === sceneId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= scenes.length) return prev;
      const [removed] = scenes.splice(idx, 1);
      scenes.splice(newIdx, 0, removed);
      return { ...prev, script: { ...prev.script, scenes } };
    });
    setSaveStatus('draft');
  };

  const handleDeleteScene = (sceneId: number) => {
    if (!confirm("Delete this viral segment?")) return;
    setState(prev => {
      if (!prev.script || !prev.script.scenes) return prev;
      return { ...prev, script: { ...prev.script, scenes: prev.script.scenes.filter(s => s.id !== sceneId) } };
    });
    setSaveStatus('draft');
  };

  const handleAddScene = () => {
    setState(prev => {
      if (!prev.script) return prev;
      const newScene: Scene = {
        id: Date.now(),
        voiceover: "Add catchy dialogue here...",
        visual_prompt: "Visual description...",
        duration_est: 3,
        status: 'pending'
      };
      return { ...prev, script: { ...prev.script, scenes: [...(prev.script.scenes || []), newScene] } };
    });
    setSaveStatus('draft');
  };

  const handleSaveProject = async () => {
    if (!state.script) return; setSaveStatus('saving');
    const project: ProjectData = { id: state.id || `shorts-${Date.now()}`, type: 'shorts', title: state.script.title, topic: state.topic, lastUpdated: Date.now(), config: { mode, aspectRatio, language, selectedVoice, selectedVisualModel, selectedTextModel, selectedStyle, subtitleStyle, bgmName, bgmVolume, hideSubtitles, voiceSpeed: 1.1 }, script: state.script };
    try { await saveProject(project); setState(prev => ({ ...prev, id: project.id })); setSaveStatus('saved'); } catch (e) { setSaveStatus('error'); }
  };

  const handleExport = async () => {
    if (!playerRef.current) return;
    setIsExporting(true); setExportProgress(0); setExportStage('Checking Scene Assets...');
    try {
      const { blob } = await playerRef.current.renderVideo((p, stage) => { setExportProgress(p); setExportStage(stage); });
      setCurrentVideoBlob(blob); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `viral-short-${Date.now()}.webm`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: any) { alert("Render Failed: " + err.message); } finally { setIsExporting(false); }
  };

  const handleResetProject = () => {
    if (confirm("Start a new project? Any unsaved progress will be forgotten.")) {
      setState({ status: 'idle', topic: '', script: null, currentStep: '' });
      setCurrentVideoBlob(null);
      setExportProgress(0);
      setExportStage('Initializing');
      setSaveStatus('draft');
      setIsExporting(false);
      setBgmUrl(undefined);
      setBgmFile(null);
      setBgmName(null);
      setSelectedBgmTrack(null);
    }
  };

  const completedScenes = (state.script?.scenes || []).filter(s => s.status === 'completed');
  const completedCount = completedScenes.length;
  const totalCount = (state.script?.scenes || []).length;

  return (
    <div className="flex flex-col xl:flex-row gap-10 max-w-[1400px] mx-auto pb-20">
      {showStyleSelector && <ArtStyleSelector selectedId={selectedStyle} onSelect={setSelectedStyle} onClose={() => setShowStyleSelector(false)} />}
      {showVoiceSelector && <VoiceSelector selectedVoice={selectedVoice} onSelect={setSelectedVoice} onClose={() => setShowVoiceSelector(false)} />}
      {showBGMSelector && (
        <BGMSelector
          selectedTrack={selectedBgmTrack}
          volume={bgmVolume}
          onSelect={(track) => {
            setSelectedBgmTrack(track);
            setBgmUrl(track ? track.url : undefined);
            setBgmName(track ? track.name : null);
          }}
          onVolumeChange={setBgmVolume}
          onClose={() => setShowBGMSelector(false)}
        />
      )}
      {showSubtitleStyleSelector && (
        <SubtitleStyleSelector
          currentStyle={subtitleStyle}
          onApply={setSubtitleStyle}
          onClose={() => setShowSubtitleStyleSelector(false)}
        />
      )}
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />

      <div className="xl:w-[360px] shrink-0 sticky top-12 self-start">
        {/* Simple 9:16 Video Player - No Phone Frame */}
        <div className="relative aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          <VideoPlayer ref={playerRef} scenes={completedScenes} isReady={completedCount > 0} aspectRatio="9:16" subtitleStyle={subtitleStyle} hideSubtitles={hideSubtitles} onToggleSubtitles={() => setHideSubtitles(!hideSubtitles)} bgmUrl={bgmUrl} bgmVolume={bgmVolume} voiceSpeed={1.1} isPro={isPro} />

          {isExporting && (
            <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center text-center backdrop-blur-xl">
              <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-slate-800 stroke-current" strokeWidth="8" fill="transparent" r="44" cx="50" cy="50" />
                  <circle className="text-orange-500 stroke-current transition-all duration-300" strokeWidth="8" strokeLinecap="round" fill="transparent" r="44" cx="50" cy="50" style={{ strokeDasharray: 276.5, strokeDashoffset: 276.5 - (276.5 * exportProgress) / 100 }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-black text-white text-lg">{Math.round(exportProgress)}%</span>
              </div>
              <h4 className="text-white font-black uppercase tracking-widest text-[10px]">{exportStage}</h4>
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <button onClick={handleExport} disabled={completedCount === 0 || isExporting} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all">
            <Download size={20} /> Final Render (Local)
          </button>



        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">

        {/* Header removed - auto-navigation to library after script generation */}

        <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200"><Zap size={32} fill="currentColor" /></div>
              <div><h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Shorts Factory</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mt-1">AI Video Generator</p>
              </div>
            </div>

            <button
              onClick={handleResetProject}
              className="px-6 py-3 rounded-xl bg-white hover:bg-red-50 hover:text-red-500 text-slate-500 text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 hover:border-red-200 flex items-center gap-2 group"
            >
              <Trash2 size={14} className="group-hover:rotate-12 transition-transform" /> Clear / New Project
            </button>
          </div>

          <div className="space-y-8">
            <div className="relative">
              <input type="text" placeholder="Shorts Topic..." className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-7 pr-64 text-slate-900 text-xl font-kanit outline-none focus:ring-2 focus:ring-orange-200 transition-all placeholder:text-slate-400" value={state.topic} onChange={(e) => setState(prev => ({ ...prev, topic: e.target.value }))} />

              <div className="absolute right-3.5 top-3.5 bottom-3.5 flex items-center gap-2">
                <button onClick={handleGenerateScript} disabled={state.status !== 'idle'} className="h-full px-8 bg-orange-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 shadow-2xl transition-all disabled:opacity-50 flex items-center gap-2">
                  {state.status === 'generating_script' ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={16} />}
                  {state.status === 'generating_script' ? 'Drafting...' : 'Create Magic'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-2 flex items-center gap-1.5"><Palette size={10} className="text-pink-600" /> Art Style</label>
                <button onClick={() => setShowStyleSelector(true)} className="w-full text-left text-slate-900 font-bold text-xs truncate flex items-center justify-between"><span>{selectedStyle}</span><ChevronRight size={14} /></button>
                <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                  <Camera size={8} className="text-slate-400" />
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Style DNA Active</span>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"><label className="text-[9px] font-black text-slate-500 uppercase block mb-2">Engine</label>
                <select value={selectedVisualModel} onChange={(e) => setSelectedVisualModel(e.target.value)} className="w-full bg-transparent text-slate-900 font-bold text-xs outline-none cursor-pointer">
                  <option value="gemini-2.0-flash-exp" className="bg-white text-slate-900">Image Generation (Standard)</option>
                  {/* <option value="wan-2.1" className="bg-slate-900 text-amber-400">Wan 2.1 (Video) - Economical</option> */}
                </select></div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"><label className="text-[9px] font-black text-slate-500 uppercase block mb-2">Voice</label>
                <button onClick={() => setShowVoiceSelector(true)} className="w-full text-left text-slate-900 font-bold text-xs truncate flex items-center justify-between outline-none">
                  <span>{selectedVoice}</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Motion Toggle - AI vs Static */}
              <div className={`p-5 rounded-2xl border transition-all ${useMotion ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-2 flex items-center gap-1.5">
                  <Move size={10} className={useMotion ? 'text-purple-600' : 'text-slate-400'} /> Motion Mode
                </label>
                <button
                  onClick={() => setUseMotion(!useMotion)}
                  className="w-full flex items-center justify-between"
                >
                  <span className={`font-bold text-xs ${useMotion ? 'text-purple-600' : 'text-slate-600'}`}>
                    {useMotion ? 'AI Motion (Replicate)' : 'Static (Ken Burns)'}
                  </span>
                  <div className={`relative w-12 h-6 rounded-full transition-colors ${useMotion ? 'bg-purple-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${useMotion ? 'left-6' : 'left-0.5'}`} />
                  </div>
                </button>
                <p className={`mt-2 text-[8px] font-bold uppercase tracking-tight ${useMotion ? 'text-purple-500' : 'text-slate-400'}`}>
                  {useMotion ? '💰 Uses Replicate API Credits' : '✨ Free FFmpeg Effect'}
                </p>
              </div>

              {/* BGM Library */}
              <div className={`p-5 rounded-2xl border transition-all ${selectedBgmTrack ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200' : 'bg-slate-50 border-slate-200'}`}>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-2 flex items-center gap-1.5">
                  <Music size={10} className={selectedBgmTrack ? 'text-pink-600' : 'text-slate-400'} /> Background Music
                </label>
                <button
                  onClick={() => setShowBGMSelector(true)}
                  className="w-full text-left text-slate-900 font-bold text-xs truncate flex items-center justify-between"
                >
                  <span className={selectedBgmTrack ? 'text-pink-600' : 'text-slate-600'}>
                    {selectedBgmTrack ? selectedBgmTrack.name : 'None selected'}
                  </span>
                  <ChevronRight size={14} />
                </button>
                {selectedBgmTrack && (
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-tight text-pink-500">
                    🎵 {selectedBgmTrack.genre} • {selectedBgmTrack.duration}
                  </p>
                )}
              </div>

              {/* Subtitle Style */}
              <div className={`p-5 rounded-2xl border transition-all bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200`}>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-2 flex items-center gap-1.5">
                  <Type size={10} className="text-amber-600" /> Subtitle Style
                </label>
                <button
                  onClick={() => setShowSubtitleStyleSelector(true)}
                  className="w-full text-left font-bold text-xs truncate flex items-center justify-between"
                >
                  <span className="text-amber-700">
                    {SUBTITLE_TEMPLATES.find(t => t.style.textColor === subtitleStyle.textColor)?.name || 'Custom'}
                  </span>
                  <ChevronRight size={14} />
                </button>
                <div
                  className="mt-2 px-2 py-1 rounded text-[10px] font-bold inline-block"
                  style={{
                    color: subtitleStyle.textColor,
                    backgroundColor: subtitleStyle.backgroundOpacity > 0 ? subtitleStyle.backgroundColor : 'rgba(0,0,0,0.8)',
                    textShadow: subtitleStyle.shadowBlur ? `0 0 ${subtitleStyle.shadowBlur}px ${subtitleStyle.shadowColor}` : 'none'
                  }}
                >
                  PREVIEW
                </div>
              </div>

            </div>
          </div>
        </div>
        {
          state.script && (
            isInitialGenerating ? (
              <div className="bg-white border border-slate-200 rounded-[3.5rem] p-20 flex flex-col items-center justify-center text-center shadow-xl mt-8 min-h-[600px]">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-orange-500 animate-pulse" size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Creating Viral Magic...</h3>
                <p className="text-slate-500 font-medium max-w-md animate-pulse">Running full production pipeline: Scripting, Voice Synthesis, and Cinematic Visuals.</p>

                <div className="mt-12 grid grid-cols-3 gap-8 w-full max-w-2xl">
                  {['AI Scripting', 'Voice Synthesis', 'Visual Gen'].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-orange-500 animate-bounce'}`}></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-xl flex flex-col mt-8">
                <div className="flex border-b border-slate-200 p-2 gap-2 bg-slate-50">
                  {[{ id: 'scenes', label: ' storyboard', icon: <Layers size={16} /> }, { id: 'viral', label: 'Viral Styling', icon: <Type size={16} /> }, { id: 'seo', label: 'Deployment', icon: <BarChart3 size={16} /> }].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 py-5 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}>{t.icon} {t.label}</button>
                  ))}
                </div>
                <div className="p-10">
                  {activeTab === 'scenes' && (
                    <div className="space-y-8">
                      <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-200"><Rocket size={28} /></div>
                          <div><h4 className="text-base font-black text-slate-900 uppercase tracking-widest leading-none mb-2">Parallel Core Production</h4><p className="text-[10px] text-slate-500 font-bold uppercase">{completedCount} / {totalCount} Ready</p></div>
                        </div>
                        <button onClick={handleGenerateAll} disabled={isProcessingAll || (completedCount === totalCount && totalCount > 0)} className={`px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-4 active:scale-95 ${isProcessingAll ? 'bg-orange-600 text-white animate-pulse' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-900/40'}`}>
                          {isProcessingAll ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                          {isProcessingAll ? 'Batch Rendering...' : 'Synthesize All Scenes'}
                        </button>
                      </div>
                      <SceneManager
                        scenes={state.script.scenes}
                        onRegenerate={processScene}
                        onRefinePrompt={handleRefinePrompt}
                        onToggleSkip={(id) => updateScene(id, { status: 'skipped' })}
                        onUpdateScene={updateScene}
                        onDragReorder={handleReorderScenes}
                        onReorder={handleStepReorder}
                        onDelete={handleDeleteScene}
                        onAddScene={handleAddScene}
                        isProcessingAll={isProcessingAll}
                      />
                    </div>
                  )}
                  {activeTab === 'viral' && (
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200 space-y-10 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-8"><div className="flex items-center gap-3"><Music size={20} className="text-orange-500" /><h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Audio Master</h4></div><div className="flex items-center gap-4"><input type="file" accept="audio/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setBgmName(f.name); setBgmFile(f); } }} className="hidden" id="bgm-up" /><label htmlFor="bgm-up" className="flex items-center gap-3 px-8 py-3 bg-white text-orange-600 border border-orange-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-50 transition cursor-pointer shadow-sm"><Upload size={16} />{bgmName || 'Upload BGM'}</label></div></div>
                      <div className="space-y-4"><div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest"><span>Atmosphere Gain</span><span className="text-orange-500">{Math.round(bgmVolume * 100)}%</span></div><input type="range" min="0" max="0.5" step="0.01" value={bgmVolume} onChange={(e) => setBgmVolume(parseFloat(e.target.value))} className="w-full accent-orange-500 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer" /></div>
                      <div className="pt-8 border-t border-slate-200">
                        <SubtitleEditor style={subtitleStyle} onChange={(upd) => setSubtitleStyle(p => ({ ...p, ...upd }))} presetType="shorts" />
                      </div>
                    </div>
                  )}
                  {activeTab === 'seo' && <MetadataManager metadata={state.script} topic={state.topic} style={selectedStyle} />}
                </div>
              </div>
            ))
        }
      </div>
      {
        showYoutubeModal && currentVideoBlob && state.script && (
          <YoutubeUploadModal
            videoBlob={currentVideoBlob}
            initialTitle={state.script.seoTitle || state.script.title}
            initialDescription={state.script.longDescription || state.script.description || ''}
            initialTags={state.script.hashtags}
            onClose={() => setShowYoutubeModal(false)}
          />
        )
      }
    </div >
  );
};

export default ShortsCreator;