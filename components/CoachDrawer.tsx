'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Briefcase, Copy, Check, Send, Sparkles, Loader2, DollarSign, Calendar, Users, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedProblem, OfferBundle, Offer, UserContext } from '@/lib/schemas';
import { useTranslation } from '@/context/LanguageContext';

interface CoachDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    problem: SelectedProblem;
    userContext?: UserContext;
}

export function CoachDrawer({ isOpen, onClose, problem, userContext }: CoachDrawerProps) {
    const [activeTab, setActiveTab] = useState<'chat' | 'offers'>('chat');

    const { t } = useTranslation();
    const coachT = t.coach;

    const [contextCollected, setContextCollected] = useState(false);

    // Manage local user context state, initialized from props but updatable
    const [localUserContext, setLocalUserContext] = useState<UserContext | undefined>(userContext);

    // If we have explicit userContext passed in that seems "complete", skip collection. 
    // For now, checks if we have skills/access.
    const needsContext = !localUserContext?.skills && !localUserContext?.access && !contextCollected;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#0F0F0F] border-l border-[#333] z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#111]">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="text-purple-500" size={20} />
                                    {coachT.title}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm truncate">
                                    {coachT.contextPrefix} {problem.problem_title}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[#222]">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors border-b-2 ${activeTab === 'chat'
                                        ? 'border-purple-500 text-white bg-purple-500/5'
                                        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#161616]'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <MessageSquare size={16} />
                                    {coachT.tabs.chat}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('offers')}
                                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors border-b-2 ${activeTab === 'offers'
                                        ? 'border-blue-500 text-white bg-blue-500/5'
                                        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#161616]'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Briefcase size={16} />
                                    {coachT.tabs.offers}
                                </div>
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative">
                            {needsContext ? (
                                <UserContextForm
                                    onComplete={(ctx) => {
                                        // Update local context state instead of mutating prop
                                        setLocalUserContext(prev => ({ ...prev, ...ctx, language: prev?.language || 'es' }));
                                        setContextCollected(true);
                                    }}
                                />
                            ) : (
                                activeTab === 'chat' ? (
                                    <CoachChat problem={problem} userContext={localUserContext} t={coachT} />
                                ) : (
                                    <CoachOffers problem={problem} userContext={localUserContext} t={coachT} />
                                )
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// --- SUB-COMPONENTS ---

function UserContextForm({ onComplete }: { onComplete: (ctx: { skills: string, access: string }) => void }) {
    const [skills, setSkills] = useState('');
    const [access, setAccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete({ skills, access });
    };

    return (
        <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Target size={32} className="text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Personaliza tu Coach</h3>
            <p className="text-gray-400 mb-8 max-w-sm">
                Para sugerirte mejores negocios, necesito saber un poco sobre ti (opcional).
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
                <div className="text-left">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tus Habilidades (1-2 frases)</label>
                    <textarea
                        value={skills}
                        onChange={e => setSkills(e.target.value)}
                        placeholder="Ej. Soy bueno diseñando logos, escribiendo copy, organizando eventos..."
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors h-24 resize-none"
                    />
                </div>
                <div className="text-left">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">¿A quién tienes acceso? (Industria/Personas)</label>
                    <input
                        type="text"
                        value={access}
                        onChange={e => setAccess(e.target.value)}
                        placeholder="Ej. Médicos, Dueños de restaurantes, Abogados..."
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 mt-4"
                >
                    Comenzar
                </button>
                <button
                    type="button"
                    onClick={() => onComplete({ skills: '', access: '' })}
                    className="text-gray-500 text-xs hover:text-gray-300 transition-colors mt-2"
                >
                    Saltar este paso
                </button>
            </form>
        </div>
    );
}

function CoachChat({ problem, userContext, t }: { problem: SelectedProblem, userContext?: UserContext, t: typeof import('@/lib/translations').translations.en.coach }) {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: t.chat.initialMessage.replace('{title}', problem.problem_title) }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/coach/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMsg }],
                    selectedProblem: problem,
                    userContext
                })
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const reader = response.body?.getReader();
            if (!reader) return;

            // Optimistic assistant message
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = new TextDecoder().decode(value);

                // Parse SSE format (simple implementation)
                // Assuming "data: {content}" lines
                // A better parser is recommended for prod, but this works for basic text chunks
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = line.slice(6);
                            if (data === '[DONE]') break;
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    const lastMsg = newMsgs[newMsgs.length - 1];
                                    if (lastMsg.role === 'assistant') {
                                        lastMsg.content += parsed.content;
                                    }
                                    return newMsgs;
                                });
                            }
                        } catch (e) {
                            console.error('SSE parse error', e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: t.chat.error }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'user'
                                ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100'
                                : 'bg-[#1A1A1A] border border-[#333] text-gray-300'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#1A1A1A] border border-[#333] rounded-2xl p-4 flex gap-2 items-center text-gray-500">
                            <Loader2 size={16} className="animate-spin" />
                            <span>{t.chat.typing}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-[#222] bg-[#111]">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={t.chat.placeholder}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-4 pr-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-700 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
}

function CoachOffers({ problem, userContext, t }: { problem: SelectedProblem, userContext?: UserContext, t: typeof import('@/lib/translations').translations.en.coach }) {
    const [bundle, setBundle] = useState<OfferBundle | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateOffers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/coach/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedProblem: problem, userContext })
            });
            if (!response.ok) throw new Error('Failed to generate offers');
            const data = await response.json();
            setBundle(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!bundle && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-[#0F0F0F] to-[#1A1A1A]">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                    <Briefcase size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t.offers.emptyState.title}</h3>
                <p className="text-gray-400 mb-8 max-w-sm">
                    {t.offers.emptyState.description}
                </p>
                <button
                    onClick={generateOffers}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
                >
                    <Sparkles size={18} />
                    {t.offers.emptyState.button}
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-gray-400 animate-pulse">{t.offers.loading}</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 space-y-6">
            {/* Summary Header */}
            <div className="bg-[#151515] border border-[#222] rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{t.offers.strategyLabel}</h4>
                <p className="text-white font-medium">{bundle?.positioning_statement}</p>
            </div>

            {/* Offers List */}
            {bundle?.offers.map((offer, idx) => (
                <OfferCard key={idx} offer={offer} isRecommended={idx === bundle.recommended_best_offer_index} t={t} />
            ))}

            <div className="h-4" /> {/* Spacer */}
        </div>
    );
}

