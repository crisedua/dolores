/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { HeroInput } from '@/components/HeroInput';

import { ProblemCard } from '@/components/ProblemCard';
import { Bell, Search, Calendar } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">

      {/* Dashboard Header - Only show when we have results */}
      {data && (
        <header className="flex justify-between items-center mb-8 pt-8 px-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, Vincent 👋
            </h1>
            <p className="text-gray-500 text-sm">Here is your problem discovery dashboard.</p>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <Search size={20} className="hover:text-white cursor-pointer" />
            <Bell size={20} className="hover:text-white cursor-pointer" />

            <div className="flex items-center gap-2 text-sm text-gray-500 border-l border-[#333] pl-4">
              <Calendar size={16} />
              <span>19 Dec 2025</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-[#555]">
              {/* User Avatar Placeholder */}
            </div>
          </div>
        </header>
      )}

      {/* Main Action Area - Centered when no data */}
      {!data && (
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <HeroInput onSearch={handleSearch} isLoading={isLoading} />
        </div>
      )}

      {/* Results View - Matches "Board View" from image but for our context */}

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 px-4 pb-8 max-w-7xl mx-auto">

          {/* Validated Header */}
          <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Validated Opportunities</h2>
              <p className="text-[#666] text-xs font-bold tracking-widest uppercase">
                Ranked by Signal Strength & Commercial Potential
              </p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333] px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-300">
                {data.problems.length} PROBLEMS FOUND
              </span>
            </div>
          </div>

          {/* List Only - No Map/Matrix */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {data.problems
                .sort((a: any, b: any) => b.economicIntent - a.economicIntent)
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
