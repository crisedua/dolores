'use client';
import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

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

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight leading-tight">
                Deja de adivinar ideas. <br />
                <span className="text-gray-400">Encuentra problemas reales.</span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
                Escribe un nicho. Obtén un reporte clasificado de puntos de dolor con pruebas, quién los tiene y un plan de construcción no-code de 7 días.
            </p>

            {/* Bullets */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-10">
                <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> Quejas reales (no corazonadas)
                </div>
                <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> Puntuado por urgencia
                </div>
                <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" /> Plan MVP + 1ros Clientes
                </div>
            </div>

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
                            placeholder="ej. herramientas ia"
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
                                    <span>Analizando...</span>
                                </>
                            ) : (
                                <span>Analizar</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Example Searches - User-Friendly Guidance */}
            <div className="mt-10 max-w-3xl mx-auto">
                {/* Guidance Text */}
                <p className="text-center text-xs text-gray-400 mb-6 font-medium">
                    💡 <span className="text-gray-200 font-bold">Tip:</span> Piensa en un grupo de personas o industria que conozcas bien. ¿Qué les frustra?
                </p>

                {/* Category: Professionals */}
                <div className="mb-6">
                    <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 text-center">👔 Profesionales</span>
                    <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => setQuery("problemas de freelancers")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Freelancers</button>
                        <button onClick={() => setQuery("frustaciones de dentistas")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Dentistas</button>
                        <button onClick={() => setQuery("quejas de contadores")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Contadores</button>
                        <button onClick={() => setQuery("problemas de agentes inmobiliarios")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Agentes Inmobiliarios</button>
                    </div>
                </div>

                {/* Category: Small Business */}
                <div className="mb-6">
                    <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 text-center">🏪 Negocios Pequeños</span>
                    <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => setQuery("problemas de dueños de restaurantes")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Restaurantes</button>
                        <button onClick={() => setQuery("frustraciones de tiendas online")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">E-commerce</button>
                        <button onClick={() => setQuery("quejas de gimnasios")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Gimnasios</button>
                        <button onClick={() => setQuery("problemas de clínicas veterinarias")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Veterinarias</button>
                    </div>
                </div>

                {/* Category: Lifestyle */}
                <div className="mb-6">
                    <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 text-center">🎯 Nichos de Vida</span>
                    <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => setQuery("problemas de padres que trabajan desde casa")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Padres Remotos</button>
                        <button onClick={() => setQuery("frustraciones de nómadas digitales")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Nómadas Digitales</button>
                        <button onClick={() => setQuery("quejas de estudiantes universitarios")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Estudiantes</button>
                        <button onClick={() => setQuery("problemas de creadores de contenido")} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs hover:border-purple-500 hover:text-purple-400 transition-all hover:bg-[#222]">Creadores</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
