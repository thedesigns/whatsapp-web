import { create } from 'zustand';
import api from '../services/api';

interface TemplateComponent {
  type: string;
  format?: string;
  text?: string;
  buttons?: any[];
}

interface Template {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: TemplateComponent[];
}

interface TemplateState {
  templates: Template[];
  loading: boolean;
  
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: any) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  syncTemplates: () => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  loading: false,

  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/templates');
      set({ templates: response.data });
    } catch (error) {
      console.error('Failed to fetch templates', error);
    } finally {
      set({ loading: false });
    }
  },

  createTemplate: async (template: any) => {
    set({ loading: true });
    try {
      await api.post('/templates', template);
      const response = await api.get('/templates');
      set({ templates: response.data });
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMsg = errorData?.error || error.message;
      if (errorData?.fullError) {
        console.error('📋 Full Meta Error Object:', errorData.fullError);
      }
      console.error('❌ Template creation error:', errorMsg);
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  deleteTemplate: async (id: string) => {
    set({ loading: true });
    try {
      await api.delete(`/templates/${id}`);
      const response = await api.get('/templates');
      set({ templates: response.data });
    } catch (error) {
      console.error('Failed to delete template', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  syncTemplates: async () => {
    set({ loading: true });
    try {
      await api.post('/templates/sync');
      const response = await api.get('/templates');
      set({ templates: response.data });
    } catch (error: any) {
      console.error('Failed to sync templates', error);
      alert('Failed to sync templates: ' + (error.response?.data?.error || error.message));
    } finally {
      set({ loading: false });
    }
  },
}));
