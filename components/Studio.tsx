import React, { useState, useEffect } from 'react';
import {
    Wand2, Film, Newspaper, Grid, Video, Clapperboard, LogOut,
    Youtube, FileEdit, Key, CreditCard, Shield, FolderOpen, Headphones, ShieldCheck, Loader2,
    Layout, AlertTriangle
} from 'lucide-react';

// Components
// Components
import Hub from './Hub';
import ShortsCreator from './ShortsCreator';
import LongVideoCreator from './LongVideoCreator';
import TrendingNews from './TrendingNews';
import YoutubeManager from './YoutubeManager';

import AutomationEngine from './AutomationEngine';
import AuthModal from './AuthModal';
import LandingPage from './LandingPage';
import ProfilePage from './ProfilePage';
import BillingPage from './BillingPage';
import SubscriptionGuard from './SubscriptionGuard';
import AdminPanel from './AdminPanel';
import AssetLibrary from './AssetLibrary';
import SupportPage from './SupportPage';
import OnboardingTour from './OnboardingTour';
import CreditDisplay from './CreditDisplay';
import { secureStorage } from '../utils/secureStorage';

import { NewsItem } from '../types';
import { AutomationProvider } from '../contexts/AutomationContext';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useSubscription } from '../contexts/SubscriptionContext';
import ErrorBoundary from './ErrorBoundary';
import { ProjectData } from '../services/projectService';

