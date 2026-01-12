import React, { useState, useEffect, useRef } from 'react';
import { X, CreditCard, Check, Loader2, Sparkles, Zap, Crown, AlertTriangle, Shield, Search } from 'lucide-react';
import { loadStripeScript, getStripe, SUBSCRIPTION_PLANS, getStripePublicKey, createPaymentIntent, getPriceDetails } from '../services/stripeService';
import { useApp } from '../contexts/AppContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    currency?: 'USD' | 'THB';
    initialPackage?: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, currency = 'USD', initialPackage }) => {
    const { addCredits } = useApp();
    const [step, setStep] = useState<'package' | 'details'>('package');
    const [selectedPackage, setSelectedPackage] = useState<any>(SUBSCRIPTION_PLANS[0]);

    // Billing Details
    const [billingDetails, setBillingDetails] = useState({
        firstName: '', lastName: '', email: '',
        userId: '',
        line1: '', city: '', state: '', postal_code: '', country: 'TH'
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [stripeReady, setStripeReady] = useState(false);
    const [cardElement, setCardElement] = useState<any>(null);
    const cardContainerRef = useRef<HTMLDivElement>(null);

    // Helper to get formatted price
    const getPrice = (item: any) => {
        return getPriceDetails(item, currency).display;
    };

    useEffect(() => {
        if (isOpen) {
            // Apply initial package if provided
            if (initialPackage) {
                setSelectedPackage(initialPackage);
                setStep('details'); // Jump directly to details since we only have one method
            } else {
                setStep('package');
            }

            setError(null);
            setSuccess(false);
            initStripe();
        }
    }, [isOpen, initialPackage]);

    const initStripe = async () => {
        try {
            await loadStripeScript();
            const publicKey = getStripePublicKey();
            if (!publicKey) {
                setError('Stripe Public Key not configured. Please add it in Settings.');
                return;
            }
            setStripeReady(true);
        } catch (err) {
            setError('Failed to load payment system');
        }
    };

    // Mount Stripe Card Element when details step is reached
    useEffect(() => {
        if (step === 'details' && stripeReady && cardContainerRef.current && !cardElement) {
            mountCardElement();
        }
    }, [step, stripeReady]);

    const mountCardElement = async () => {
        try {
            const stripe = await getStripe();
            const elements = stripe.elements({
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#6366f1',
                        colorBackground: '#050505',
                        colorText: '#ffffff',
                        colorDanger: '#ef4444',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        borderRadius: '12px',
                    }
                }
            });

            const card = elements.create('card', {
                style: {
                    base: {
                        fontSize: '14px',
                        color: '#ffffff',
                        '::placeholder': { color: '#475569' },
                    },
                    invalid: { color: '#ef4444' }
                }
            });

            card.mount(cardContainerRef.current!);
            setCardElement(card);
        } catch (err: any) {
            setError('Failed to initialize card form: ' + err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cardElement) {
            setError('Card form not ready. Please wait...');
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            // Check for direct Payment Link first
            if (selectedPackage.paymentLink) {
                const { supabase } = await import('../services/supabase');
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('User not found');

                // Redirect to Stripe Payment Link
                window.location.href = `${selectedPackage.paymentLink}?client_reference_id=${user.id}`;
                return;
            }

            // 1. Create Payment Intent on backend
            const priceDetails = getPriceDetails(selectedPackage, currency);

            const { clientSecret, error: intentError } = await createPaymentIntent(
                selectedPackage.id,
                priceDetails.price,
                currency.toLowerCase()
            );

            if (intentError || !clientSecret) {
                throw new Error(intentError || 'Failed to create payment');
            }

            // 2. Confirm payment
            const stripe = await getStripe();
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${billingDetails.firstName} ${billingDetails.lastName}`,
                        email: billingDetails.email,
                        address: {
                            line1: billingDetails.line1,
                            city: billingDetails.city,
                            state: billingDetails.state,
                            postal_code: billingDetails.postal_code,
                            country: billingDetails.country
                        }
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message || 'Payment failed');
            }

            // 3. Success
            if (result.paymentIntent?.status === 'succeeded') {
                const creditsToAdd = selectedPackage.credits || selectedPackage.tokens || 0;
                addCredits(creditsToAdd);
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setStep('package');
                    setCardElement(null);
                }, 2000);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const getPackageIcon = (id: string) => {
        switch (id) {
            case 'trial': return <Zap className="text-pink-400" size={20} />;
            case 'starter': return <Sparkles className="text-blue-400" size={20} />;
            case 'creator': return <Zap className="text-purple-400" size={20} />;
            case 'pro': return <Crown className="text-amber-400" size={20} />;
            default: return <Sparkles size={20} />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative bg-slate-900/50 rounded-[2.5rem] border border-white/10 w-full max-w-lg mx-4 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden ring-1 ring-white/5">
                {/* Glossy Background Effect */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-6 relative z-10">
                    <div className="flex items-center gap-4">
                        {step !== 'package' && (
                            <button
                                onClick={() => setStep('package')}
                                className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                            >
                                <span className="sr-only">Back</span>
                                <CreditCard size={20} className="rotate-180" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">
                                {step === 'package' ? 'เลือกแพ็กเกจ' : 'ข้อมูลใบเสร็จ (Billing)'}
                            </h2>
                            {step === 'package' && (
                                <p className="text-xs text-purple-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Secured by Stripe
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all hover:rotate-90 hover:scale-110 active:scale-95 group">
                        <X className="text-slate-400 group-hover:text-white" size={24} />
                    </button>
                </div>

                {success ? (
                    <div className="p-16 flex flex-col items-center text-center relative z-10">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse" />
                            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl relative border border-white/10 animate-in zoom-in duration-500">
                                <Check className="text-white drop-shadow-md" size={48} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight">ชำระเงินสำเร็จ!</h3>
                        <div className="px-6 py-2 bg-green-500/10 rounded-full border border-green-500/20 mb-8">
                            <p className="text-green-400 font-bold text-sm uppercase tracking-widest">+{(selectedPackage.credits || selectedPackage.tokens || 0).toLocaleString()} Credits</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10">
                        {/* STEP 1: Package Selection */}
                        {step === 'package' && (
                            <div className="px-8 pb-8">
                                <div className="space-y-3">
                                    {SUBSCRIPTION_PLANS.map((plan) => (
                                        <button
                                            key={plan.id}
                                            onClick={() => setSelectedPackage(plan)}
                                            className={`w-full p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden text-left flex items-center gap-4 ${selectedPackage.id === plan.id
                                                ? 'border-orange-500 bg-gradient-to-r from-orange-500/10 to-pink-500/10 shadow-[0_0_30px_rgba(249,115,22,0.15)]'
                                                : 'border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl transition-colors ${selectedPackage.id === plan.id ? 'bg-gradient-to-br from-orange-500 to-pink-500' : 'bg-slate-800'}`}>
                                                {plan.id === 'sub_lite' ? <Zap className="text-white" size={20} /> : plan.id === 'sub_pro' ? <Crown className="text-white" size={20} /> : <Sparkles className="text-white" size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-black uppercase tracking-tight">{plan.name}</span>
                                                    {plan.recommend && <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded-full uppercase">แนะนำ</span>}
                                                </div>
                                                <div className="text-xs text-slate-400">{plan.tokens.toLocaleString()} Credits / เดือน</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xl font-black ${selectedPackage.id === plan.id ? 'text-orange-300' : 'text-white'}`}>{getPrice(plan)}</div>
                                                <div className="text-[10px] text-slate-500 uppercase">/เดือน</div>
                                            </div>
                                            {selectedPackage.id === plan.id && <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setStep('details')}
                                    className="w-full mt-6 py-4 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-[0.98] bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400"
                                >
                                    ดำเนินการต่อ
                                </button>
                            </div>
                        )}

                        {/* STEP 2: Billing + Payment Form */}
                        {step === 'details' && (
                            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
                                {/* Summary Card */}
                                <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 flex items-center justify-between mb-1 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-7 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                                            <div className="flex -space-x-1">
                                                <div className="w-3 h-3 rounded-full bg-[#eb001b] opacity-90"></div>
                                                <div className="w-3 h-3 rounded-full bg-[#f79e1b] opacity-90"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white tracking-wide">Credit Card</div>
                                            <div className="text-[8px] text-slate-500 font-medium">Secure Checkout</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">ชื่อจริง (First Name)</label>
                                        <input required placeholder="Suparach" className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" value={billingDetails.firstName} onChange={e => setBillingDetails({ ...billingDetails, firstName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">นามสกุล (Last Name)</label>
                                        <input required placeholder="Promsit" className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" value={billingDetails.lastName} onChange={e => setBillingDetails({ ...billingDetails, lastName: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">อีเมล (Email)</label>
                                    <input required type="email" placeholder="example@gmail.com" className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" value={billingDetails.email} onChange={e => setBillingDetails({ ...billingDetails, email: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">ชื่อบริษัท (Company)</label>
                                        <input placeholder="Optional" className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">ประเทศ (Country)</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner appearance-none"
                                                value={billingDetails.country}
                                                onChange={e => setBillingDetails({ ...billingDetails, country: e.target.value })}
                                            >
                                                <option value="TH">Thailand (ไทย)</option>
                                                <option value="US">United States</option>
                                                <option value="SG">Singapore</option>
                                                <option value="JP">Japan</option>
                                                <option value="GB">United Kingdom</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">ที่อยู่ (Address)</label>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={14} />
                                        <input required placeholder="ค้นหาที่อยู่..." className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 pl-9 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" value={billingDetails.line1} onChange={e => setBillingDetails({ ...billingDetails, line1: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">แขวง/ตำบล (Sub-district)</label>
                                        <input required placeholder="Khlong Tan" className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" value={billingDetails.city} onChange={e => setBillingDetails({ ...billingDetails, city: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">เขต/อำเภอ (District)</label>
                                        <input required placeholder="Khlong Toei" className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" value={billingDetails.state} onChange={e => setBillingDetails({ ...billingDetails, state: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">รหัสไปรษณีย์ (ZIP Code)</label>
                                        <input required placeholder="10110" className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 shadow-inner" value={billingDetails.postal_code} onChange={e => setBillingDetails({ ...billingDetails, postal_code: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">เบอร์โทร (Phone)</label>
                                        <div className="flex shadow-inner rounded-lg overflow-hidden">
                                            <div className="bg-[#050505] border border-white/10 border-r-0 px-2.5 flex items-center gap-1.5">
                                                <img src="https://flagcdn.com/w20/th.png" className="w-4 h-3 object-cover rounded-[2px] opacity-80" alt="TH" />
                                                <span className="text-[10px] text-slate-400 font-medium">+66</span>
                                            </div>
                                            <input required placeholder="81 234 5678" className="w-full bg-[#050505] border border-white/10 rounded-r-lg p-2.5 text-white text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 border-l" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 mt-1 border-t border-white/5">
                                    <div className="flex items-center justify-between pl-1 mb-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Card Information</label>
                                        <div className="flex gap-1 opacity-50">
                                            <div className="w-6 h-3.5 bg-white/10 rounded-sm"></div>
                                            <div className="w-6 h-3.5 bg-white/10 rounded-sm"></div>
                                            <div className="w-6 h-3.5 bg-white/10 rounded-sm"></div>
                                        </div>
                                    </div>

                                    <div
                                        ref={cardContainerRef}
                                        className="bg-[#050505] border border-white/10 rounded-lg p-3 min-h-[44px] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner"
                                    />
                                    <p className="text-[9px] text-slate-600 pl-1 flex items-center gap-1.5">
                                        <Shield size={10} /> Secured by Stripe (PCI-DSS Compliant)
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold animate-in slide-in-from-top-2">
                                        <AlertTriangle size={14} className="shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isProcessing || !stripeReady}
                                    className="w-full py-3.5 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5558e6] hover:to-[#9333ea] shadow-indigo-500/20"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none blur-xl"></div>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Pay {selectedPackage.displayPrice}
                                            <Zap size={16} className="text-yellow-300 fill-yellow-300 animate-pulse" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                                    Encrypted & Secure Payment
                                </p>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
