import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    onClose?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const { signIn, signUp, signInWithGoogle, loading } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (mode === 'register' && password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            if (mode === 'login') {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
            onClose?.();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            await signInWithGoogle();
            onClose?.();
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(139,92,246,0.15)] w-full max-w-md relative overflow-hidden">

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none -ml-10 -mb-10"></div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full z-10"
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                    <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl ring-1 ring-white/10 overflow-hidden bg-slate-900">
                        <img src="/images/logo_new.png" alt="AutoCreator Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                        {mode === 'login' ? 'Welcome Back' : 'Join the Future'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {mode === 'login'
                            ? 'Sign in to access your creative studio'
                            : 'Create free account to start generating'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold flex items-center justify-center gap-3 transition-all mb-6 disabled:opacity-50 relative z-10 group"
                >
                    <Chrome size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">OR USING EMAIL</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="group relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 pl-12 text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-slate-900 transition-all font-medium"
                        />
                    </div>

                    <div className="group relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 pl-12 text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-slate-900 transition-all font-medium"
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="group relative animate-in fade-in slide-in-from-top-4 duration-300">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 pl-12 text-white placeholder:text-slate-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-slate-900 transition-all font-medium"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.6)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Processing...
                            </>
                        ) : (
                            mode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Toggle Mode */}
                <div className="text-center mt-6 relative z-10">
                    <p className="text-slate-400 text-sm">
                        {mode === 'login' ? "New to AutoCreator? " : "Already have an account? "}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-white hover:text-purple-300 font-bold transition-colors underline decoration-purple-500/30 hover:decoration-purple-400 underline-offset-4"
                        >
                            {mode === 'login' ? 'Create Account' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
