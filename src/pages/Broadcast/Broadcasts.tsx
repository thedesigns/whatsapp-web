import React, { useEffect, useState } from 'react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import BroadcastWizard from '../../components/Broadcast/BroadcastWizard';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  Send,
  AlertCircle,
  Loader2,
  FileText,
  BarChart2,
  Trash2,
  Clock,
  Download,
  X,
  Phone,
  User,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safe date formatting helper to prevent crashes on invalid dates
function safeFormatDate(dateValue: any, formatString: string, fallback: string = '-'): string {
  if (!dateValue) return fallback;
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatString);
  } catch {
    return fallback;
  }
}


const Broadcasts: React.FC = () => {
  const { broadcasts, loading, fetchBroadcasts, deleteBroadcast, getBroadcastReport } = useBroadcastStore();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [infoRecipient, setInfoRecipient] = useState<any>(null);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleShowReport = async (id: string) => {
    setReportLoading(true);
    try {
      const report = await getBroadcastReport(id);
      // Ensure recipients is always an array to prevent rendering crashes
      if (report && !report.recipients) {
        report.recipients = [];
      }
      setSelectedReport(report);
    } catch (err) {
      console.error('Failed to load report:', err);
      alert('Failed to load report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteBroadcast(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadCSV = (report: any) => {
    try {
      if (!report) {
        alert('No report data available to download');
        return;
      }
      
      const recipients = report.recipients || [];
      const campaignName = (report.name || 'Untitled_Campaign').replace(/[^a-zA-Z0-9]/g, '_');
      const templateName = report.templateName || 'Unknown';
      
      // Build CSV with detailed headers
      const headers = [
        'Recipient Name',
        'Phone Number', 
        'Status',
        'Delivery Status Detail',
        'WA Message ID',
        'Sent At',
        'Delivered At',
        'Read At',
        'Error Message',
        'Campaign Name',
        'Template'
      ];
      
      const rows = recipients.map((r: any) => {
        let deliveryDetail = r.status || 'PENDING';
        if (r.status === 'SENT' && !r.deliveredAt) {
          deliveryDetail = 'Waiting for recipient handset (Offline)';
        } else if (r.status === 'DELIVERED' || r.status === 'READ') {
          deliveryDetail = 'Received by handset';
        } else if (r.status === 'FAILED') {
          deliveryDetail = `Failed: ${r.error || 'Unknown'}`;
        }

        return [
          r.contactName || r.name || 'Unknown',
          r.phoneNumber || '-',
          r.status || 'PENDING',
          deliveryDetail,
          r.waMessageId || '-',
          safeFormatDate(r.sentAt, 'yyyy-MM-dd HH:mm:ss'),
          safeFormatDate(r.deliveredAt, 'yyyy-MM-dd HH:mm:ss'),
          safeFormatDate(r.readAt, 'yyyy-MM-dd HH:mm:ss'),
          r.error || '',
          report.name || 'Untitled Campaign',
          templateName
        ];
      });

      // Escape values properly for CSV
      const escapeCSV = (value: any) => {
        const str = String(value ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
      };

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map(escapeCSV).join(','))
      ].join('\n');

      // Create and trigger download using Blob (safe for large files)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
      const filename = `Broadcast_Report_${campaignName}.csv`;
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Could not generate CSV report. Please try again.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-100';
      case 'PROCESSING': 
      case 'RUNNING': return 'bg-primary/5 text-primary border-primary/10';
      case 'PENDING': 
      case 'SCHEDULED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'FAILED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'PENDING';
      case 'PROCESSING': return 'RUNNING';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={14} />;
      case 'PROCESSING': return <Loader2 className="animate-spin" size={14} />;
      case 'SCHEDULED': return <Calendar size={14} />;
      case 'FAILED': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const safeBroadcasts = Array.isArray(broadcasts) ? broadcasts : [];
  const filteredBroadcasts = safeBroadcasts.filter(b => {
    const name = b.name || '';
    const templateName = b.templateName || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         templateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Broadcast Campaigns</h1>
          <p className="text-gray-500 font-medium text-sm">Reach your audience at scale with Meta Templates</p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>New Broadcast</span>
        </button>
      </div>

      <BroadcastWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />

      {/* Campaigns Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border border-gray-100 bg-white rounded-2xl mb-6 shadow-sm flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="input pl-10 h-11 bg-gray-50 border-transparent focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex items-center bg-gray-50 rounded-xl px-3 border border-transparent focus-within:bg-white focus-within:border-gray-100 transition-all">
               <Filter size={16} className="text-gray-400 mr-2" />
               <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent h-11 text-sm font-bold text-gray-600 focus:outline-none cursor-pointer"
               >
                 <option value="ALL">All Status</option>
                 <option value="SCHEDULED">Pending</option>
                 <option value="PROCESSING">Running</option>
                 <option value="COMPLETED">Completed</option>
                 <option value="FAILED">Failed</option>
               </select>
             </div>
             <button 
              onClick={() => fetchBroadcasts()}
              className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-primary hover:bg-primary/5 transition-all group"
              title="Refresh Broadcasts"
             >
              <Loader2 className={cn("transition-all", loading && "animate-spin text-primary")} size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pb-20">
          {loading && broadcasts.length === 0 ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
              <p className="text-gray-400 font-bold">Loading campaigns...</p>
            </div>
          ) : filteredBroadcasts.length > 0 ? (
            filteredBroadcasts.map((campaign) => (
              <div 
                key={campaign.id} 
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Status & Name */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                       <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center space-x-1.5 border",
                        getStatusStyle(campaign.status)
                      )}>
                        {getStatusIcon(campaign.status)}
                        <span>{getStatusLabel(campaign.status)}</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">
                      {campaign.name || 'Untitled Campaign'}
                    </h3>
                    <p className="text-sm text-gray-400 font-bold flex items-center mt-1 uppercase tracking-tight">
                      <FileText size={14} className="mr-1.5" />
                      {campaign.templateName || 'Unknown Template'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-8 px-8 border-x border-gray-50">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xl font-black text-gray-900">{campaign.totalRecipients}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Success</p>
                      <p className="text-xl font-black text-green-600">{campaign.successCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Failed</p>
                      <p className="text-xl font-black text-red-600">{campaign.failedCount}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right mr-4 hidden sm:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {campaign.status === 'SCHEDULED' ? 'Scheduled For' : 'Created At'}
                      </p>
                      <p className="text-xs font-bold text-gray-600">
                        {safeFormatDate(campaign.status === 'SCHEDULED' ? campaign.scheduledAt : campaign.createdAt, 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleShowReport(campaign.id)}
                      className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <BarChart2 size={20} />
                    </button>
                    <button 
                      onClick={() => setDeleteId(campaign.id)} 
                      className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {campaign.status === 'PROCESSING' && (
                  <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${(campaign.successCount / campaign.totalRecipients) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center">
               <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 opacity-40">
                <Send size={40} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No active campaigns</h4>
              <p className="max-w-xs font-medium">
                You haven't sent any broadcasts yet. Create your first campaign to reach your customers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4 animate-in zoom-in duration-300">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete Campaign?</h3>
            <p className="text-gray-500 text-sm font-medium mb-6">
              This will permanently delete the campaign and its history depending on the retention policy. This action implies "Wait for deletion to complete".
            </p>
            <div className="flex items-center space-x-3 w-full">
              <button 
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl shadow-lg shadow-red-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          {/* ... (Report Modal content unchanged, omitted for brevity if duplicate) ... */}
          {/* I need to make sure I don't delete the report modal content. The replacement logic replaces FROM start line to End. */}
          {/* The previous code had Report Modal starting around line 259. */}
          {/* I will invoke replace_file_content carefully. */ }
          {/* I'm replacing from line 32 (DeleteButton definition) to where the Report Modal STARTS. */}
          {/* Or I can replace the whole functional component but keep Report Modal. */}
          {/* Let's be careful. */}
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <BarChart2 size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedReport.name}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedReport.templateName}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{safeFormatDate(selectedReport.createdAt, 'PPP p')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => downloadCSV(selectedReport)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download size={18} />
                  <span>Download Report</span>
                </button>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50">
              {/* Report Stats */}
              <div className="grid grid-cols-4 gap-6 p-8">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Outreach</p>
                   <h4 className="text-3xl font-black text-gray-900">{selectedReport.totalRecipients}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">Delivered</p>
                   <h4 className="text-3xl font-black text-green-600">{selectedReport.deliveredCount}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Read</p>
                   <h4 className="text-3xl font-black text-blue-600">{selectedReport.readCount}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Failed</p>
                   <h4 className="text-3xl font-black text-red-600">{selectedReport.failedCount}</h4>
                </div>
              </div>

              {/* Recipients Table */}
              <div className="px-8 flex-1 overflow-hidden flex flex-col">
                 <div className="bg-white rounded-t-3xl border border-gray-100 shadow-sm flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md border-b border-gray-100">
                          <tr>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">WA Message ID</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                             <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event History</th>
                             <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Info</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                           {(selectedReport.recipients || []).map((r: any) => (
                             <tr key={r.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="px-6 py-4">
                                   <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                         <User size={16} />
                                      </div>
                                      <span className="font-bold text-gray-900">{r.contactName || 'Valued Client'}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center space-x-2 text-gray-500 font-mono text-xs font-bold">
                                      <Phone size={12} />
                                      <span>{r.phoneNumber}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <p className="text-[10px] font-mono font-bold text-gray-400 truncate max-w-[120px]">{r.waMessageId || '-'}</p>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={cn(
                                     "px-2.5 py-1 rounded-full text-[9px] font-black uppercase flex items-center w-fit space-x-1 border",
                                     r.status === 'READ' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                     r.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                                     r.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-100' :
                                     'bg-gray-50 text-gray-500 border-gray-100'
                                   )}>
                                      {r.status === 'READ' ? <FileText size={10} /> : 
                                       r.status === 'DELIVERED' ? <CheckCircle2 size={10} /> :
                                       r.status === 'FAILED' ? <AlertCircle size={10} /> : <Clock size={10} />}
                                      <span>{r.status}</span>
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex flex-col gap-1">
                                      {r.sentAt && <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400"><Clock size={10}/> SENT: {format(new Date(r.sentAt), 'HH:mm:ss')}</div>}
                                      {r.deliveredAt && <div className="flex items-center gap-1.5 text-[9px] font-bold text-green-500"><CheckCircle2 size={10}/> DELIV: {format(new Date(r.deliveredAt), 'HH:mm:ss')}</div>}
                                      {r.readAt && <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-500"><FileText size={10}/> READ: {format(new Date(r.readAt), 'HH:mm:ss')}</div>}
                                      {!r.sentAt && <span className="text-[10px] text-gray-300 font-bold italic">No events yet</span>}
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <button onClick={() => setInfoRecipient(r)} className="ml-auto block hover:opacity-80 transition-opacity">
                                     {r.error ? (
                                        <div className="flex items-center justify-end text-red-500 space-x-1" title={r.error}>
                                           <AlertCircle size={14} />
                                           <span className="text-[10px] font-bold">Error Info</span>
                                        </div>
                                     ) : (
                                        <div className="flex items-center justify-end text-gray-300 group-hover:text-primary transition-colors">
                                           <ExternalLink size={14} />
                                        </div>
                                     )}
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-100 bg-white flex items-center justify-between">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest"> Pulse Data Engine v1.0 </p>
               <button 
                onClick={() => setSelectedReport(null)}
                className="btn-primary"
               >
                 Close Report
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Recipient Modal */}
      {infoRecipient && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-gray-900 text-lg">Message Details</h3>
                 <button onClick={() => setInfoRecipient(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400"/></button>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-gray-400 font-bold text-[10px] uppercase block mb-1">Recipient</span>
                    <span className="font-black text-gray-900 text-lg block">{infoRecipient.contactName || infoRecipient.name || 'Unknown'}</span>
                    <div className="flex items-center space-x-2 mt-1 text-gray-500 font-mono text-xs font-bold">
                      <Phone size={12} />
                      <span>{infoRecipient.phoneNumber}</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-bold text-[10px] uppercase block mb-1">Status</span>
                      <span className={cn(
                        "text-xs font-black uppercase",
                        infoRecipient.status === 'FAILED' ? "text-red-500" : 
                        infoRecipient.status === 'DELIVERED' ? "text-green-500" : 
                        infoRecipient.status === 'READ' ? "text-blue-500" : "text-gray-500"
                      )}>{infoRecipient.status}</span>
                   </div>
                   <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-bold text-[10px] uppercase block mb-1">Message ID</span>
                      <span className="font-mono text-[10px] text-gray-500 block truncate" title={infoRecipient.waMessageId || '-'}>{infoRecipient.waMessageId || '-'}</span>
                   </div>
                 </div>

                 {infoRecipient.error && (
                   <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                      <div className="flex items-center space-x-2 text-red-500 mb-2">
                        <AlertCircle size={16} />
                        <span className="font-black text-xs uppercase">Error Description</span>
                      </div>
                      <p className="text-red-600 font-medium text-sm leading-relaxed">{infoRecipient.error}</p>
                   </div>
                 )}
              </div>
              <button onClick={() => setInfoRecipient(null)} className="btn-secondary w-full mt-6 h-12 rounded-2xl font-bold">Close Details</button>
           </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {reportLoading && (
        <div className="fixed inset-0 z-100 bg-white/20 backdrop-blur-md flex items-center justify-center">
           <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col items-center">
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <p className="text-lg font-black text-gray-900">Generating Report...</p>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Fetching recipient logs</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Broadcasts;
