import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Store, 
  CreditCard, 
  ClipboardCheck, 
  ExternalLink,
  ChevronRight,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import IntegrationConfigModal from '../../components/Integrations/IntegrationConfigModal';
import api from '../../services/api';
import { useAuth } from '../../store/authStore';

const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'configured' | 'external'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [installedIntegrations, setInstalledIntegrations] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ eventsToday: 0, totalSynced: 0, failedSyncs: 0 });

  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!user?.organizationId) return;
      try {
        const [integrationsRes, statsRes, activityRes, settingsRes] = await Promise.all([
            api.get(`/integrations/${user.organizationId}`),
            api.get(`/integrations/${user.organizationId}/stats`),
            api.get(`/integrations/${user.organizationId}/activity?limit=10`),
            api.get(`/integrations/${user.organizationId}/settings`).catch(() => ({ data: {} }))
        ]);
        setInstalledIntegrations(integrationsRes.data);
        setStats(statsRes.data);
        setActivityLogs(activityRes.data);
        
        // Add external settings to installedIntegrations if they exist
        if (settingsRes.data.apiKey || settingsRes.data.externalWebhookUrl) {
           setInstalledIntegrations(prev => [
             ...prev, 
             { type: 'EXTERNAL', config: JSON.stringify(settingsRes.data), isActive: true }
           ]);
        }
      } catch (error) {
        console.error('Failed to fetch integrations data:', error);
      }
    };
    fetchIntegrations();
  }, [user?.organizationId]);

  const handleOpenConfig = (integration: any) => {
    const installed = installedIntegrations.find(i => i.type === integration.id.toUpperCase());
    setSelectedIntegration({
      ...integration,
      organizationId: user?.organizationId,
      config: installed?.config
    });
    setIsModalOpen(true);
  };

  const handleSave = async (config: any) => {
    if (!user?.organizationId || !selectedIntegration) return;
    try {
      const endpoint = selectedIntegration.id === 'external' 
        ? `/integrations/${user.organizationId}/settings`
        : `/integrations/${user.organizationId}`;
        
      const response = await api.post(endpoint, selectedIntegration.id === 'external' ? config : {
        type: selectedIntegration.id.toUpperCase(),
        name: selectedIntegration.name,
        config: config
      });
      
      // Update local state
      setInstalledIntegrations(prev => {
        const existing = prev.find(i => i.type === response.data.type);
        if (existing) {
          return prev.map(i => i.id === response.data.id ? response.data : i);
        }
        return [...prev, response.data];
      });
    } catch (error) {
      console.error('Failed to save integration:', error);
      throw error;
    }
  };

  const integrations = [
    {
      id: 'shopify',
      name: 'Shopify',
// ... (rest of the integrations array remains the same)
      description: 'Automate order notifications and abandoned cart reminders.',
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'Not Configured',
      features: ['Abandoned Cart', 'Order Status', 'Shipping Updates']
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      description: 'Sync your WordPress store with WhatsApp for seamless updates.',
      icon: Store,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'Connected',
      features: ['Abandoned Cart', 'Payment Alerts', 'Refund Status']
    },
    {
      id: 'zoho',
      name: 'Zoho Books',
      description: 'Send professional invoices and payment reminders via WhatsApp.',
      icon: ClipboardCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'Not Configured',
      features: ['Invoice Alerts', 'Payment Receipts', 'Billing Updates']
    },
    {
      id: 'tally',
      name: 'Tally Prime',
      description: 'Real-time billing alerts and ledger balance notifications.',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'Not Configured',
      features: ['Balance Alerts', 'Outstanding Reminders', 'Daily Reports']
    },
    {
      id: 'external',
      name: 'Custom External API',
      description: 'Connect any third-party system using our generic REST API and Webhooks.',
      icon: ExternalLink,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      status: 'Ready to use',
      features: ['Text & Media', 'Template Messages', 'Incoming Webhooks']
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Integrations</h1>
          <p className="text-gray-500 font-medium mt-1">Connect your favorite e-commerce and billing platforms</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Explore
          </button>
          <button 
            onClick={() => setActiveTab('configured')}
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'configured' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Installed
          </button>
          <button 
            onClick={() => setActiveTab('external')}
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'external' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            API Docs
          </button>
        </div>
      </div>

      {activeTab === 'external' ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
            <h2 className="text-2xl font-black mb-6">REST API Documentation</h2>
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">1</div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Authentication</h3>
                </div>
                <p className="text-gray-500 mb-4 font-medium">All requests must include your API Key in the <code className="bg-gray-100 px-2 py-0.5 rounded text-primary">X-API-Key</code> header.</p>
                <div className="bg-dark-100 rounded-2xl p-6 font-mono text-sm text-gray-300">
                  curl -X POST {'{'}{window.location.origin}{'}'}/api/integrations/send \<br />
                  &nbsp;&nbsp;-H "X-API-Key: YOUR_API_KEY" \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                  &nbsp;&nbsp;-d {'\''}{'{'}"phoneNumber": "...", "content": "Hello!"{'}'}{'\''}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">2</div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Send Message (Text/Media)</h3>
                </div>
                <p className="text-gray-500 mb-4 font-medium">Send any message type to a phone number. If the contact doesn't exist, it will be created automatically.</p>
                <div className="bg-dark-100 rounded-2xl p-6 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                  {`POST /api/integrations/send
{
  "phoneNumber": "1234567890",
  "type": "image",
  "content": "Caption or Media ID",
  "mediaUrl": "https://example.com/image.jpg"
}`}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">3</div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Send Template</h3>
                </div>
                <p className="text-gray-500 mb-4 font-medium">Send approved WhatsApp templates with interactive components.</p>
                <div className="bg-dark-100 rounded-2xl p-6 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                  {`POST /api/integrations/send-template
{
  "phoneNumber": "1234567890",
  "templateName": "order_update",
  "language": "en",
  "components": [
    { "type": "body", "parameters": [{ "type": "text", "text": "VAL_1" }] }
  ]
}`}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">4</div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Incoming Webhooks (Receiving)</h3>
                </div>
                <p className="text-gray-500 mb-4 font-medium">Configure your webhook URL in settings. We will POST to it whenever a message or status update is received.</p>
                <div className="bg-dark-100 rounded-2xl p-6 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                  {`{
  "type": "message",
  "data": { "from": "...", "content": "...", "timestamp": "..." },
  "contact": { "name": "...", "waId": "..." }
}`}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {integrations
            .filter(i => activeTab === 'all' || installedIntegrations.some(installed => installed.type === i.id.toUpperCase()))
            .map((item) => (
            <div 
              key={item.id}
              className="group relative bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
            >
              {/* Card content same as before ... */}
              <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full ${item.bgColor} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
              
              <div className="relative flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-3xl ${item.bgColor} flex items-center justify-center ${item.color} shadow-inner`}>
                    <item.icon size={32} strokeWidth={2.5} />
                  </div>
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 ${
                    installedIntegrations.some(i => i.type === item.id.toUpperCase() && i.isActive) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Activity size={12} className={installedIntegrations.some(i => i.type === item.id.toUpperCase() && i.isActive) ? 'animate-pulse' : ''} />
                    <span>{installedIntegrations.some(i => i.type === item.id.toUpperCase() && i.isActive) ? 'Connected' : 'Not Configured'}</span>
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{item.name}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed pr-4">
                    {item.description}
                  </p>

                  <div className="pt-6 flex flex-wrap gap-2">
                    {item.features.map(feature => (
                      <span key={feature} className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <button 
                    onClick={() => handleOpenConfig(item)}
                    className="flex items-center space-x-2 text-primary font-black uppercase tracking-widest text-xs hover:translate-x-1 transition-transform"
                  >
                    <span>Configuration</span>
                    <ChevronRight size={16} />
                  </button>
                  
                  <button className="p-3 bg-gray-100 text-gray-400 rounded-2xl hover:bg-dark-100 hover:text-white transition-all">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats/Logs section */}
      <div className="bg-dark-100 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-primary/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-3xl font-black tracking-tight leading-tight">Integration<br />Activity</h3>
              <p className="text-gray-400 font-medium text-sm leading-relaxed">Monitoring real-time events from your connected platforms. Everything is synced and encrypted.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Events Today', value: stats.eventsToday, icon: Activity, color: 'text-blue-400' },
                { label: 'Total Synced', value: stats.totalSynced, icon: CheckCircle2, color: 'text-green-400' },
                { label: 'Failed Syncs', value: stats.failedSyncs, icon: AlertCircle, color: 'text-red-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-colors">
                  <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black tracking-tight">{stat.value}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-8 space-y-4 w-full">
            <div className="flex items-center justify-between mb-2">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Activity Feed</h4>
               <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live Monitoring
               </span>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {activityLogs.length > 0 ? (
                activityLogs.map((log: any) => (
                  <div key={log.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase ${
                        log.source === 'shopify' ? 'bg-green-500/10 text-green-400' : 
                        log.source === 'woocommerce' ? 'bg-purple-500/10 text-purple-400' : 
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {log.source[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-200">{log.event}</div>
                        <div className="text-[10px] text-gray-500 font-medium truncate max-w-[200px]">
                           {new Date(log.createdAt).toLocaleString()} • {log.source}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       {log.error ? (
                          <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-500/20">Failed</span>
                       ) : (
                          <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-green-500/20">Success</span>
                       )}
                       <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-[32px]">
                   <Activity size={32} className="mb-2 opacity-20" />
                   <p className="text-xs font-bold uppercase tracking-widest">No activity detected yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedIntegration && (
        <IntegrationConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          integration={selectedIntegration}
        />
      )}
    </div>
  );
};

export default Integrations;
