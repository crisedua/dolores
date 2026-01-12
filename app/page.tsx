'use client';
import Link from 'next/link';
import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Search,
    TrendingUp,
    MessageSquare,
    Zap,
    ArrowRight,
    CheckCircle2,
    Gem,
    Target,
    Lightbulb,
    Users,
    Sparkles,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { useTranslation } from '@/context/LanguageContext';

function LandingContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language, setLanguage } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Removal of auto-redirect to allow logged-in users to choose between tools on the landing page
    /* 
    useEffect(() => {
        if (!isLoading && user) {
            const next = searchParams.get('next') || '/app';
            router.push(next);
        }
    }, [user, isLoading, router, searchParams]);
    */



    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/20">
                            <Gem size={18} />
                        </div>
                        <span className="font-bold text-lg text-white">Veta</span>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-medium tracking-wide">BETA</span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-md border border-white/10">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setLanguage('es')}
                                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${language === 'es' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Español
                            </button>
                        </div>
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href={user ? "/app" : "/auth?next=/app"}
                                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                {t.landing.nav.discover}
                            </Link>
                            <Link
                                href={user ? "/app/business-ideas" : "/auth?next=/app/business-ideas"}
                                className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5"
                            >
                                {t.landing.nav.businessAdvisor}
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold tracking-wide">NEW</span>
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                {t.landing.nav.pricing}
                            </Link>
                            <Link
                                href={user ? "/app" : "/auth?next=/app"}
                                className="bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all text-sm shadow-lg shadow-white/5"
                            >
                                {user ? t.landing.nav.dashboard : t.landing.nav.login}
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-gray-400 hover:text-white p-2"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-200">
                            <Link
                                href={user ? "/app" : "/auth?next=/app"}
                                className="text-xl font-bold text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t.landing.nav.discover}
                            </Link>
                            <Link
                                href={user ? "/app/business-ideas" : "/auth?next=/app/business-ideas"}
                                className="text-xl font-bold text-white flex items-center gap-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t.landing.nav.businessAdvisor}
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold tracking-wide">NEW</span>
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-xl font-bold text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t.landing.nav.pricing}
                            </Link>
                            <Link
                                href={user ? "/app" : "/auth?next=/app"}
                                className="bg-white text-black px-6 py-4 rounded-xl font-bold text-center"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {user ? t.landing.nav.dashboard : t.landing.nav.login}
                            </Link>
                            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${language === 'en' ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 text-gray-400'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${language === 'es' ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 text-gray-400'}`}
                                >
                                    Español
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>


            {/* SECTION — Dos herramientas, un solo objetivo */}
            <section className="py-24 px-6 bg-[#080808]/50 border-y border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {t.landing.tools.title}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        {/* Tool 1 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 flex flex-col hover:border-blue-500/30 transition-colors group">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                {t.landing.tools.tool1.title}
                            </h3>
                            <p className="text-gray-400 mb-8 flex-grow">
                                {t.landing.tools.tool1.desc}
                            </p>
                            <ul className="space-y-4 mb-8">
                                {t.landing.tools.tool1.points.map((point: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                                        <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        </div>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={user ? "/app" : "/auth?next=/app"}
                                className="w-full py-4 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-extrabold hover:bg-white hover:text-black transition-all text-center flex items-center justify-center gap-2"
                            >
                                <Search size={18} />
                                {t.landing.hero.ctaPain}
                            </Link>
                        </div>

                        {/* Tool 2 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 flex flex-col hover:border-purple-500/30 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[60px] pointer-events-none" />
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                {t.landing.tools.tool2.title}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {t.landing.tools.tool2.desc}
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                                <p className="text-sm font-semibold text-purple-400 mb-4">{t.landing.tools.tool2.header}</p>
                                <ul className="space-y-3">
                                    {t.landing.tools.tool2.points.map((point: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                                            <CheckCircle2 size={14} className="text-purple-500 shrink-0 mt-0.5" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href={user ? "/app/business-ideas" : "/auth?next=/app/business-ideas"}
                                className="w-full py-4 px-6 rounded-xl bg-purple-600 text-white font-extrabold hover:bg-purple-700 transition-all text-center shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
                            >
                                <Sparkles size={18} />
                                {t.landing.hero.ctaAdvisor}
                            </Link>
                        </div>
                    </div>

                    <p className="text-center text-gray-600 text-sm mt-12 italic">
                        {t.landing.tools.footer}
                    </p>
                </div>
            </section>

            {/* SECTION — Cómo funciona (ultra simple) */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white">{t.landing.howItWorks.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                        <Link
                            href={user ? "/app" : "/auth?next=/app"}
                            className="relative text-center group cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:border-blue-500/50 transition-colors bg-[#0A0A0A] z-10 relative">
                                <span className="text-xl font-bold text-white">1</span>
                            </div>
                            <p className="text-gray-300 font-medium group-hover:text-white transition-colors">{t.landing.howItWorks.step1}</p>
                        </Link>

                        <div className="relative text-center">
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#0A0A0A] z-10 relative">
                                <span className="text-xl font-bold text-white">2</span>
                            </div>
                            <p className="text-gray-300 font-medium">{t.landing.howItWorks.step2}</p>
                        </div>

                        <Link
                            href={user ? "/app/business-ideas" : "/auth?next=/app/business-ideas"}
                            className="relative text-center group cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:border-purple-500/50 transition-colors bg-[#0A0A0A] z-10 relative">
                                <span className="text-xl font-bold text-white">3</span>
                            </div>
                            <p className="text-gray-300 font-medium group-hover:text-white transition-colors">{t.landing.howItWorks.step3}</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5 mt-20">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white font-bold flex items-center justify-center rounded text-xs">
                            <Gem size={14} />
                        </div>
                        <span className="font-semibold text-white">Veta</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        {t.landing.footer.tagline}
                    </p>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <WhatsAppButton />
        </div>
    );
}

export default function LandingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        }>
            <LandingContent />
        </Suspense>
    );
}
