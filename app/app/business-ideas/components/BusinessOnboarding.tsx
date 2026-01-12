'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { useTranslation } from '@/context/LanguageContext';
import { UserContext } from '@/lib/schemas';
import { Check, ChevronRight, MapPin, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

interface BusinessOnboardingProps {
    onComplete: (context: UserContext) => void;
}

export function BusinessOnboarding({ onComplete }: BusinessOnboardingProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [country, setCountry] = useState('');
    const [situation, setSituation] = useState<UserContext['situation'] | null>(null);

    const handleNext = () => {
        if (step === 1 && country) setStep(2);
        else if (step === 2 && situation) {
            onComplete({
                language: 'es', // Default assumption, can be dynamic
                country,
                situation: situation,
                skills: '', // Collected later or inferred
                access: ''
            });
        }
    };

    const countries = [
        "Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica", "Ecuador",
        "El Salvador", "España", "Guatemala", "Honduras", "México", "Nicaragua",
        "Panamá", "Paraguay", "Perú", "República Dominicana", "Uruguay", "Venezuela"
    ];

    const situations = [
        {
            id: 'no_ideas',
            icon: <Lightbulb className="text-yellow-500" />,
            title: t.businessIdeas.situations.no_ideas.title,
            desc: t.businessIdeas.situations.no_ideas.desc
        },
        {
            id: 'too_many',
            icon: <TrendingUp className="text-blue-500" />,
            title: t.businessIdeas.situations.too_many.title,
            desc: t.businessIdeas.situations.too_many.desc
        },
        {
            id: 'stuck_low_ticket',
            icon: <AlertCircle className="text-red-500" />,
            title: t.businessIdeas.situations.stuck_low_ticket.title,
            desc: t.businessIdeas.situations.stuck_low_ticket.desc
        }
    ] as const;

    return (
        <div className="min-h-full flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.businessIdeas.title}</h1>
                <p className="text-gray-500">{t.businessIdeas.subtitle}</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-12">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <div className={`w-16 h-0.5 bg-gray-200`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-200 text-gray-500`}>3</div>
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-2xl"
            >
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {t.businessIdeas.steps.location}
                        </h2>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            >
                                <option value="">Selecciona tu país</option>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleNext}
                                disabled={!country}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                Siguiente <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {t.businessIdeas.steps.situation}
                        </h2>
                        <div className="space-y-3">
                            {situations.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSituation(s.id)}

                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${situation === s.id
                                        ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500/20'
                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${situation === s.id ? 'bg-white' : 'bg-gray-100'}`}>
                                        {s.icon}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{s.title}</div>
                                        <div className="text-sm text-gray-500">{s.desc}</div>
                                    </div>
                                    {situation === s.id && (
                                        <div className="ml-auto text-blue-600">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="text-gray-500 font-medium hover:text-gray-900 px-4"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!situation}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                Siguiente <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
