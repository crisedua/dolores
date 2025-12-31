'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowRight, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // Typically Supabase requires email verification by default, 
                // we might want to warn the user or just auto-login if disabled.
                alert('Check your email for the confirmation link!');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-[#0F0F0F] border border-[#222] rounded-2xl shadow-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="text-gray-500 text-sm">
                    {isLogin ? 'Enter your details to access your workspace.' : 'Start discovering opportunities today.'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
            </div>

            <div className="mt-8 border-t border-[#222] pt-6">
                <p className="text-xs text-center text-gray-600 mb-4">OR CONTINUE WITH</p>
                <button
                    type="button"
                    className="w-full bg-[#1A1A1A] text-white font-medium py-3 rounded-xl border border-[#333] hover:bg-[#222] transition-colors flex items-center justify-center gap-2"
                    onClick={() => alert("GitHub auth requires additional setup in Supabase dashboard.")}
                >
                    <Github size={20} /> GitHub
                </button>
            </div>
        </div>
    );
}
