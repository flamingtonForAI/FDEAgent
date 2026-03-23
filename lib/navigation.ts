import { ProjectState } from '../types';

// Valid workflow tabs (for restoring last position)
export type WorkflowTab =
  | 'projects' | 'quickStart' | 'academy' | 'archetypes' | 'pricing'
  | 'archetypeViewer'
  | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner'
  | 'systemMap' | 'aip' | 'overview'
  | 'aiEnhancement' | 'deliver';

export const validWorkflowTabs: WorkflowTab[] = [
  'projects', 'quickStart', 'academy', 'archetypes', 'pricing',
  'scouting', 'workbench', 'ontology', 'actionDesigner',
  'systemMap', 'aip', 'overview', 'aiEnhancement', 'deliver',
];

// Phase tabs that require an active project — single source of truth for
// chat bar visibility and bottom padding
export const projectPhaseTabs: WorkflowTab[] = [
  'scouting', 'workbench', 'ontology', 'actionDesigner',
  'systemMap', 'overview', 'aiEnhancement', 'aip', 'deliver',
];

export type Phase = 'discover' | 'model' | 'integrate' | 'enhance' | 'deliver';

export const tabToPhase = (tab: WorkflowTab): Phase => {
  switch (tab) {
    case 'scouting':
    case 'quickStart':
    case 'academy':
    case 'archetypes':
    case 'pricing':
    case 'projects':
      return 'discover';
    case 'workbench':
    case 'ontology':
    case 'actionDesigner':
      return 'model';
    case 'systemMap':
    case 'overview':
      return 'integrate';
    case 'aiEnhancement':
    case 'aip':
      return 'enhance';
    case 'deliver':
      return 'deliver';
    default:
      return 'discover';
  }
};

export const loadLastActiveTab = (): WorkflowTab => {
  try {
    const saved = localStorage.getItem('ontology-last-tab');
    if (saved && validWorkflowTabs.includes(saved as WorkflowTab)) {
      return saved as WorkflowTab;
    }
  } catch (e) {
    console.error('加载上次标签失败:', e);
  }
  return 'quickStart';
};

// Default empty project state
export const emptyProjectState: ProjectState = {
  industry: '',
  useCase: '',
  objects: [],
  links: [],
  integrations: [],
  aiRequirements: [],
  status: 'scouting',
};

