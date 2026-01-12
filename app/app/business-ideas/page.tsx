'use client';

import { useState } from 'react';
import { BusinessOnboarding } from './components/BusinessOnboarding';
import { BusinessDashboard } from './components/BusinessDashboard';
import { UserContext } from '@/lib/schemas';

export default function BusinessIdeasPage() {
    // State to persist the collected context
    const [userContext, setUserContext] = useState<UserContext | null>(null);

    return (
        // Override global dark theme for this specific subsection to match the requested design
        // We use a fixed wrapper to ensure it covers the area
        <div className="absolute inset-0 bg-white z-0 overflow-hidden text-slate-900">
            {!userContext ? (
                <BusinessOnboarding onComplete={setUserContext} />
            ) : (
                <BusinessDashboard userContext={userContext} />
            )}
        </div>
    );
}
