import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePromotionDirective } from '../promotionDirective.ts';

const config = (metric, rules) => ({ enabled: true, metric, rules });
const result = total => ({ total, endTermScore: total });

describe('DRCE promotion directive', () => {
  it('matches inclusive total-mark ranges and respects rule order', () => {
    const rules = [
      { id: 'repeat', minScore: 0, maxScore: 99, outcome: 'repeat' },
      { id: 'promoted', minScore: 100, maxScore: 200, outcome: 'promoted' },
    ];
    assert.equal(
      resolvePromotionDirective(config('total', rules), {
        results: [result(40), result(40)],
        language: 'en',
      }),
      'Advised to repeat the current class',
    );
    assert.equal(
      resolvePromotionDirective(config('total', rules), {
        results: [result(100), result(100)],
        language: 'en',
      }),
      'Promoted to the next class',
    );
  });

  it('calculates the average over available numeric subject marks', () => {
    const rules = [
      { id: 'probation', minScore: 60, maxScore: 74.99, outcome: 'probation' },
    ];
    assert.equal(
      resolvePromotionDirective(config('average', rules), {
        results: [result(60), result(70), { total: null, endTermScore: null }],
        language: 'en',
      }),
      'Promoted on probation',
    );
  });

  it('localizes the matched outcome and returns null for unmatched or disabled rules', () => {
    const rules = [{ id: 'repeat', minScore: 0, maxScore: 50, outcome: 'repeat' }];
    assert.equal(
      resolvePromotionDirective(config('average', rules), {
        results: [result(40)],
        language: 'ar',
      }),
      'يُنصح الطالب بإعادة الصف الحالي',
    );
    assert.equal(
      resolvePromotionDirective({ ...config('average', rules), enabled: false }, {
        results: [result(40)],
        language: 'en',
      }),
      null,
    );
    assert.equal(
      resolvePromotionDirective(config('average', rules), {
        results: [result(51)],
        language: 'en',
      }),
      null,
    );
  });
});
