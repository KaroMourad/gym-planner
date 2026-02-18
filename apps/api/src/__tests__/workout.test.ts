import { describe, it, expect } from 'vitest';
import { CreateWorkoutSchema } from '@gym-planner/shared';

describe('CreateWorkoutSchema', () => {
  it('accepts a valid workout name', () => {
    const result = CreateWorkoutSchema.safeParse({ name: 'Push Day' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = CreateWorkoutSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a name that is too long', () => {
    const result = CreateWorkoutSchema.safeParse({ name: 'A'.repeat(121) });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = CreateWorkoutSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
