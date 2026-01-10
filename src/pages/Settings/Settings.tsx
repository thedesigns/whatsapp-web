import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/authStore';
import { User, Mail, Shield, Building2, Key, Save, Bell, Globe, Zap, Copy, Check, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Profile/Security State
  const [name, setName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Notification States
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(user?.pushNotifications ?? true);

  // External API Settings
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isSavingApi, setIsSavingApi] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.organizationId) return;
      try {
        const response = await api.get(`/integrations/${user.organizationId}/settings`);
        setApiKey(response.data.apiKey || '');
        setWebhookUrl(response.data.externalWebhookUrl || '');
        setWebhookSecret(response.data.externalWebhookSecret || '');
      } catch (err) {
        console.error('Failed to fetch API settings:', err);
      }
    };
    fetchSettings();
  }, [user?.organizationId]);

  const handleUpdateProfile = async (updates: any) => {
    setIsSavingProfile(true);
    try {
      await api.put('/auth/profile', updates);
      // Optional: Update local store if needed, but it will be updated on next login/refresh if using persist
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleNotification = async (type: 'email' | 'push', value: boolean) => {
    if (type === 'email') setEmailNotifications(value);
    else setPushNotifications(value);

    try {
      await api.put('/auth/profile', {
        [type === 'email' ? 'emailNotifications' : 'pushNotifications']: value
      });
    } catch (err) {
      console.error('Failed to update notification preference:', err);
      // Revert state on error
      if (type === 'email') setEmailNotifications(!value);
      else setPushNotifications(!value);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const response = await api.post(`/integrations/${user.organizationId}/generate-api-key`);
      setApiKey(response.data.apiKey);
      console.log('New API Key generated:', response.data.apiKey);
    } catch (err) {
      console.error('Generate Key failed:', err);
      alert('Failed to generate API Key');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiSettings = async () => {
    if (!user?.organizationId) return;
    setIsSavingApi(true);
    try {
      await api.post(`/integrations/${user.organizationId}/settings`, {
        apiKey,
        externalWebhookUrl: webhookUrl,
        externalWebhookSecret: webhookSecret
      });
      alert('API settings saved successfully');
    } catch (err) {
      alert('Failed to save API settings');
    } finally {
      setIsSavingApi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium text-sm">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center space-x-3 text-primary">
              <User size={20} />
              <h3 className="font-black uppercase tracking-tight text-sm">Profile Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold flex-1"
                    placeholder="Your name"
                  />
                  <button 
                    onClick={() => handleUpdateProfile({ name })}
                    disabled={isSavingProfile || name === user?.name}
                    className="btn-primary h-14 px-4 disabled:opacity-50"
                  >
                    {isSavingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input 
                    type="email" 
                    disabled
                    className="input h-14 pl-14 bg-gray-100 border-transparent text-gray-400 font-bold cursor-not-allowed"
                    defaultValue={user?.email || ''}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl">
                <Shield size={16} className="text-primary" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{user?.role || 'USER'}</span>
              </div>
              {user?.organizationId && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl">
                  <Building2 size={16} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-500">Organization Member</span>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center space-x-3 text-orange-500">
              <Key size={20} />
              <h3 className="font-black uppercase tracking-tight text-sm">Change Password</h3>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input h-12 bg-gray-50 border-transparent focus:bg-white font-bold"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input h-12 bg-gray-50 border-transparent focus:bg-white font-bold"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input h-12 bg-gray-50 border-transparent focus:bg-white font-bold"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <AlertTriangle size={14} />
                  <span>{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <Check size={14} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || !newPassword}
                  className="btn-primary h-12 px-6 flex items-center space-x-2"
                >
                  {isChangingPassword ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* External API Integration Section */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-primary">
                <Zap size={20} />
                <h3 className="font-black uppercase tracking-tight text-sm">External API Configuration</h3>
              </div>
              <div className="px-3 py-1 bg-primary/5 rounded-full">
                <span className="text-[10px] font-black text-primary uppercase">Beta</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your API Key</label>
                  <button 
                    onClick={handleGenerateKey}
                    disabled={loading}
                    className="text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest flex items-center space-x-1"
                  >
                    <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                    <span>{apiKey ? 'Regenerate Key' : 'Generate Key'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    readOnly
                    value={apiKey}
                    placeholder="No API key generated yet"
                    className="input h-14 bg-dark-900 border-transparent font-mono text-gray-300 text-sm focus:ring-0"
                  />
                  {apiKey && (
                    <button 
                      onClick={() => copyToClipboard(apiKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium ml-1 italic">Use this key in the <code className="text-primary font-bold">X-API-Key</code> header for authenticated requests.</p>
              </div>

              {/* Webhook Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 mt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">External Webhook URL</label>
                  <input 
                    type="url" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                    placeholder="https://your-api.com/webhook"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Webhook Secret (Optional)</label>
                  <input 
                    type="password" 
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="input h-14 bg-gray-50 border-transparent focus:bg-white font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveApiSettings}
                disabled={isSavingApi}
                className="btn-primary h-12 px-6 flex items-center space-x-2"
              >
                {isSavingApi ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>Save API Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 text-primary">
              <Bell size={20} />
              <h3 className="font-black uppercase tracking-tight text-sm">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Email Notifications</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailNotifications}
                    onChange={(e) => handleToggleNotification('email', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Push Notifications</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={pushNotifications}
                    onChange={(e) => handleToggleNotification('push', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 text-gray-600">
              <Globe size={20} />
              <h3 className="font-black uppercase tracking-tight text-sm">System Language</h3>
            </div>
            
            <select className="w-full h-12 bg-gray-50 rounded-xl px-4 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              <option>English (US)</option>
              <option>Hindi</option>
              <option>Arabic</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
