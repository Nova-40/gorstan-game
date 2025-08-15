import { describe, it, expect } from 'vitest';
import { armTrap, disarmAll, enterRoom } from '../../src/engine/trapSystem';

describe('traps', () => {
  it('lethal trap causes death on entry', () => {
    disarmAll();
    armTrap('pit', 'room:maze:echo', 'You fall into a pit.', true);
    const result = enterRoom('room:maze:echo');
    expect(result.death).toBe(true);
    expect(result.cause).toMatch(/pit/i);
  });

  it('non-lethal trap does not cause death', () => {
    disarmAll();
    armTrap('alarm', 'room:maze:echo', 'A loud alarm sounds.', false);
    const result = enterRoom('room:maze:echo');
    expect(result.death).toBe(false);
    expect(result.cause).toMatch(/alarm/i);
  });
});
