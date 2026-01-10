import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Plus,
  Search, 
  ShieldCheck,
  Loader2,
  Settings,
  X,
  Calendar,
  Key,
  Database,
  Share2,
  Trash2,
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const OrganizationManagement: React.FC = () => {
  const { organizations, plans, loading, fetchOrganizations, updateOrganization, deleteOrganization, fetchPlans, createOrganization } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{id: string, name: string} | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [newOrg, setNewOrg] = useState({
    name: '',
    adminEmail: '',
    adminName: '',
    adminPassword: '',
    subscriptionPlanId: '',
    subscriptionStatus: 'ACTIVE',
    billingCycle: 'MONTHLY'
  });

  useEffect(() => {
    fetchOrganizations();
    fetchPlans();
  }, []);

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrganization(newOrg);
      setIsCreateModalOpen(false);
      setNewOrg({
        name: '', adminName: '', adminEmail: '', adminPassword: '',
        subscriptionPlanId: '', subscriptionStatus: 'ACTIVE', billingCycle: 'MONTHLY'
      });
      alert('Subscription account created successfully.');
    } catch (err) {
      alert('Failed to create subscription');
    }
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    try {
      await updateOrganization(selectedOrg.id, {
        name: selectedOrg.name,
        wabaId: selectedOrg.wabaId,
        phoneNumberId: selectedOrg.phoneNumberId,
        accessToken: selectedOrg.accessToken,
        subscriptionPlanId: selectedOrg.subscriptionPlanId,
        subscriptionStatus: selectedOrg.subscriptionStatus,
        billingCycle: selectedOrg.billingCycle,
        subscriptionExpiry: selectedOrg.subscriptionExpiry,
        adminName: selectedOrg.adminName,
        adminEmail: selectedOrg.adminEmail,
        adminPassword: selectedOrg.adminPassword
      } as any);
      setIsEditModalOpen(false);
      setSelectedOrg(null);
    } catch (err) {
      alert('Failed to update customer subscription');
    }
  };

  const handleDeleteClick = (orgId: string, orgName: string) => {
    setOrgToDelete({ id: orgId, name: orgName });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteOrg = async () => {
    if (!orgToDelete) return;
    try {
      await deleteOrganization(orgToDelete.id);
      setIsDeleteConfirmOpen(false);
      setOrgToDelete(null);
    } catch (err) {
      console.error('Failed to terminate subscription', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Subscribed Customers</h1>
          <p className="text-gray-500 font-medium text-sm">Monitor and manage platform tenants and billing lifecycles</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center space-x-2 h-12 px-6 shadow-lg shadow-primary/20"
        >
           <Plus size={20} />
           <span>Add Customer</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
               <Building2 size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Accounts</p>
               <h3 className="text-2xl font-black text-gray-900">{organizations.filter(o => o.isActive).length}</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
               <CreditCard size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue Status</p>
               <h3 className="text-2xl font-black text-gray-900">Optimal</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <Users size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Seats</p>
               <h3 className="text-2xl font-black text-gray-900">{organizations.reduce((acc, o) => acc + (o._count?.users || 0), 0)}</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance</p>
               <h3 className="text-2xl font-black text-gray-900">100%</h3>
            </div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search organizations..." 
                className="input h-12 pl-12 bg-gray-50 border-transparent focus:bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-secondary h-12 px-6 flex items-center space-x-2">
               <Edit3 size={18} />
               <span>System Config</span>
            </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Customer Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Subscription & Billing</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Meta API Config</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
                      <p className="text-gray-400 font-bold">Synchronizing platform data...</p>
                   </td>
                </tr>
              ) : filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          {org.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 tracking-tight">{org.name}</p>
                          <p className="text-xs text-gray-500 font-medium">Joined {format(new Date(org.createdAt), 'MMM yyyy')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                             <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                (org.subscriptionPlan as any)?.name === 'PREMIUM' ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"
                              )}>{(org.subscriptionPlan as any)?.name || 'No Plan'}</span>
                             <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-blue-50 text-blue-600",
                             )}>{org.billingCycle || 'MONTHLY'}</span>
                             <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                org.isActive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                             )}>{org.isActive ? 'Active' : 'Locked'}</span>
                          </div>
                          {org.subscriptionExpiry && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Exp: {format(new Date(org.subscriptionExpiry), 'MMM dd, yyyy')}</p>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center border",
                            org.wabaId ? "bg-primary/5 border-primary/20 text-primary" : "bg-gray-50 border-gray-100 text-gray-300"
                          )}>
                             <Share2 size={16} />
                          </div>
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center border",
                            org.accessToken ? "bg-primary/5 border-primary/20 text-primary" : "bg-gray-50 border-gray-100 text-gray-300"
                          )}>
                             <Key size={16} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{org.wabaId ? 'Connected' : 'Unset'}</span>
                             <span className="text-[9px] font-bold text-gray-300 truncate w-32">{org.wabaId || 'No Business ID'}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end space-x-2 ">
                          <button 
                            onClick={() => {
                              setSelectedOrg({...org});
                              setIsEditModalOpen(true);
                            }}
                            className="p-2.5 bg-transparent text-gray-300 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                          >
                             <Edit3 size={18} />
                          </button>
                          {org.isActive ? (
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDeleteClick(org.id, org.name); 
                              }} 
                              className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-red-100 transition-all ml-2"
                            >
                               Deactivate
                            </button> 
                          ) : ( 
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                updateOrganization(org.id, { isActive: true }); 
                              }} 
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 transition-all ml-2"
                            >
                               Reactivate
                            </button> 
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">No organizations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Settings size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">Organization Control</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedOrg.name}</p>
                   </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                   <X size={20} />
                </button>
             </div>

             <form onSubmit={handleUpdateOrg} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                 {/* Organization Details Section */}
                 <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-primary">
                       <Building2 size={20} />
                       <h4 className="font-black uppercase tracking-tight text-sm">Organization Details</h4>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Organization Name</label>
                       <input 
                         type="text" 
                         className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                         placeholder="Organization Name"
                         value={selectedOrg.name || ''}
                         onChange={(e) => setSelectedOrg({...selectedOrg, name: e.target.value})}
                       />
                    </div>
                 </div>

                 {/* Admin User Section */}
                 <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-primary">
                       <Users size={20} />
                       <h4 className="font-black uppercase tracking-tight text-sm">Primary Admin User</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Name</label>
                          <input 
                            type="text" 
                            className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                            placeholder="Leave blank to keep current"
                            value={selectedOrg.adminName || ''}
                            onChange={(e) => setSelectedOrg({...selectedOrg, adminName: e.target.value})}
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Email</label>
                          <input 
                            type="email" 
                            className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                            placeholder="Leave blank to keep current"
                            value={selectedOrg.adminEmail || ''}
                            onChange={(e) => setSelectedOrg({...selectedOrg, adminEmail: e.target.value})}
                          />
                       </div>
                       <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reset Password</label>
                          <div className="relative">
                             <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                             <input 
                               type="password" 
                               className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                               placeholder="Enter new password to reset"
                               value={selectedOrg.adminPassword || ''}
                               onChange={(e) => setSelectedOrg({...selectedOrg, adminPassword: e.target.value})}
                             />
                          </div>
                       </div>
                    </div>
                 </div>
                
                {/* Meta Configuration Section */}
                <div className="space-y-6">
                   <div className="flex items-center space-x-3 text-primary">
                      <Database size={20} />
                      <h4 className="font-black uppercase tracking-tight text-sm">Meta WhatsApp API Configuration</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WABA ID</label>
                         <input 
                           type="text" 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                           placeholder="WhatsApp Business Account ID"
                           value={selectedOrg.wabaId || ''}
                           onChange={(e) => setSelectedOrg({...selectedOrg, wabaId: e.target.value})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number ID</label>
                         <input 
                           type="text" 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                           placeholder="Meta Phone Number ID"
                           value={selectedOrg.phoneNumberId || ''}
                           onChange={(e) => setSelectedOrg({...selectedOrg, phoneNumberId: e.target.value})}
                         />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Meta Access Token</label>
                         <div className="relative">
                            <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input 
                              type="password" 
                              className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                              placeholder="Permanent System User Token"
                              value={selectedOrg.accessToken || ''}
                              onChange={(e) => setSelectedOrg({...selectedOrg, accessToken: e.target.value})}
                            />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Subscription Section */}
                <div className="space-y-6">
                   <div className="flex items-center space-x-3 text-orange-500">
                      <CreditCard size={20} />
                      <h4 className="font-black uppercase tracking-tight text-sm">Subscription & Billing</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subscription Plan</label>
                         <select 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm"
                           value={selectedOrg.subscriptionPlanId || ''}
                           onChange={(e) => setSelectedOrg({...selectedOrg, subscriptionPlanId: e.target.value})}
                         >
                            <option value="">Select Plan</option>
                            {plans.map(plan => (
                               <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Status</label>
                         <select 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm"
                           value={selectedOrg.subscriptionStatus}
                           onChange={(e) => setSelectedOrg({...selectedOrg, subscriptionStatus: e.target.value})}
                         >
                            <option value="ACTIVE">Paid & Active</option>
                            <option value="PAST_DUE">Overdue Warning</option>
                            <option value="EXPIRED">Terminated / Stopped</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Billing Cycle</label>
                          <select 
                            className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm"
                            value={selectedOrg.billingCycle || 'MONTHLY'}
                            onChange={(e) => setSelectedOrg({...selectedOrg, billingCycle: e.target.value})}
                          >
                             <option value="MONTHLY">Monthly Billing</option>
                             <option value="YEARLY">Annual Billing</option>
                          </select>
                       </div>
                      <div className="col-span-2 space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration Date</label>
                         <div className="relative">
                            <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input 
                              type="date" 
                              className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-black"
                              value={selectedOrg.subscriptionExpiry ? format(new Date(selectedOrg.subscriptionExpiry), 'yyyy-MM-dd') : ''}
                              onChange={(e) => setSelectedOrg({...selectedOrg, subscriptionExpiry: e.target.value})}
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-8 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsEditModalOpen(false)}
                     className="flex-1 h-14 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all text-xs"
                   >
                      Discard Changes
                   </button>
                   <button 
                     type="submit"
                     className="flex-2 btn-primary h-14 rounded-2xl font-black shadow-xl shadow-primary/20"
                   >
                      Push Configuration Update
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && orgToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-2">
                 <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-gray-900 tracking-tight">Deactivate Organization?</h3>
                 <p className="text-sm font-medium text-gray-500 leading-relaxed">
                   Are you sure you want to delete <span className="font-bold text-gray-900">"{orgToDelete.name}"</span>? This action cannot be immediately undone.
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
                   onClick={confirmDeleteOrg}
                   className="h-12 rounded-xl font-black bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all uppercase tracking-widest text-xs"
                 >
                    Confirm Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Plus size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">New Tenant Provisioning</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Create a new organization and admin account</p>
                   </div>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                   <X size={20} />
                </button>
             </div>

             <form onSubmit={handleCreateOrg} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                
                {/* Basic Info */}
                <div className="space-y-6">
                   <div className="flex items-center space-x-3 text-primary">
                      <Building2 size={20} />
                      <h4 className="font-black uppercase tracking-tight text-sm">Organization Identity</h4>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Entity Name</label>
                      <input 
                        required
                        type="text" 
                        className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                        placeholder="e.g. Acme Corporation"
                        value={newOrg.name}
                        onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                      />
                   </div>
                </div>

                {/* Admin Setup - The User's request */}
                <div className="space-y-6">
                   <div className="flex items-center space-x-3 text-emerald-500">
                      <Users size={20} />
                      <h4 className="font-black uppercase tracking-tight text-sm">Master Admin Account</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Full Name</label>
                         <input 
                           required
                           type="text" 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                           placeholder="John Doe"
                           value={newOrg.adminName}
                           onChange={(e) => setNewOrg({...newOrg, adminName: e.target.value})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                         <input 
                           required
                           type="email" 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                           placeholder="john@example.com"
                           value={newOrg.adminEmail}
                           onChange={(e) => setNewOrg({...newOrg, adminEmail: e.target.value})}
                         />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Password</label>
                         <div className="relative">
                            <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input 
                              required
                              type="password" 
                              className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                              placeholder="Minimum 8 characters"
                              value={newOrg.adminPassword}
                              onChange={(e) => setNewOrg({...newOrg, adminPassword: e.target.value})}
                            />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Initial Plan */}
                <div className="space-y-6">
                   <div className="flex items-center space-x-3 text-orange-500">
                      <CreditCard size={20} />
                      <h4 className="font-black uppercase tracking-tight text-sm">Initial Subscription</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subscription Plan</label>
                         <select 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm"
                           value={newOrg.subscriptionPlanId}
                           onChange={(e) => setNewOrg({...newOrg, subscriptionPlanId: e.target.value})}
                         >
                            <option value="">Select Plan</option>
                            {plans.map(plan => (
                               <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Status</label>
                         <select 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm"
                           value={newOrg.subscriptionStatus}
                           onChange={(e) => setNewOrg({...newOrg, subscriptionStatus: e.target.value})}
                         >
                            <option value="ACTIVE">Active</option>
                            <option value="PAST_DUE">Past Due</option>
                            <option value="EXPIRED">Terminated</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Billing Cycle</label>
                          <select 
                            className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm"
                            value={newOrg.billingCycle}
                            onChange={(e) => setNewOrg({...newOrg, billingCycle: e.target.value})}
                          >
                             <option value="MONTHLY">Monthly</option>
                             <option value="YEARLY">Yearly</option>
                          </select>
                       </div>
                   </div>
                </div>

                <div className="pt-8 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsCreateModalOpen(false)}
                     className="flex-1 h-14 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all text-xs"
                   >
                      Cancel Provisioning
                   </button>
                   <button 
                     type="submit"
                     className="flex-2 btn-primary h-14 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center space-x-2"
                   >
                      <ShieldCheck size={20} />
                      <span>Deploy Organization</span>
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
