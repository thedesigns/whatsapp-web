import { create } from 'zustand';
import api from '../services/api';

interface Contact {
  id: string;
  waId: string;
  name: string;
  phoneNumber: string;
  labels: string[];
  createdAt: string;
  lastConversationAt?: string;
}

interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  _count?: {
    contacts: number;
  };
}

interface ContactState {
  contacts: Contact[];
  groups: ContactGroup[];
  loading: boolean;
  groupsLoading: boolean;
  total: number;
  
  fetchContacts: (page?: number, limit?: number, search?: string, groupId?: string, groupIds?: string | string[]) => Promise<void>;
  createContact: (data: Partial<Contact>) => Promise<void>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  bulkImport: (contacts: any[], groupId?: string) => Promise<void>;
  
  fetchGroups: () => Promise<void>;
  createGroup: (data: Partial<ContactGroup>) => Promise<void>;
  updateGroup: (id: string, data: Partial<ContactGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  groups: [],
  loading: false,
  groupsLoading: false,
  total: 0,

  fetchContacts: async (page = 1, limit = 10, search = '', groupId = '', groupIds = []) => {
    set({ loading: true });
    try {
      const response = await api.get('/contacts', { 
        params: { page, limit, search, groupId, groupIds } 
      });
      set({ contacts: response.data.contacts, total: response.data.total });
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    } finally {
      set({ loading: false });
    }
  },

  createContact: async (data) => {
    try {
      const response = await api.post('/contacts', data);
      set((state) => ({ contacts: [response.data, ...state.contacts], total: state.total + 1 }));
    } catch (error) {
      console.error('Failed to create contact', error);
      throw error;
    }
  },

  updateContact: async (id, data) => {
    try {
      const response = await api.patch(`/contacts/${id}`, data);
      set((state) => ({
        contacts: state.contacts.map((c) => (c.id === id ? response.data : c)),
      }));
    } catch (error) {
      console.error('Failed to update contact', error);
      throw error;
    }
  },

  deleteContact: async (id) => {
    try {
      await api.delete(`/contacts/${id}`);
      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
        total: state.total - 1
      }));
    } catch (error) {
      console.error('Failed to delete contact', error);
      throw error;
    }
  },

  bulkImport: async (contacts, groupId) => {
    try {
      await api.post('/contacts/bulk', { contacts, groupId });
      // Refresh list after import
      await get().fetchContacts(1, 10);
      await get().fetchGroups();
    } catch (error) {
      console.error('Failed to import contacts', error);
      throw error;
    }
  },

  fetchGroups: async () => {
    set({ groupsLoading: true });
    try {
      const response = await api.get('/contacts/groups');
      set({ groups: response.data });
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      set({ groupsLoading: false });
    }
  },

  createGroup: async (data) => {
    try {
      const response = await api.post('/contacts/groups', data);
      set((state) => ({ groups: [...state.groups, response.data] }));
    } catch (error) {
      console.error('Failed to create group', error);
      throw error;
    }
  },

  updateGroup: async (id, data) => {
    try {
      const response = await api.patch(`/contacts/groups/${id}`, data);
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? response.data : g)),
      }));
    } catch (error) {
      console.error('Failed to update group', error);
      throw error;
    }
  },

  deleteGroup: async (id) => {
    try {
      await api.delete(`/contacts/groups/${id}`);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete group', error);
      throw error;
    }
  },
}));
