/**
 * Readiness Checker — aggregates project state into a unified readiness report.
 *
 * Data sources (all already exist):
 * - runQualityCheck() from qualityChecker
 * - checkActionThreeLayers() from qualityChecker
 *
 * No AI involved — pure rule-based aggregation.
 * All user-facing text uses locale keys (common:readiness.*) — never inline {en,cn}.
 */

import { ProjectState } from '../types';
import { runQualityCheck, checkActionThreeLayers, QualityReport, ThreeLayerReport } from './qualityChecker';

// ============= Types =============

export interface ReadinessSnapshot {
  objects: number;
  actions: number;
  links: number;
  integrations: number;
  aiAnalysisComplete: boolean;
  qualityGrade: string;
  qualityScore: number;
}

export interface ReadinessMessage {
  key: string;
  params?: Record<string, string | number>;
}

export interface ReadinessBlocker {
  message: ReadinessMessage;
  targetTab?: string;
}

export interface ReadinessAction {
  message: ReadinessMessage;
  targetTab?: string;
  priority: number; // higher = more important
}

export interface ReadinessReport {
  currentPhaseKey: string;
  phaseProgress: number; // 0-100
  snapshot: ReadinessSnapshot;
  blockers: ReadinessBlocker[];
  nextActions: ReadinessAction[];
}

// ============= Phase Detection =============

type PhaseId = 'discovery' | 'modeling' | 'integration' | 'aiEnhancement' | 'delivery';

interface PhaseInfo {
  id: PhaseId;
  nameKey: string;
  progress: number;
}

function evaluatePhases(project: ProjectState, threeLayerReport: ThreeLayerReport | null): PhaseInfo[] {
  const objectCount = project.objects?.length || 0;
  const linkCount = project.links?.length || 0;
  const integrationCount = project.integrations?.length || 0;
  const actionCount = project.objects?.reduce((acc, obj) => acc + (obj.actions?.length || 0), 0) || 0;

  const businessLayerComplete = threeLayerReport?.byLayer.business.complete || 0;
  const logicLayerComplete = threeLayerReport?.byLayer.logic.complete || 0;
  const implLayerComplete = threeLayerReport?.byLayer.implementation.complete || 0;

  const hasAIFeatures = project.objects.some(obj => obj.aiFeatures && obj.aiFeatures.length > 0);

  // Phase 1: Discovery
  const discoveryProgress = Math.min(100,
    (objectCount > 0 ? 40 : 0) +
    (project.industry ? 20 : 0) +
    (project.useCase ? 20 : 0) +
    (actionCount > 0 ? 20 : 0)
  );

  // Phase 2: Modeling
  const modelingProgress = Math.min(100,
    (objectCount >= 1 ? 20 : 0) +
    (linkCount > 0 ? 20 : 0) +
    (businessLayerComplete > 0 ? 25 : 0) +
    (actionCount >= 1 ? 20 : 0) +
    (project.objects.every(obj => obj.description && obj.description.length >= 10) ? 15 : 0)
  );

  // Phase 3: Integration
  const integrationProgress = Math.min(100,
    (integrationCount > 0 ? 40 : 0) +
    (logicLayerComplete > 0 ? 30 : 0) +
    ((threeLayerReport?.averageScore || 0) >= 50 ? 30 : 0)
  );

  // Phase 4: AI Enhancement
  const aiProgress = Math.min(100,
    (hasAIFeatures ? 60 : 0) +
    ((threeLayerReport?.averageScore || 0) >= 60 ? 40 : 0)
  );

  // Phase 5: Delivery
  const deliveryProgress = Math.min(100,
    (implLayerComplete > 0 ? 40 : 0) +
    ((threeLayerReport?.averageScore || 0) >= 70 ? 30 : 0) +
    (integrationCount > 0 && logicLayerComplete > 0 ? 30 : 0)
  );

  return [
    { id: 'discovery', nameKey: 'readiness.phase.discovery', progress: discoveryProgress },
    { id: 'modeling', nameKey: 'readiness.phase.modeling', progress: modelingProgress },
    { id: 'integration', nameKey: 'readiness.phase.integration', progress: integrationProgress },
    { id: 'aiEnhancement', nameKey: 'readiness.phase.aiEnhancement', progress: aiProgress },
    { id: 'delivery', nameKey: 'readiness.phase.delivery', progress: deliveryProgress },
  ];
}

function detectCurrentPhase(phases: PhaseInfo[]): PhaseInfo {
  // Find the first phase that is not yet complete (< 80%)
  for (const phase of phases) {
    if (phase.progress < 80) return phase;
  }
  // All phases complete — return delivery
  return phases[phases.length - 1];
}

// ============= Blockers =============

function detectBlockers(
  project: ProjectState,
  qualityReport: QualityReport | null,
  threeLayerReport: ThreeLayerReport | null
): ReadinessBlocker[] {
  const blockers: ReadinessBlocker[] = [];
  const objectCount = project.objects?.length || 0;
  const actionCount = project.objects?.reduce((acc, obj) => acc + (obj.actions?.length || 0), 0) || 0;

  if (objectCount === 0) {
    blockers.push({
      message: { key: 'readiness.blocker.noObjects' },
      targetTab: 'scouting'
    });
  }

  if (objectCount > 0 && actionCount === 0) {
    blockers.push({
      message: { key: 'readiness.blocker.noActions' },
      targetTab: 'workbench'
    });
  }

  // Check for error-level quality issues
  if (qualityReport && qualityReport.bySeverity.error > 0) {
    blockers.push({
      message: {
        key: 'readiness.blocker.criticalQuality',
        params: { count: qualityReport.bySeverity.error }
      },
    });
  }

  // Check for minimal three-layer actions
  if (threeLayerReport && threeLayerReport.minimalActions > 0) {
    blockers.push({
      message: {
        key: 'readiness.blocker.minimalActions',
        params: { count: threeLayerReport.minimalActions }
      },
      targetTab: 'workbench'
    });
  }

  return blockers;
}

