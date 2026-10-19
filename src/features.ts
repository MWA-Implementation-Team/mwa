// Feature gating — see SPEC-feature-gating.md. One env var (MWA_FEATURES)
// controls which route groups exist; gated routes fall through to 404.

export const FEATURE_IDS = ['landing', 'auth', 'app', 'admin', 'api'] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];

const KNOWN: ReadonlySet<string> = new Set(FEATURE_IDS);

export function parseFeatures(raw: string | undefined): Set<FeatureId> {
    const entries = raw?.split(',').map((e) => e.trim()) ?? [];
    if (entries.every((e) => e === '') || entries.includes('all')) {
        return new Set(FEATURE_IDS);
    }
    const features = new Set<FeatureId>();
    for (const id of entries) {
        if (id === '') {
            continue;
        }
        if (KNOWN.has(id)) {
            features.add(id as FeatureId);
        } else {
            console.warn(`MWA_FEATURES: ignoring unknown feature '${id}'`);
        }
    }
    return features;
}
