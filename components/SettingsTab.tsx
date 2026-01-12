import React, { useState, useEffect } from 'react';
import { Settings, Save, Key, Shield, AlertTriangle, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { setStripePublicKey, getStripePublicKey } from '../services/stripeService';

const SettingsTab = () => {
    const { apiKey, setApiKey } = useApp();
    const [geminiKey, setGeminiKey] = useState(apiKey);
    const [stripeKey, setStripeKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setGeminiKey(apiKey);
        setStripeKey(getStripePublicKey());
    }, [apiKey]);

    const handleSave = () => {
        if (geminiKey) setApiKey(geminiKey);
        if (stripeKey) setStripePublicKey(stripeKey);

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
                    <Settings className="text-slate-600" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
                    <p className="text-slate-500">Configure your API keys and system preferences</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Gemini API Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50/50 rounded-lg">
                            <Key className="text-blue-500" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">AI Configuration</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 outline-none transition-colors font-mono shadow-inner"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Required for script generation and AI features. Get one at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Configuration */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50/50 rounded-lg">
                            <Shield className="text-purple-500" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Payment Gateway (Stripe)</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Stripe Public Key (Frontend)
                            </label>
                            <input
                                type="text"
                                value={stripeKey}
                                onChange={(e) => setStripeKey(e.target.value)}
                                placeholder="pk_test_..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 outline-none transition-colors font-mono shadow-inner"
                            />
                            <div className="flex items-start gap-2 mt-2 text-xs text-slate-500">
                                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>
                                    This key is stored locally in your browser to enable secure payment tokenization.
                                    The Secret Key is managed securely on your server.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all
              ${isSaved
                                ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95'
                            }
            `}
                    >
                        {isSaved ? (
                            <>
                                <Check size={20} />
                                Saved Successfully
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
