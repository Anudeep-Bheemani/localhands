type ServiceLike = { id: string; name: string; categoryId: string };
type CategoryLike = { id: string; name: string; slug: string; services: ServiceLike[] };

const STOPWORDS = new Set([
  "the", "a", "an", "my", "is", "it", "and", "to", "for", "of", "i", "need", "want",
  "please", "help", "with", "in", "on", "at", "has", "have", "am", "im", "me",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Simple keyword-overlap matcher — no AI/LLM. Returns the best-matching service, if any. */
export function matchServiceFromText(
  query: string,
  categories: CategoryLike[]
): { category: CategoryLike; service: ServiceLike; score: number } | null {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return null;

  let best: { category: CategoryLike; service: ServiceLike; score: number } | null = null;

  for (const category of categories) {
    const categoryTokens = tokenize(category.name);
    for (const service of category.services) {
      const serviceTokens = tokenize(service.name);
      const allTokens = [...serviceTokens, ...categoryTokens];

      let score = 0;
      for (const qt of queryTokens) {
        for (const st of allTokens) {
          if (qt === st) score += 2;
          else if (st.includes(qt) || qt.includes(st)) score += 1;
        }
      }

      if (score > 0 && (!best || score > best.score)) {
        best = { category, service, score };
      }
    }
  }

  return best;
}

/** Generic token-overlap score between free text and a worker's own skill/category names. No AI/LLM. */
export function scoreTextAgainstSkills(text: string, skillNames: string[]): number {
  const textTokens = tokenize(text);
  const skillTokens = skillNames.flatMap((s) => tokenize(s));
  if (textTokens.length === 0 || skillTokens.length === 0) return 0;

  let score = 0;
  for (const t of textTokens) {
    for (const s of skillTokens) {
      if (t === s) score += 2;
      else if (s.includes(t) || t.includes(s)) score += 1;
    }
  }
  return score;
}

export type MatchReason = { label: string; met: boolean };

export function buildMatchReasons(opts: {
  hasRequiredSkill: boolean;
  distanceKm: number;
  serviceRadiusKm: number;
  availableNow: boolean;
  jobsCompleted: number;
  hasMaterial: boolean;
}): { reasons: MatchReason[]; score: number } {
  const withinRadius = opts.distanceKm <= opts.serviceRadiusKm;
  const experienced = opts.jobsCompleted >= 10;

  const reasons: MatchReason[] = [
    { label: "Required skill", met: opts.hasRequiredSkill },
    { label: `${opts.distanceKm.toFixed(1)} km away`, met: withinRadius },
    { label: "Available now", met: opts.availableNow },
    { label: `${opts.jobsCompleted} jobs completed`, met: experienced },
    { label: "Material available", met: opts.hasMaterial },
  ];

  const score =
    (opts.hasRequiredSkill ? 30 : 0) +
    (withinRadius ? 20 : 0) +
    (opts.availableNow ? 15 : 0) +
    (experienced ? 10 : 0) +
    (opts.hasMaterial ? 5 : 0) +
    Math.max(0, 20 - opts.distanceKm);

  return { reasons, score };
}
