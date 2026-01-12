import { create } from 'zustand';
import api from '../services/api';

interface Broadcast {
  id: string;
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'SCHEDULED';
  templateName: string;
  createdAt: string;
  scheduledAt?: string;
  successCount: number;
  failedCount: number;
  totalRecipients: number;
}

interface BroadcastState {
  broadcasts: Broadcast[];
  loading: boolean;
  
  fetchBroadcasts: () => Promise<void>;
  createBroadcast: (data: any) => Promise<void>;
  deleteBroadcast: (id: string) => Promise<void>;
  getBroadcastReport: (id: string) => Promise<any>;
}

export const useBroadcastStore = create<BroadcastState>((set) => ({
  broadcasts: [],
  loading: false,

  fetchBroadcasts: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/broadcasts');
      set({ broadcasts: response.data });
    } catch (error) {
      console.error('Failed to fetch broadcasts', error);
    } finally {
      set({ loading: false });
    }
  },

  createBroadcast: async (data) => {
    set({ loading: true });
    try {
      await api.post('/broadcasts', data);
      // Refetch all broadcasts to get complete data including name and templateName
      const response = await api.get('/broadcasts');
      set({ broadcasts: response.data });
    } catch (error) {
      console.error('Failed to create broadcast', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteBroadcast: async (id) => {
    try {
      await api.delete(`/broadcasts/${id}`);
      set((state) => ({
        broadcasts: state.broadcasts.filter((b) => b.id !== id),
      }));
    } catch (error: any) {
      console.error('Failed to delete broadcast', error);
      alert('Failed to delete broadcast: ' + (error.response?.data?.error || error.message));
    }
  },

  getBroadcastReport: async (id) => {
    try {
      const response = await api.get(`/broadcasts/${id}/report`);
      return response.data;
    } catch (error) {
      console.error('Failed to get broadcast report', error);
      throw error;
    }
  },
}));
