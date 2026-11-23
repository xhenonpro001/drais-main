import type {
  DRCEDataContext,
  DRCEPromotionDirectiveConfig,
  DRCEPromotionOutcome,
} from './schema';

const OUTCOME_TEXT: Record<DRCEPromotionOutcome, { en: string; ar: string }> = {
  promoted: {
    en: 'Promoted to the next class',
    ar: 'تمت ترقية الطالب إلى الصف التالي',
  },
  repeat: {
    en: 'Advised to repeat the current class',
    ar: 'يُنصح الطالب بإعادة الصف الحالي',
  },
  probation: {
    en: 'Promoted on probation',
    ar: 'تمت ترقية الطالب بشرط التحسن',
  },
};

/** Example policy used by new report-card templates; schools can edit the ranges. */
export function createDefaultPromotionDirective(): DRCEPromotionDirectiveConfig {
  return {
    enabled: true,
    metric: 'average',
    rules: [
      { id: 'repeat', minScore: 0, maxScore: 39.99, outcome: 'repeat' },
      { id: 'probation', minScore: 40, maxScore: 49.99, outcome: 'probation' },
      { id: 'promoted', minScore: 50, maxScore: 100, outcome: 'promoted' },
    ],
  };
}

/** Resolve the first configured promotion range matching this learner's marks. */
export function resolvePromotionDirective(
  config: DRCEPromotionDirectiveConfig | undefined,
  dataCtx: Pick<DRCEDataContext, 'results' | 'language'>,
): string | null {
  if (!config?.enabled || !config.rules.length) return null;

  const scores = dataCtx.results
    .map(result => result.total ?? result.endTermScore)
    .filter((score): score is number => typeof score === 'number' && Number.isFinite(score));
  if (!scores.length) return null;

  const total = scores.reduce((sum, score) => sum + score, 0);
  const value = config.metric === 'total' ? total : total / scores.length;
  const match = config.rules.find(rule =>
    Number.isFinite(rule.minScore)
    && Number.isFinite(rule.maxScore)
    && rule.minScore <= rule.maxScore
    && value >= rule.minScore
    && value <= rule.maxScore,
  );
  if (!match) return null;

  const language = dataCtx.language === 'ar' ? 'ar' : 'en';
  return OUTCOME_TEXT[match.outcome]?.[language] ?? null;
}
