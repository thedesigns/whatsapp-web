import { create } from 'zustand';
import { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  type Node, 
  type Edge, 
  type OnNodesChange, 
  type OnEdgesChange, 
  type OnConnect,
  type Connection
} from 'reactflow';
import api from '../services/api';

interface FlowInfo {
  id: string;
  name: string;
  triggerKeyword?: string;
  isActive?: boolean;
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  loading: boolean;
  flowList: FlowInfo[];
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number, y: number }) => void;
  duplicateNode: (node: Node) => void;
  updateNodeData: (id: string, data: any) => void;
  saveFlow: (flowId: string, name?: string, trigger?: string, isDefault?: boolean) => Promise<string | null>;
  loadFlow: (flowId: string) => Promise<any>;
  fetchFlows: () => Promise<void>;
  resetFlow: () => void;
  testFlow: (flowId: string, phoneNumber: string) => Promise<{ success: boolean; message?: string }>;
  deleteFlow: (flowId: string) => Promise<{ success: boolean; message?: string }>;
  toggleFlowStatus: (flowId: string, isActive: boolean) => Promise<boolean>;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [
    {
      id: 'start',
      type: 'input',
      data: { label: 'Start Flow' },
      position: { x: 250, y: 25 },
    },
  ],
  edges: [],
  loading: false,
  flowList: [],

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (type, position) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position,
      data: { label: `${type} node` },
    };
    set({
      nodes: [...get().nodes, newNode],
    });
  },

  duplicateNode: (node) => {
    const newNodeId = `${node.type}_${Date.now()}`;
    const newNode = {
      ...node,
      id: newNodeId,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      data: { ...node.data, label: `${node.data.label || 'Node'} (Copy)` },
      selected: true
    };
    set({
      nodes: get().nodes.map(n => ({...n, selected: false})).concat(newNode)
    });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },

  // Fetch all flows from backend
  fetchFlows: async () => {
    try {
      const response = await api.get('/chatbot/flows');
      set({ flowList: response.data });
    } catch (error) {
      console.error('Failed to fetch flows', error);
    }
  },

  // Save flow and return the ID (for new flows)
  saveFlow: async (flowId: string, name?: string, trigger?: string, isDefault: boolean = false) => {
    set({ loading: true });
    try {
      const response = await api.post(`/chatbot/flows/${flowId}`, {
        name: name || 'Untitled Flow',
        nodes: get().nodes,
        edges: get().edges,
        trigger: trigger || 'WELCOME',
        isDefault
      });
      // Refresh flow list after save and wait for it
      await get().fetchFlows();
      return response.data.id;
    } catch (error) {
      console.error('Failed to save flow', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  loadFlow: async (flowId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/chatbot/flows/${flowId}`);
      set({
        nodes: response.data.nodes || [
          {
            id: 'start',
            type: 'input',
            data: { label: 'Start Flow' },
            position: { x: 250, y: 25 },
          },
        ],
        edges: response.data.edges || [],
      });
      return response.data; // Return full flow data including name/trigger
    } catch (error) {
      console.error('Failed to load flow', error);
      // Reset to default if flow doesn't exist
      get().resetFlow();
      return null;
    } finally {
      set({ loading: false });
    }
  },

  resetFlow: () => {
    set({
      nodes: [
        {
          id: 'start',
          type: 'input',
          data: { label: 'Start Flow' },
          position: { x: 250, y: 25 },
        },
      ],
      edges: [],
    });
  },

  testFlow: async (flowId, phoneNumber) => {
    try {
      await api.post('/chatbot/test', { flowId, phoneNumber });
      return { success: true };
    } catch (e: any) {
      console.error('Test flow failed', e);
      return { success: false, message: e.response?.data?.error || e.message };
    }
  },

  deleteFlow: async (flowId: string) => {
    set({ loading: true });
    try {
      const response = await api.delete(`/chatbot/flows/${flowId}`);
      // Refresh flow list after deletion
      await get().fetchFlows();
      // Reset current flow state
      get().resetFlow();
      return { success: true, message: response.data.message };
    } catch (e: any) {
      console.error('Delete flow failed', e);
      return { success: false, message: e.response?.data?.error || e.message };
      set({ loading: false });
    }
  },

  toggleFlowStatus: async (flowId: string, isActive: boolean) => {
    try {
      await api.patch(`/chatbot/flows/${flowId}/status`, { isActive });
      
      // Update local state without full refetch for speed
      set(state => ({
        flowList: state.flowList.map(f => 
          f.id === flowId ? { ...f, isActive } : f
        )
      }));
      return true;
    } catch (error) {
      console.error('Failed to toggle flow status', error);
      return false;
    }
  },
}));
