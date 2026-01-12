import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Check, X, Mic, Loader2, Volume2, User } from 'lucide-react';
import { generateVoiceover } from '../services/geminiService';
import { decodeAudioData } from '../utils/audioUtils';

interface VoiceOption {
    id: string;
    name: string;
    gender: 'Male' | 'Female';
    description: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
    // Original Standard Voices
    { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Calm, soothing, nature-documentary style.' },
    { id: 'Zephyr', name: 'Zephyr', gender: 'Male', description: 'Soft, gentle, calm narration.' },
    { id: 'Puck', name: 'Puck', gender: 'Female', description: 'Playful, energetic, suitable for lively stories.' },
    { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Deep, resonant, authoritative.' },
    { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Strong, intense, dramatic reading.' },
    { id: 'Aoede', name: 'Aoede', gender: 'Female', description: 'Formal, precise, educational tone.' },

    // New Journey/Gemini Voices
    { id: 'Leda', name: 'Leda', gender: 'Female', description: 'Sophisticated, composed, professional.' },
    { id: 'Orus', name: 'Orus', gender: 'Male', description: 'Mature, engaging, confident tone.' },
    { id: 'Callirhoe', name: 'Callirhoe', gender: 'Female', description: 'Clear, confident, energetic.' },
    { id: 'Rasalgethi', name: 'Rasalgethi', gender: 'Male', description: 'Natural, conversational, relaxed.' },
    { id: 'Autonoe', name: 'Autonoe', gender: 'Male', description: 'Deep, resonant, storyteller.' },
    { id: 'Umbriel', name: 'Umbriel', gender: 'Male', description: 'Soft, measured, calm.' },
    { id: 'Algenib', name: 'Algenib', gender: 'Female', description: 'Warm, friendly, upbeat.' },
];

interface VoiceSelectorProps {
    selectedVoice: string;
    onSelect: (voice: string) => void;
    onClose: () => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelect, onClose }) => {
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);
    const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Stop audio when closing
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handlePreview = async (voice: VoiceOption) => {
        if (playingVoice === voice.id) {
            // Stop playing
            if (audioRef.current) audioRef.current.pause();
            setPlayingVoice(null);
            return;
        }

        // Stop previously playing
        if (audioRef.current) audioRef.current.pause();

        setLoadingVoice(voice.id);
        setPlayingVoice(null);

        try {
            // Generate sample
            const text = `Hello, I am ${voice.name}. This is how I sound for your video.`;
            const base64Audio = await generateVoiceover(text, voice.id);

            const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
            const audio = new Audio(audioUrl);

            audio.onended = () => setPlayingVoice(null);

            await audio.play();
            audioRef.current = audio;
            setPlayingVoice(voice.id);
        } catch (err) {
            console.warn("AI Voice Preview failed, falling back to browser TTS", err);

            // Fallback: Browser TTS
            const utterance = new SpeechSynthesisUtterance(`Hello, I am ${voice.name}.`);
            // Try to match gender if possible (basic heuristic)
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('English') && (voice.gender === 'Female' ? v.name.includes('Female') : v.name.includes('Male')));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => setPlayingVoice(null);
            window.speechSynthesis.speak(utterance);
            // We set playing voice to allow the "Stop" button to work (though stopping TTS is global)
            // For simplicity in this UI, we just let it play out or use cancel on stop
            setPlayingVoice(voice.id);

            // Use a timeout to clear state if onend doesn't fire reliably
            setTimeout(() => setPlayingVoice(null), 3000);
        } finally {
            setLoadingVoice(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-white rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-200 m-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                            <Mic size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Voice Casting</h2>
                            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Select your narrator</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Voice Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-2">
                    {VOICE_OPTIONS.map((voice) => {
                        const isSelected = selectedVoice === voice.id;
                        const isPlaying = playingVoice === voice.id;
                        const isLoading = loadingVoice === voice.id;

                        return (
                            <div
                                key={voice.id}
                                onClick={() => onSelect(voice.id)}
                                className={`group relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${isSelected
                                    ? 'bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-200'
                                    : 'bg-white border-slate-100 hover:border-purple-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {voice.name[0]}
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {voice.gender}
                                    </div>
                                </div>

                                <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${isSelected ? 'text-white' : 'text-slate-900'
                                    }`}>
                                    {voice.name}
                                </h3>
                                <p className={`text-xs font-medium leading-relaxed mb-6 ${isSelected ? 'text-white/80' : 'text-slate-500'
                                    }`}>
                                    {voice.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePreview(voice);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected
                                            ? 'bg-white text-purple-600 hover:bg-purple-50'
                                            : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : isPlaying ? (
                                            <><Pause size={14} /> Stop</>
                                        ) : (
                                            <><Play size={14} /> Preview</>
                                        )}
                                    </button>

                                    {isSelected && (
                                        <div className="w-8 h-8 rounded-full bg-white text-purple-600 flex items-center justify-center shadow-sm">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceSelector;
