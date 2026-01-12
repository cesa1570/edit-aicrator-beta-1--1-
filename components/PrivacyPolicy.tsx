import React from 'react';
import { Shield, Lock, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <Shield className="text-indigo-500" />
                        <span className="font-bold text-white">AutoCreator Privacy</span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Privacy Policy</h1>
                    <p className="text-lg text-slate-400">Last updated: January 2026</p>
                </div>

                <div className="space-y-12 bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-800">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Lock size={24} /></div>
                            <h2 className="text-2xl font-bold text-white">1. Data Collection</h2>
                        </div>
                        <p className="leading-relaxed mb-4">
                            We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, request customer support, or otherwise communicate with us. The types of information we may collect include your name, email address, payment information, and any other information you choose to provide.
                        </p>
                        <p className="leading-relaxed">
                            When you use our AI services, we temporarily process your inputs (images, text) to generate content. We do not use your personal content to train our public AI models without your explicit consent.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><FileText size={24} /></div>
                            <h2 className="text-2xl font-bold text-white">2. Usage of Information</h2>
                        </div>
                        <p className="leading-relaxed">
                            We use the information we collect to operate, maintain, and improve our services, such as:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-indigo-500">
                            <li>To provide and deliver the products and services you request.</li>
                            <li>To process transactions and send you related information, including confirmations and invoices.</li>
                            <li>To send you technical notices, updates, security alerts, and support and administrative messages.</li>
                            <li>To monitor and analyze trends, usage, and activities in connection with our Services.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><Shield size={24} /></div>
                            <h2 className="text-2xl font-bold text-white">3. Data Security</h2>
                        </div>
                        <p className="leading-relaxed">
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Your payment information is processed securely by Stripe and is never stored on our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@autocreator.ai" className="text-indigo-400 hover:underline">support@autocreator.ai</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
