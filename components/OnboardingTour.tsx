import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Zap, CreditCard, LayoutDashboard } from 'lucide-react';

interface Step {
    target: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: Step[] = [
    {
        target: 'center',
        title: 'Welcome to AICrator Studio! 🚀',
        content: 'Your all-in-one AI video production powerhouse. Let\'s take a quick tour to get you started.',
        position: 'center'
    },
    {
        target: 'nav-create', // IDs we need to ensure match NavItems
        title: 'Create Magic ✨',
        content: 'Head here to generate Shorts or Long Videos instantly using AI.',
        position: 'right'
    },
    {
        target: 'nav-billing',
        title: 'Your Wallet 💳',
        content: 'Manage your credits, top-up tokens, and view payment history here.',
        position: 'right'
    },
    {
        target: 'engine-mode',
        title: 'Engine Mode ⚙️',
        content: 'See your current status and switch modes (Free/Pro/Admin).',
        position: 'bottom'
    }
];

const OnboardingTour: React.FC = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem('has_seen_onboarding');
        if (!seen) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (stepIndex < TOUR_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('has_seen_onboarding', 'true');
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[stepIndex];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto" onClick={handleClose}></div>

            {/* Highlight Logic (Simplified for now - Just Center Modal with position hints) */}
            {/* In a real implementation we would calculate rects of targets. For MVP, we stick to a central guided modal that points to things or just explains them. */}

            <div className="relative pointer-events-auto bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
                    <X size={20} />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/30 text-white">
                        {stepIndex === 0 && <Zap size={32} />}
                        {stepIndex === 1 && <LayoutDashboard size={32} />}
                        {stepIndex === 2 && <CreditCard size={32} />}
                        {stepIndex === 3 && <Zap size={32} />}
                    </div>
                </div>

                <h3 className="text-2xl font-black text-white text-center mb-2">{step.title}</h3>
                <p className="text-slate-400 text-center mb-8 text-sm leading-relaxed">{step.content}</p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {TOUR_STEPS.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIndex ? 'w-6 bg-purple-500' : 'w-1.5 bg-slate-700'}`}></div>
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm uppercase tracking-wide hover:scale-105 transition-transform"
                    >
                        {stepIndex === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
