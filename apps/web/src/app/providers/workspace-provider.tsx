import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Workspace {
  _id: string;
  name: string;
}

interface WorkspaceContextValue {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(() => {
    const stored = localStorage.getItem('devflow-active-workspace');
    return stored && stored !== 'null' ? stored : null;
  });

  const queryClient = useQueryClient();
  const creatingRef = useRef(false);

  const setActiveWorkspaceId = useCallback((id: string) => {
    setActiveWorkspaceIdState(id);
    localStorage.setItem('devflow-active-workspace', id);
  }, []);

  const { data: workspaces } = useQuery<Workspace[]>({
    queryKey: ['workspaces', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/workspaces/me');
      return data.data as Workspace[];
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const { mutate: createWorkspaceMutate } = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/workspaces', { name: 'My Workspace' });
      return data.data.workspace as Workspace;
    },
    onSuccess: (ws) => {
      setActiveWorkspaceId(ws._id);
      queryClient.invalidateQueries({ queryKey: ['workspaces', 'me'] });
    },
    onSettled: () => {
      creatingRef.current = false;
    },
  });

  useEffect(() => {
    if (!workspaces || activeWorkspaceId) return;

    if (workspaces.length > 0) {
      setActiveWorkspaceId(workspaces[0]._id);
    } else if (!creatingRef.current) {
      creatingRef.current = true;
      createWorkspaceMutate();
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspaceId, createWorkspaceMutate]);

  const value = useMemo(
    () => ({ activeWorkspaceId, setActiveWorkspaceId }),
    [activeWorkspaceId, setActiveWorkspaceId],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