// ============= Next Actions =============

function generateNextActions(
  project: ProjectState,
  phases: PhaseInfo[],
  qualityReport: QualityReport | null,
  threeLayerReport: ThreeLayerReport | null
): ReadinessAction[] {
  const actions: ReadinessAction[] = [];
  const objectCount = project.objects?.length || 0;
  const actionCount = project.objects?.reduce((acc, obj) => acc + (obj.actions?.length || 0), 0) || 0;
  const linkCount = project.links?.length || 0;
  const integrationCount = project.integrations?.length || 0;
  const currentPhase = detectCurrentPhase(phases);

  // Error-level quality issues — highest priority
  if (qualityReport && qualityReport.bySeverity.error > 0) {
    const errorIssue = qualityReport.issues.find(i => i.severity === 'error');
    if (errorIssue) {
      const targetTab = errorIssue.target?.type === 'object' || errorIssue.target?.type === 'action' ? 'workbench'
        : errorIssue.target?.type === 'link' ? 'ontology'
        : errorIssue.target?.type === 'integration' ? 'systemMap'
        : undefined;
      actions.push({
        message: {
          key: 'readiness.action.fixCritical',
          params: { count: qualityReport.bySeverity.error }
        },
        targetTab,
        priority: 100
      });
    }
  }

  // Current phase-specific recommendations
  if (currentPhase.id === 'discovery') {
    if (objectCount === 0) {
      actions.push({
        message: { key: 'readiness.action.chatToDiscover' },
        targetTab: 'scouting',
        priority: 90
      });
    } else if (!project.industry) {
      actions.push({
        message: { key: 'readiness.action.specifyIndustry' },
        targetTab: 'scouting',
        priority: 80
      });
    }
  }

  if (currentPhase.id === 'modeling') {
    const objectsWithoutDesc = project.objects.filter(obj => !obj.description || obj.description.length < 10);
    if (objectsWithoutDesc.length > 0) {
      const names = objectsWithoutDesc.slice(0, 2).map(o => o.name).join(', ') +
        (objectsWithoutDesc.length > 2 ? '...' : '');
      actions.push({
        message: {
          key: 'readiness.action.addDescriptions',
          params: { count: objectsWithoutDesc.length, names }
        },
        targetTab: 'workbench',
        priority: 85
      });
    }
    if (objectCount >= 2 && linkCount === 0) {
      actions.push({
        message: { key: 'readiness.action.defineLinks' },
        targetTab: 'ontology',
        priority: 80
      });
    }
    if (actionCount === 0 && objectCount > 0) {
      actions.push({
        message: { key: 'readiness.action.defineActions' },
        targetTab: 'workbench',
        priority: 85
      });
    }
  }

  if (currentPhase.id === 'integration') {
    if (integrationCount === 0) {
      actions.push({
        message: { key: 'readiness.action.addIntegrations' },
        targetTab: 'systemMap',
        priority: 85
      });
    }
    const incompleteIntegrations = project.integrations.filter(i => !i.mechanism || !i.dataPoints || i.dataPoints.length === 0);
    if (incompleteIntegrations.length > 0) {
      actions.push({
        message: {
          key: 'readiness.action.completeIntegrations',
          params: { count: incompleteIntegrations.length }
        },
        targetTab: 'systemMap',
        priority: 80
      });
    }
  }

  if (currentPhase.id === 'aiEnhancement') {
    const hasAI = project.objects.some(obj => obj.aiFeatures && obj.aiFeatures.length > 0);
    if (!hasAI) {
      actions.push({
        message: { key: 'readiness.action.runAIAnalysis' },
        targetTab: 'aiEnhancement',
        priority: 85
      });
    }
  }

  if (currentPhase.id === 'delivery') {
    if (threeLayerReport && threeLayerReport.minimalActions > 0) {
      actions.push({
        message: {
          key: 'readiness.action.completeActionDefs',
          params: { count: threeLayerReport.minimalActions }
        },
        targetTab: 'workbench',
        priority: 85
      });
    }
  }

  // Sort by priority (highest first) and take top 3
  return actions.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

// ============= Main Function =============

export function checkReadiness(project: ProjectState): ReadinessReport {
  const objectCount = project.objects?.length || 0;
  const actionCount = project.objects?.reduce((acc, obj) => acc + (obj.actions?.length || 0), 0) || 0;
  const hasAIFeatures = project.objects.some(obj => obj.aiFeatures && obj.aiFeatures.length > 0);

  // Compute expensive reports once, pass through
  const qualityReport = objectCount > 0 ? runQualityCheck(project) : null;
  const threeLayerReport = objectCount > 0 ? checkActionThreeLayers(project) : null;

  const phases = evaluatePhases(project, threeLayerReport);
  const currentPhase = detectCurrentPhase(phases);

  const snapshot: ReadinessSnapshot = {
    objects: objectCount,
    actions: actionCount,
    links: project.links?.length || 0,
    integrations: project.integrations?.length || 0,
    aiAnalysisComplete: hasAIFeatures,
    qualityGrade: qualityReport?.grade || '-',
    qualityScore: qualityReport?.score || 0,
  };

  return {
    currentPhaseKey: currentPhase.nameKey,
    phaseProgress: currentPhase.progress,
    snapshot,
    blockers: detectBlockers(project, qualityReport, threeLayerReport),
    nextActions: generateNextActions(project, phases, qualityReport, threeLayerReport),
  };
}
