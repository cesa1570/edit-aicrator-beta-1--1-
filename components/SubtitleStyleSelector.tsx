import React, { useState } from 'react';
import { X, Type, Check, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { SubtitleStyle } from '../types';

// Pre-defined subtitle templates
export interface SubtitleTemplate {
    id: string;
    name: string;
    preview: string;
    style: SubtitleStyle;
}

export const SUBTITLE_TEMPLATES: SubtitleTemplate[] = [
    // Row 1: Popular Viral Styles
    {
        id: 'viral-pop',
        name: '🔥 Viral POP',
        preview: 'Word-by-Word Sync',
        style: {
            fontSize: 64, textColor: '#FFFFFF', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 13, fontFamily: 'Kanit', outlineColor: '#000000', outlineWidth: 5,
            shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.9)', fontWeight: '900',
            activeWordColor: '#ffcd00', inactiveWordColor: '#FFFFFF', wordsPerBatch: 3, textTransform: 'uppercase'
        }
    },
    {
        id: 'beast',
        name: 'BEAST',
        preview: 'MrBeast Style',
        style: {
            fontSize: 68, textColor: '#00FF00', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 15, fontFamily: 'Impact', outlineColor: '#000000', outlineWidth: 6,
            shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.9)', fontWeight: '900',
            activeWordColor: '#FFFF00', inactiveWordColor: '#00FF00', wordsPerBatch: 2, textTransform: 'uppercase'
        }
    },
    {
        id: 'umi',
        name: 'Umi',
        preview: 'Soft & Calm',
        style: {
            fontSize: 56, textColor: '#87CEEB', backgroundColor: '#000000', backgroundOpacity: 0.3,
            verticalOffset: 20, fontFamily: 'Inter', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '600',
            activeWordColor: '#FFFFFF', inactiveWordColor: '#87CEEB', wordsPerBatch: 4
        }
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        preview: 'Classic Viral',
        style: {
            fontSize: 60, textColor: '#FFFFFF', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 15, fontFamily: 'Kanit', outlineColor: '#000000', outlineWidth: 4,
            shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.8)', fontWeight: '800',
            activeWordColor: '#FF0050', inactiveWordColor: '#FFFFFF', wordsPerBatch: 3, textTransform: 'uppercase'
        }
    },
    // Row 2: Name Styles
    {
        id: 'ariel',
        name: 'ARIEL',
        preview: 'Purple Glow',
        style: {
            fontSize: 58, textColor: '#9B59B6', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 18, fontFamily: 'Kanit', outlineColor: '#FFFFFF', outlineWidth: 2,
            shadowBlur: 15, shadowColor: 'rgba(155,89,182,0.7)', fontWeight: '900',
            activeWordColor: '#E74C3C', inactiveWordColor: '#9B59B6', wordsPerBatch: 3
        }
    },
    {
        id: 'devin',
        name: 'DEVIN',
        preview: 'Yellow Bold',
        style: {
            fontSize: 62, textColor: '#F1C40F', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 15, fontFamily: 'Impact', outlineColor: '#000000', outlineWidth: 5,
            shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.9)', fontWeight: '900',
            activeWordColor: '#FFFFFF', inactiveWordColor: '#F1C40F', wordsPerBatch: 2, textTransform: 'uppercase'
        }
    },
    {
        id: 'tracy',
        name: 'Tracy',
        preview: 'Elegant White',
        style: {
            fontSize: 54, textColor: '#FFFFFF', backgroundColor: '#1A1A1A', backgroundOpacity: 0.85,
            verticalOffset: 20, fontFamily: 'Georgia', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '600',
            activeWordColor: '#FFD700', inactiveWordColor: '#FFFFFF', wordsPerBatch: 4
        }
    },
    {
        id: 'marissa',
        name: 'Marissa',
        preview: 'Clean Minimal',
        style: {
            fontSize: 52, textColor: '#333333', backgroundColor: '#FFFFFF', backgroundOpacity: 0.95,
            verticalOffset: 18, fontFamily: 'Inter', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '700',
            activeWordColor: '#E91E63', inactiveWordColor: '#333333', wordsPerBatch: 4
        }
    },
    // Row 3: Effect Styles
    {
        id: 'mark',
        name: 'Mark',
        preview: 'Blue Highlight',
        style: {
            fontSize: 56, textColor: '#FFFFFF', backgroundColor: '#2196F3', backgroundOpacity: 0.9,
            verticalOffset: 15, fontFamily: 'Kanit', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '800',
            activeWordColor: '#FFEB3B', inactiveWordColor: '#FFFFFF', wordsPerBatch: 3
        }
    },
    {
        id: 'story',
        name: 'Story',
        preview: 'Instagram Style',
        style: {
            fontSize: 54, textColor: '#FFFFFF', backgroundColor: '#E91E63', backgroundOpacity: 0.85,
            verticalOffset: 20, fontFamily: 'Inter', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '700',
            activeWordColor: '#FFFFFF', inactiveWordColor: '#FFE0E6', wordsPerBatch: 3
        }
    },
    {
        id: 'classic',
        name: 'Classic',
        preview: 'Traditional',
        style: {
            fontSize: 58, textColor: '#FFFFFF', backgroundColor: '#000000', backgroundOpacity: 0.7,
            verticalOffset: 12, fontFamily: 'Arial', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 2, shadowColor: 'rgba(0,0,0,0.5)', fontWeight: '600',
            activeWordColor: '#FFFF00', inactiveWordColor: '#FFFFFF', wordsPerBatch: 5
        }
    },
    {
        id: 'active',
        name: 'Active',
        preview: 'Green Energy',
        style: {
            fontSize: 60, textColor: '#FFFFFF', backgroundColor: '#4CAF50', backgroundOpacity: 0.9,
            verticalOffset: 15, fontFamily: 'Kanit', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.3)', fontWeight: '800',
            activeWordColor: '#FFEB3B', inactiveWordColor: '#FFFFFF', wordsPerBatch: 3, textTransform: 'uppercase'
        }
    },
    // Row 4: Creative Styles
    {
        id: 'bubble',
        name: 'Bubble',
        preview: 'Rounded Box',
        style: {
            fontSize: 50, textColor: '#333333', backgroundColor: '#FFFFFF', backgroundOpacity: 0.95,
            verticalOffset: 18, fontFamily: 'Comic Sans MS', outlineColor: '#333333', outlineWidth: 2,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '700',
            activeWordColor: '#FF6B6B', inactiveWordColor: '#333333', wordsPerBatch: 4
        }
    },
    {
        id: 'glass',
        name: 'Glass',
        preview: 'Frosted Look',
        style: {
            fontSize: 54, textColor: '#FFFFFF', backgroundColor: '#FFFFFF', backgroundOpacity: 0.2,
            verticalOffset: 20, fontFamily: 'Inter', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 10, shadowColor: 'rgba(255,255,255,0.3)', fontWeight: '600',
            activeWordColor: '#00FFFF', inactiveWordColor: '#FFFFFF', wordsPerBatch: 4
        }
    },
    {
        id: 'comic',
        name: 'Comic',
        preview: 'Fun & Playful',
        style: {
            fontSize: 56, textColor: '#FF0000', backgroundColor: '#FFFF00', backgroundOpacity: 0.9,
            verticalOffset: 15, fontFamily: 'Comic Sans MS', outlineColor: '#000000', outlineWidth: 3,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '900',
            activeWordColor: '#0000FF', inactiveWordColor: '#FF0000', wordsPerBatch: 2
        }
    },
    {
        id: 'glow',
        name: 'Glow',
        preview: 'Neon Effect',
        style: {
            fontSize: 58, textColor: '#FF00FF', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 18, fontFamily: 'Kanit', outlineColor: '#FFFFFF', outlineWidth: 2,
            shadowBlur: 20, shadowColor: 'rgba(255,0,255,0.8)', fontWeight: '900',
            activeWordColor: '#00FFFF', inactiveWordColor: '#FF00FF', wordsPerBatch: 3
        }
    },
    // Row 5: Aesthetic Styles
    {
        id: 'pastel',
        name: 'Pastel',
        preview: 'Soft Colors',
        style: {
            fontSize: 52, textColor: '#FFB6C1', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 20, fontFamily: 'Inter', outlineColor: '#FFFFFF', outlineWidth: 2,
            shadowBlur: 8, shadowColor: 'rgba(255,182,193,0.5)', fontWeight: '600',
            activeWordColor: '#E6E6FA', inactiveWordColor: '#FFB6C1', wordsPerBatch: 4
        }
    },
    {
        id: 'neon',
        name: 'Neon',
        preview: 'Electric Pink',
        style: {
            fontSize: 60, textColor: '#FF1493', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 15, fontFamily: 'Kanit', outlineColor: '#FFFFFF', outlineWidth: 3,
            shadowBlur: 25, shadowColor: 'rgba(255,20,147,0.9)', fontWeight: '900',
            activeWordColor: '#00FF00', inactiveWordColor: '#FF1493', wordsPerBatch: 2, textTransform: 'uppercase'
        }
    },
    {
        id: 'vapor',
        name: 'Vapor',
        preview: 'Vaporwave',
        style: {
            fontSize: 56, textColor: '#00FFFF', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 18, fontFamily: 'Orbitron', outlineColor: '#FF00FF', outlineWidth: 2,
            shadowBlur: 15, shadowColor: 'rgba(0,255,255,0.6)', fontWeight: '700',
            activeWordColor: '#FF00FF', inactiveWordColor: '#00FFFF', wordsPerBatch: 3
        }
    },
    {
        id: 'retrotv',
        name: 'RetroTV',
        preview: 'VHS Effect',
        style: {
            fontSize: 54, textColor: '#00FF00', backgroundColor: '#000000', backgroundOpacity: 0.8,
            verticalOffset: 12, fontFamily: 'Courier New', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 3, shadowColor: 'rgba(0,255,0,0.5)', fontWeight: '700',
            activeWordColor: '#FFFFFF', inactiveWordColor: '#00FF00', wordsPerBatch: 4
        }
    },
    // Row 6: Professional Styles
    {
        id: 'elegant',
        name: 'Elegant',
        preview: 'Sophisticated',
        style: {
            fontSize: 50, textColor: '#FFFFFF', backgroundColor: '#1A1A1A', backgroundOpacity: 0.9,
            verticalOffset: 15, fontFamily: 'Georgia', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '400',
            activeWordColor: '#FFD700', inactiveWordColor: '#FFFFFF', wordsPerBatch: 5
        }
    },
    {
        id: 'marker',
        name: 'Marker',
        preview: 'Handwritten',
        style: {
            fontSize: 58, textColor: '#000000', backgroundColor: '#FFEB3B', backgroundOpacity: 0.85,
            verticalOffset: 18, fontFamily: 'Comic Sans MS', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '700',
            activeWordColor: '#E91E63', inactiveWordColor: '#000000', wordsPerBatch: 3
        }
    },
    {
        id: 'slow',
        name: 'Slow',
        preview: 'Relaxed Pace',
        style: {
            fontSize: 48, textColor: '#FFFFFF', backgroundColor: '#000000', backgroundOpacity: 0.5,
            verticalOffset: 20, fontFamily: 'Inter', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.5)', fontWeight: '500',
            activeWordColor: '#87CEEB', inactiveWordColor: '#FFFFFF', wordsPerBatch: 5
        }
    },
    // Row 7: Color Styles
    {
        id: 'coral',
        name: 'Coral',
        preview: 'Warm Pink',
        style: {
            fontSize: 54, textColor: '#FF7F7F', backgroundColor: '#000000', backgroundOpacity: 0,
            verticalOffset: 18, fontFamily: 'Inter', outlineColor: '#FFFFFF', outlineWidth: 2,
            shadowBlur: 10, shadowColor: 'rgba(255,127,127,0.6)', fontWeight: '700',
            activeWordColor: '#FFFFFF', inactiveWordColor: '#FF7F7F', wordsPerBatch: 4
        }
    },
    {
        id: 'modern',
        name: 'Modern',
        preview: 'Clean Design',
        style: {
            fontSize: 52, textColor: '#333333', backgroundColor: '#FFFFFF', backgroundOpacity: 0.95,
            verticalOffset: 15, fontFamily: 'Inter', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 0, shadowColor: 'transparent', fontWeight: '600',
            activeWordColor: '#2196F3', inactiveWordColor: '#333333', wordsPerBatch: 4
        }
    },
    {
        id: 'blue',
        name: 'Blue',
        preview: 'Ocean Vibes',
        style: {
            fontSize: 58, textColor: '#FFFFFF', backgroundColor: '#1976D2', backgroundOpacity: 0.9,
            verticalOffset: 15, fontFamily: 'Kanit', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.3)', fontWeight: '800',
            activeWordColor: '#FFEB3B', inactiveWordColor: '#FFFFFF', wordsPerBatch: 3
        }
    },
    {
        id: 'vivid',
        name: 'Vivid',
        preview: 'Bold Colors',
        style: {
            fontSize: 60, textColor: '#FFFFFF', backgroundColor: '#E91E63', backgroundOpacity: 0.9,
            verticalOffset: 15, fontFamily: 'Kanit', outlineColor: 'transparent', outlineWidth: 0,
            shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.4)', fontWeight: '900',
            activeWordColor: '#FFEB3B', inactiveWordColor: '#FFFFFF', wordsPerBatch: 3, textTransform: 'uppercase'
        }
    }
];

