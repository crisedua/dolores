'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { useTranslation } from '@/context/LanguageContext';

export default function LandingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { t, language, setLanguage } = useTranslation();

    // Redirect logged-in users to the app
    useEffect(() => {
        if (!isLoading && user) {
            router.push('/app');
        }
    }, [user, isLoading, router]);



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
                        {/*                         <Link
                            href="/workshop"
                            className="text-amber-400 hover:text-amber-300 transition-colors text-sm md:text-base font-medium"
                        >
                            🎓 Workshop
                        </Link> */}
                        <Link
                            href="/pricing"
                            className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                        >
                            {t.landing.nav.pricing}
                        </Link>
                        {user ? (
                            <Link
                                href="/app"
                                className="bg-white text-black px-4 py-1.5 md:px-5 md:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
                            >
                                {t.landing.nav.dashboard}
                            </Link>
                        ) : (
                            <Link
                                href="/auth"
                                className="bg-white text-black px-4 py-1.5 md:px-5 md:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
                            >
                                {t.landing.nav.login}
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
                        <Zap size={14} className="text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">{t.landing.hero.badge}</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {t.landing.hero.title1}
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {t.landing.hero.title2}
                        </span>
                        <br />
                        <span className="text-2xl md:text-3xl text-gray-200">
                            {t.landing.hero.title3}
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                        {t.landing.hero.description}
                    </p>

                    {/* Bullets */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-sm text-gray-300 mb-12">
                        {t.landing.hero.bullets.map((bullet: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span>{bullet}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href={user ? "/app" : "/auth"}
                            className="group bg-white text-black px-6 py-3 rounded-lg font-semibold text-base hover:bg-gray-100 transition-all flex items-center gap-2"
                        >
                            {t.landing.hero.cta}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Demo Preview */}
                    <div className="relative max-w-4xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
                        <div className="relative bg-[#111] border border-[#333] rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#222]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Search size={18} className="text-gray-500" />
                                    <span className="text-gray-400 font-medium">{t.landing.demo.search}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-[#1A1A1A] rounded-lg p-4 border-l-4 border-blue-500 text-left">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white font-medium">{t.landing.demo.problem1}</span>
                                            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">{t.landing.demo.priority}</span>
                                        </div>
                                        <p className="text-sm text-gray-400">{t.landing.demo.problem1Desc}</p>
                                    </div>
                                    <div className="bg-[#1A1A1A] rounded-lg p-4 border-l-4 border-blue-400 text-left">
                                        <span className="text-white font-medium">{t.landing.demo.problem2}</span>
                                    </div>
                                    <div className="bg-[#1A1A1A] rounded-lg p-4 border-l-4 border-blue-300 text-left">
                                        <span className="text-white font-medium">{t.landing.demo.problem3}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-y border-white/5">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">10K+</div>
                        <div className="text-gray-500 text-sm">{t.landing.stats.threads}</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">15+</div>
                        <div className="text-gray-500 text-sm">{t.landing.stats.problems}</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">30s</div>
                        <div className="text-gray-500 text-sm">{t.landing.stats.time}</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">100%</div>
                        <div className="text-gray-500 text-sm">{t.landing.stats.verified}</div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="como-funciona" className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing.howItWorks.title}</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {t.landing.howItWorks.subtitle}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative group hover:border-blue-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">1</div>
                            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                <Search size={28} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t.landing.howItWorks.step1.title}</h3>
                            <p className="text-gray-400">
                                {t.landing.howItWorks.step1.desc}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative group hover:border-purple-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">2</div>
                            <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                                <MessageSquare size={28} className="text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t.landing.howItWorks.step2.title}</h3>
                            <p className="text-gray-400">
                                {t.landing.howItWorks.step2.desc}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative group hover:border-pink-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center font-bold text-white">3</div>
                            <div className="w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6">
                                <TrendingUp size={28} className="text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{t.landing.howItWorks.step3.title}</h3>
                            <p className="text-gray-400">
                                {t.landing.howItWorks.step3.desc}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 bg-[#080808]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing.features.title}</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {t.landing.features.subtitle}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <CheckCircle2 size={24} className="text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{t.landing.features.f1.title}</h3>
                                <p className="text-gray-400 text-sm">{t.landing.features.f1.desc}</p>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <Target size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{t.landing.features.f2.title}</h3>
                                <p className="text-gray-400 text-sm">{t.landing.features.f2.desc}</p>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <Lightbulb size={24} className="text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{t.landing.features.f3.title}</h3>
                                <p className="text-gray-400 text-sm">{t.landing.features.f3.desc}</p>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <Users size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{t.landing.features.f4.title}</h3>
                                <p className="text-gray-400 text-sm">{t.landing.features.f4.desc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        {t.landing.finalCta.title1}
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {t.landing.finalCta.title2}
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-10">
                        {t.landing.finalCta.description}
                    </p>
                    <Link
                        href={user ? "/app" : "/auth"}
                        className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
                    >
                        {t.landing.finalCta.button}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5">
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
