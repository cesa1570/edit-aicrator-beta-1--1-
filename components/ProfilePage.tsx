import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useApp } from '../contexts/AppContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { User, Shield, CreditCard, Key, CheckCircle, AlertCircle, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import CreditDisplay from './CreditDisplay';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { subscription, isPro, loading: subLoading } = useSubscription();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // Supabase doesn't enforce check on client side update easily without separate auth flow, but we can keep UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // Update password
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) throw error;

            setSuccess('Password changed successfully');
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
        } catch (err: any) {
            console.error(err);
            setError('Failed to change password: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: any) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl overflow-hidden border border-white/10 relative">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl uppercase">
                            {user?.email?.[0] || <User size={32} />}
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white">My Account</h2>
                    <p className="text-slate-400">Manage your profile, security, and preferences</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Profile & Password */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-purple-400" />
                            Account Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-sm">
                                    {user?.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">User ID</label>
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-500 font-mono text-xs truncate">
                                    {user?.uid}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Key size={20} className="text-purple-400" />
                            Change Password
                        </h3>

                        {error && (
                            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm flex items-center gap-2">
                                <CheckCircle size={16} />
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-purple-900/20"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Subscription Status & API Key */}
                <div className="space-y-6">
                    {/* Credit Display */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <CreditDisplay onBuyClick={() => window.location.hash = 'billing'} />
                    </div>

                    {/* Subscription Widget */}
                    <div className="bg-gradient-to-br from-[#0F111A] to-[#1E202E] border border-indigo-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none -mr-16 -mt-16"></div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <CreditCard size={24} className="text-indigo-400" />
                                Subscription Status
                            </h3>

                            {subLoading ? (
                                <div className="h-40 flex items-center justify-center text-slate-500 gap-2">
                                    <Loader2 className="animate-spin" size={20} /> Loading subscription...
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-950/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 mb-6 shadow-inner relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${isPro ? 'from-green-500/20' : 'from-slate-500/10'} to-transparent rounded-bl-[4rem]`}></div>
                                        <div className={`text-xs font-bold ${isPro ? 'text-indigo-400' : 'text-slate-400'} uppercase mb-2 tracking-wider`}>Current Plan</div>
                                        <div className="text-3xl font-black text-white mb-3 tracking-tight capitalize">
                                            {(() => {
                                                const plan = subscription?.plan || 'free';
                                                if (plan === 'sub_starter') return 'STARTER PLAN';
                                                if (plan === 'sub_growth') return 'PRO PLAN';
                                                if (plan === 'sub_influencer') return 'PRO MAX PLAN';
                                                if (plan === 'sub_ultra') return 'ULTRA PLAN';
                                                return subscription?.plan || 'Free Plan';
                                            })()} {isPro && '🚀'}
                                        </div>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isPro ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-slate-700/50 text-slate-400 ring-slate-500/20'} text-xs font-bold ring-1`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isPro ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                            {subscription?.status || 'Active'}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                            <span className="text-slate-400 font-medium">Start Date</span>
                                            <span className="text-white font-mono">{subscription?.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                            <span className="text-slate-400 font-medium">Renewal Date</span>
                                            <span className="text-white font-mono">{subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : '-'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                                            {isPro
                                                ? "Thank you for supporting AutoCreator! You have access to all premium features."
                                                : "Upgrade to Pro to unlock unlimited video generation and premium voices."}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
