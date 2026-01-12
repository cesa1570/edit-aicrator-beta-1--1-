import React from 'react';
import { FileText, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <FileText className="text-indigo-500" />
                        <span className="font-bold text-white">Terms of Service</span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Terms of Service</h1>
                    <p className="text-lg text-slate-400">Effective Date: January 1, 2026</p>
                </div>

                <div className="space-y-12 bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-800">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="leading-relaxed">
                            By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p className="leading-relaxed">
                            AutoCreator provides AI-powered video creation tools. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                        <p className="leading-relaxed">
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="text-amber-500" />
                            <h2 className="text-2xl font-bold text-white">4. Acceptable Use</h2>
                        </div>
                        <p className="leading-relaxed text-amber-100/80 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                            You agree not to misuse the Service or help anyone else to do so. You must not use the Service to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Subscription & Payment</h2>
                        <p className="leading-relaxed mb-4">
                            Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle").
                        </p>
                        <p className="leading-relaxed">
                            All payments are processed securely. We do not store your full card details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
                        <p className="leading-relaxed">
                            In no event shall AutoCreator, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-slate-800">
                        <p className="text-sm text-slate-500">
                            Create content responsibly. AutoCreator is a tool provided "as is".
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
