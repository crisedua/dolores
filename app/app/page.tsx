/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroInput } from '@/components/HeroInput';
import { SearchProgress, ProgressStep } from '@/components/SearchProgress';
import { ProblemCard } from '@/components/ProblemCard';
import { Bell, Search, Calendar, Save, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';

// Wrapper component to handle useSearchParams with Suspense
function HomeContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchSteps, setSearchSteps] = useState<ProgressStep[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [reportSaved, setReportSaved] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const { usage, incrementUsage } = useSubscription();
  const searchParams = useSearchParams();

  // Handle URL query parameter for templates/history
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !isLoading && !data) {
      handleSearch(q);
    }
  }, [searchParams]);

  // Save search to history
  const saveToHistory = async (query: string, result_count: number) => {
    if (!user) return;
    try {
      await supabase.from('search_history').insert({
        user_id: user.id,
        query,
        result_count
      });
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  // Save current results as a report
  const saveReport = async () => {
    if (!data || !currentQuery || !user) return;
    try {
      const { error } = await supabase.from('saved_reports').insert({
        user_id: user.id,
        title: `Análisis: ${currentQuery}`,
        query: currentQuery,
        problem_count: data.problems?.length || 0,
        results: data
      });

      if (error) throw error;

      setReportSaved(true);
      setTimeout(() => setReportSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save report:', e);
    }
  };

  const handleSearch = async (query: string) => {
    // Check if user can search
    if (!usage.canSearch) {
      setShowUpgradeModal(true);
      return;
    }

    console.log("Starting search for:", query);
    setIsLoading(true);
    setSearchSteps([]);
    setData(null);
    setCurrentQuery(query);
    setReportSaved(false);

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`API Error ${response.status}: ${errorText.substring(0, 100)}`);
        return;
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // If the last character isn't a newline, the last element of the split 
        // will be a partial JSON string. Pop it and keep it in the buffer.
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const update = JSON.parse(line);
            console.log("Stream update:", update); // Debug log

            if (update.type === 'progress') {
              setSearchSteps(prev => {
                const exists = prev.find(p => p.label === update.step);
                if (exists) {
                  return prev.map(p => p.label === update.step ? { ...p, status: update.status } : p);
                }
                return [...prev, { id: Math.random().toString(), label: update.step, status: update.status }];
              });
            }

            if (update.type === 'error') {
              console.error("Stream Error:", update.error);
              setSearchSteps(prev => [...prev, { id: 'err', label: `Error: ${update.error}`, status: 'completed' }]);
              return;
            }

            if (update.type === 'result') {
              await new Promise(r => setTimeout(r, 500));
              console.log("Got results:", update.data);
              setData(update.data);

              // Increment usage count for free users
              await incrementUsage();

              // Auto-save to history (with error handling)
              saveToHistory(query, update.data.problems?.length || 0).catch(err => {
                console.error('Failed to save search history:', err);
              });
            }
          } catch (e) {
            console.error("Error parsing stream line:", line, e);
          }
        }
      }

    } catch (e: any) {
      console.error("Search Handler Error:", e);
      setSearchSteps(prev => [...prev, { id: 'err', label: `Failed: ${e.message}`, status: 'completed' }]);
      // Keep loading UI visible to show the error state? 
      // Actually, if we set isLoading(false) it hides the progress.
      // Let's keep it true but ensure user can reset.
    } finally {
      // Only hide loading if we have data or if the user needs to retry?
      // If we hide loading on error, the error message disappears.
      // We should only unset isLoading if SUCCESS.
      if (data) setIsLoading(false);
      // Wait, if error, we want to show the error. 
      // Current UI: !data && isLoading -> Show Progress.
      // So if error happens, we want !data && isLoading to stay true to show the error step.
      // We will only set isLoading(false) if we successfully got data OR if user cancels.
      // But we need a way to reset. The "NEW SEARCH" button handles reset.

      // FIX: If data received, logic in UI handles it.
      // If error (data is null), keep isLoading true so Progress/Error is visible.
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        searchesUsed={usage.search_count}
        searchLimit={usage.limit}
      />

      {/* Dashboard Header - Only show when we have results */}
      {data && (
        <header className="flex justify-between items-center mb-8 pt-8 px-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Bienvenido de nuevo, {user?.email?.split('@')[0] || 'Invitado'} 👋
            </h1>
            <p className="text-gray-500 text-sm">Aquí está tu panel de descubrimiento de problemas.</p>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <Search size={20} className="hover:text-white cursor-pointer" />
            <Bell size={20} className="hover:text-white cursor-pointer" />

            <div className="flex items-center gap-2 text-sm text-gray-500 border-l border-[#333] pl-4">
              <Calendar size={16} />
              <span>Dic 2025</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-[#555]">
              {/* User Avatar Placeholder */}
            </div>
          </div>
        </header>
      )}

      {/* Main Action Area - Centered when no data AND not loading */}
      {!data && (
        <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-500 ${isLoading ? '-mt-40' : '-mt-20'}`}>
          {!isLoading ? (
            <HeroInput onSearch={handleSearch} isLoading={false} />
          ) : (
            <div className="w-full">
              <h2 className="text-center text-2xl font-bold text-white mb-6">Descubrimiento en Progreso</h2>
              <SearchProgress steps={searchSteps} />
              {/* Add a reset button if stuck */}
              <div className="text-center mt-8">
                <button onClick={() => setIsLoading(false)} className="text-xs text-gray-500 underline hover:text-white">Cancelar / Reiniciar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results View */}
      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 px-4 pb-8 max-w-7xl mx-auto">

          {/* Validated Header */}
          <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Oportunidades Validadas</h2>
              <p className="text-[#666] text-xs font-bold tracking-widest uppercase">
                Ordenadas por Fuerza de Señal y Potencial Comercial
              </p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333] px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-300">
                {data.problems.length} PROBLEMAS ENCONTRADOS
              </span>
            </div>
          </div>

          {/* List Only */}
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => { setData(null); setSearchSteps([]); setIsLoading(false); setCurrentQuery(''); }}
                className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest"
              >
                ← NUEVA BÚSQUEDA
              </button>
              <button
                onClick={saveReport}
                disabled={reportSaved}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {reportSaved ? (
                  <>
                    <Check size={16} />
                    Guardado
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar Reporte
                  </>
                )}
              </button>
            </div>
            <div className="space-y-6">
              {data.problems
                .sort((a: any, b: any) => (b.signalScore || 0) - (a.signalScore || 0))
                .map((p: any) => (
                  <ProblemCard key={p.id} problem={p} />
                ))
              }
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Default export with Suspense boundary for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
