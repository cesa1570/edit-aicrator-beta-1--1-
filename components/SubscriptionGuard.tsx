import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface SubscriptionGuardProps {
    children: React.ReactNode;
    feature?: string; // Name of the feature being guarded
    onUpgrade?: () => void;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
    children,
    feature = 'this feature',
    onUpgrade
}) => {
    const { isPro, loading } = useSubscription();

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    // If user has pro access, render children
    if (isPro) {
        return <>{children}</>;
    }

    // Show upgrade prompt for free users
    return (
        <div className="relative min-h-[60vh] flex items-center justify-center">
            {/* Blurred background hint */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />
            </div>

            {/* Lock Overlay */}
            <div className="relative z-10 text-center px-8 py-12 max-w-md animate-in fade-in zoom-in-95 duration-500">
                {/* Lock Icon */}
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(139,92,246,0.4)] ring-1 ring-white/10">
                    <Lock size={36} className="text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                    Premium Feature
                </h3>

                {/* Description */}
                <p className="text-slate-400 mb-8 leading-relaxed">
                    <span className="text-white font-bold">{feature}</span> is available for PRO members only.
                    Upgrade now to unlock unlimited AI video generation.
                </p>

                {/* Upgrade Button */}
                <button
                    onClick={() => {
                        window.location.href = '/billing';
                    }}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_30px_rgba(124,58,237,0.6)] hover:scale-105 active:scale-95"
                >
                    <Sparkles size={20} className="group-hover:animate-pulse" />
                    Select a Plan
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Features List */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">What you'll unlock</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {['Shorts Creator', 'Long Videos', 'Manual Studio', 'Unlimited Downloads'].map((item) => (
                            <span key={item} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionGuard;
