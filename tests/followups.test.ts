import { describe, it, expect } from 'vitest';
import { buildFollowUps } from '../app/ask/followups';

describe('buildFollowUps', () => {
  it('extracts the subject from a why-did-X-fail question', () => {
    const ups = buildFollowUps('Why did Quibi fail?');
    expect(ups).toHaveLength(4);
    expect(ups[0]).toBe('What did Quibi underestimate?');
    expect(ups[1]).toBe('Was the business model fundamentally broken?');
    expect(ups[3]).toBe('Which other companies made the same mistake as Quibi?');
  });

  it('handles verb and collapse variants', () => {
    expect(buildFollowUps('Why did Kozmo.com collapse?')[0]).toBe(
      'What did Kozmo.com underestimate?'
    );
    expect(buildFollowUps('Why was Webvan doomed?')[0]).toBe('What did Webvan underestimate?');
  });

  it('returns the same suggestions for the same question (deterministic)', () => {
    const q = 'Why did Pets.com fail?';
    expect(buildFollowUps(q)).toEqual(buildFollowUps(q));
  });

  it('returns generic suggestions for non-why questions', () => {
    const ups = buildFollowUps('Compare Webvan and Kozmo.com');
    expect(ups).toHaveLength(3);
    expect(ups[0]).not.toContain('underestimate');
  });

  it('returns generic suggestions for empty input', () => {
    expect(buildFollowUps('')).toHaveLength(3);
    expect(buildFollowUps('   ')).toHaveLength(3);
  });
});
