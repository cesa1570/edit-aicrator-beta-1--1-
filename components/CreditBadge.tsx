import React from 'react';
import { Coins, Loader2, Plus } from 'lucide-react';
import { useCredits } from '../hooks/useCredits';
import { useAuth } from '../contexts/AuthContext';

interface CreditBadgeProps {
    showBuyButton?: boolean;
    onBuyClick?: () => void;
}

const CreditBadge: React.FC<CreditBadgeProps> = ({ showBuyButton = true, onBuyClick }) => {
    const { user } = useAuth();
    const { credits, loading } = useCredits();

    if (!user) return null;

    const getCreditColor = () => {
        if (credits >= 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
        if (credits >= 20) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    };

    return (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${getCreditColor()} transition-all`}>
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <>
                    <Coins size={16} />
                    <span className="font-black text-sm">{credits}</span>
                    <span className="text-xs opacity-70 uppercase tracking-wider">Credits</span>
                </>
            )}

            {showBuyButton && (
                <button
                    onClick={onBuyClick}
                    className="ml-2 w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    title="Buy more credits"
                >
                    <Plus size={14} />
                </button>
            )}
        </div>
    );
};

export default CreditBadge;