interface SubtitleStyleSelectorProps {
    currentStyle: SubtitleStyle;
    onApply: (style: SubtitleStyle) => void;
    onClose: () => void;
}

const SubtitleStyleSelector: React.FC<SubtitleStyleSelectorProps> = ({
    currentStyle,
    onApply,
    onClose,
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState<SubtitleTemplate | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [customStyle, setCustomStyle] = useState<SubtitleStyle>(currentStyle);
    const previewWords = ["This", "is", "how", "your", "subtitles", "will", "look!"];
    const [activeWordIndex, setActiveWordIndex] = useState(2);

    // Animate the active word for preview
    React.useEffect(() => {
        const interval = setInterval(() => {
            setActiveWordIndex(prev => (prev + 1) % previewWords.length);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const currentPreviewStyle = customStyle;

    const getWordStyle = (isActive: boolean): React.CSSProperties => {
        const style = currentPreviewStyle;
        return {
            fontFamily: `"${style.fontFamily}", sans-serif`,
            fontSize: `${Math.min(style.fontSize / 2.5, 24)}px`,
            fontWeight: style.fontWeight as any,
            color: isActive ? (style.activeWordColor || '#FFD700') : (style.inactiveWordColor || style.textColor),
            textShadow: style.shadowBlur && style.shadowBlur > 0
                ? `0 0 ${style.shadowBlur / 2}px ${style.shadowColor}`
                : 'none',
            WebkitTextStroke: style.outlineWidth && style.outlineWidth > 0
                ? `${style.outlineWidth / 3}px ${style.outlineColor}`
                : 'none',
            transform: isActive ? 'scale(1.3)' : 'scale(1)',
            transition: 'all 0.15s ease-out',
            display: 'inline-block',
            textTransform: style.textTransform || 'none',
        };
    };

    const handleApply = () => {
        onApply(customStyle);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal - Light Theme */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="flex-none flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Type size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Subtitle Styles</h2>
                            <p className="text-slate-500 text-xs font-medium">Choose your viral subtitle template</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                    {/* Live Preview with Animation - Larger */}
                    <div className="bg-slate-900 p-8 sticky top-0 z-10 shadow-lg">
                        <div className="aspect-[9/16] max-h-[220px] mx-auto rounded-2xl overflow-hidden relative bg-gradient-to-br from-purple-900/60 to-blue-900/60 flex items-end justify-center pb-8 shadow-xl">
                            <div
                                className="relative z-10 text-center flex flex-wrap justify-center gap-3 px-6"
                                style={{
                                    backgroundColor: currentPreviewStyle.backgroundOpacity > 0
                                        ? `rgba(${parseInt(currentPreviewStyle.backgroundColor.slice(1, 3), 16)}, ${parseInt(currentPreviewStyle.backgroundColor.slice(3, 5), 16)}, ${parseInt(currentPreviewStyle.backgroundColor.slice(5, 7), 16)}, ${currentPreviewStyle.backgroundOpacity})`
                                        : 'transparent',
                                    padding: currentPreviewStyle.backgroundOpacity > 0 ? '16px 24px' : '12px',
                                    borderRadius: '16px',
                                }}
                            >
                                {previewWords.map((word, i) => (
                                    <span key={i} style={{
                                        ...getWordStyle(i === activeWordIndex),
                                        fontSize: `${Math.min(currentPreviewStyle.fontSize / 2, 32)}px`, // Larger font
                                    }}>
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="text-center text-slate-400 text-xs mt-4 font-medium">🔥 Live Word-by-Word Preview</p>
                    </div>

                    {/* Template Grid - Larger Cards */}
                    <div className="p-6">
                        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                            Select Template
                        </h3>
                        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {SUBTITLE_TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setCustomStyle(template.style);
                                    }}
                                    className={`p-3 rounded-2xl border-2 transition-all text-center ${selectedTemplate?.id === template.id
                                        ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-200'
                                        : 'border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/50'
                                        }`}
                                >
                                    {/* Mini Preview - Larger */}
                                    <div className="bg-slate-900 rounded-xl p-3 mb-2 h-14 flex items-center justify-center overflow-hidden">
                                        <span
                                            style={{
                                                fontFamily: `"${template.style.fontFamily}", sans-serif`,
                                                fontSize: '14px',
                                                fontWeight: template.style.fontWeight as any,
                                                color: template.style.textColor,
                                                textShadow: template.style.shadowBlur ? `0 0 ${template.style.shadowBlur / 3}px ${template.style.shadowColor}` : 'none',
                                                backgroundColor: template.style.backgroundOpacity > 0
                                                    ? `rgba(${parseInt(template.style.backgroundColor.slice(1, 3), 16)}, ${parseInt(template.style.backgroundColor.slice(3, 5), 16)}, ${parseInt(template.style.backgroundColor.slice(5, 7), 16)}, ${template.style.backgroundOpacity})`
                                                    : 'transparent',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                textTransform: template.style.textTransform || 'none',
                                            }}
                                        >
                                            Sample
                                        </span>
                                    </div>
                                    <p className="text-slate-800 text-xs font-bold truncate">{template.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Settings Toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-white border-y border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors sticky bottom-0 z-10"
                    >
                        <Sliders size={16} />
                        <span className="text-xs font-bold uppercase">Advanced Settings</span>
                        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* Advanced Settings Panel */}
                    {showAdvanced && (
                        <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                {/* Font Size & Weight */}
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-slate-600 text-[10px] font-bold uppercase block mb-2">Font Size</label>
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200">
                                            <input
                                                type="number"
                                                value={customStyle.fontSize}
                                                onChange={(e) => setCustomStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                                className="w-full bg-transparent outline-none text-slate-800 text-sm font-mono"
                                            />
                                            <span className="text-slate-400 text-xs">px</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-slate-600 text-[10px] font-bold uppercase block mb-2">Font Weight</label>
                                        <select
                                            value={customStyle.fontWeight}
                                            onChange={(e) => setCustomStyle(prev => ({ ...prev, fontWeight: e.target.value }))}
                                            className="w-full bg-white rounded-lg p-2 border border-slate-200 text-slate-800 text-sm outline-none"
                                        >
                                            <option value="400">400 (Regular)</option>
                                            <option value="500">500 (Medium)</option>
                                            <option value="600">600 (SemiBold)</option>
                                            <option value="700">700 (Bold)</option>
                                            <option value="800">800 (ExtraBold)</option>
                                            <option value="900">900 (Black)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Font Family */}
                                <div className="col-span-2">
                                    <label className="text-slate-600 text-[10px] font-bold uppercase block mb-2">Font Family</label>
                                    <select
                                        value={customStyle.fontFamily}
                                        onChange={(e) => setCustomStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                                        className="w-full bg-white rounded-lg p-2 border border-slate-200 text-slate-800 text-sm outline-none"
                                    >
                                        <option value="Kanit">Kanit</option>
                                        <option value="Inter">Inter</option>
                                        <option value="Roboto">Roboto</option>
                                        <option value="Open Sans">Open Sans</option>
                                        <option value="Montserrat">Montserrat</option>
                                        <option value="Lato">Lato</option>
                                        <option value="Oswald">Oswald</option>
                                        <option value="Raleway">Raleway</option>
                                        <option value="Poppins">Poppins</option>
                                        <option value="Orbitron">Orbitron</option>
                                        <option value="Creepster">Creepster</option>
                                        <option value="Comic Sans MS">Comic Sans</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Courier New">Courier New</option>
                                    </select>
                                </div>

                                {/* Text Transform */}
                                <div className="col-span-2">
                                    <label className="text-slate-600 text-[10px] font-bold uppercase block mb-2">Text Transform</label>
                                    <select
                                        value={customStyle.textTransform || 'none'}
                                        onChange={(e) => setCustomStyle(prev => ({ ...prev, textTransform: e.target.value as any }))}
                                        className="w-full bg-white rounded-lg p-2 border border-slate-200 text-slate-800 text-sm outline-none"
                                    >
                                        <option value="none">None</option>
                                        <option value="uppercase">Uppercase</option>
                                        <option value="lowercase">Lowercase</option>
                                        <option value="capitalize">Capitalize</option>
                                    </select>
                                </div>

                                {/* Colors */}
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-slate-600 text-[10px] font-bold uppercase block mb-2">Active Word Color</label>
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200">
                                            <input
                                                type="color"
                                                value={customStyle.activeWordColor || '#ffcd00'}
                                                onChange={(e) => setCustomStyle(prev => ({ ...prev, activeWordColor: e.target.value }))}
                                                className="w-8 h-8 rounded cursor-pointer border-0"
                                            />
                                            <span className="text-slate-700 text-xs font-mono">{customStyle.activeWordColor || '#ffcd00'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-slate-600 text-[10px] font-bold uppercase block mb-2">Inactive Word Color</label>
                                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200">
                                            <input
                                                type="color"
                                                value={customStyle.inactiveWordColor || '#FFFFFF'}
                                                onChange={(e) => setCustomStyle(prev => ({ ...prev, inactiveWordColor: e.target.value }))}
                                                className="w-8 h-8 rounded cursor-pointer border-0"
                                            />
                                            <span className="text-slate-700 text-xs font-mono">{customStyle.inactiveWordColor || '#FFFFFF'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sliders Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100 p-4 rounded-xl">
                                {/* Position from Bottom */}
                                <div>
                                    <label className="text-slate-600 text-[10px] font-bold uppercase block mb-2">Position from Bottom</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="5"
                                            max="50"
                                            value={customStyle.verticalOffset}
                                            onChange={(e) => setCustomStyle(prev => ({ ...prev, verticalOffset: parseInt(e.target.value) }))}
                                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                        <span className="text-slate-700 text-xs font-bold w-10 text-right">{customStyle.verticalOffset}%</span>
                                    </div>
                                </div>

                                {/* Words Per Batch */}
                                <div>
                                    <label className="text-slate-600 text-[10px] font-bold uppercase block mb-2">Words Per Batch</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={customStyle.wordsPerBatch || 3}
                                            onChange={(e) => setCustomStyle(prev => ({ ...prev, wordsPerBatch: parseInt(e.target.value) }))}
                                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                        <span className="text-slate-700 text-xs font-bold w-10 text-right">{customStyle.wordsPerBatch || 3}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Emojis Toggle */}
                            <div className="mt-6 p-4 bg-slate-900 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">👀</span>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Emojis</h4>
                                        <p className="text-slate-400 text-xs">Show emojis in subtitles</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={customStyle.showEmojis !== false}
                                        onChange={(e) => setCustomStyle(prev => ({ ...prev, showEmojis: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-none flex items-center justify-between p-4 border-t border-slate-200 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs uppercase hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-8 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs uppercase hover:bg-amber-400 transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
                    >
                        <Check size={16} /> Apply Style
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubtitleStyleSelector;

