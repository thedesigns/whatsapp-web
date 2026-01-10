import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Layout, Image as ImageIcon, Video, FileText, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TemplateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
}

const TemplateWizard: React.FC<TemplateWizardProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [language, setLanguage] = useState('en_US');
  
  const [headerType, setHeaderType] = useState('NONE');
  const [headerText, setHeaderText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [buttons, setButtons] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [headerUrl, setHeaderUrl] = useState<string | null>(null);
  const [headerHandle, setHeaderHandle] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddButton = () => {
    if (buttons.length >= 3) return;
    setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }]);
  };

  const handleRemoveButton = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  const handleUpdateButton = (idx: number, updates: any) => {
    setButtons(buttons.map((btn, i) => i === idx ? { ...btn, ...updates } : btn));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeaderFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/messages/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.publicUrl) {
        setHeaderUrl(res.data.publicUrl);
        // Use either the headerHandle (4:: format) or the mediaId (numerical) from the upload
        // Both work for header_handle in template creation
        const handle = res.data.headerHandle || res.data.mediaId;
        if (handle) {
          setHeaderHandle(handle);
        }
        console.log('✅ File uploaded, URL received. Handle/MediaId:', handle);
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload media asset');
    } finally {
      setIsUploading(false);
    }
  };

    const handleSubmit = () => {
    const components = [];
    
    // Validate template name
    if (!name || name.trim() === '') {
      alert('Please enter a template name');
      return;
    }
    
    // Sanitize template name: lowercase, underscores only, no special chars
    const sanitizedName = name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    
    console.log('📝 Original name:', name);
    console.log('📝 Sanitized name:', sanitizedName);
    
    if (!sanitizedName || sanitizedName.length < 1) {
      alert('Template name is invalid after sanitization. Please use only letters, numbers, and underscores.');
      return;
    }
    
    if (headerType !== 'NONE') {
        const headerComp: any = {
            type: 'header',
            format: headerType.toLowerCase(),
        };

        if (headerType === 'TEXT') {
            headerComp.text = headerText;
        } else if (headerHandle) {
            // Using the Meta-generated media ID (either 4:: format or numerical ID)
            // The numerical ID from regular media upload works for template headers
            headerComp.example = {
                header_handle: [headerHandle]
            };
        } else {
            // Fallback for cases where media upload failed
            const sampleUrls: Record<string, string> = {
                'IMAGE': 'https://raw.githubusercontent.com/thedesigns/new/main/2890.jpg',
                'VIDEO': 'https://www.buildquickbots.com/whatsapp/media/sample/video/sample01.mp4',
                'DOCUMENT': 'https://www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf'
            };
            
            headerComp.example = {
                header_handle: [sampleUrls[headerType] || sampleUrls.IMAGE]
            };
        }

        components.push(headerComp);
    }

    const bodyComp: any = {
        type: 'body',
        text: bodyText
    };

    // Meta REQUIRES examples for each UNIQUE variable {{1}}, {{2}}, etc.
    const bodyVarsMatch = bodyText.match(/\{\{(\d+)\}\}/g);
    if (bodyVarsMatch) {
        // Extract unique variable numbers
        const uniqueVars = Array.from(new Set(bodyVarsMatch.map(v => v.match(/\d+/)![0])))
            .sort((a, b) => parseInt(a) - parseInt(b));
            
        bodyComp.example = {
            body_text: [
                uniqueVars.map(v => `Sample ${v}`)
            ]
        };
    }

    components.push(bodyComp);

    if (footerText) {
        components.push({
            type: 'footer',
            text: footerText
        });
    }

    if (buttons.length > 0) {
        components.push({
            type: 'buttons',
            buttons: buttons.map(b => {
                const buttonDef: any = {
                    type: b.type.toLowerCase(),
                    text: b.text,
                };
                
                if (b.type === 'URL') {
                    // Use user-provided URL, or a placeholder with variable for dynamic URLs
                    buttonDef.url = b.url || 'https://example.com/{{1}}';
                    buttonDef.example = [b.url || 'https://example.com/demo'];
                }
                
                if (b.type === 'PHONE_NUMBER') {
                    // Use user-provided phone number
                    buttonDef.phone_number = b.phone_number || '+1234567890';
                }
                
                return buttonDef;
            })
        });
    }

    onSave({
        name: sanitizedName,
        category: category.toLowerCase(),
        language: language || 'en_US',
        components,
        headerUrl, // Pass the local ngrok URL for DB storage
        allow_category_change: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-100/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Layout size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-none mb-1">Create Template</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {step} of 2 • {step === 1 ? 'Configuration' : 'Content & Design'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form Side */}
            <div className="space-y-8">
              {step === 1 ? (
                <>
                  <section className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Basic Details</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">Template Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. order_confirmation_v1"
                          className="input"
                          value={name}
                          onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        />
                        <p className="mt-1.5 text-[10px] text-gray-400 uppercase font-black tracking-tight">Only lowercase, numbers, and underscores</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-gray-700 block mb-2">Category</label>
                          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="MARKETING">Marketing</option>
                            <option value="UTILITY">Utility</option>
                            <option value="AUTHENTICATION">Auth</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 block mb-2">Language</label>
                           <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="en_US">English (US)</option>
                            <option value="pt_BR">Portuguese (BR)</option>
                            <option value="es">Spanish</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-6">
                     <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Header (Optional)</label>
                        <div className="flex p-1 bg-gray-100/50 rounded-xl w-fit flex-wrap gap-1">
                            {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].map((type) => (
                                <button
                                    key={type}
                                        onClick={() => {
                                            setHeaderType(type);
                                        }}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-black transition-all",
                                        headerType === type ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        {headerType === 'TEXT' && (
                            <input 
                                type="text" 
                                placeholder="Enter header text..."
                                className="input"
                                value={headerText}
                                onChange={(e) => setHeaderText(e.target.value)}
                            />
                        )}
                        {(headerType === 'IMAGE' || headerType === 'VIDEO' || headerType === 'DOCUMENT') && (
                            <label className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-white group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
                                {isUploading ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                        <RefreshCw className="w-8 h-8 mb-2 animate-spin text-primary" />
                                        <span className="text-[10px] font-black uppercase text-primary">Processing...</span>
                                    </div>
                                ) : headerFile ? (
                                    <div className="text-center">
                                        <Check className="w-8 h-8 mb-2 mx-auto text-green-500" />
                                        <span className="text-[10px] font-black uppercase text-gray-900 block truncate max-w-[200px]">{headerFile.name}</span>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setHeaderFile(null);
                                                setHeaderUrl(null);
                                            }}
                                            className="text-[9px] font-black text-red-500 uppercase mt-2 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold uppercase text-center">
                                            {headerType === 'DOCUMENT' ? 'Upload PDF Document' : `Upload Header ${headerType}`}
                                        </span>
                                        <span className="text-[9px] text-gray-400 uppercase mt-1">MAX 16MB</span>
                                    </>
                                )}
                                <input type="file" className="hidden" onChange={handleFileUpload} accept={
                                    headerType === 'IMAGE' ? 'image/*' : 
                                    headerType === 'VIDEO' ? 'video/*' : 
                                    headerType === 'DOCUMENT' ? 'application/pdf' : '*'
                                } />
                            </label>
                        )}
                     </div>

                     <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Body Content</label>
                          <button
                            type="button"
                            onClick={() => {
                              // Find the next variable number
                              const matches = bodyText.match(/\{\{(\d+)\}\}/g);
                              const usedNums = matches ? matches.map(m => parseInt(m.replace(/\D/g, ''))) : [];
                              const nextNum = usedNums.length === 0 ? 1 : Math.max(...usedNums) + 1;
                              setBodyText(bodyText + `{{${nextNum}}}`);
                            }}
                            className="text-[10px] font-black uppercase text-primary hover:text-primary-hover flex items-center gap-1"
                          >
                            <Plus size={12} />
                            Add Variable
                          </button>
                        </div>
                        <textarea 
                          rows={4}
                          placeholder="What would you like to say? Use {{1}} for variables."
                          className="input py-4 resize-none"
                          value={bodyText}
                          onChange={(e) => setBodyText(e.target.value)}
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Footer (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Reply STOP to opt-out"
                          className="input"
                          value={footerText}
                          onChange={(e) => setFooterText(e.target.value)}
                        />
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Buttons (Max 3)</label>
                            <button onClick={handleAddButton} disabled={buttons.length >= 3} className="text-primary hover:text-primary-hover disabled:opacity-50 inline-flex items-center font-black uppercase text-[10px]">
                                <Plus size={14} className="mr-1" /> Add Button
                            </button>
                        </div>
                        <div className="space-y-3">
                            {buttons.map((btn, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between">
                                        <select 
                                            className="text-[10px] font-black uppercase bg-gray-50 border-none rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary"
                                            value={btn.type}
                                            onChange={(e) => handleUpdateButton(idx, { type: e.target.value, phone_number: '', url: '' })}
                                        >
                                            <option value="QUICK_REPLY">Quick Reply</option>
                                            <option value="URL">Visit Website</option>
                                            <option value="PHONE_NUMBER">Call Number</option>
                                        </select>
                                        <button onClick={() => handleRemoveButton(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Button Label"
                                        className="input h-10 text-sm"
                                        value={btn.text}
                                        onChange={(e) => handleUpdateButton(idx, { text: e.target.value })}
                                    />
                                    {btn.type === 'PHONE_NUMBER' && (
                                        <input 
                                            type="tel" 
                                            placeholder="Phone Number (e.g. +919876543210)"
                                            className="input h-10 text-sm"
                                            value={btn.phone_number || ''}
                                            onChange={(e) => handleUpdateButton(idx, { phone_number: e.target.value })}
                                        />
                                    )}
                                    {btn.type === 'URL' && (
                                        <input 
                                            type="url" 
                                            placeholder="Website URL (e.g. https://example.com)"
                                            className="input h-10 text-sm"
                                            value={btn.url || ''}
                                            onChange={(e) => handleUpdateButton(idx, { url: e.target.value })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                     </div>
                  </section>
                </>
              )}
            </div>

            {/* Preview Side */}
            <div className="hidden lg:block">
              <div className="sticky top-0 bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Live Mobile Preview</h4>
                  <div className="flex space-x-1">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     <div className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
                  </div>
                </div>

                <div className="max-w-[280px] mx-auto bg-[#e5ddd5] rounded-[32px] p-2 aspect-9/16 relative overflow-hidden border-[6px] border-dark-100 shadow-2xl">
                    <div className="h-full w-full bg-[#f0f2f5] rounded-[24px] flex flex-col pt-10 px-3 overflow-hidden">
                        {/* Chat Bubbles */}
                        <div className="flex-1 overflow-hidden">
                             <div className="bg-white rounded-[14px] rounded-tl-none p-3 shadow-sm border-l-4 border-primary max-w-[90%] animate-in slide-in-from-left duration-300">
                                {headerType !== 'NONE' && (
                                    <div className="mb-2 bg-gray-100 rounded-lg overflow-hidden min-h-[40px] flex items-center justify-center">
                                         {headerType === 'TEXT' ? (
                                             <span className="text-[11px] font-black text-gray-800 p-2 text-center uppercase">{headerText || 'Header'}</span>
                                         ) : (
                                             <div className="flex flex-col items-center p-4">
                                                 {headerType === 'IMAGE' ? <ImageIcon size={20} className="text-gray-300" /> : 
                                                  headerType === 'VIDEO' ? <Video size={20} className="text-gray-300" /> :
                                                  <FileText size={20} className="text-gray-300" />}
                                                 <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Header {headerType}</span>
                                             </div>
                                         )}
                                    </div>
                                )}
                                <p className="text-[12px] text-gray-800 font-medium whitespace-pre-wrap leading-snug">
                                    {bodyText || 'Your message text will appear here...'}
                                </p>
                                {footerText && (
                                    <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                        {footerText}
                                    </p>
                                )}
                             </div>
                             {buttons.length > 0 && (
                                 <div className="flex flex-col mt-1.5 space-y-1 max-w-[90%]">
                                     {buttons.map((btn, i) => (
                                         <div key={i} className="bg-white border-t border-gray-100 rounded-[12px] p-2 flex items-center justify-center shadow-sm">
                                              <span className="text-[11px] font-black text-primary uppercase">{btn.text || 'Button label'}</span>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-primary/3 border border-primary/10 rounded-2xl flex items-start space-x-3">
                   <AlertCircle className="text-primary mt-0.5" size={14} />
                   <p className="text-[10px] font-bold text-primary/80 uppercase leading-relaxed">
                      This is a simulated preview. Actual rendering may vary based on user device and language settings.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
                {[1, 2].map((s) => (
                    <div key={s} className={cn(
                        "h-1.5 transition-all duration-300 rounded-full",
                        step === s ? "w-8 bg-primary" : "w-1.5 bg-gray-200"
                    )} />
                ))}
            </div>
            <div className="flex space-x-3">
                {step > 1 && (
                    <button onClick={() => setStep(step - 1)} className="btn-secondary px-8">Back</button>
                )}
                <button 
                    onClick={() => step < 2 ? setStep(step + 1) : handleSubmit()} 
                    className="btn-primary px-8 flex items-center space-x-2 shadow-lg shadow-primary/30"
                >
                    <span>{step === 2 ? 'Submit to Meta' : 'Next Step'}</span>
                    <Check size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const AlertCircle = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default TemplateWizard;
