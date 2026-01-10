import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Key, Globe, Info, AlertCircle } from 'lucide-react';

interface IntegrationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
  integration: {
    id: string;
    name: string;
    type: string;
    config?: any;
  };
}

const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({ isOpen, onClose, onSave, integration }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (integration.config) {
      setFormData(typeof integration.config === 'string' ? JSON.parse(integration.config) : integration.config);
    } else {
      setFormData({});
    }
  }, [integration]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderFields = () => {
    switch (integration.id) {
      case 'shopify':
        return (
          <>
            <div className="space-y-1.5 pt-4 border-t border-gray-100">
               <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Webhook URL (Copy to Shopify)</label>
               <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 font-mono text-xs text-rose-700 break-all select-all cursor-pointer" title="Click to copy">
                 {window.location.origin.replace('5173', '3000')}/api/integrations/shopify/webhook/{(integration as any).organizationId || 'org_id'}
               </div>
               <p className="text-[10px] text-gray-400 ml-1 italic">Go to Settings {' > '} Notifications {' > '} Create Webhook in Shopify and paste this URL with Event "Checkout creation" and "Order creation".</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shop Domain</label>
              <div className="relative">
                <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="shopDomain"
                  type="text" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="your-store.myshopify.com"
                  defaultValue={formData.shopDomain}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Client ID / API Key</label>
              <div className="relative">
                <Shield size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="clientId"
                  type="text" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="Found in Shopify App Settings"
                  defaultValue={formData.clientId || formData.apiKey}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Client Secret / API Secret</label>
              <div className="relative">
                <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="clientSecret"
                  type="password" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="Used for HMAC Verification"
                  defaultValue={formData.clientSecret || formData.webhookSecret || formData.apiSecret}
                  onChange={handleChange}
                />
              </div>
              <p className="text-[10px] text-gray-400 ml-1 italic">This secret is required to verify that the abandoned cart data is authentic.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin API Access Token</label>
              <div className="relative">
                <Shield size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="accessToken"
                  type="password" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="shpat_..."
                  defaultValue={formData.accessToken}
                  onChange={handleChange}
                />
              </div>
              <p className="text-[10px] text-gray-400 ml-1 italic">Required for live order lookups in the chatbot.</p>
            </div>
          </>
        );
      case 'woocommerce':
        return (
          <>
            <div className="space-y-1.5 pt-4 border-t border-gray-100">
               <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Webhook URL (Copy to WooCommerce)</label>
               <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 font-mono text-xs text-rose-700 break-all select-all cursor-pointer" title="Click to copy">
                 {window.location.origin.replace('5173', '3000')}/api/integrations/woocommerce/webhook/{(integration as any).organizationId || 'org_id'}
               </div>
               <p className="text-[10px] text-gray-400 ml-1 italic">Paste this into WooCommerce {' > '} Settings {' > '} Advanced {' > '} Webhooks.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store URL</label>
              <div className="relative">
                <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="storeUrl"
                  type="text" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="https://yourstore.com"
                  defaultValue={formData.storeUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Consumer Key</label>
              <div className="relative">
                <Shield size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="consumerKey"
                  type="text" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="ck_..."
                  defaultValue={formData.consumerKey}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Consumer Secret</label>
              <div className="relative">
                <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="consumerSecret"
                  type="password" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="cs_..."
                  defaultValue={formData.consumerSecret}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        );
      case 'external':
        return (
          <>
            <div className="space-y-1.5 pt-4 border-t border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">API Key</label>
              <div className="relative">
                <Shield size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="apiKey"
                  type="text" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="Your External API Key"
                  defaultValue={formData.apiKey}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, apiKey: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase"
                >
                  Generate
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">External Webhook URL</label>
              <div className="relative">
                <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="externalWebhookUrl"
                  type="text" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="https://your-app.com/webhook"
                  defaultValue={formData.externalWebhookUrl}
                  onChange={handleChange}
                />
              </div>
              <p className="text-[10px] text-gray-400 ml-1 italic">We will POST incoming messages and status updates to this URL.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">External Webhook Secret</label>
              <div className="relative">
                <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  name="externalWebhookSecret"
                  type="password" 
                  className="input h-14 pl-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                  placeholder="Secret for HMAC validation"
                  defaultValue={formData.externalWebhookSecret}
                  onChange={handleChange}
                />
              </div>
              <p className="text-[10px] text-gray-400 ml-1 italic">Used to sign payloads with X-Hub-Signature-256 header.</p>
            </div>
          </>
        );
      case 'zoho':
        return (
          <>
            <div className="space-y-1.5 pt-4 border-t border-gray-100">
               <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Webhook URL (Copy to Zoho)</label>
               <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 font-mono text-xs text-rose-700 break-all select-all cursor-pointer" title="Click to copy">
                 {window.location.origin.replace('5173', '3000')}/api/integrations/zoho/webhook/{(integration as any).organizationId || 'org_id'}
               </div>
               <p className="text-[10px] text-gray-400 ml-1 italic">Go to Zoho Books {' > '} Settings {' > '} Automation {' > '} Webhooks and create a new Webhook.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Organization ID</label>
              <input 
                name="zohoOrgId"
                type="text" 
                className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                placeholder="Zoho Organization ID"
                defaultValue={formData.zohoOrgId}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authtoken / API Key</label>
              <input 
                name="apiKey"
                type="password" 
                className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                placeholder="Zoho API Token"
                defaultValue={formData.apiKey}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 'tally':
        return (
          <>
            <div className="space-y-1.5 pt-4 border-t border-gray-100">
               <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Sync URL (Use in Tally Helper)</label>
               <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 font-mono text-xs text-rose-700 break-all select-all cursor-pointer" title="Click to copy">
                 {window.location.origin.replace('5173', '3000')}/api/integrations/tally/sync/{(integration as any).organizationId || 'org_id'}
               </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tally URL / IP</label>
              <input 
                name="tallyUrl"
                type="text" 
                className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                placeholder="http://local-ip:9000"
                defaultValue={formData.tallyUrl}
                onChange={handleChange}
              />
            </div>
          </>
        );
      default:
        return <p className="text-gray-500">Configuration fields coming soon...</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-100/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">{integration.name} Configuration</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Secure API Connection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100 flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Info size={18} />
            </div>
            <div className="text-xs text-blue-700 font-medium leading-relaxed">
              These credentials are encrypted and stored securely. We only use them to sync your orders and send automated WhatsApp notifications.
            </div>
          </div>

          <div className="space-y-5">
            {renderFields()}
          </div>

          <div className="pt-4 flex items-center space-x-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 btn-primary h-14 shadow-xl shadow-primary/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 h-14 bg-gray-100 text-gray-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="bg-gray-50 p-6 flex items-center justify-center space-x-6 border-t border-gray-100">
          <div className="flex items-center space-x-2 grayscale opacity-50">
            <AlertCircle size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">PCI Compliant</span>
          </div>
          <div className="flex items-center space-x-2 grayscale opacity-50">
            <Shield size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">AES-256 Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationConfigModal;
