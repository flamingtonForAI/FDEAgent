/**
 * Project Context
 * Provides multi-project management state and methods throughout the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { storage } from '../lib/storage';
import type { ProjectState, ChatMessage, Project, ProjectListItem } from '../types';

interface ProjectContextType {
  // Project list
  projects: ProjectListItem[];
  activeProjectId: string | null;
  activeProject: ProjectListItem | null;

  // Current project data
  currentOntology: ProjectState | null;
  currentChat: ChatMessage[];

  // Loading state
  isLoading: boolean;
  isInitialized: boolean;

  // Project operations
  createProject: (params: {
    name: string;
    industry: string;
    useCase: string;
    description?: string;
    baseArchetypeId?: string;
    baseArchetypeName?: string;
    initialState?: ProjectState;
  }) => Project;
  switchProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Pick<ProjectListItem, 'name' | 'description' | 'industry' | 'status' | 'tags'>>) => void;

  // Current project data operations
  setCurrentOntology: (state: ProjectState) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;

  // Refresh projects list
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentOntology, setCurrentOntologyState] = useState<ProjectState | null>(null);
  const [currentChat, setCurrentChatState] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Ref to track if we're switching projects (to prevent save during switch)
  const isSwitchingRef = useRef(false);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Run migration if needed
        if (storage.needsMigration()) {
          storage.migrateOldData();
        }

        // Clean up legacy global data (e.g., old ontology-chat-messages key)
        storage.cleanupLegacyData();

        // Load projects list
        const projectList = storage.listProjectsLocal();
        setProjects(projectList);

        // Get active project
        let activeId = storage.getActiveProjectId();

        // If no active project but have projects, select the first one
        if (!activeId && projectList.length > 0) {
          activeId = projectList[0].id;
          storage.setActiveProjectId(activeId);
        }

        if (activeId) {
          setActiveProjectId(activeId);
          // Load project data
          const state = storage.getProjectStateById(activeId);
          const chat = storage.getChatMessagesById(activeId);
          setCurrentOntologyState(state);
          setCurrentChatState(chat);
        }
      } catch (error) {
        console.error('Failed to initialize project context:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // Auto-save current ontology when it changes
  useEffect(() => {
    if (!isInitialized || !activeProjectId || isSwitchingRef.current) return;
    if (!currentOntology) return;

    // Debounce save
    const timer = setTimeout(() => {
      storage.saveProjectStateById(activeProjectId, currentOntology);
      // Refresh projects list to update progress
      setProjects(storage.listProjectsLocal());
    }, 500);

    return () => clearTimeout(timer);
  }, [currentOntology, activeProjectId, isInitialized]);

  // Auto-save chat messages when they change
  useEffect(() => {
    if (!isInitialized || !activeProjectId || isSwitchingRef.current) return;

    // Debounce save
    const timer = setTimeout(() => {
      storage.saveChatMessagesById(activeProjectId, currentChat);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentChat, activeProjectId, isInitialized]);

  // Get active project metadata
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  // Create a new project
  const createProject = useCallback((params: {
    name: string;
    industry: string;
    useCase: string;
    description?: string;
    baseArchetypeId?: string;
    baseArchetypeName?: string;
    initialState?: ProjectState;
  }): Project => {
    const project = storage.createProject(params);

    // Refresh projects list
    setProjects(storage.listProjectsLocal());

    // Switch to new project
    setActiveProjectId(project.id);
    const state = storage.getProjectStateById(project.id);
    const chat = storage.getChatMessagesById(project.id);
    setCurrentOntologyState(state);
    setCurrentChatState(chat);

    return project;
  }, []);

  // Switch to a different project
  const switchProject = useCallback(async (projectId: string) => {
    if (projectId === activeProjectId) return;

    isSwitchingRef.current = true;
    setIsLoading(true);

    try {
      // Save current project data first
      if (activeProjectId && currentOntology) {
        storage.saveProjectStateById(activeProjectId, currentOntology);
        storage.saveChatMessagesById(activeProjectId, currentChat);
      }

      // Load new project data
      const state = storage.getProjectStateById(projectId);
      const chat = storage.getChatMessagesById(projectId);

      // Update state
      storage.setActiveProjectId(projectId);
      setActiveProjectId(projectId);
      setCurrentOntologyState(state);
      setCurrentChatState(chat);

      // Refresh projects list
      setProjects(storage.listProjectsLocal());
    } catch (error) {
      console.error('Failed to switch project:', error);
    } finally {
      setIsLoading(false);
      isSwitchingRef.current = false;
    }
  }, [activeProjectId, currentOntology, currentChat]);

  // Delete a project
  const deleteProject = useCallback((projectId: string) => {
    storage.deleteProject(projectId);

    // Update state
    const newProjects = storage.listProjectsLocal();
    setProjects(newProjects);

    // If deleted active project, switch to another
    if (projectId === activeProjectId) {
      const newActiveId = storage.getActiveProjectId();
      setActiveProjectId(newActiveId);
      if (newActiveId) {
        const state = storage.getProjectStateById(newActiveId);
        const chat = storage.getChatMessagesById(newActiveId);
        setCurrentOntologyState(state);
        setCurrentChatState(chat);
      } else {
        setCurrentOntologyState(null);
        setCurrentChatState([]);
      }
    }
  }, [activeProjectId]);

  // Update project metadata
  const updateProject = useCallback((
    projectId: string,
    updates: Partial<Pick<ProjectListItem, 'name' | 'description' | 'industry' | 'status' | 'tags'>>
  ) => {
    storage.updateProject(projectId, updates);
    setProjects(storage.listProjectsLocal());
  }, []);

  // Set current ontology (for external updates)
  const setCurrentOntology = useCallback((state: ProjectState) => {
    setCurrentOntologyState(state);
  }, []);

  // Set chat messages
  const setChatMessages = useCallback((messages: ChatMessage[]) => {
    setCurrentChatState(messages);
  }, []);

  // Add a single chat message
  const addChatMessage = useCallback((message: ChatMessage) => {
    setCurrentChatState(prev => [...prev, message]);
  }, []);

  // Refresh projects list
  const refreshProjects = useCallback(() => {
    setProjects(storage.listProjectsLocal());
  }, []);

  const value: ProjectContextType = {
    projects,
    activeProjectId,
    activeProject,
    currentOntology,
    currentChat,
    isLoading,
    isInitialized,
    createProject,
    switchProject,
    deleteProject,
    updateProject,
    setCurrentOntology,
    setChatMessages,
    addChatMessage,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

export { ProjectContext };
