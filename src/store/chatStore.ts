import { create } from 'zustand';
import api from '../services/api';

interface Message {
  id: string;
  content: string;
  direction: 'INCOMING' | 'OUTGOING';
  timestamp: string;
  status: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'TEMPLATE' | 'ORDER' | 'INTERACTIVE' | 'BUTTON' | 'LOCATION';
  mediaUrl?: string;
  mediaId?: string;
  fileName?: string;
  mediaSize?: number;
  metadata?: any;
}

interface Conversation {
  id: string;
  waId: string;
  name: string;
  lastMessage?: string;
  updatedAt: string;
  unreadCount: number;
  assignedToId?: string;
  assignedAgent?: { id: string; name: string; avatar?: string };
  // Broadcast tracking
  broadcastId?: string;
  broadcastName?: string;
  isReply?: boolean;
  broadcast?: { id: string; name: string };
  contact?: { phoneNumber?: string };
}

interface BroadcastLabel {
  id: string;
  name: string;
  conversationCount: number;
}

interface ChatState {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Message[];
  loading: boolean;
  // Broadcast filter
  broadcastLabels: BroadcastLabel[];
  selectedBroadcastFilter: string | null;
  
  fetchConversations: (broadcastId?: string) => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  sendMedia: (conversationId: string, file: File, type: string, caption?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  addConversation: (conversation: any) => void;
  // Broadcast actions
  fetchBroadcastLabels: () => Promise<void>;
  setSelectedBroadcastFilter: (broadcastId: string | null) => void;
  exportToCSV: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  selectedConversationId: null,
  messages: [],
  loading: false,
  broadcastLabels: [],
  selectedBroadcastFilter: null,

  fetchConversations: async (broadcastId?: string) => {
    set({ loading: true });
    try {
      const params = broadcastId ? `?broadcastId=${broadcastId}` : '';
      const response = await api.get(`/conversations${params}`);
      const rawConversations = Array.isArray(response.data.conversations) 
        ? response.data.conversations 
        : (Array.isArray(response.data) ? response.data : []);

      const flattened = rawConversations.map((conv: any) => ({
        ...conv,
        name: conv.contact?.name || conv.contact?.profileName || 'Unknown',
        waId: conv.contact?.phoneNumber || conv.contact?.waId || '',
        lastMessage: conv.lastMessagePreview || '',
        unreadCount: conv.unreadCount || 0,
        broadcastId: conv.broadcastId || conv.broadcast?.id || null,
        broadcastName: conv.broadcastName || conv.broadcast?.name || null,
        isReply: conv.isReply || false,
        assignedAgent: conv.assignedAgent || null,
      }));

      set({ conversations: flattened });
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      set({ conversations: [] });
    } finally {
      set({ loading: false });
    }
  },

  selectConversation: async (id: string) => {
    set({ selectedConversationId: id, loading: true });
    try {
      const response = await api.get(`/messages/${id}`);
      set({ messages: response.data });
      
      // Mark as read when selected
      get().markAsRead(id);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (conversationId: string) => {
    try {
      // Find unread messages
      const state = get();
      const currentMessages = state.messages;
      const unreadIds = currentMessages
        .filter(m => m.direction === 'INCOMING' && m.status !== 'READ')
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await api.post(`/messages/${conversationId}/read`, { messageIds: unreadIds });
      }

      // Update local unread count
      set(state => ({
        conversations: state.conversations.map(c => 
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      }));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  },

  addMessage: (message) => {
    if (!message || !message.id) return;
    
    set((state) => {
      if (state.messages.find(m => m.id === message.id)) return state;

      const conversationId = (message as any).conversationId;
      const isCurrentlySelected = state.selectedConversationId === conversationId;
      
      const convExists = state.conversations.find(c => c.id === conversationId || c.waId === (message as any).waId);

      if (!convExists) {
        // If conversation doesn't exist, we should probably trigger a refresh or handle it
        // For now, let's just refresh the list to be safe and captured the new one
        get().fetchConversations();
      }

      // Move this conversation to top of list (new message behavior)
      const updatedConversations = state.conversations.map((c) =>
        c.id === conversationId || c.waId === (message as any).waId
          ? { 
              ...c, 
              lastMessage: message.content, 
              updatedAt: message.timestamp || new Date().toISOString(),
              unreadCount: (message.direction === 'INCOMING' && !isCurrentlySelected) 
                ? (c.unreadCount || 0) + 1 
                : c.unreadCount
            }
          : c
      );

      // Sort to put conversation with new message at top
      const convWithNewMessage = updatedConversations.find(c => c.id === conversationId);
      const reorderedConversations = convWithNewMessage
        ? [convWithNewMessage, ...updatedConversations.filter(c => c.id !== conversationId)]
        : updatedConversations;

      return {
        messages: isCurrentlySelected ? [...state.messages, message] : state.messages,
        conversations: reorderedConversations,
      };
    });
  },

  addConversation: (conv) => {
    set((state) => {
      if (state.conversations.find(c => c.id === conv.id)) return state;
      
      const newConv = {
        ...conv,
        name: conv.contact?.name || conv.contact?.profileName || 'Unknown',
        waId: conv.contact?.phoneNumber || conv.contact?.waId || '',
        lastMessage: conv.lastMessagePreview || '',
        unreadCount: conv.unreadCount || 0,
      };

      return {
        conversations: [newConv, ...state.conversations]
      };
    });
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, status } : m
      ),
    }));
  },

  sendMessage: async (conversationId, content) => {
    try {
      const response = await api.post(`/messages/${conversationId}`, { content });
      get().addMessage(response.data);
    } catch (error) {
      console.error('Failed to send message', error);
      throw error;
    }
  },

  sendMedia: async (conversationId, file, type, caption) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (caption) formData.append('caption', caption);

      const response = await api.post(`/messages/${conversationId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      get().addMessage(response.data);
    } catch (error) {
      console.error('Failed to send media', error);
      throw error;
    }
  },

  // Broadcast filter actions
  fetchBroadcastLabels: async () => {
    try {
      const response = await api.get('/conversations/broadcast-labels');
      set({ broadcastLabels: response.data || [] });
    } catch (error) {
      console.error('Failed to fetch broadcast labels', error);
      set({ broadcastLabels: [] });
    }
  },

  setSelectedBroadcastFilter: (broadcastId: string | null) => {
    set({ selectedBroadcastFilter: broadcastId });
    // Refetch conversations with filter
    get().fetchConversations(broadcastId || undefined);
  },

  exportToCSV: async () => {
    const state = get();
    const params = state.selectedBroadcastFilter ? `?broadcastId=${state.selectedBroadcastFilter}` : '';
    try {
      // Use authenticated API request with blob response
      const response = await api.get(`/conversations/export-csv${params}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inbox-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV', error);
      alert('Failed to export CSV');
    }
  },
}));
