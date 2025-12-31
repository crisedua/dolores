'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface HeroInputProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

export function HeroInput({ onSearch, isLoading }: HeroInputProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
    };

    return (
        <div className="w-full max-w-3xl mx-auto mb-20 px-4 text-center">
            {/* Glow Effect Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none -z-10" />

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                Find Problems <br />
                <span className="text-gray-400">Worth Solving</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                Stop guessing. Analyze real complaints, frustrations, and emerging patterns from across the web. Get validated proof for your next venture.
            </p>

            <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
                {/* Input Container */}
                <div className="relative group">
                    {/* Subtle border glow on hover/focus */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-focus-within:opacity-100 group-focus-within:duration-200`} />

                    <div className="relative flex items-center bg-[#0F0F0F] rounded-2xl p-2 pl-6 shadow-2xl">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. ai tools"
                            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-gray-600 h-12"
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !query}
                            className="ml-2 bg-[#222] hover:bg-[#333] text-gray-300 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/5 active:scale-95"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin text-purple-500" size={18} />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <span>Analyze</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Popular Tags */}
            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500 font-medium">
                <span className="tracking-widest text-[10px] uppercase text-gray-600">Popular:</span>
                <button onClick={() => setQuery("Shopify Apps")} className="hover:text-purple-400 transition-colors">Shopify Apps</button>
                <span className="text-gray-700">•</span>
                <button onClick={() => setQuery("Real Estate")} className="hover:text-purple-400 transition-colors">Real Estate</button>
                <span className="text-gray-700">•</span>
                <button onClick={() => setQuery("Legal Tech")} className="hover:text-purple-400 transition-colors">Legal Tech</button>
            </div>
        </div>
    );
}
