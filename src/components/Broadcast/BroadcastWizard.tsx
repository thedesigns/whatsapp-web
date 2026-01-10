import React, { useState, useEffect } from 'react';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { useContactStore } from '../../store/useContactStore';
import api from '../../services/api';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Send,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Check,
  Upload,
  Calendar,
  Users,
  Search,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BroadcastWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const BroadcastWizard: React.FC<BroadcastWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { templates, fetchTemplates } = useTemplateStore();
  const { createBroadcast } = useBroadcastStore();
  const { contacts, fetchContacts, groups, fetchGroups } = useContactStore();
  
  // State
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [variableMappings, setVariableMappings] = useState<Record<number, string>>({});
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  
  // Selection State
  const [selectionMode, setSelectionMode] = useState<'CSV' | 'CRM' | 'GROUPS' | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [crmSearchTerm, setCrmSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchContacts(1, 100);
      fetchGroups();
      setStep(1);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setSelectedTemplate(null);
    setMediaId(null);
    setMediaUrl(null);
    setRecipients([]);
    setCsvColumns([]);
    setVariableMappings({});
    setIsScheduled(false);
    setScheduledAt('');
    setSelectionMode(null);
    setSelectedContactIds([]);
    setSelectedGroupIds([]);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Must set Content-Type to undefined to let axios auto-detect multipart/form-data with boundary
      const res = await api.post('/messages/upload-media', formData, {
        headers: { 'Content-Type': undefined }
      });
      setMediaId(res.data.mediaId);
      setMediaUrl(URL.createObjectURL(file)); 
      const headerComp = selectedTemplate.components.find((c: any) => c.type?.toUpperCase() === 'HEADER');
      setMediaType(headerComp?.format?.toUpperCase() || 'IMAGE');
    } catch (err) {
      alert('Media upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim());
      setCsvColumns(headers);

      const parsed = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        
        const phoneKey = headers.find(h => h.toLowerCase().includes('phone') || h.toLowerCase().includes('number')) || headers[0];
        const nameKey = headers.find(h => h.toLowerCase().includes('name')) || headers[1];

        return {
          phoneNumber: obj[phoneKey],
          name: nameKey ? obj[nameKey] : '',
          rawData: obj
        };
      });
      setRecipients(parsed);

      const templateVars = detectTemplateVariables(selectedTemplate);
      const initialMap: any = {};
      templateVars.forEach(v => {
        const match = headers.find(h => h.toLowerCase().includes(v.toString()) || h.toLowerCase() === `{{${v}}}`);
        if (match) initialMap[v] = match;
        else if (headers[v-1]) initialMap[v] = headers[v-1];
      });
      setVariableMappings(initialMap);
    };
    reader.readAsText(file);
  };

  const detectTemplateVariables = (template: any) => {
    const vars = new Set<number>();
    template?.components.forEach((c: any) => {
      if (c.text) {
        const matches = c.text.match(/{{(\d+)}}/g);
        matches?.forEach((m: string) => vars.add(parseInt(m.match(/\d+/)![0])));
      }
    });
    return Array.from(vars).sort((a,b) => a-b);
  };

  const handleCrmSelect = () => {
    const selectedContacts = contacts.filter(c => selectedContactIds.includes(c.id));
    mapContactsToRecipients(selectedContacts);
  };

  const handleGroupSelect = async () => {
    setLoading(true);
    try {
      // Fetch ALL contacts for the selected groups (bypass pagination for campaign prep)
      const res = await api.get('/contacts', { 
        params: { limit: 10000, groupIds: selectedGroupIds } 
      });
      mapContactsToRecipients(res.data.contacts);
    } catch (err) {
      alert('Failed to fetch group contacts');
    } finally {
      setLoading(false);
    }
  };

  const mapContactsToRecipients = (contactsToMap: any[]) => {
    const mapped = contactsToMap.map(c => ({
      phoneNumber: c.phoneNumber,
      name: c.name,
      rawData: {
         'Name': c.name,
         'Phone': c.phoneNumber,
         '1': c.name,
         ...c.labels?.reduce((acc: any, label: string, idx: number) => ({...acc, [`Label ${idx+1}`]: label}), {})
      }
    }));
    
    setCsvColumns(['Name', 'Phone', '1', ...Array.from({length: 5}, (_, i) => `Label ${i+1}`)]);
    setRecipients(mapped);
    
    const templateVars = detectTemplateVariables(selectedTemplate);
    if (templateVars.includes(1)) {
       setVariableMappings(prev => ({...prev, 1: 'Name'}));
    }
    setSelectionMode('CSV'); // Move to mapping step (visually reuse CSV step)
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const finalRecipients = recipients.map(r => {
        const variables: any = {};
        Object.entries(variableMappings).forEach(([idx, col]) => {
          variables[parseInt(idx)] = r.rawData[col];
        });
        return {
          phoneNumber: r.phoneNumber,
          name: r.name,
          variables
        };
      });

      await createBroadcast({
        name,
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language,
        recipients: finalRecipients,
        mediaId: mediaId || undefined,
        mediaType: mediaType || undefined,
        scheduledAt: isScheduled ? scheduledAt : undefined
      });
      onClose();
    } catch (err) {
      alert('Failed to launch broadcast');
    } finally {
      setLoading(false);
    }
  };

  const hasMedia = selectedTemplate?.components.some((c: any) => 
    c.type?.toUpperCase() === 'HEADER' && 
    ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format?.toUpperCase())
  );
  const templateVars = detectTemplateVariables(selectedTemplate);

  const goToNext = () => {
    if (step === 1) {
      setStep(hasMedia ? 2 : 3);
    } else if (step === 3 && recipients.length > 0) {
      setStep(templateVars.length > 0 ? 4 : 5);
    } else if (step === 4) {
      setStep(5);
    } else {
      setStep(step + 1);
    }
  };

  const goToPrev = () => {
    if (step === 3 && !hasMedia) {
      setStep(1);
    } else if (step === 5 && templateVars.length === 0) {
      setStep(3);
    } else {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Send size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Campaign Builder</h2>
              <div className="flex items-center space-x-2">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {step} of 5</span>
                 <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={cn("w-3 h-1 rounded-full", i <= step ? "bg-primary" : "bg-gray-100")} />
                    ))}
                 </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/20">
          
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Campaign Identity</label>
                <input 
                  type="text" 
                  placeholder="e.g. Winter Blast 2026"
                  className="input h-14 text-xl font-black bg-white shadow-sm border-gray-100 rounded-2xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Choose Template</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.filter(t => t.status === 'APPROVED').map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={cn(
                        "p-5 rounded-3xl border-2 text-left transition-all group relative overflow-hidden",
                        selectedTemplate?.id === t.id ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" : "bg-white border-gray-100 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{t.category}</span>
                         {selectedTemplate?.id === t.id && <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"><Check size={12} /></div>}
                      </div>
                      <h4 className="font-bold text-gray-900 truncate">{t.name}</h4>
                      <div className="flex items-center mt-2 space-x-3 text-[10px] font-bold text-gray-400 uppercase">
                         <span>{t.language}</span>
                         <span className="w-1 h-1 bg-gray-300 rounded-full" />
                         <span>{t.components.length} Components</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedTemplate && (
            <div className="max-w-md mx-auto py-10 space-y-8 text-center">
               <div className="space-y-2">
                  <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-primary">
                    <ImageIcon size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Visual Header</h3>
                  <p className="text-gray-500 font-medium">Add an image or video to grab attention.</p>
               </div>
               
               {mediaUrl && (
                  <div className="relative group w-full aspect-video rounded-3xl overflow-hidden border-8 border-white shadow-2xl">
                    <img src={mediaUrl} className="w-full h-full object-cover" alt="Pulse Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => {setMediaId(null); setMediaUrl(null);}}
                          className="px-6 py-2 bg-white text-red-600 font-black rounded-2xl shadow-xl transform scale-90 group-hover:scale-100 transition-all hover:bg-red-50"
                        >
                          Remove Asset
                        </button>
                    </div>
                  </div>
               )}

               {!mediaUrl && (
                 <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-primary/10 bg-white rounded-[40px] cursor-pointer hover:bg-primary/5 transition-all group">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={28} />
                      </div>
                      <p className="text-lg font-black text-gray-800 tracking-tight">Upload Asset</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Max 50MB • HQ Recommended</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleMediaUpload} />
                 </label>
               )}
            </div>
          )}

          {step === 3 && (
            <div className="max-w-4xl mx-auto space-y-8">
               {!selectionMode ? (
                 <div className="grid grid-cols-3 gap-6">
                    <button 
                      onClick={() => setSelectionMode('GROUPS')}
                      className="p-8 rounded-[40px] border-2 border-gray-100 bg-white hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col items-center text-center group"
                    >
                      <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <Layers size={32} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900">By Groups</h4>
                      <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Target Phone Books</p>
                    </button>

                    <button 
                      onClick={() => setSelectionMode('CRM')}
                      className="p-8 rounded-[40px] border-2 border-gray-100 bg-white hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all flex flex-col items-center text-center group"
                    >
                      <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                        <Users size={32} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900">Pick Contacts</h4>
                      <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Select Individual CRM data</p>
                    </button>

                    <button 
                      onClick={() => setSelectionMode('CSV')}
                      className="p-8 rounded-[40px] border-2 border-gray-100 bg-white hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all flex flex-col items-center text-center group"
                    >
                      <div className="w-20 h-20 bg-orange-50 rounded-[32px] flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet size={32} />
                      </div>
                      <h4 className="text-xl font-black text-gray-900">Upload CSV</h4>
                      <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Import external list</p>
                    </button>
                 </div>
               ) : selectionMode === 'GROUPS' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <h3 className="text-xl font-black text-gray-900">Select Target Groups</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase">{selectedGroupIds.length} Groups Selected</p>
                       </div>
                       <button onClick={() => setSelectionMode(null)} className="text-xs font-black text-primary uppercase underline">Change Method</button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-2">
                       {groups.map(g => (
                         <button
                           key={g.id}
                           onClick={() => {
                             if (selectedGroupIds.includes(g.id)) setSelectedGroupIds(prev => prev.filter(id => id !== g.id));
                             else setSelectedGroupIds(prev => [...prev, g.id]);
                           }}
                           className={cn(
                             "flex items-center justify-between p-6 rounded-[30px] border-2 transition-all",
                             selectedGroupIds.includes(g.id) ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-gray-100 bg-white hover:border-gray-200"
                           )}
                         >
                           <div className="flex items-center space-x-4">
                              <div className={cn("w-3 h-3 rounded-full", selectedGroupIds.includes(g.id) ? "bg-primary" : "bg-gray-200")} />
                              <div className="text-left">
                                <p className="font-black text-gray-900">{g.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{g._count?.contacts || 0} Contacts</p>
                              </div>
                           </div>
                           {selectedGroupIds.includes(g.id) && <CheckCircle2 className="text-primary" size={20} />}
                         </button>
                       ))}
                    </div>
                    <button 
                      disabled={selectedGroupIds.length === 0 || loading}
                      onClick={handleGroupSelect}
                      className="btn-primary w-full h-14 rounded-3xl mt-4"
                    >
                      {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Sync Contacts & Continue'}
                    </button>
                  </div>
               ) : selectionMode === 'CRM' ? (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <h3 className="text-xl font-black text-gray-900">CRM Picker</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase">{selectedContactIds.length} Selective Recipients</p>
                       </div>
                       <button onClick={() => setSelectionMode(null)} className="text-xs font-black text-primary uppercase underline">Back</button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search your phonebook..." 
                        className="input h-12 pl-12 text-sm bg-white"
                        value={crmSearchTerm}
                        onChange={(e) => setCrmSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                       {contacts.filter(c => c.name.toLowerCase().includes(crmSearchTerm.toLowerCase())).map(c => (
                         <button
                          key={c.id}
                          onClick={() => {
                            if (selectedContactIds.includes(c.id)) setSelectedContactIds(prev => prev.filter(id => id !== c.id));
                            else setSelectedContactIds(prev => [...prev, c.id]);
                          }}
                          className={cn(
                            "flex items-center p-4 rounded-3xl border transition-all text-left",
                            selectedContactIds.includes(c.id) ? "border-emerald-500 bg-emerald-50/50" : "border-gray-100 bg-white hover:bg-gray-50"
                          )}
                         >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs mr-4",
                              selectedContactIds.includes(c.id) ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                            )}>
                              {selectedContactIds.includes(c.id) ? <Check size={18} /> : (c.name[0] || '?')}
                            </div>
                            <div className="flex-1 overflow-hidden">
                               <p className="font-bold text-gray-900 truncate">{c.name}</p>
                               <p className="text-[10px] text-gray-400 font-bold">{c.phoneNumber}</p>
                            </div>
                         </button>
                       ))}
                    </div>
                    <button 
                      disabled={selectedContactIds.length === 0}
                      onClick={() => handleCrmSelect()}
                      className="btn-primary w-full h-14 rounded-3xl mt-4"
                    >
                      Process Selection
                    </button>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-gray-900">List Import</h3>
                       <button onClick={() => setSelectionMode(null)} className="text-xs font-black text-primary uppercase underline">Back</button>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-80 border-4 border-dashed border-orange-100 bg-white rounded-[50px] cursor-pointer hover:bg-orange-50/30 transition-all shadow-sm">
                        {recipients.length > 0 ? (
                           <div className="text-center">
                              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[30px] flex items-center justify-center mx-auto mb-6">
                                <Check size={40} />
                              </div>
                              <p className="text-2xl font-black text-gray-900">{recipients.length} Ready</p>
                              <p className="text-sm text-gray-500 font-medium">Click to use different file</p>
                           </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-16 h-16 mb-6 text-orange-400" />
                            <p className="text-xl font-black text-gray-800 tracking-tight">Drop Recipient CSV</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Must contain 'PhoneNumber' column</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept=".csv" onChange={handleCSVUpload} />
                    </label>
                 </div>
               )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
               <div className="bg-primary/5 rounded-[32px] p-6 border border-primary/10 flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 tracking-tight">Map Data Variables</p>
                    <p className="text-xs text-gray-500 font-medium">Connect your contact fields to the template placeholders.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  {templateVars.map(v => (
                    <div key={v} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between hover:border-primary/20 transition-colors">
                       <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-primary border border-gray-100">
                             {v}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900">Variable {'{{'}{v}{'}}'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Dynamic Slot</p>
                          </div>
                       </div>
                       <select 
                        className="bg-gray-50 border-transparent rounded-2xl px-6 py-3 font-bold text-sm outline-none focus:ring-4 ring-primary/10 min-w-[200px]"
                        value={variableMappings[v] || ''}
                        onChange={(e) => setVariableMappings(prev => ({...prev, [v]: e.target.value}))}
                       >
                         <option value="">Select Field</option>
                         {csvColumns.map(col => (
                           <option key={col} value={col}>{col}</option>
                         ))}
                       </select>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="max-w-md mx-auto space-y-10 py-4">
               <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                  
                  <div className="flex justify-between items-center pb-6 border-b border-gray-50">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Campaign Summary</span>
                    <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-full uppercase shadow-lg shadow-primary/20">Final Review</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400 font-black text-[10px] uppercase">Title</span>
                       <span className="font-black text-gray-900 text-lg tracking-tight">{name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400 font-black text-[10px] uppercase">Audience</span>
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-black rounded-xl text-sm">{recipients.length} Contacts</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400 font-black text-[10px] uppercase">Template</span>
                       <span className="font-black text-primary truncate max-w-[200px] text-sm">{selectedTemplate.name}</span>
                    </div>
                  </div>
               </div>

               <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-gray-900">
                       <Calendar size={20} className="text-primary" />
                       <span className="font-black uppercase tracking-tight">Delivery Schedule</span>
                    </div>
                    <button 
                      onClick={() => setIsScheduled(!isScheduled)}
                      className={cn(
                        "w-14 h-8 rounded-full transition-all relative",
                        isScheduled ? "bg-primary shadow-lg shadow-primary/20" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 bg-white rounded-full absolute top-1 transition-all",
                        isScheduled ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                  
                  {isScheduled ? (
                    <input 
                      type="datetime-local" 
                      className="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 ring-primary/10"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  ) : (
                    <div className="text-center py-2">
                       <p className="text-xs font-bold text-gray-400 uppercase">Will be sent immediately after launch</p>
                    </div>
                  )}
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-50 bg-white flex items-center justify-between">
          <button 
            disabled={step === 1 || loading}
            onClick={goToPrev}
            className="flex items-center space-x-3 px-8 py-3 font-black text-gray-400 hover:text-gray-900 transition-all uppercase text-[11px] tracking-widest disabled:opacity-0"
          >
            <ChevronLeft size={18} />
            <span>Back Track</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="px-8 py-3 font-black text-gray-400 hover:text-red-500 transition-all text-[11px] uppercase tracking-widest"
            >
              Discard
            </button>
            <button
              disabled={loading || (step === 1 && (!name || !selectedTemplate)) || (step === 3 && recipients.length === 0)}
              onClick={() => {
                if (step === 5) handleFinish();
                else goToNext();
              }}
              className="btn-primary flex items-center space-x-3 px-10 h-14 rounded-3xl min-w-[180px] justify-center shadow-xl shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="tracking-tight">{step === 5 ? (isScheduled ? 'Schedule' : 'Launch Campaign') : 'Continue'}</span>
                  {step !== 5 ? <ChevronRight size={20} /> : <Send size={20} />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastWizard;
