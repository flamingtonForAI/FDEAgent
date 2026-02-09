/**
 * useProjects hook
 * Provides project management functionality with cloud sync
 */

import { useState, useCallback, useEffect } from 'react';
import { projectService, type ProjectSummary, type Project } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';

interface UseProjectsReturn {
  projects: ProjectSummary[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: {
    name: string;
    industry?: string;
    useCase?: string;
  }) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedProjects = await projectService.listProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const createProject = useCallback(
    async (data: { name: string; industry?: string; useCase?: string }) => {
      if (!isAuthenticated) {
        throw new Error('Must be authenticated to create projects');
      }

      const newProject = await projectService.createProject(data);

      // Update local state
      setProjects((prev) => [
        {
          id: newProject.id,
          name: newProject.name,
          industry: newProject.industry,
          useCase: newProject.useCase,
          status: newProject.status,
          createdAt: newProject.createdAt,
          updatedAt: newProject.updatedAt,
        },
        ...prev,
      ]);

      return newProject;
    },
    [isAuthenticated]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        throw new Error('Must be authenticated to delete projects');
      }

      await projectService.deleteProject(id);

      // Update local state
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [isAuthenticated]
  );

  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  // Fetch projects when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [isAuthenticated, fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    deleteProject,
    refreshProjects,
  };
}
