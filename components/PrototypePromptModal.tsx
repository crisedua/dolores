'use client';
import { useState } from 'react';
import { X, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { Problem } from './ProblemCard';

interface PrototypePromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    problem: Problem;
}

type ToolTab = 'lovable' | 'bolt' | 'antigravity';

const TOOLS: { id: ToolTab; name: string; color: string; description: string }[] = [
    { id: 'lovable', name: 'Lovable', color: 'from-pink-500 to-rose-500', description: 'Beautiful landing pages' },
    { id: 'bolt', name: 'Bolt.new', color: 'from-yellow-500 to-orange-500', description: 'Fast prototyping' },
    { id: 'antigravity', name: 'Antigravity', color: 'from-blue-500 to-purple-500', description: 'AI-powered builds' },
];

export function PrototypePromptModal({ isOpen, onClose, problem }: PrototypePromptModalProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<ToolTab>('lovable');
    const [prompts, setPrompts] = useState<Record<ToolTab, string>>({ lovable: '', bolt: '', antigravity: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedTool, setCopiedTool] = useState<ToolTab | null>(null);
    const [hasGenerated, setHasGenerated] = useState(false);

    const generatePrompts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: problem.description,
                    persona: problem.persona,
                    urgencySignals: problem.urgencySignals,
                    mvpIdeas: problem.mvpIdeas,
                    existingSolutions: problem.existingSolutions
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate prompts');
            }

            const data = await response.json();
            setPrompts({
                lovable: data.prompts.lovable,
                bolt: data.prompts.bolt,
                antigravity: data.prompts.antigravity
            });
            setHasGenerated(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error generating prompts');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (tool: ToolTab) => {
        try {
            await navigator.clipboard.writeText(prompts[tool]);
            setCopiedTool(tool);
            setTimeout(() => setCopiedTool(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleOpen = () => {
        if (!hasGenerated && !isLoading) {
            generatePrompts();
        }
    };

    // Generate on first open
    if (isOpen && !hasGenerated && !isLoading && !error) {
        handleOpen();
    }

    if (!isOpen) return null;

    const prototypePromptsT = (t as any).prototypePrompts || {
        modalTitle: 'Prototype Prompt Generator',
        helperText: 'Copy one of these prompts into your preferred no-code AI tool to create a simple prototype for validation.',
        copyPrompt: 'Copy Prompt',
        copied: 'Copied!',
        generating: 'Generating personalized prompts...'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#222]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {prototypePromptsT.modalTitle}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5 max-w-md">
                                {prototypePromptsT.helperText}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-4 border-b border-[#222] overflow-x-auto">
                    {TOOLS.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTab(tool.id)}
                            className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tool.id
                                    ? `bg-gradient-to-r ${tool.color} text-white shadow-lg`
                                    : 'bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-[#222]'
                                }`}
                        >
                            {tool.name}
                            <span className={`text-xs ${activeTab === tool.id ? 'text-white/70' : 'text-gray-600'}`}>
                                {tool.description}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Loader2 size={40} className="text-purple-500 animate-spin" />
                            <p className="text-gray-400">{prototypePromptsT.generating}</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={generatePrompts}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Problem context */}
                            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 mb-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Problem</p>
                                <p className="text-gray-300 text-sm">{problem.description}</p>
                                {problem.persona && (
                                    <p className="text-gray-500 text-xs mt-2">Target: {problem.persona}</p>
                                )}
                            </div>

                            {/* Prompt display */}
                            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#111]">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                                        Prompt for {TOOLS.find(t => t.id === activeTab)?.name}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(activeTab)}
                                        disabled={!prompts[activeTab]}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222] text-gray-300 hover:text-white transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {copiedTool === activeTab ? (
                                            <>
                                                <Check size={14} className="text-green-500" />
                                                {prototypePromptsT.copied}
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                {prototypePromptsT.copyPrompt}
                                            </>
                                        )}
                                    </button>
                                </div>
                                <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-y-auto">
                                    {prompts[activeTab] || 'No prompt generated yet...'}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
