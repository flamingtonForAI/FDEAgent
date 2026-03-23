import { describe, it, expect } from 'vitest';

/**
 * Unit tests for project-access middleware role hierarchy logic.
 * Tests the pure role comparison logic without Fastify/DB dependencies.
 */

type ProjectRole = 'viewer' | 'editor' | 'owner';

const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  viewer: 0,
  editor: 1,
  owner: 2,
};

function hasMinimumRole(effectiveRole: ProjectRole, requiredRole: ProjectRole): boolean {
  return ROLE_HIERARCHY[effectiveRole] >= ROLE_HIERARCHY[requiredRole];
}

describe('project-access role hierarchy', () => {
  it('owner has all permissions', () => {
    expect(hasMinimumRole('owner', 'viewer')).toBe(true);
    expect(hasMinimumRole('owner', 'editor')).toBe(true);
    expect(hasMinimumRole('owner', 'owner')).toBe(true);
  });

  it('editor has viewer and editor permissions', () => {
    expect(hasMinimumRole('editor', 'viewer')).toBe(true);
    expect(hasMinimumRole('editor', 'editor')).toBe(true);
    expect(hasMinimumRole('editor', 'owner')).toBe(false);
  });

  it('viewer only has viewer permission', () => {
    expect(hasMinimumRole('viewer', 'viewer')).toBe(true);
    expect(hasMinimumRole('viewer', 'editor')).toBe(false);
    expect(hasMinimumRole('viewer', 'owner')).toBe(false);
  });
});
