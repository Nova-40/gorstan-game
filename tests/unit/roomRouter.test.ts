import { describe, it, expect } from 'vitest';
import { go, goBack, getCurrent } from '../../src/engine/roomRouter';

describe('roomRouter history', () => {
  it('maintains history and fallback', () => {
    go('room:a');
    go('room:b');
    go('room:c');
    expect(getCurrent()).toBe('room:c');
    goBack();
    expect(getCurrent()).toBe('room:b');
    goBack();
    expect(getCurrent()).toBe('room:a');
    goBack();
    expect(getCurrent()).toBe('room:hub');
  });
});
