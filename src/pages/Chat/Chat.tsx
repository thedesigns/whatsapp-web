import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../../store/chatStore';
import { socketService } from '../../services/socketService';
import { useAuth } from '../../store/authStore';
import { Search, Send, FileText, User, MoreVertical, Share2, Plus, Image as ImageIcon, Film, File, Check, CheckCheck, Loader2, ShoppingBag, MapPin, Filter, Download, MessageSquareReply, Radio, UserCheck, Volume2 } from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../../services/api';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Chat: React.FC = () => {
  const { user, token } = useAuth();
  const { 
    conversations, 
    fetchConversations, 
    selectedConversationId, 
    selectConversation, 
    messages, 
    sendMessage,
    sendMedia,
    addMessage,
    updateMessageStatus,
    broadcastLabels,
    selectedBroadcastFilter,
    fetchBroadcastLabels,
    setSelectedBroadcastFilter,
    exportToCSV
  } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  
  // Agent assignment state
  const [agents, setAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  
  // Ref for auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch agents for assignment dropdown
  const fetchAgents = async () => {
    setAgentsLoading(true);
    try {
      const response = await api.get('/agents');
      setAgents(response.data || []);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    } finally {
      setAgentsLoading(false);
    }
  };
  
  // Assign conversation to agent
  const handleAssignAgent = async (agentId: string) => {
    if (!selectedConversationId) return;
    try {
      await api.post(`/conversations/${selectedConversationId}/assign`, { agentId });
      setShowAssignMenu(false);
      fetchConversations(); // Refresh to show assignment
    } catch (err) {
      console.error('Failed to assign agent', err);
      alert('Failed to assign conversation');
    }
  };
  
  // Helper to get authenticated media URL (adds token for browser-direct access)
  const getMediaUrl = (mediaId: string | undefined) => {
    if (!mediaId) return '';
    const authToken = localStorage.getItem('token');
    return `${api.defaults.baseURL}/messages/media/${mediaId}?token=${authToken || ''}`;
  };

  useEffect(() => {
    fetchConversations();
    fetchBroadcastLabels();
    
    if (user?.organizationId && token) {
      const socket = socketService.connect(user.organizationId, token);
      
      socket?.on('new_message', (data: any) => {
        // Extract message from wrapper if needed
        const messageToAdd = data.message || data;
        addMessage(messageToAdd, data.conversation);
      });
      
      socket?.on('message_status', (data: any) => {
        updateMessageStatus(data.messageId, data.status);
      });

      socket?.on('new_conversation', (data: any) => {
        useChatStore.getState().addConversation(data.conversation);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversationId) return;
    
    const text = inputText;
    setInputText('');
    await sendMessage(selectedConversationId, text);
  };

  const handleFileUpload = async (type: string, file: File) => {
    if (!selectedConversationId) return;
    setIsUploading(true);
    setShowAttachMenu(false);
    try {
      await sendMedia(selectedConversationId, file, type);
    } catch (error) {
      console.error('File upload failed', error);
      alert('Failed to send file');
    } finally {
      setIsUploading(false);
    }
  };

  const conversationsArray = Array.isArray(conversations) ? conversations : [];
  
  const selectedConversation = conversationsArray.find(c => c.id === selectedConversationId);
  
  const filteredConversations = conversationsArray.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.waId || '').includes(searchTerm)
  );

  const safeFormatDate = (dateStr: string | undefined | null, formatStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return format(date, formatStr);
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="h-full flex space-x-6 overflow-hidden">
      {/* Conversation List */}
      <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          {/* Search and Filter Row */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="input pl-10 bg-gray-50 border-transparent focus:bg-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  selectedBroadcastFilter 
                    ? "bg-primary text-white" 
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                )}
                title="Filter by Broadcast"
              >
                <Filter size={18} />
              </button>
              
              {showFilterMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={() => { setSelectedBroadcastFilter(null); setShowFilterMenu(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      !selectedBroadcastFilter ? "bg-primary/10 text-primary" : "hover:bg-gray-50"
                    )}
                  >
                    All Conversations
                  </button>
                  {broadcastLabels.map((label) => (
                    <button 
                      key={label.id}
                      onClick={() => { setSelectedBroadcastFilter(label.id); setShowFilterMenu(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between",
                        selectedBroadcastFilter === label.id ? "bg-primary/10 text-primary" : "hover:bg-gray-50"
                      )}
                    >
                      <span className="flex items-center">
                        <Radio size={14} className="mr-2" />
                        {label.name}
                      </span>
                      <span className="text-xs text-gray-400">{label.conversationCount}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Export Button */}
            <button 
              onClick={exportToCSV}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all"
              title="Export to CSV"
            >
              <Download size={18} />
            </button>
          </div>
          
          {/* Active Filter Badge */}
          {selectedBroadcastFilter && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-500">Filtering:</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-bold flex items-center">
                <Radio size={12} className="mr-1" />
                {broadcastLabels.find(l => l.id === selectedBroadcastFilter)?.name}
                <button 
                  onClick={() => setSelectedBroadcastFilter(null)}
                  className="ml-2 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={cn(
                "w-full p-4 flex items-start space-x-3 transition-all hover:bg-gray-50/80 border-b border-gray-50 relative",
                selectedConversationId === conv.id && "bg-primary/5 hover:bg-primary/5 border-r-4 border-r-primary"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 shadow-sm border border-white shrink-0">
                {conv.name[0]}
              </div>
              <div className="flex-1 text-left overflow-hidden min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-bold text-gray-900 truncate">{conv.name}</h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">
                    {safeFormatDate(conv.updatedAt, 'HH:mm')}
                  </span>
                </div>
                
                {/* Mobile Number */}
                <p className="text-[11px] text-gray-400 font-medium mb-1">
                  {conv.waId || conv.contact?.phoneNumber || ''}
                </p>
                
                {/* Broadcast Label */}
                {(conv.broadcastName || conv.broadcast?.name) && (
                  <div className="mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      <Radio size={10} className="mr-1" />
                      {conv.broadcastName || conv.broadcast?.name}
                    </span>
                  </div>
                )}
                
                {/* Last Message Preview */}
                <p className="text-sm text-gray-500 truncate font-medium">
                  {conv.lastMessage || 'No messages yet'}
                </p>
                
                {/* Reply Badge */}
                {conv.isReply && (
                  <div className="mt-1">
                    <span className="inline-flex items-center text-[10px] font-bold text-green-600">
                      <MessageSquareReply size={12} className="mr-1" />
                      Reply
                    </span>
                  </div>
                )}
                
                {/* Assigned Agent Badge */}
                {conv.assignedAgent && (
                  <div className="mt-1">
                    <span className="inline-flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      <UserCheck size={10} className="mr-1" />
                      {conv.assignedAgent.name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Unread Count Circle Badge */}
              {conv.unreadCount > 0 && (
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm shrink-0">
                  {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-md z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {selectedConversation.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedConversation.name}</h3>
                  <p className="text-xs text-green-500 font-bold flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Assign to Agent Button */}
                <div className="relative">
                  <button 
                    onClick={() => { setShowAssignMenu(!showAssignMenu); if (!showAssignMenu) fetchAgents(); }}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-95 flex items-center space-x-1.5",
                      showAssignMenu ? "bg-primary text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-primary"
                    )}
                    title="Assign to Agent"
                  >
                    <UserCheck size={20} />
                  </button>
                  
                  {showAssignMenu && (
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Assign to Agent</h4>
                        <button 
                          onClick={() => setShowAssignMenu(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >×</button>
                      </div>
                      
                      {agentsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="animate-spin text-primary" size={20} />
                        </div>
                      ) : agents.length > 0 ? (
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {agents.map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => handleAssignAgent(agent.id)}
                              className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-left"
                            >
                              <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                  {agent.name?.[0] || 'A'}
                                </div>
                                {agent.isOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm truncate">{agent.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase">{agent.role}</p>
                              </div>
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                                {agent.activeConversations || 0}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-400 text-sm py-4">No agents available</p>
                      )}
                    </div>
                  )}
                </div>
                
                <button className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all active:scale-95">
                  <FileText size={20} />
                </button>
                <button className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all active:scale-95">
                  <User size={20} />
                </button>
                <button className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all active:scale-95">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {messages.map((msg, idx) => {
                const isAgent = msg.direction === 'OUTGOING';
                const showAvatar = idx === 0 || messages[idx-1].direction !== msg.direction;

                const renderMetadata = () => {
                  if (!msg.metadata) return null;
                  
                  let data;
                  try {
                    data = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
                  } catch (e) {
                    return null;
                  }

                  if (msg.type === 'ORDER') {
                    return (
                      <div className={cn(
                        "mb-3 p-4 rounded-xl border",
                        isAgent ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-100"
                      )}>
                        <div className="flex items-center space-x-2 mb-3">
                          <ShoppingBag size={18} className={isAgent ? "text-white" : "text-primary"} />
                          <span className="text-sm font-black uppercase tracking-tight">Order Received</span>
                        </div>
                        <div className="space-y-2">
                          {data.product_items?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-bold">{item.quantity}x {item.product_retailer_id}</span>
                              <span className="opacity-70">Price: {item.item_price} {item.currency}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-current/10 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase opacity-60">Catalog: {data.catalog_id}</span>
                        </div>
                      </div>
                    );
                  }

                  if (msg.type === 'INTERACTIVE') {
                    if (data.type === 'nfm_reply' && data.nfm_reply?.response_json) {
                      const response = JSON.parse(data.nfm_reply.response_json);
                      return (
                        <div className={cn(
                          "mb-3 p-4 rounded-xl border",
                          isAgent ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-100"
                        )}>
                          <div className="text-[10px] font-black uppercase opacity-60 mb-2">Form Submission</div>
                          <div className="space-y-1">
                            {Object.entries(response).map(([key, value]: [string, any], i) => (
                              <div key={i} className="flex flex-col">
                                <span className="text-[10px] font-bold text-primary uppercase">{key.replace(/_/g, ' ')}</span>
                                <span className="text-xs font-bold">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  }

                  if (msg.type === 'LOCATION') {
                    return (
                      <div className={cn(
                        "mb-3 p-3 rounded-xl border flex items-center space-x-3",
                        isAgent ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-100"
                      )}>
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase">Shared Location</p>
                          <p className="text-[10px] opacity-70 truncate">{data.latitude}, {data.longitude}</p>
                        </div>
                      </div>
                    );
                  }

                  return null;
                };

                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex items-end space-x-2",
                      isAgent ? "flex-row-reverse space-x-reverse" : "flex-row"
                    )}
                  >
                    {!isAgent && (
                      <div className={cn("w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400", !showAvatar && "opacity-0")}>
                        {selectedConversation.name[0]}
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[70%] p-3 px-4 rounded-2xl shadow-sm border relative group",
                      isAgent 
                        ? "bg-linear-to-br from-primary to-primary-hover text-white border-transparent rounded-br-none" 
                        : "bg-white text-gray-800 border-gray-100 rounded-bl-none"
                    )}>
                      {msg.type === 'IMAGE' ? (
                        <div className="mb-2">
                           <img 
                            src={getMediaUrl(msg.mediaId || msg.mediaUrl)} 
                            alt="attachment" 
                            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(getMediaUrl(msg.mediaId || msg.mediaUrl), '_blank')}
                          />
                        </div>
                      ) : msg.type === 'VIDEO' ? (
                        <div className="mb-2">
                           <video 
                            src={getMediaUrl(msg.mediaId || msg.mediaUrl)} 
                            controls
                            className="rounded-lg max-w-full h-auto"
                          />
                        </div>
                      ) : msg.type === 'DOCUMENT' ? (
                        <div className={cn(
                          "flex items-center space-x-3 p-2 rounded-xl mb-1",
                          isAgent ? "bg-white/10" : "bg-gray-50"
                        )}>
                          <File size={24} className={isAgent ? "text-white" : "text-primary"} />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate">{msg.fileName || 'Document'}</p>
                            <p className="text-[10px] opacity-70">{( (msg.mediaSize || 0) / 1024).toFixed(1)} KB</p>
                          </div>
                          <button 
                            onClick={() => window.open(getMediaUrl(msg.mediaId || msg.mediaUrl), '_blank')}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              isAgent ? "hover:bg-white/20 text-white" : "hover:bg-primary/10 text-primary"
                            )}
                          >
                            <Share2 size={14} />
                          </button>
                        </div>
                      ) : msg.type === 'AUDIO' ? (
                        <div className={cn(
                          "flex items-center space-x-3 p-3 rounded-xl mb-1",
                          isAgent ? "bg-white/10" : "bg-gray-50"
                        )}>
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            isAgent ? "bg-white/20" : "bg-primary/10"
                          )}>
                            <Volume2 size={20} className={isAgent ? "text-white" : "text-primary"} />
                          </div>
                          <audio 
                            src={getMediaUrl(msg.mediaId || msg.mediaUrl)} 
                            controls
                            className="flex-1 h-10"
                            style={{ maxWidth: '250px' }}
                          />
                        </div>
                      ) : null}
                      
                      {renderMetadata()}

                      {/* Show content only if not a media placeholder */}
                      {msg.content && !['[Image]', '[Video]', '[Document]', '[Audio]', '[image]', '[video]', '[document]', '[audio]'].includes(msg.content.trim()) && (
                        <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                      )}
                      <div className={cn(
                        "mt-1.5 flex items-center justify-end space-x-1",
                        isAgent ? "text-primary-light/80" : "text-gray-400"
                      )}>
                        <span className="text-[10px] font-bold">
                          {safeFormatDate(msg.timestamp, 'HH:mm')}
                        </span>
                        {isAgent && (
                          <span className="ml-1">
                            {msg.status === 'READ' ? (
                              <CheckCheck size={14} className="text-white" />
                            ) : (
                              <Check size={14} className="text-white/70" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isUploading && (
                <div className="flex justify-center p-2">
                   <div className="bg-white/80 backdrop-blur-sm self-center px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center space-x-2">
                      <Loader2 className="animate-spin text-primary" size={16} />
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Sending attachment...</span>
                   </div>
                </div>
              )}
              {/* Scroll anchor for auto-scroll to bottom */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white relative">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      showAttachMenu ? "bg-primary text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-primary"
                    )}
                  >
                    <Plus size={24} className={cn("transition-transform", showAttachMenu && "rotate-45")} />
                  </button>
                  
                  {showAttachMenu && (
                    <div className="absolute bottom-16 left-0 w-max bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
                      <div className="flex flex-col space-y-1">
                        <label className="flex items-center space-x-3 p-3 hover:bg-primary/5 rounded-xl cursor-pointer group transition-colors">
                          <ImageIcon className="text-primary group-hover:scale-110 transition-transform" size={20} />
                          <span className="text-sm font-bold text-gray-700">Images</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('image', e.target.files[0])} />
                        </label>
                        <label className="flex items-center space-x-3 p-3 hover:bg-primary/5 rounded-xl cursor-pointer group transition-colors">
                          <Film className="text-blue-500 group-hover:scale-110 transition-transform" size={20} />
                          <span className="text-sm font-bold text-gray-700">Videos</span>
                          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('video', e.target.files[0])} />
                        </label>
                        <label className="flex items-center space-x-3 p-3 hover:bg-primary/5 rounded-xl cursor-pointer group transition-colors">
                          <File className="text-orange-500 group-hover:scale-110 transition-transform" size={20} />
                          <span className="text-sm font-bold text-gray-700">Documents</span>
                          <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('document', e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="input pr-12 h-12 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 font-medium transition-all"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary transition-colors">
                    <User size={18} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isUploading}
                  className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all border-none"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/10">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
               <Share2 size={40} className="text-gray-300" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Your Workspace</h4>
            <p className="max-w-xs font-medium text-gray-500">
              Select a conversation from the sidebar to view chat history and start messaging in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
