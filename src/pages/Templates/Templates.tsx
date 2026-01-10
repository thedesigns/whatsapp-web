import React, { useEffect, useState } from 'react';
import { useTemplateStore } from '../../store/useTemplateStore';
import { 
  RefreshCw,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  Image as ImageIcon,
  ExternalLink,
  X,
  Video,
  File
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import TemplateWizard from '../../components/Templates/TemplateWizard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Templates: React.FC = () => {
  const { templates, loading, fetchTemplates, syncTemplates, createTemplate } = useTemplateStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSaveTemplate = async (templateData: any) => {
    try {
      await createTemplate(templateData);
      setIsWizardOpen(false);
    } catch (error: any) {
      console.error('Failed to create template', error);
      alert(error.message || 'Failed to create template');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-50 text-green-600 border-green-100';
      case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MARKETING': return <ImageIcon size={14} />;
      case 'UTILITY': return <Clock size={14} />;
      case 'AUTHENTICATION': return <CheckCircle2 size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <TemplateWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSave={handleSaveTemplate} 
      />

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">{previewTemplate.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black uppercase border", getStatusStyle(previewTemplate.status))}>
                    {previewTemplate.status}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{previewTemplate.category}</span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - WhatsApp Style Preview */}
            <div className="p-6 bg-[#e5ddd5]">
              <div className="bg-white rounded-2xl shadow-sm p-4 max-w-[90%]">
                {(() => {
                  const components = Array.isArray(previewTemplate.components) ? previewTemplate.components : [];
                  const headerComp = components.find((c: any) => c.type === 'HEADER');
                  const bodyComp = components.find((c: any) => c.type === 'BODY');
                  const footerComp = components.find((c: any) => c.type === 'FOOTER');
                  const buttonsComp = components.find((c: any) => c.type === 'BUTTONS');

                  return (
                    <>
                      {headerComp && (
                        <div className="mb-3 pb-3 border-b border-gray-100">
                          {headerComp.format === 'IMAGE' && (
                            <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center">
                              <ImageIcon size={32} className="text-gray-400" />
                            </div>
                          )}
                          {headerComp.format === 'VIDEO' && (
                            <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center">
                              <Video size={32} className="text-gray-400" />
                            </div>
                          )}
                          {headerComp.format === 'DOCUMENT' && (
                            <div className="bg-gray-100 rounded-xl h-20 flex items-center justify-center gap-2">
                              <File size={24} className="text-gray-400" />
                              <span className="text-xs text-gray-500 font-bold">PDF Document</span>
                            </div>
                          )}
                          {headerComp.text && (
                            <p className="font-bold text-gray-900">{headerComp.text}</p>
                          )}
                        </div>
                      )}
                      {bodyComp?.text && (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {bodyComp.text.replace(/\{\{(\d+)\}\}/g, (match: string) => `[Variable ${match}]`)}
                        </p>
                      )}
                      {footerComp?.text && (
                        <p className="text-xs text-gray-400 mt-3">{footerComp.text}</p>
                      )}
                      {buttonsComp?.buttons && buttonsComp.buttons.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                          {buttonsComp.buttons.map((btn: any, idx: number) => (
                            <button key={idx} className="w-full py-2 text-center text-primary text-sm font-bold bg-primary/5 rounded-xl">
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-400 font-bold">Language: {previewTemplate.language}</span>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="btn-primary text-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">WhatsApp Templates</h1>
          <p className="text-gray-500 font-medium text-sm">Pre-approved message components from Meta Business</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="btn-primary flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            <span>Create New</span>
          </button>
          <button 
            onClick={() => syncTemplates()}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={cn(loading && "animate-spin")} size={18} />
            <span>Sync from Meta</span>
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto pb-10">
        <div className="p-4 border border-gray-100 bg-white rounded-2xl mb-6 shadow-sm flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="input pl-10 h-11 bg-gray-50 border-transparent focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-primary transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && templates.length === 0 ? (
             Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                  <div className="w-20 h-4 bg-gray-100 rounded mb-4" />
                  <div className="w-full h-24 bg-gray-50 rounded mb-4" />
                  <div className="w-1/2 h-4 bg-gray-100 rounded" />
                </div>
             ))
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div 
                key={template.id} 
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                    getStatusStyle(template.status)
                  )}>
                    {template.status}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    {getCategoryIcon(template.category)}
                    <span className="ml-1.5">{template.category}</span>
                  </span>
                </div>

                <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors mb-4 truncate">
                  {template.name}
                </h3>

                <div className="flex-1 bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100 overflow-hidden">
                   {template.components.map((comp: any, idx: number) => (
                     <div key={idx} className="mb-2 last:mb-0">
                        {comp.type === 'HEADER' && (
                          <div className="text-[10px] font-black text-primary uppercase mb-1 flex items-center">
                            {comp.format === 'IMAGE' ? <ImageIcon size={10} className="mr-1" /> : <FileText size={10} className="mr-1" />}
                            Header ({comp.format})
                          </div>
                        )}
                        {comp.text && (
                          <p className="text-xs text-gray-600 line-clamp-3 font-medium leading-relaxed">
                            {typeof comp.text === 'string' ? comp.text.replace(/{{(\d+)}}/g, (match: string) => `[${match}]`) : ''}
                          </p>
                        )}
                        {comp.type === 'BUTTONS' && (
                           <div className="mt-2 flex flex-wrap gap-1">
                              {comp.buttons.map((btn: any, bidx: number) => (
                                <span key={bidx} className="text-[9px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">
                                  {btn.text}
                                </span>
                              ))}
                           </div>
                        )}
                     </div>
                   ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Lang: {template.language}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                      className="text-primary hover:text-primary-hover flex items-center text-[10px] font-black uppercase"
                    >
                       Full Preview
                       <ExternalLink size={12} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : !loading && (
            <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center">
               <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 opacity-40">
                <FileText size={40} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No templates found</h4>
              <p className="max-w-xs font-medium">
                Make sure your Meta Business account is correctly linked and templates are approved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Templates;
