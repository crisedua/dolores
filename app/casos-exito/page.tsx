
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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Casos de Éxito</h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                    Discover real-world examples of successful business executions.
                    Learn the strategies, steps, and insights that led to their growth.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories?.map((story) => (
                    <SuccessStoryCard key={story.id} story={story} />
                ))}

                {(!stories || stories.length === 0) && (
                    <div className="col-span-full text-center py-20 text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800 border-dashed">
                        <p>No success stories added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
