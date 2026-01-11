import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PlanManagement: React.FC = () => {
  const { plans, loading, fetchPlans, createPlan, updatePlan, deletePlan } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    yearlyPrice: 0,
    limits: '',
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        yearlyPrice: plan.yearlyPrice || 0,
        limits: plan.limits,
        isActive: plan.isActive
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: '',
        price: 0,
        yearlyPrice: 0,
        limits: '{}',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPlan) {
        await updatePlan(selectedPlan.id, formData);
      } else {
        await createPlan(formData);
      }
      setIsModalOpen(false);
      setIsModalOpen(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to save plan';
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Subscription Plans</h1>
          <p className="text-gray-500 font-medium text-sm">Define pricing tiers and resource limitations for your tenants</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2 h-12 px-6 shadow-lg shadow-primary/20"
        >
           <Plus size={20} />
           <span>Create New Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Layers size={28} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter",
                    plan.isActive ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {plan.isActive ? 'Active Plan' : 'Draft'}
                  </span>
                  <p className="text-3xl font-black text-gray-900 mt-2">
                    ₹{plan.price}<span className="text-sm text-gray-400 font-medium">/mo</span>
                  </p>
                  <p className="text-sm font-black text-primary/60 mt-0.5">
                    ₹{plan.yearlyPrice}<span className="text-[10px] text-gray-400 font-medium lowercase">/year</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{plan.name}</h3>
                <div className="mt-4 space-y-3">
                   {/* Simplified limits display for now */}
                   <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span>Unlimited Contacts</span>
                   </div>
                   <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span>Broadcast Features</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
               <button 
                onClick={() => handleOpenModal(plan)}
                className="flex items-center space-x-2 text-sm font-black text-gray-400 hover:text-primary transition-colors px-4 py-2"
               >
                  <Edit3 size={16} />
                  <span>Configure</span>
               </button>
               <button 
                onClick={() => { if(confirm('Delete this plan?')) deletePlan(plan.id) }}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
               >
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}

        {plans.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                <Layers size={40} />
             </div>
             <div>
                <h3 className="text-lg font-black text-gray-900">No Plans Defined</h3>
                <p className="text-gray-500 font-medium text-sm">Create your first subscription tier to start accepting customers</p>
             </div>
             <button onClick={() => handleOpenModal()} className="btn-secondary h-12 px-8">Define Initial Plan</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden flex flex-col">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Zap size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">{selectedPlan ? 'Edit Plan' : 'New Tier Definition'}</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configure tier permissions and pricing</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                   <X size={20} />
                </button>
             </div>

             <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Plan Display Name</label>
                      <input 
                        required
                        type="text" 
                        className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                        placeholder="e.g. Enterprise Premium"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monthly Cost (INR)</label>
                        <div className="relative">
                           <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold">₹</span>
                           <input 
                              required
                              type="number" 
                              className="input h-14 pl-12 bg-gray-50 border-transparent focus:bg-white font-black"
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                           />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yearly Cost (INR)</label>
                        <div className="relative">
                           <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 font-bold">₹</span>
                           <input 
                              required
                              type="number" 
                              className="input h-14 pl-12 bg-gray-50 font-black border-primary/20"
                              value={formData.yearlyPrice}
                              onChange={(e) => setFormData({...formData, yearlyPrice: parseFloat(e.target.value)})}
                           />
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                        <select 
                           className="input h-14 bg-gray-50 border-transparent focus:bg-white font-black uppercase text-sm"
                           value={formData.isActive ? 'true' : 'false'}
                           onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                        >
                           <option value="true">Active/Visible</option>
                           <option value="false">Hidden/Draft</option>
                        </select>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <div className="flex items-center justify-between ml-1">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Limits (JSON)</label>
                         <span className="text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded italic">Beta Config</span>
                      </div>
                      <textarea 
                        className="input min-h-[120px] py-4 bg-gray-50 border-transparent focus:bg-white font-mono text-xs"
                        placeholder='{"messages": 10000, "contacts": "unlimited"}'
                        value={formData.limits}
                        onChange={(e) => setFormData({...formData, limits: e.target.value})}
                      />
                   </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 h-14 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all text-xs"
                   >
                      Discard
                   </button>
                   <button 
                     type="submit"
                     className="flex-2 btn-primary h-14 rounded-2xl font-black shadow-xl shadow-primary/20"
                   >
                      {selectedPlan ? 'Update Configuration' : 'Deploy Plan Tier'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
