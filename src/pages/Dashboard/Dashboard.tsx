import React, { useEffect } from 'react';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import { 
  TrendingUp, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard: React.FC = () => {
  const { data, loading, fetchAnalytics } = useAnalyticsStore();
  const [range, setRange] = React.useState('7d');

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  if (loading && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-gray-400 font-bold">Assembling your workspace...</p>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Sent Messages', 
      value: data?.stats.totalMessages || 0, 
      change: '+12.5%', 
      isUp: true, 
      icon: MessageSquare,
      color: 'bg-primary'
    },
    { 
      label: 'Delivery Rate', 
      value: `${((data?.stats.deliveredCount || 0) / (data?.stats.totalMessages || 1) * 100).toFixed(1)}%`, 
      change: '+2.1%', 
      isUp: true, 
      icon: CheckCircle2,
      color: 'bg-green-500'
    },
    { 
      label: 'Read Rate', 
      value: `${((data?.stats.readCount || 0) / (data?.stats.deliveredCount || 1) * 100).toFixed(1)}%`, 
      change: '-0.4%', 
      isUp: false, 
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    { 
      label: 'Active Contacts', 
      value: data?.stats.totalContacts || 0, 
      change: '+42 new', 
      isUp: true, 
      icon: Users,
      color: 'bg-orange-500'
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics Insights</h1>
          <p className="text-gray-500 font-medium text-sm">Real-time performance metrics for your organization</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
             {[
               { label: '7D', value: '7d' },
               { label: '30D', value: '30d' },
               { label: '90D', value: '90d' },
               { label: 'ALL', value: 'all' },
             ].map(p => (
               <button 
                key={p.value}
                onClick={() => setRange(p.value)}
                className={cn(
                  "px-4 py-1.5 text-xs font-black rounded-lg transition-all",
                  range === p.value ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-400 hover:text-gray-600"
                )}
               >
                 {p.label}
               </button>
             ))}
          </div>
          <button 
            onClick={() => fetchAnalytics()}
            className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-primary shadow-sm transition-all"
          >
            <RefreshCw className={cn(loading && "animate-spin")} size={18} />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", kpi.color)}>
                  <kpi.icon size={24} />
               </div>
               <div className={cn(
                 "flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase",
                 kpi.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
               )}>
                  {kpi.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span>{kpi.change}</span>
               </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">{kpi.value}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
            
            <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:scale-110 transition-transform -rotate-12">
               <kpi.icon size={80} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-gray-900">Engagement Trends</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sent vs Delivered vs Read</p>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-black text-gray-400 uppercase">Sent</span>
               </div>
               <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase">Read</span>
               </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends || []}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSent)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="read" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Broadcast Performance Bar Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-black text-gray-900 mb-2">Campaign Reach</h3>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Performance by campaign</p>
           
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.broadcastStats || []} layout="vertical">
                 <XAxis type="number" hide />
                 <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{fill: '#475569', fontSize: 11, fontWeight: 800}}
                    width={100}
                 />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="delivered" radius={[0, 8, 8, 0]} barSize={20}>
                    {data?.broadcastStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                    ))}
                 </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
           
           <div className="mt-4 space-y-3">
              {(data?.broadcastStats.slice(0, 3) || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                   <span className="font-bold text-gray-600">{b.name}</span>
                   <span className="font-black text-primary">{((b.delivered / (b.delivered + b.failed)) * 100).toFixed(0)}% Success</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Bottom Row - More Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 p-8">
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Recent Performance Alerts</h3>
            <div className="space-y-4">
               {(data as any)?.alerts?.map((alert: any) => (
                  <div key={alert.id} className={cn(
                    "p-4 rounded-2xl border flex items-center space-x-4",
                    alert.type === 'critical' ? "bg-red-50 border-red-100" :
                    alert.type === 'warning' ? "bg-orange-50 border-orange-100" :
                    "bg-blue-50 border-blue-100"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm",
                      alert.type === 'critical' ? "text-red-500" :
                      alert.type === 'warning' ? "text-orange-500" :
                      "text-blue-500"
                    )}>
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h4 className={cn(
                        "font-black text-sm",
                        alert.type === 'critical' ? "text-red-900" :
                        alert.type === 'warning' ? "text-orange-900" :
                        "text-blue-900"
                      )}>{alert.title}</h4>
                      <p className={cn(
                        "text-xs font-medium",
                        alert.type === 'critical' ? "text-red-700" :
                        alert.type === 'warning' ? "text-orange-700" :
                        "text-blue-700"
                      )}>{alert.message}</p>
                    </div>
                  </div>
               ))}
               {(!(data as any)?.alerts || (data as any)?.alerts?.length === 0) && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-500 shadow-sm">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-green-900 text-sm">All Systems Healthy</h4>
                      <p className="text-xs text-green-700 font-medium">No performance issues detected in the selected period.</p>
                    </div>
                  </div>
               )}
            </div>
         </div>
         <div className="bg-dark-100 p-8 rounded-3xl text-white shadow-xl shadow-black/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full translate-x-16 -translate-y-16 blur-2xl" />
            <h3 className="text-xl font-black mb-6 uppercase tracking-tighter relative z-10">Pro Insights</h3>
            
            <div className="space-y-4 relative z-10">
               {(data as any)?.insights?.slice(0, 2).map((insight: any) => (
                  <div key={insight.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{insight.title}</span>
                        <span className={cn(
                           "text-[10px] font-black px-2 py-0.5 rounded-full",
                           insight.impact === 'Positive' ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                        )}>{insight.score}%</span>
                     </div>
                     <p className="text-xs font-medium text-gray-300 leading-relaxed">{insight.description}</p>
                  </div>
               ))}
            </div>

            <button className="w-full py-3 bg-primary text-white font-black rounded-xl text-sm shadow-lg hover:bg-primary/80 transition-all active:scale-95 mt-6 relative z-10">
               Generate Full Report
            </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
