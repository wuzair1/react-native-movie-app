import { balance, claim, emptyDemo, withdrawDemo } from '../demoRewards';
describe('demo points ledger', () => {
  it('allows one daily or completion claim per identifier', () => {
    const first = claim(emptyDemo, 'daily:2026-10-14', 100, 'Check in');
    expect(claim(first, 'daily:2026-10-14', 100, 'Check in')).toBe(first);
    expect(balance(claim(first, 'episode:10378', 50, 'Sample'))).toBe(150);
  });
  it('does not allow overdrafts or duplicate simulated withdrawals', () => {
    expect(withdrawDemo(emptyDemo, 'one')).toBe(emptyDemo);
    const funded = claim(emptyDemo, 'check', 100, 'Demo');
    const withdrawn = withdrawDemo(funded, 'one');
    expect(balance(withdrawn)).toBe(0);
    expect(withdrawDemo(withdrawn, 'one')).toBe(withdrawn);
    expect(withdrawn.entries[1].label).toContain('no payment sent');
  });
  it('rejects invalid point awards', () => {
    for (const points of [-1, 0, NaN, Infinity, 1.2]) expect(claim(emptyDemo, 'invalid', points, 'Invalid')).toBe(emptyDemo);
  });
});
