import { describe, it, expect } from 'vitest';
import { ruleBasedGapAnalysis } from '../lib/gapAnalysis';

import jobRoles from '../data/jobRoles.json';

describe('Gap Analysis Engine (ruleBasedGapAnalysis)', () => {
  it('identifies missing and matched skills accurately (Happy Path)', () => {

    const userSkills = ["aws", "python"];
    const targetRole = "cloud-eng";

    const result = ruleBasedGapAnalysis(userSkills, targetRole);

    expect(result.error).toBeUndefined();
    expect(result.source).toBe('rule-based');

    const matchedIds = result.matchedSkills.map(s => s.id);
    expect(matchedIds).toContain('aws');

    expect(typeof result.overallFitScore).toBe('number');
    expect(result.overallFitScore).toBeGreaterThanOrEqual(0);
    expect(result.overallFitScore).toBeLessThanOrEqual(100);
  });

  it('handles invalid or non-existent target roles gracefully (Edge Case)', () => {
    const userSkills = ["aws", "python"];
    const invalidRole = "astronaut-moon-base";

    const result = ruleBasedGapAnalysis(userSkills, invalidRole);

    expect(result.error).toBe("No matching job descriptions found for this role.");
    expect(result.overallFitScore).toBeUndefined();
  });
});
