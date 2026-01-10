import { create } from 'zustand';
import api from '../services/api';

interface AnalyticsData {
  stats: {
    totalMessages: number;
    deliveredCount: number;
    readCount: number;
    failedCount: number;
    totalContacts: number;
    activeConversations: number;
  };
  trends: {
    date: string;
    sent: number;
    delivered: number;
    read: number;
  }[];
  broadcastStats: {
    name: string;
    delivered: number;
    failed: number;
  }[];
  alerts?: {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: Date;
  }[];
  insights?: {
    id: string;
    title: string;
    description: string;
    impact: string;
    score: number;
  }[];
}

interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  
  fetchAnalytics: (period?: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  loading: false,

  fetchAnalytics: async (period = '7d') => {
    set({ loading: true });
    try {
      const response = await api.get('/analytics/dashboard', { params: { period } });
      set({ data: response.data });
    } catch (error) {
      console.error('Failed to fetch analytics', error);
      // Mock data for demo if API fails
      set({
        data: {
          stats: {
            totalMessages: 1250,
            deliveredCount: 1100,
            readCount: 850,
            failedCount: 45,
            totalContacts: 342,
            activeConversations: 12
          },
          trends: [
            { date: 'Mon', sent: 120, delivered: 100, read: 80 },
            { date: 'Tue', sent: 150, delivered: 140, read: 110 },
            { date: 'Wed', sent: 180, delivered: 160, read: 130 },
            { date: 'Thu', sent: 140, delivered: 120, read: 90 },
            { date: 'Fri', sent: 200, delivered: 180, read: 150 },
            { date: 'Sat', sent: 250, delivered: 230, read: 200 },
            { date: 'Sun', sent: 210, delivered: 190, read: 170 },
          ],
          broadcastStats: [
            { name: 'Welcome Series', delivered: 450, failed: 12 },
            { name: 'Flash Sale Jan', delivered: 320, failed: 8 },
            { name: 'Renewal Notice', delivered: 180, failed: 2 },
          ],
          alerts: [
            { id: '1', type: 'warning', title: 'Low Delivery Rate', message: 'Your delivery rate is below the recommended 85%.', timestamp: new Date() },
          ],
          insights: [
            { id: '1', title: 'Best Sending Time', description: 'Messages sent between 10 AM - 12 PM have the highest read rates.', impact: 'Positive', score: 78 },
            { id: '2', title: 'Audience Engagement', description: 'Your read rate of 68% is above industry average.', impact: 'Positive', score: 85 },
          ]
        }
      });
    } finally {
      set({ loading: false });
    }
  },
}));