function OfferCard({ offer, isRecommended, t }: { offer: Offer, isRecommended: boolean, t: typeof import('@/lib/translations').translations.en.coach }) {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className={`rounded-xl border ${isRecommended ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10' : 'border-[#222] bg-[#111]'} overflow-hidden`}>
            {isRecommended && (
                <div className="bg-blue-600 text-white text-[10px] font-bold py-1 px-3 text-center tracking-widest uppercase">
                    {t.offers.recommended}
                </div>
            )}
            <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1">{offer.title}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                    <Target size={12} />
                    {t.offers.target} {offer.ideal_customer}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#222]">
                        <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">{t.offers.price}</div>
                        <div className="text-green-400 font-bold flex items-center gap-1">
                            <DollarSign size={14} />
                            {offer.price_usd.min} - {offer.price_usd.max}
                        </div>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#222]">
                        <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">{t.offers.timeline}</div>
                        <div className="text-gray-200 font-bold flex items-center gap-1">
                            <Calendar size={14} />
                            {offer.timeline_weeks} semanas
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div>
                        <span className="text-xs text-gray-500 font-bold uppercase">{t.offers.promise}</span>
                        <p className="text-sm text-gray-300 italic">&quot;{offer.promise_outcome}&quot;</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 font-bold uppercase">{t.offers.deliverables}</span>
                        <ul className="text-sm text-gray-400 list-disc list-inside">
                            {offer.deliverables.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => copyToClipboard(offer.outreach_message, 'outreach')}
                        className="flex-1 bg-[#222] hover:bg-[#333] border border-[#333] text-gray-300 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {copied === 'outreach' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {t.offers.copyOutreach}
                    </button>
                    <button
                        onClick={() => copyToClipboard(offer.discovery_questions.join('\n'), 'questions')}
                        className="flex-1 bg-[#222] hover:bg-[#333] border border-[#333] text-gray-300 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {copied === 'questions' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {t.offers.copyQuestions}
                    </button>
                </div>
            </div>
        </div>
    );
}
