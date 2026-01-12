import React from 'react';
import { Coins, Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAdmin } from '../hooks/useAdmin';

interface CreditDisplayProps {
    onBuyClick: () => void;
    compact?: boolean;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ onBuyClick, compact = false }) => {
    const { credits } = useApp();
    const { isAdmin } = useAdmin();

    if (compact) {
        return (
            <button
                onClick={onBuyClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full hover:border-purple-400 transition-all group"
            >
                <Coins className="text-purple-400" size={14} />
                <span className="text-white font-bold text-sm">{isAdmin ? 'UNL' : credits}</span>
                <Plus className="text-purple-400 group-hover:rotate-90 transition-transform" size={12} />
            </button>
        );
    }

    return (
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Coins className="text-white" size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Your Credits</div>
                        <div className="text-2xl font-black text-white">{isAdmin ? 'UNLIMITED' : credits.toLocaleString()}</div>
                    </div>
                </div>
                <button
                    onClick={onBuyClick}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                    <Plus size={16} />
                    Buy Credits
                </button>
            </div>
        </div>
    );
};

export default CreditDisplay;
