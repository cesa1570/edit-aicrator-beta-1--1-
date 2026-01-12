import React, { useState, useRef } from 'react';
import { X, Play, Pause, Music, Check, Volume2 } from 'lucide-react';

export interface BGMTrack {
    id: string;
    name: string;
    genre: string;
    duration: string;
    url: string;
}

// Pre-loaded BGM Library
export const BGM_LIBRARY: BGMTrack[] = [
    // Cinematic
    { id: 'cinematic-1', name: 'Epic Rise', genre: 'Cinematic', duration: '2:30', url: '/audio/bgm/cinematic/epic_rise.mp3' },
    { id: 'cinematic-2', name: 'Dramatic Tension', genre: 'Cinematic', duration: '1:45', url: '/audio/bgm/cinematic/dramatic.mp3' },
    { id: 'cinematic-3', name: 'Emotional Journey', genre: 'Cinematic', duration: '3:00', url: '/audio/bgm/cinematic/emotional.mp3' },

    // Chill
    { id: 'chill-1', name: 'Lo-Fi Vibes', genre: 'Chill', duration: '2:00', url: '/audio/bgm/chill/lofi.mp3' },
    { id: 'chill-2', name: 'Peaceful Morning', genre: 'Chill', duration: '2:30', url: '/audio/bgm/chill/peaceful.mp3' },
    { id: 'chill-3', name: 'Sunset Dreams', genre: 'Chill', duration: '1:50', url: '/audio/bgm/chill/sunset.mp3' },

    // Upbeat
    { id: 'upbeat-1', name: 'Energy Boost', genre: 'Upbeat', duration: '1:30', url: '/audio/bgm/upbeat/energy.mp3' },
    { id: 'upbeat-2', name: 'Happy Days', genre: 'Upbeat', duration: '2:00', url: '/audio/bgm/upbeat/happy.mp3' },
    { id: 'upbeat-3', name: 'Party Time', genre: 'Upbeat', duration: '1:45', url: '/audio/bgm/upbeat/party.mp3' },

    // Horror
    { id: 'horror-1', name: 'Dark Ambient', genre: 'Horror', duration: '3:00', url: '/audio/bgm/horror/dark.mp3' },
    { id: 'horror-2', name: 'Suspense', genre: 'Horror', duration: '2:15', url: '/audio/bgm/horror/suspense.mp3' },
    { id: 'horror-3', name: 'Creepy Whispers', genre: 'Horror', duration: '2:45', url: '/audio/bgm/horror/creepy.mp3' },

    // Epic
    { id: 'epic-1', name: 'Battle Ready', genre: 'Epic', duration: '2:30', url: '/audio/bgm/epic/battle.mp3' },
    { id: 'epic-2', name: 'Victory March', genre: 'Epic', duration: '2:00', url: '/audio/bgm/epic/victory.mp3' },
    { id: 'epic-3', name: 'Hero\'s Journey', genre: 'Epic', duration: '3:15', url: '/audio/bgm/epic/hero.mp3' },
];

const GENRES = ['All', 'Cinematic', 'Chill', 'Upbeat', 'Horror', 'Epic'];

const GENRE_ICONS: Record<string, string> = {
    'All': '🎵',
    'Cinematic': '🎬',
    'Chill': '😌',
    'Upbeat': '🎉',
    'Horror': '👻',
    'Epic': '⚔️',
};

interface BGMSelectorProps {
    selectedTrack: BGMTrack | null;
    volume: number;
    onSelect: (track: BGMTrack | null) => void;
    onVolumeChange: (volume: number) => void;
    onClose: () => void;
}

const BGMSelector: React.FC<BGMSelectorProps> = ({
    selectedTrack,
    volume,
    onSelect,
    onVolumeChange,
    onClose,
}) => {
    const [activeGenre, setActiveGenre] = useState('All');
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const filteredTracks = activeGenre === 'All'
        ? BGM_LIBRARY
        : BGM_LIBRARY.filter(t => t.genre === activeGenre);

    const handlePreview = (track: BGMTrack) => {
        if (playingId === track.id) {
            // Stop playing
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            // Play new track
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const audio = new Audio(track.url);
            audio.volume = volume;
            audio.play().catch(() => {
                // Audio file not found - show visual feedback only
                console.log('Preview not available for:', track.name);
            });
            audio.onended = () => setPlayingId(null);
            audioRef.current = audio;
            setPlayingId(track.id);
        }
    };

    const handleSelect = (track: BGMTrack) => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setPlayingId(null);
        onSelect(track);
        onClose();
    };

    const handleNoMusic = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setPlayingId(null);
        onSelect(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                            <Music size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">BGM Library</h2>
                            <p className="text-slate-500 text-xs font-medium">Choose background music for your video</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Genre Tabs */}
                <div className="flex gap-2 p-4 border-b border-slate-100 overflow-x-auto">
                    {GENRES.map(genre => (
                        <button
                            key={genre}
                            onClick={() => setActiveGenre(genre)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeGenre === genre
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {GENRE_ICONS[genre]} {genre}
                        </button>
                    ))}
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
                    <Volume2 size={18} className="text-slate-500" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-xs font-bold text-slate-500 w-10">{Math.round(volume * 100)}%</span>
                </div>

                {/* Track List */}
                <div className="overflow-y-auto max-h-[40vh] p-4 space-y-2">
                    {filteredTracks.map(track => (
                        <div
                            key={track.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedTrack?.id === track.id
                                    ? 'bg-purple-50 border-purple-200'
                                    : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-purple-50/50'
                                }`}
                        >
                            {/* Track Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{GENRE_ICONS[track.genre]}</span>
                                    <h4 className="font-bold text-slate-900">{track.name}</h4>
                                    {selectedTrack?.id === track.id && (
                                        <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-black uppercase rounded-full">
                                            Selected
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-xs mt-1">{track.genre} • {track.duration}</p>
                            </div>

                            {/* Preview Button */}
                            <button
                                onClick={() => handlePreview(track)}
                                className={`p-3 rounded-xl transition-all ${playingId === track.id
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-600'
                                    }`}
                            >
                                {playingId === track.id ? <Pause size={18} /> : <Play size={18} />}
                            </button>

                            {/* Select Button */}
                            <button
                                onClick={() => handleSelect(track)}
                                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase hover:bg-purple-500 shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
                            >
                                <Check size={14} /> Select
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handleNoMusic}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase hover:bg-white transition-all"
                    >
                        ❌ No Music
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase hover:bg-slate-800 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BGMSelector;
