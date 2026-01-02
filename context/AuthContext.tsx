'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);

            // Initialize free subscription for new signups
            if (event === 'SIGNED_IN' && session?.user) {
                try {
                    await fetch('/api/init-subscription', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: session.user.id })
                    });
                } catch (error) {
                    console.error('Failed to initialize subscription:', error);
                }

                // Check for return URL (e.g., after signup with payment intent)
                const params = new URLSearchParams(window.location.search);
                const returnTo = params.get('returnTo');
                const action = params.get('action');

                if (returnTo) {
                    // Preserve action parameter when redirecting
                    const redirectUrl = action ? `${returnTo}?action=${action}` : returnTo;
                    router.push(redirectUrl);
                    return;
                }

                // Default redirect to dashboard
                router.push('/app');
                return;
            }

            if (!session) {
                router.push('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
            router.push('/');
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
