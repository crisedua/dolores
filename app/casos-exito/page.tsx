
import { supabase } from '@/lib/supabase';
import { SuccessStoryCard } from '@/components/SuccessStoryCard';

// Opt out of caching to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function CasosExitoPage() {
    const { data: stories, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching stories:", error);
        return <div className="p-8 text-red-400">Error loading stories. Please try again later.</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12 text-center">
                <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
                    <span className="text-blue-500">Casos</span> de Éxito
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Descubre ejemplos reales de ejecuciones de negocios exitosos.
                    Aprende las estrategias, pasos y tácticas de crecimiento que los llevaron al éxito.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories?.map((story) => (
                    <SuccessStoryCard key={story.id} story={story} />
                ))}

                {(!stories || stories.length === 0) && (
                    <div className="col-span-full text-center py-20 text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800 border-dashed">
                        <p>Aún no hay historias de éxito agregadas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
