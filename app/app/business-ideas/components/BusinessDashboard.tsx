import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { UserContext, SelectedProblem, OfferBundle } from '@/lib/schemas';
import { Send, Loader2, Briefcase, Sparkles, Target, DollarSign, Calendar, Copy } from 'lucide-react';

interface BusinessDashboardProps {
    userContext: UserContext;
}

export function BusinessDashboard({ userContext }: BusinessDashboardProps) {
    const { t } = useTranslation();
    // Initialize with a default or empty problem
    const [problem, setProblem] = useState<SelectedProblem>({
        id: 'manual-entry',
        problem_title: '',
        core_pain: '',
        who_has_it: '',
        financial_impact: '',
        evidence_summary: '',
        market_scope: 'local_latam',
        country: userContext.country
    });

    // Update problem title handler
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProblem(prev => ({ ...prev, problem_title: e.target.value, core_pain: e.target.value }));
    };


    const effectiveProblem: SelectedProblem = problem;

    return (
        <div className="flex h-full gap-6 p-6 bg-gray-50 text-gray-900">
            {/* Left: Chat */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-white space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">{t.businessIdeas.dashboard.title}</h2>
                            <p className="text-xs text-gray-500">{userContext.country}</p>
                        </div>
                    </div>
                    {/* Manual Problem Input */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                            {userContext.situation === 'no_ideas' ? 'Topic / Interest' : 'Business Idea / Problem'}
                        </label>
                        <input
                            type="text"
                            value={problem.problem_title}
                            onChange={handleTitleChange}
                            placeholder={userContext.situation === 'no_ideas' ? "E.g. Artificial Intelligence, Gyms..." : "Start typing your problem or idea here..."}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <BusinessChat
                        userContext={userContext}
                        problem={effectiveProblem}
                    />
                </div>
            </div>

            {/* Right: Offers/Dashboard */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase size={18} className="text-gray-400" />
                        {t.businessIdeas.dashboard.offersTitle}
                    </h2>
                </div>
                <div className="flex-1 overflow-hidden p-6">
                    <BusinessOffers
                        userContext={userContext}
                        problem={effectiveProblem}
                    />
                </div>
            </div>
        </div>
    );
}

// --- Sub-components adapted for Light Theme & Business Flow ---

function BusinessChat({ userContext, problem }: { userContext: UserContext, problem: SelectedProblem }) {
    const { t } = useTranslation();
    // Custom initial message based on situation
    const getInitialMessage = () => {
        const sit = userContext.situation;
        const country = userContext.country;
        if (sit === 'no_ideas') return `¡Hola! Soy tu Business Coach. Veo que estás en **${country}** y buscas inspiración. ¿Qué habilidades tienes o qué temas te apasionan?`;
        if (sit === 'too_many') return `¡Hola! Soy tu Business Coach. Veo que estás en **${country}** con muchas ideas. Cuéntame brevemente cuáles son las 3 principales para ayudarte a filtrar.`;
        if (sit === 'stuck_low_ticket') return `¡Hola! Soy tu Business Coach. Veo que estás en **${country}** pero te sientes estancado. ¿Qué vendes actualmente y a qué precio?`;
        return `Hola! Estoy aquí para ayudarte a diseñar tu oferta High-Ticket en **${country}**.`;
    };

    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: getInitialMessage() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => scrollToBottom(), [messages]);

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

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = new TextDecoder().decode(value);
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
                                    if (lastMsg.role === 'assistant') lastMsg.content += parsed.content;
                                    return newMsgs;
                                });
                            }
                        } catch (e) { console.error(e); }
                    }
                }
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: t.coach.chat.error }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${m.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                            }`}>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl p-4 flex gap-2 items-center text-gray-500 text-sm">
                            <Loader2 size={14} className="animate-spin" />
                            <span>{t.coach.chat.typing}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Escribe tu duda estratégica..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
}

function BusinessOffers({ userContext, problem }: { userContext: UserContext, problem: SelectedProblem }) {
    const { t } = useTranslation();
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
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setBundle(data);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    if (!bundle && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t.businessIdeas.dashboard.emptyOffers}</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">{t.businessIdeas.dashboard.emptyOffersDesc}</p>
                <button
                    onClick={generateOffers}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                    <Sparkles size={18} />
                    {t.businessIdeas.dashboard.generateBtn}
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
                <p className="text-gray-500 text-sm animate-pulse">{t.coach.offers.loading}</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto space-y-6 pr-2">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{t.coach.offers.strategyLabel}</h4>
                <p className="text-gray-900 font-medium text-sm">{bundle?.positioning_statement}</p>
            </div>

            {bundle?.offers.map((offer, idx) => (
                <div key={idx} className={`rounded-xl border ${idx === bundle.recommended_best_offer_index ? 'border-blue-200 bg-white shadow-md ring-1 ring-blue-100' : 'border-gray-200 bg-white'} overflow-hidden`}>
                    {idx === bundle.recommended_best_offer_index && (
                        <div className="bg-blue-600 text-white text-[10px] font-bold py-1 px-3 text-center tracking-widest uppercase">
                            {t.coach.offers.recommended}
                        </div>
                    )}
                    <div className="p-5">
                        <h3 className="text-base font-bold text-gray-900 mb-1">{offer.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                            <Target size={12} />
                            {offer.ideal_customer}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">{t.coach.offers.price}</div>
                                <div className="text-green-600 font-bold flex items-center gap-1 text-sm">
                                    <DollarSign size={12} />
                                    {offer.price_usd.min} - {offer.price_usd.max}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">{t.coach.offers.timeline}</div>
                                <div className="text-gray-700 font-bold flex items-center gap-1 text-sm">
                                    <Calendar size={12} />
                                    {offer.timeline_weeks} wks
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-100">
                                &quot;{offer.promise_outcome}&quot;
                            </p>
                            <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                                {offer.deliverables.slice(0, 3).map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                        </div>

                        <button
                            onClick={() => navigator.clipboard.writeText(offer.outreach_message)}
                            className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy size={12} /> {t.coach.offers.copyOutreach}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
