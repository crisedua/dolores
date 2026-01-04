// Lightweight analytics for conversion tracking
// Events are logged to console for now - can be extended to send to backend

type AnalyticsEvent =
    | 'search_completed_free'
    | 'paywall_viewed'
    | 'upgrade_clicked'
    | 'upgrade_completed';

interface EventData {
    [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: AnalyticsEvent, data?: EventData): void {
    const timestamp = new Date().toISOString();

    console.log(`[Analytics] ${event}`, {
        timestamp,
        ...data
    });

    // Future: Send to backend or analytics service
    // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event, data, timestamp }) });
}

// Convenience functions for specific events
export const analytics = {
    searchCompletedFree: (query: string, resultCount: number) => {
        trackEvent('search_completed_free', { query, resultCount });
    },

    paywallViewed: (paywallType: 'first_search' | 'comparison' | 'limit_reached' | 'locked_content') => {
        trackEvent('paywall_viewed', { paywallType });
    },

    upgradeClicked: (source: string) => {
        trackEvent('upgrade_clicked', { source });
    },

    upgradeCompleted: (userId: string) => {
        trackEvent('upgrade_completed', { userId });
    }
};
