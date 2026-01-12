import { z } from 'zod';

export const OfferSchema = z.object({
    title: z.string(),
    ideal_customer: z.string(),
    painful_problem: z.string(),
    promise_outcome: z.string(),
    deliverables: z.array(z.string()),
    timeline_weeks: z.number(),
    price_usd: z.object({
        min: z.number(),
        max: z.number(),
    }),
    roi_rationale: z.string(),
    differentiation: z.string(),
    risk_reversal: z.string(),
    discovery_questions: z.array(z.string()),
    outreach_message: z.string(),
    next_step_call_to_action: z.string(),
});

export const OfferBundleSchema = z.object({
    locale: z.literal("es"),
    country: z.string(),
    offers: z.array(OfferSchema),
    recommended_best_offer_index: z.number(),
    quick_pitch: z.string(),
    positioning_statement: z.string(),
    seven_day_validation_plan: z.array(z.string()),
    safety_notes: z.array(z.string()),
});

export type Offer = z.infer<typeof OfferSchema>;
export type OfferBundle = z.infer<typeof OfferBundleSchema>;

export interface CoachMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface SelectedProblem {
    id: string;
    problem_title: string;
    who_has_it: string;
    core_pain: string;
    financial_impact: string;
    evidence_summary: string;
    market_scope: "local_latam" | "regional_latam" | "international_facing";
    country?: string;
}

export interface UserContext {
    language: "es";
    country?: string;
    stage?: "no_ideas" | "too_many" | "stuck_low_ticket";
    skills?: string;
    access?: string;
    marketPreference?: "local" | "international" | "both";
}