const Studio: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'hub' | 'dashboard' | 'create' | 'long' | 'news' | 'youtube' | 'profile' | 'library' | 'billing' | 'admin' | 'support'>('hub');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<'Thai' | 'English'>('English');
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

    const [apiKey, setApiKey] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || '';
        }
        return import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || '';
    });
    const [showKeyModal, setShowKeyModal] = useState(false);

    const [ytConnected, setYtConnected] = useState(!!localStorage.getItem('yt_access_token'));
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsRegion, setNewsRegion] = useState<'global' | 'thailand'>('thailand');
    const [apiRequestsToday, setApiRequestsToday] = useState(0);

    const [credits, setCredits] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const stored = secureStorage.getItem('user_credits');
            if (stored && !isNaN(parseInt(stored))) {
                return parseInt(stored);
            }
            return 0;
        }
        return 0;
    });

    const addCredits = (amount: number) => {
        setCredits(prev => {
            const next = prev + amount;
            secureStorage.setItem('user_credits', next.toString());
            return next;
        });
    };

    // Hooks need to be called before any conditional returns
    const { user, loading: authLoading, signOut, checkVerification, sendVerification } = useAuth();
    const { isAdmin } = useAdmin();
    const { isPro, subscription } = useSubscription();

    const deductCredits = (amount: number): boolean => {
        if (isAdmin) return true;
        if (credits < amount) return false;
        setCredits(prev => {
            const next = prev - amount;
            secureStorage.setItem('user_credits', next.toString());
            return next;
        });
        return true;
    };

    useEffect(() => {
        const today = new Date().toDateString();
        if (credits < 20 && localStorage.getItem('low_credit_notified') !== today) {
            // Toast logic
        }

        if (localStorage.getItem('gemini-usage-date') !== today) {
            localStorage.setItem('gemini-usage-date', today);
            localStorage.setItem('gemini-usage-count', '0');
            localStorage.removeItem('low_credit_notified');
            setApiRequestsToday(0);
        } else {
            setApiRequestsToday(parseInt(localStorage.getItem('gemini-usage-count') || '0'));
        }

        if (credits >= 20) {
            localStorage.removeItem('low_credit_notified');
        }

        const handleUsage = () => setApiRequestsToday(prev => {
            const next = prev + 1;
            localStorage.setItem('gemini-usage-count', next.toString());
            return next;
        });
        const handleYtChange = () => setYtConnected(!!localStorage.getItem('yt_access_token'));
        window.addEventListener('gemini-api-usage', handleUsage);
        window.addEventListener('yt-connection-changed', handleYtChange);
        return () => {
            window.removeEventListener('gemini-api-usage', handleUsage);
            window.removeEventListener('yt-connection-changed', handleYtChange);
        };
    }, []);

    // Sync Credits from Firestore
    useEffect(() => {
        if (subscription?.credits !== undefined) {
            if (subscription.credits !== credits) {
                setCredits(subscription.credits);
                secureStorage.setItem('user_credits', subscription.credits.toString());
            }
        }
    }, [subscription?.credits]);

    const handleSetApiKey = (key: string) => {
        setApiKey(key);
        if (typeof window !== 'undefined') {
            localStorage.setItem('gemini_api_key', key);
        }
        setShowKeyModal(false);
    };

    const openKeySelection = () => setShowKeyModal(true);
    const resetKeyStatus = () => setApiKey('');

    const handleOpenProject = (project: ProjectData) => {
        setSelectedProject(project);
        setSelectedTopic(project.topic);
        if (project.config?.language) setSelectedLanguage(project.config.language);

        if (project.type === 'shorts') {
            setActiveTab('create');
        } else if (project.type === 'long') {
            setActiveTab('long');
        }
    };

    const NavItem = ({ id, label, icon: Icon, badge }: { id: any, label: string, icon: any, badge?: boolean }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all duration-300 relative overflow-hidden group/item ${activeTab === id
                ? 'text-purple-700 bg-purple-50 border-l-4 border-purple-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:pl-5'
                } `}
        >
            {activeTab === id && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-50" />
            )}
            <div className="flex items-center gap-3 relative z-10">
                <Icon size={20} className={`transition-colors duration-300 ${activeTab === id ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-slate-500 group-hover/item:text-white'}`} />
                <span className="tracking-wide text-sm">{label}</span>
            </div>
            {badge && <div className={`w-2 h-2 rounded-full ring-2 ring-slate-900 ${ytConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 animate-pulse'} relative z-10`}></div>}
        </button>
    );

    const contextValue: AppContextType = {
        apiKey,
        setApiKey: handleSetApiKey,
        openKeySelection,
        resetKeyStatus,
        hasSelectedKey: !!apiKey,
        credits,
        addCredits,
        deductCredits,
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showApp, setShowApp] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        secureStorage.removeItem('user_credits');
        setCredits(0);
        setApiKey('');
        setShowApp(false);
    };

    useEffect(() => {
        if (user && !authLoading) {
            setShowApp(true);
        }
    }, [user, authLoading]);

    if (authLoading) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Initializing...</p>
            </div>
        );
    }

    if (subscription?.status === 'banned') {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-red-900/10 animate-pulse" />
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 backdrop-blur-xl">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase mb-2">Account Suspended</h1>
                    <p className="text-slate-400 mb-8">
                        Your account has been deactivated due to a violation of our terms of service or suspicious activity.
                    </p>
                    <button onClick={handleSignOut} className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold uppercase tracking-widest transition-colors">Sign Out</button>
                </div>
            </div>
        );
    }

    if (!showApp) {
        return (
            <>
                <LandingPage
                    onEnterApp={() => setShowApp(true)}
                    user={user}
                    language={selectedLanguage}
                    onToggleLanguage={() => setSelectedLanguage(prev => prev === 'Thai' ? 'English' : 'Thai')}
                    onLogin={() => setShowAuthModal(true)}
                    onRegister={() => setShowAuthModal(true)}
                />
                {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            </>
        );
    }

    return (
        <AppContext.Provider value={contextValue}>
            <AutomationProvider apiKey={apiKey}>
                <AutomationEngine apiKey={apiKey} />
                <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
                    {/* Mobile Menu Button */}
                    <div className="md:hidden fixed top-4 right-4 z-[60]">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-slate-800 p-3 rounded-xl text-white shadow-lg border border-slate-700">
                            <Grid size={24} />
                        </button>
                    </div>

                    {/* Mobile Overlay */}
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                    )}

                    <aside className={`md:flex w-72 flex-col fixed inset-y-0 z-50 bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.05)] p-6 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                        <div className="flex items-center gap-3 mb-12 mt-2">
                            <img src="/images/logo_new.png" alt="AutoCreator Logo" className="w-16 h-16 rounded-xl shadow-lg object-cover" />
                            <div><h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">LazyCreator</h1><span className="text-[10px] text-purple-600 font-black tracking-[0.2em] uppercase">AI Factory</span></div>
                        </div>

                        <div className="space-y-1 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <NavItem id="hub" label="Tools Hub" icon={Grid} />

                            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 mt-8">Studio</p>
                            <NavItem id="create" label="Shorts Creator" icon={Wand2} />
                            <NavItem id="long" label="Long Video" icon={Film} />

                            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 mt-8">My Projects</p>

                            <NavItem id="library" label="Asset Library" icon={FolderOpen} />

                            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 mt-8">Intelligence</p>
                            <NavItem id="billing" label="Billing" icon={CreditCard} />
                            <NavItem id="support" label="Support" icon={Headphones} />

                            {isAdmin && (
                                <>
                                    <p className="px-4 text-[10px] font-black text-red-500/80 uppercase tracking-widest mb-4 mt-8">Admin Zone</p>
                                    <NavItem id="admin" label="Admin Control" icon={Shield} />
                                </>
                            )}
                        </div>
                        <div className="space-y-4 pt-6 border-t border-slate-800">
                            <div className="px-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-colors hover:border-slate-300">
                                <button onClick={() => setActiveTab('profile')} className="w-full text-left group/profile flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 shadow-sm relative">
                                        {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 font-black text-sm uppercase">{user?.email?.[0] || 'U'}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${isAdmin ? 'bg-red-100 text-red-600 border-red-200' : isPro ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                                {isAdmin ? 'ADMIN' : isPro ? 'PRO' : 'FREE'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-bold truncate">{user?.displayName || user?.email?.split('@')[0]}</p>
                                    </div>
                                </button>
                                <div className="h-px bg-slate-200 my-3"></div>
                                <button onClick={handleSignOut} className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-500 transition-colors duration-300 w-full pl-1 hover:bg-red-50 rounded-lg py-1.5">
                                    <LogOut size={14} className="opacity-70 group-hover:opacity-100" /> <span className="font-bold tracking-wide">SIGN OUT</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden bg-slate-50">
                        {user && !user.emailVerified && (
                            <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-500/20 p-1.5 rounded-lg"><AlertTriangle size={16} className="text-amber-500" /></div>
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Email Verification Required</span>
                                </div>
                                <button onClick={async () => { try { await useAuth().sendVerification(); alert("Verification email sent!"); } catch (e) { alert("Failed to send email."); } }} className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-3 py-1.5 rounded-lg font-black uppercase">Resend Email</button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto pt-8 px-6 md:pt-12 md:px-12 pb-12 custom-scrollbar">
                            <header className="mb-12 flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-2">
                                        <div className="h-px w-8 bg-purple-500/30"></div>
                                        <span>Engine Mode</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
                                        {activeTab === 'hub' ? 'Home' : activeTab === 'profile' ? 'My Profile' : activeTab === 'admin' ? 'Admin Panel' : activeTab}
                                    </h2>
                                </div>
                            </header>

                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <ErrorBoundary>
                                    {activeTab === 'hub' && <Hub onNavigate={(tab: any) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} />}

                                    {activeTab === 'library' && <AssetLibrary onOpenProject={handleOpenProject} />}
                                    {activeTab === 'billing' && <BillingPage />}
                                    {activeTab === 'profile' && <ProfilePage />}
                                    {activeTab === 'admin' && isAdmin && <AdminPanel />}

                                    {activeTab === 'create' && (
                                        <ShortsCreator
                                            key={selectedProject ? selectedProject.id : 'new-shorts'}
                                            initialTopic={selectedTopic}
                                            initialLanguage={selectedLanguage as any}
                                            initialProject={selectedProject}
                                            apiKey={apiKey}
                                            onNavigate={(tab) => setActiveTab(tab as any)}
                                        />
                                    )}
                                    {activeTab === 'long' && (
                                        <LongVideoCreator
                                            key={selectedProject ? selectedProject.id : 'new-long'}
                                            initialTopic={selectedTopic}
                                            initialLanguage={selectedLanguage as any}
                                            apiKey={apiKey}
                                            initialProject={selectedProject}
                                            onNavigate={(tab) => setActiveTab(tab as any)}
                                        />
                                    )}

                                    {activeTab === 'support' && <SupportPage language={selectedLanguage} />}
                                </ErrorBoundary>
                            </div>
                            {activeTab === 'youtube' && <YoutubeManager />}
                        </div>
                    </main>
                </div>

                {showKeyModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md relative">
                            <button onClick={() => setShowKeyModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">✕</button>
                            <h3 className="text-2xl font-black text-white uppercase mb-2 text-center">Enter Gemini API Key</h3>
                            <input type="password" placeholder="Paste API Key here..." className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white mb-4 outline-none" defaultValue={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                            <button onClick={() => handleSetApiKey(apiKey)} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all">Save & Unlock</button>
                        </div>
                    </div>
                )}

                <OnboardingTour />
                {credits < 20 && credits > 0 && !isAdmin && (
                    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-500">
                        <div className="bg-orange-500/10 border border-orange-500/20 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
                            <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500"><AlertTriangle size={24} /></div>
                            <div className="flex-1"><h4 className="font-bold text-orange-400 text-sm uppercase tracking-wide">Low Balance Warning</h4><p className="text-slate-400 text-xs mt-1">You have only {credits} tokens left.</p></div>
                            <button onClick={() => setActiveTab('billing')} className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors uppercase">Top Up</button>
                        </div>
                    </div>
                )}
            </AutomationProvider>
        </AppContext.Provider>
    );
};

export default Studio;
