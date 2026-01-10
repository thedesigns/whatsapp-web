import { create } from 'zustand';
import api from '../services/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  limits: string;
  isActive: boolean;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  wabaId?: string;
  phoneNumberId?: string;
  accessToken?: string;
  verifyToken?: string;
  isActive: boolean;
  subscriptionPlanId?: string;
  subscriptionPlan?: Plan;
  subscriptionStatus: string;
  billingCycle: string;
  subscriptionExpiry?: string;
  createdAt: string;
  _count?: {
    users: number;
    contacts: number;
    messages: number;
  };
}

interface PlatformStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalPlatformUsers: number;
  planDistribution: Record<string, number>;
  annualRevenue: number;
  newOrganizationsInRange: number;
  alerts: any[];
  insights: any[];
}

interface AdminState {
  organizations: Organization[];
  plans: Plan[];
  stats: PlatformStats | null;
  loading: boolean;
  
  fetchOrganizations: () => Promise<void>;
  fetchPlatformStats: (range?: string) => Promise<void>;
  createOrganization: (data: any) => Promise<void>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;

  fetchPlans: () => Promise<void>;
  createPlan: (data: any) => Promise<void>;
  updatePlan: (id: string, data: any) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  organizations: [],
  plans: [],
  stats: null,
  loading: false,

  fetchOrganizations: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/organizations');
      set({ organizations: response.data });
    } catch (error) {
      console.error('Failed to fetch organizations', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchPlatformStats: async (range = 'all') => {
    set({ loading: true });
    try {
      const response = await api.get(`/organizations/stats/platform?range=${range}`);
      set({ stats: response.data });
    } catch (error) {
      console.error('Failed to fetch platform stats', error);
    } finally {
      set({ loading: false });
    }
  },

  createOrganization: async (data) => {
    set({ loading: true });
    try {
      const response = await api.post('/organizations', data);
      set((state) => ({
        organizations: [response.data.organization, ...state.organizations]
      }));
    } catch (error) {
      console.error('Failed to create organization', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateOrganization: async (id, data) => {
    set({ loading: true });
    try {
      const response = await api.put(`/organizations/${id}`, data);
      set((state) => ({
        organizations: state.organizations.map((org) => 
          org.id === id ? { ...org, ...response.data.organization } : org
        )
      }));
    } catch (error) {
      console.error('Failed to update organization', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteOrganization: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/organizations/${id}`);
      set((state) => ({
        organizations: state.organizations.map((org) => 
          org.id === id ? { ...org, isActive: false } : org
        )
      }));
    } catch (error) {
      console.error('Failed to deactivate organization', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchPlans: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/plans');
      set({ plans: response.data });
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      set({ loading: false });
    }
  },

  createPlan: async (data) => {
    set({ loading: true });
    try {
      const response = await api.post('/plans', data);
      set((state) => ({ plans: [response.data, ...state.plans] }));
    } catch (error) {
      console.error('Failed to create plan', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePlan: async (id, data) => {
    set({ loading: true });
    try {
      const response = await api.put(`/plans/${id}`, data);
      set((state) => ({
        plans: state.plans.map((p) => p.id === id ? response.data : p)
      }));
    } catch (error) {
      console.error('Failed to update plan', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deletePlan: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/plans/${id}`);
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete plan', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
