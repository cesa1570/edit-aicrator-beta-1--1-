import React from 'react';
import { SubtitleStyle } from '../types';
import { Type, AlignVerticalJustifyCenter, Droplet, Sun, Layers } from 'lucide-react';

interface SubtitleSettingsProps {
    settings: SubtitleStyle;
    onChange: (settings: SubtitleStyle) => void;
    onClose: () => void;
}

const FONTS = ['Kanit', 'Roboto', 'Montserrat', 'Playfair Display', 'Merriweather', 'Chakra Petch'];
const COLORS = ['#FFFFFF', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FF0000', '#000000'];

const SubtitleSettings: React.FC<SubtitleSettingsProps> = ({ settings, onChange, onClose }) => {

    // Ensure default values to prevent crashes
    const safeSettings: SubtitleStyle = {
        fontSize: 48,
        textColor: '#FFFFFF',
        backgroundColor: '#000000',
        backgroundOpacity: 0.6,
        verticalOffset: 20,
        fontFamily: 'Kanit',
        outlineColor: '#000000',
        outlineWidth: 2,
        shadowBlur: 0,
        shadowColor: 'rgba(0,0,0,0.5)',
        fontWeight: 'bold',
        ...settings
    };

    const update = (key: keyof SubtitleStyle, value: any) => {
        onChange({ ...safeSettings, [key]: value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-[400px] shadow-2xl relative" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Type size={20} className="text-indigo-400" /> Subtitle Style
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">Close</button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">

                    {/* 1. Font Family & Weight */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Font Family</label>
                        <select
                            value={safeSettings.fontFamily}
                            onChange={(e) => update('fontFamily', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                        >
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    {/* 2. Text Color & Size */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-2"><Droplet size={10} /> Color</label>
                            <div className="flex gap-1 flex-wrap">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => update('textColor', c)}
                                        className={`w-6 h-6 rounded-full border border-white/10 ${safeSettings.textColor === c ? 'ring-2 ring-indigo-500 scale-110' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={safeSettings.textColor}
                                    onChange={(e) => update('textColor', e.target.value)}
                                    className="w-6 h-6 rounded-full overflow-hidden bg-transparent cursor-pointer border-none p-0"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-2"><Type size={10} /> Size: {safeSettings.fontSize}</label>
                            <input
                                type="range" min="20" max="150" step="2"
                                value={safeSettings.fontSize}
                                onChange={(e) => update('fontSize', parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                    </div>

                    {/* 3. Spacing & Position */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-2"><AlignVerticalJustifyCenter size={10} /> Vertical Position: {safeSettings.verticalOffset}%</label>
                        <input
                            type="range" min="0" max="100" step="5"
                            value={safeSettings.verticalOffset}
                            onChange={(e) => update('verticalOffset', parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                            <span>Bottom</span>
                            <span>Middle</span>
                            <span>Top</span>
                        </div>
                    </div>

                    {/* 4. Background & Outline */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-2"><Layers size={10} /> Background</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] text-slate-500 mb-1 block">Opacity</label>
                                <input
                                    type="range" min="0" max="1" step="0.1"
                                    value={safeSettings.backgroundOpacity}
                                    onChange={(e) => update('backgroundOpacity', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-500 mb-1 block">Bg Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={safeSettings.backgroundColor}
                                        onChange={(e) => update('backgroundColor', e.target.value)}
                                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700 p-0"
                                    />
                                    <span className="text-xs text-slate-400 uppercase">{safeSettings.backgroundColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-2"><Sun size={10} /> Outline (Stroke)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] text-slate-500 mb-1 block">Width: {safeSettings.outlineWidth}</label>
                                <input
                                    type="range" min="0" max="20" step="1"
                                    value={safeSettings.outlineWidth}
                                    onChange={(e) => update('outlineWidth', parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-500 mb-1 block">Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={safeSettings.outlineColor}
                                        onChange={(e) => update('outlineColor', e.target.value)}
                                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700 p-0"
                                    />
                                    <span className="text-xs text-slate-400 uppercase">{safeSettings.outlineColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SubtitleSettings;
