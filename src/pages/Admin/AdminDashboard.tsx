import React, { useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  Zap,
  Globe,
  Activity,
  Award
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { stats, fetchPlatformStats, loading } = useAdminStore();
  const [range, setRange] = React.useState('all');

  useEffect(() => {
    fetchPlatformStats(range);
  }, [range]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-gray-500 font-medium mt-1">Global SaaS health and subscription growth metrics</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit h-fit">
          {[
            { label: '7D', value: '7' },
            { label: '30D', value: '30' },
            { label: '90D', value: '90' },
            { label: 'ALL', value: 'all' },
          ].map((r) => (
            <button 
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                range === r.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary SaaS Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Customers', value: stats?.totalOrganizations || 0, icon: Building2, color: 'primary', trend: '+12%' },
          { label: 'Active Subscriptions', value: stats?.activeOrganizations || 0, icon: ShieldCheck, color: 'emerald', trend: '+5%' },
          { label: 'Platform Capacity', value: stats?.totalPlatformUsers || 0, icon: Users, color: 'blue', trend: '+18%' },
          { label: 'Annual Revenue', value: '₹' + (stats?.annualRevenue || 0).toLocaleString(), icon: CreditCard, color: 'orange', trend: '+24%' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-full translate-x-16 -translate-y-16 opacity-50 group-hover:scale-110 transition-transform`} />
            <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                   <ArrowUpRight size={12} />
                   <span>{stat.trend}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* System Health */}
         <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm flex flex-col space-y-6 self-start">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                     <Activity size={20} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">System Status</h3>
               </div>
               <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                  Operational
               </span>
            </div>

            <div className="space-y-4">
               {[
                 { label: 'API Gateway', status: 'Stable', uptime: '99.9%' },
                 { label: 'WhatsApp Broker', status: 'Optimal', uptime: '99.8%' },
                 { label: 'DB Cluster', status: 'Healthy', uptime: '100%' },
               ].map((system, i) => (
                  <div key={i} className="p-5 rounded-3xl bg-gray-50 border border-gray-100 space-y-2">
                     <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-900">{system.label}</h4>
                        <span className="text-[10px] text-emerald-500 font-black uppercase">{system.status}</span>
                     </div>
                     <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[99%]" />
                     </div>
                     <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase">
                        <span>Uptime</span>
                        <span>{system.uptime}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Subscription distribution */}
         <div className="lg:col-span-2 bg-dark-100 p-8 rounded-[48px] shadow-2xl flex flex-col space-y-8 relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full translate-x-32 -translate-y-32 blur-3xl" />
            
            <div className="relative z-10 flex items-center justify-between">
               <div className="flex items-center space-x-3 text-white">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                     <Zap size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">SaaS Growth Engine</h3>
               </div>
               <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Market Distribution</span>
               </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/5 p-8 rounded-[40px] space-y-6">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
                         <Award size={24} />
                      </div>
                      <div>
                         <h4 className="font-black text-white text-lg">Premium Tier</h4>
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Enterprise Clients</p>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-4xl font-black text-white">{stats?.planDistribution?.PREMIUM || 0}</span>
                         <span className="text-xs font-bold text-emerald-500 mb-1">+4 New this month</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                         <div className="bg-orange-500 h-full w-[65%]" />
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-8 rounded-[40px] space-y-6">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                         <Globe size={24} />
                      </div>
                      <div>
                         <h4 className="font-black text-white text-lg">Standard Tier</h4>
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">SMB Market</p>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-4xl font-black text-white">{stats?.planDistribution?.FREE || 0}</span>
                         <span className="text-xs font-bold text-gray-500 mb-1">Converting at 12%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                         <div className="bg-blue-500 h-full w-[85%]" />
                      </div>
                   </div>
                </div>
            </div>

            <div className="relative z-10 bg-primary p-6 rounded-[32px] flex items-center gap-6 shadow-xl shadow-primary/20">
               <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <TrendingUp size={24} />
               </div>
               <div className="flex-1 space-y-0.5">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Monthly Growth Trend</p>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    Platform adoption is accelerating. New organization signups are up 200% compared to last quarter.
                  </p>
               </div>
               <button className="px-6 py-3 bg-white rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest">
                  View Data
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
