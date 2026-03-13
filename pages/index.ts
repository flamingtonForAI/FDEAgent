// Page exports — only eagerly-loaded pages belong here.
// AcademyPage, ArchetypesPage, AIEnhancementPage, DeliveryPage are
// lazy-loaded via React.lazy() in App.tsx and must NOT be re-exported
// from this barrel (barrel re-exports defeat code-splitting).
export { ProjectsPage } from './ProjectsPage';
export { QuickStartPage } from './QuickStartPage';
export { ScoutingPage } from './ScoutingPage';
export { ModelingPage } from './ModelingPage';
export { IntegrationPage } from './IntegrationPage';
