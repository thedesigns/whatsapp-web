import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Users, 
  UserCheck,
  UserCog,
  ShieldCheck,
  Plus,
  Search, 
  Loader2,
  X,
  Key,
  Trash2,
  Edit3,
  ClipboardList,
  Circle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'AGENT';
  isOnline?: boolean;
  isActive?: boolean;
  avatar?: string;
  createdAt?: string;
  activeConversations?: number;
}

interface Conversation {
  id: string;
  contact?: { name?: string; phoneNumber?: string };
  lastMessagePreview?: string;
}

const AgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<{id: string, name: string} | null>(null);
  
  // Conversations for task assignment
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  
  // New agent form
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    password: '',
    role: 'AGENT' as 'ADMIN' | 'SUPERVISOR' | 'AGENT'
  });

  // Fetch agents
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/agents');
      setAgents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unassigned conversations for task assignment
  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const response = await api.get('/conversations');
      const convs = response.data.conversations || response.data || [];
      // Filter to show unassigned or all conversations
      setConversations(convs.slice(0, 20)); // Limit to 20 for dropdown
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Filter agents
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalAgents = agents.length;
  const onlineAgents = agents.filter(a => a.isOnline).length;
  const adminCount = agents.filter(a => a.role === 'ADMIN').length;
  const supervisorCount = agents.filter(a => a.role === 'SUPERVISOR').length;
  const agentCount = agents.filter(a => a.role === 'AGENT').length;

  // Create agent
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/agents', newAgent);
      setIsAddModalOpen(false);
      setNewAgent({ name: '', email: '', password: '', role: 'AGENT' });
      fetchAgents();
      alert('Agent created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create agent');
    }
  };

  // Update agent
  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    try {
      const updateData: any = {
        name: selectedAgent.name,
        email: selectedAgent.email,
        role: selectedAgent.role
      };
      // Only include password if provided
      if ((selectedAgent as any).newPassword) {
        updateData.password = (selectedAgent as any).newPassword;
      }
      await api.put(`/agents/${selectedAgent.id}`, updateData);
      setIsEditModalOpen(false);
      setSelectedAgent(null);
      fetchAgents();
      alert('Agent updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update agent');
    }
  };

  // Delete agent
  const handleDeleteClick = (agentId: string, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      await api.delete(`/agents/${agentToDelete.id}`);
      setIsDeleteConfirmOpen(false);
      setAgentToDelete(null);
      fetchAgents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete agent');
    }
  };

  // Assign task to agent
  const handleAssignTask = async (conversationId: string) => {
    if (!selectedAgent) return;
    try {
      await api.post(`/conversations/${conversationId}/assign`, { agentId: selectedAgent.id });
      setIsAssignTaskModalOpen(false);
      setSelectedAgent(null);
      alert('Conversation assigned successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to assign conversation');
    }
  };

  const openAssignTaskModal = (agent: Agent) => {
    setSelectedAgent(agent);
    fetchConversations();
    setIsAssignTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agent Management</h1>
          <p className="text-gray-500 font-medium text-sm">Manage team members, roles, and task assignments</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center space-x-2 h-12 px-6 shadow-lg shadow-primary/20"
        >
           <Plus size={20} />
           <span>Add Agent</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4">
         <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
               <Users size={22} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Agents</p>
               <h3 className="text-xl font-black text-gray-900">{totalAgents}</h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <Circle size={22} className="fill-current" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Online</p>
               <h3 className="text-xl font-black text-gray-900">{onlineAgents}</h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
               <ShieldCheck size={22} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admins</p>
               <h3 className="text-xl font-black text-gray-900">{adminCount}</h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
               <UserCheck size={22} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supervisors</p>
               <h3 className="text-xl font-black text-gray-900">{supervisorCount}</h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <UserCog size={22} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agents</p>
               <h3 className="text-xl font-black text-gray-900">{agentCount}</h3>
            </div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search agents..." 
                className="input h-12 pl-12 bg-gray-50 border-transparent focus:bg-white text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Agent</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Active Chats</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
                      <p className="text-gray-400 font-bold">Loading agents...</p>
                   </td>
                </tr>
              ) : filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            {agent.name[0]}
                          </div>
                          {agent.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest",
                          agent.role === 'ADMIN' ? "bg-red-100 text-red-600" : 
                          agent.role === 'SUPERVISOR' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                       )}>{agent.role}</span>
                    </td>
                    <td className="px-8 py-5">
                       <span className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center w-fit",
                          agent.isOnline ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"
                       )}>
                         <Circle size={8} className={cn("mr-1.5", agent.isOnline ? "fill-current" : "")} />
                         {agent.isOnline ? 'Online' : 'Offline'}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-gray-700">{agent.activeConversations || 0}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end space-x-1">
                          <button 
                            onClick={() => openAssignTaskModal(agent)}
                            className="p-2 bg-transparent text-gray-300 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                            title="Assign Task"
                          >
                             <ClipboardList size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAgent({...agent});
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 bg-transparent text-gray-300 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                            title="Edit"
                          >
                             <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(agent.id, agent.name)}
                            className="p-2 bg-transparent text-gray-300 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                            title="Delete"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">No agents found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Plus size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">Add New Agent</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Create team member account</p>
                   </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                   <X size={20} />
                </button>
             </div>

             <form onSubmit={handleCreateAgent} className="p-8 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                   <input 
                     required
                     type="text" 
                     className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold w-full"
                     placeholder="John Doe"
                     value={newAgent.name}
                     onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                   <input 
                     required
                     type="email" 
                     className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold w-full"
                     placeholder="john@example.com"
                     value={newAgent.email}
                     onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                   <div className="relative">
                      <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input 
                        required
                        type="password" 
                        className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold w-full"
                        placeholder="Minimum 6 characters"
                        value={newAgent.password}
                        onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                      />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                   <select 
                     className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm w-full"
                     value={newAgent.role}
                     onChange={(e) => setNewAgent({...newAgent, role: e.target.value as any})}
                   >
                      <option value="AGENT">Agent</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Admin</option>
                   </select>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsAddModalOpen(false)}
                     className="flex-1 h-14 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all text-xs"
                   >
                      Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 btn-primary h-14 rounded-2xl font-black shadow-xl shadow-primary/20"
                   >
                      Create Agent
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {isEditModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Edit3 size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">Edit Agent</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedAgent.email}</p>
                   </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                   <X size={20} />
                </button>
             </div>

             <form onSubmit={handleUpdateAgent} className="p-8 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                   <input 
                     required
                     type="text" 
                     className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold w-full"
                     value={selectedAgent.name}
                     onChange={(e) => setSelectedAgent({...selectedAgent, name: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                   <input 
                     required
                     type="email" 
                     className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold w-full"
                     value={selectedAgent.email}
                     onChange={(e) => setSelectedAgent({...selectedAgent, email: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password (leave blank to keep current)</label>
                   <div className="relative">
                      <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input 
                        type="password" 
                        className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold w-full"
                        placeholder="Enter new password"
                        onChange={(e) => setSelectedAgent({...selectedAgent, newPassword: e.target.value} as any)}
                      />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                   <select 
                     className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm w-full"
                     value={selectedAgent.role}
                     onChange={(e) => setSelectedAgent({...selectedAgent, role: e.target.value as any})}
                   >
                      <option value="AGENT">Agent</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Admin</option>
                   </select>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsEditModalOpen(false)}
                     className="flex-1 h-14 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all text-xs"
                   >
                      Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 btn-primary h-14 rounded-2xl font-black shadow-xl shadow-primary/20"
                   >
                      Save Changes
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && agentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-2">
                 <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-gray-900 tracking-tight">Delete Agent?</h3>
                 <p className="text-sm font-medium text-gray-500 leading-relaxed">
                   Are you sure you want to delete <span className="font-bold text-gray-900">"{agentToDelete.name}"</span>? This action will deactivate their account.
                 </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full pt-2">
                 <button 
                   onClick={() => setIsDeleteConfirmOpen(false)}
                   className="h-12 rounded-xl font-black text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={confirmDeleteAgent}
                   className="h-12 rounded-xl font-black bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all uppercase tracking-widest text-xs"
                 >
                    Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {isAssignTaskModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ClipboardList size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">Assign Conversation</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To: {selectedAgent.name}</p>
                   </div>
                </div>
                <button onClick={() => setIsAssignTaskModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                   <X size={20} />
                </button>
             </div>

             <div className="p-6 flex-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleAssignTask(conv.id)}
                        className="w-full flex items-center space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-all text-left border border-gray-100"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                          {(conv.contact?.name || conv.contact?.phoneNumber || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{conv.contact?.name || conv.contact?.phoneNumber || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 truncate">{conv.lastMessagePreview || 'No message'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 font-bold py-10">No conversations available</p>
                )}
             </div>

             <div className="p-6 border-t border-gray-50">
                <button 
                  onClick={() => setIsAssignTaskModalOpen(false)}
                  className="w-full h-12 rounded-xl font-black text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                >
                   Cancel
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;
