import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, Smartphone, AlertCircle, Loader2, Calendar, ExternalLink, QrCode, Zap, Package, Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useApp } from '../contexts/AppContext';
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES, CreditPackage, getPriceDetails } from '../services/stripeService';
import { saveTransaction } from '../services/transactionService';
import PaymentHistory from './PaymentHistory';
import PaymentModal from './PaymentModal';
import { Globe, ArrowRight } from 'lucide-react';



const BillingPage: React.FC = () => {
    const { subscription, isPro, loading } = useSubscription();
    const { addCredits, credits } = useApp();

    // UI State
    const [viewMode, setViewMode] = useState<'subscription' | 'topup' | 'history'>('subscription');
    const [currency, setCurrency] = useState<'USD' | 'THB'>('USD'); // Default global

    // Payment State
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'promptpay'>('credit_card');
    const [isProcessing, setIsProcessing] = useState(false);

    // Track previous credits to detect top-up
    const prevCreditsRef = React.useRef(credits);

    useEffect(() => {
        if (credits > prevCreditsRef.current) {
            // Credits increased!
            if (isPaymentModalOpen || sessionStorage.getItem('expecting_payment')) {
                alert(`🎉 Payment Confirmed! Balance updated to ${credits} tokens.`);
                setIsPaymentModalOpen(false);
                setViewMode('history');
                sessionStorage.removeItem('expecting_payment');
            }
        }
        prevCreditsRef.current = credits;
    }, [credits, isPaymentModalOpen]);

    const handleSelect = async (item: any, type: 'sub' | 'credit') => {
        // Check for direct Payment Link (Stripe)
        if (item.paymentLink) {
            try {
                const { supabase } = await import('../services/supabase');
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Redirect directly to Stripe
                    window.location.href = `${item.paymentLink}?client_reference_id=${user.id}`;
                    return;
                } else {
                    // If not logged in, maybe show login modal or alert?
                    // For now, let's assume they should be logged in to see this page, 
                    // or the AuthGuard handles it. If not, alert them.
                    alert("Please log in to subscribe.");
                    return;
                }
            } catch (e) {
                console.error("Error redirecting to payment:", e);
            }
        }

        // Map data to a common structure
        // Store full item for the modal
        setSelectedItem(item);
        setIsPaymentModalOpen(true);
    };

    // Payment is now handled entirely by PaymentModal component

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 animate-in fade-in slide-in-from-bottom-6 duration-700">



            {/* Header Area */}
            <div className="text-center mb-10 pt-10 space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase">
                    Upgrade Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Power</span>
                </h1>
                <p className="text-slate-400 text-lg">Unlock professional AI tools and scale your video production.</p>

                <div className="flex items-center justify-center gap-4 mt-8">
                    <div className="bg-white border border-slate-200 p-1 rounded-2xl inline-flex relative shadow-sm">
                        {/* Highlights tab */}
                        <div
                            className={`absolute inset-y-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300 shadow-lg ${viewMode === 'subscription' ? 'left-1 w-[120px]' : 'left-[128px] w-[120px]'}`}
                        ></div>

                        <button
                            onClick={() => setViewMode('subscription')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider relative z-10 transition-colors w-[120px] ${viewMode === 'subscription' ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setViewMode('history')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider relative z-10 transition-colors w-[120px] ${viewMode === 'history' ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            History
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Balance Card */}
            <div className="max-w-md mx-auto mb-16">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Your Balance</div>
                        <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                            {credits} <span className="text-sm font-bold text-slate-500">Tokens</span>
                        </div>
                    </div>
                    {isPro && (
                        <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                            PRO Active
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'history' ? (
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6">
                    <PaymentHistory />
                </div>
            ) : (
                /* Subscription View */
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative max-w-7xl mx-auto">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 hover:-translate-y-2 flex flex-col shadow-lg
                        ${plan.recommend
                                    ? 'bg-slate-900 border-orange-500/50 shadow-orange-900/20 z-10 scale-105 ring-1 ring-orange-500/20 text-white'
                                    : 'bg-white border-slate-200 hover:border-slate-300'}`}
                        >
                            {plan.recommend && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-orange-600 to-pink-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                                    <Crown size={12} /> Most Popular
                                </div>
                            )}

                            <div className="mb-6 text-center">
                                <h3 className={`text-lg font-bold uppercase tracking-widest mb-4 ${plan.recommend ? 'text-slate-400' : 'text-slate-500'}`}>{plan.name}</h3>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className={`text-5xl font-black tracking-tight ${plan.recommend ? 'text-white' : 'text-slate-900'}`}>{getPriceDetails(plan, currency).display}</span>
                                    <span className="text-sm text-slate-500 font-bold self-end mb-2">/mo</span>
                                </div>
                                <div className="inline-flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1 text-slate-300 text-sm font-bold">
                                    <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                                    {plan.tokens} Tokens
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className={`flex items-start gap-3 text-sm ${plan.recommend ? 'text-slate-300' : 'text-slate-600'}`}>
                                        <CheckCircle size={16} className={`shrink-0 mt-0.5 ${plan.recommend ? 'text-orange-500' : 'text-emerald-500'}`} />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSelect(plan, 'sub')}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all
                            ${plan.recommend
                                        ? 'bg-white text-black hover:bg-slate-200'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                            >
                                Subscribe
                            </button>
                        </div>
                    ))}

                    {/* FAQ Section moved here or removed? Let's keep it below */}
                    <div className="col-span-full mt-16 max-w-3xl mx-auto space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 text-center mb-8 uppercase tracking-widest">Frequently Asked Questions (FAQ)</h3>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-lg font-bold text-slate-900 mb-2">📅 Does the subscription auto-renew?</h4>
                            <p className="text-slate-500 text-sm">
                                <span className="text-orange-500 font-bold">No, it does not auto-renew.</span> You must manually click "Renew" each month when your package expires. This gives you full control over your expenses.
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-lg font-bold text-slate-900 mb-2">💸 Credits didn't show up after payment?</h4>
                            <p className="text-slate-500 text-sm">
                                If your credits haven't updated within 5 minutes of payment, please send your receipt/slip to <span className="text-slate-900 font-bold underline">support@lazyautocreator.xyz</span> and we will resolve it immediately.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal - Using Stripe */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                currency={currency}
                initialPackage={selectedItem}
            />
        </div>
    );
};

export default BillingPage;
