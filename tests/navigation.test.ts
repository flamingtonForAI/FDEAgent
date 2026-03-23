import { describe, it, expect } from 'vitest';
import {
  type WorkflowTab,
  validWorkflowTabs,
  projectPhaseTabs,
  tabToPhase,
  type Phase,
  emptyProjectState,
} from '../lib/navigation';

describe('navigation', () => {
  describe('validWorkflowTabs', () => {
    it('contains all expected tabs', () => {
      const expected: WorkflowTab[] = [
        'projects', 'quickStart', 'academy', 'archetypes', 'pricing',
        'scouting', 'workbench', 'ontology', 'actionDesigner',
        'systemMap', 'aip', 'overview', 'aiEnhancement', 'deliver',
      ];
      expect(validWorkflowTabs).toEqual(expect.arrayContaining(expected));
      expect(validWorkflowTabs.length).toBe(expected.length);
    });

    it('has no duplicates', () => {
      const unique = new Set(validWorkflowTabs);
      expect(unique.size).toBe(validWorkflowTabs.length);
    });
  });

  describe('projectPhaseTabs', () => {
    it('is a subset of validWorkflowTabs', () => {
      for (const tab of projectPhaseTabs) {
        expect(validWorkflowTabs).toContain(tab);
      }
    });

    it('does not include non-project tabs', () => {
      const nonProjectTabs: WorkflowTab[] = ['projects', 'quickStart', 'academy', 'archetypes', 'pricing'];
      for (const tab of nonProjectTabs) {
        expect(projectPhaseTabs).not.toContain(tab);
      }
    });

    it('includes all expected project phase tabs', () => {
      const expected: WorkflowTab[] = [
        'scouting', 'workbench', 'ontology', 'actionDesigner',
        'systemMap', 'overview', 'aiEnhancement', 'aip', 'deliver',
      ];
      expect(projectPhaseTabs).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('tabToPhase', () => {
    it('maps discover-phase tabs correctly', () => {
      const discoverTabs: WorkflowTab[] = ['scouting', 'quickStart', 'academy', 'archetypes', 'pricing', 'projects'];
      for (const tab of discoverTabs) {
        expect(tabToPhase(tab)).toBe('discover' satisfies Phase);
      }
    });

    it('maps model-phase tabs correctly', () => {
      const modelTabs: WorkflowTab[] = ['workbench', 'ontology', 'actionDesigner'];
      for (const tab of modelTabs) {
        expect(tabToPhase(tab)).toBe('model' satisfies Phase);
      }
    });

    it('maps integrate-phase tabs correctly', () => {
      const integrateTabs: WorkflowTab[] = ['systemMap', 'overview'];
      for (const tab of integrateTabs) {
        expect(tabToPhase(tab)).toBe('integrate' satisfies Phase);
      }
    });

    it('maps enhance-phase tabs correctly', () => {
      const enhanceTabs: WorkflowTab[] = ['aiEnhancement', 'aip'];
      for (const tab of enhanceTabs) {
        expect(tabToPhase(tab)).toBe('enhance' satisfies Phase);
      }
    });

    it('maps deliver tab correctly', () => {
      expect(tabToPhase('deliver')).toBe('deliver' satisfies Phase);
    });

    it('covers every valid tab', () => {
      const allPhases: Phase[] = ['discover', 'model', 'integrate', 'enhance', 'deliver'];
      for (const tab of validWorkflowTabs) {
        const phase = tabToPhase(tab);
        expect(allPhases).toContain(phase);
      }
    });
  });

  describe('emptyProjectState', () => {
    it('has correct default structure', () => {
      expect(emptyProjectState).toEqual({
        industry: '',
        useCase: '',
        objects: [],
        links: [],
        integrations: [],
        aiRequirements: [],
        status: 'scouting',
      });
    });
  });
});
