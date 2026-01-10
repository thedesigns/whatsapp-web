import React, { useEffect, useState, useRef } from 'react';
import { useContactStore } from '../../store/useContactStore';
import { 
  Search, 
  UserPlus, 
  Upload, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Trash2, 
  Edit2, 
  Users, 
  Plus, 
  X, 
  User, 
  Tags,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Contacts: React.FC = () => {
  const { 
    contacts, total, loading, fetchContacts, deleteContact, bulkImport,
    groups, groupsLoading, fetchGroups, createGroup, updateContact 
  } = useContactStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  
  const [editingContact, setEditingContact] = useState<any>(null);
  const [importGroupId, setImportGroupId] = useState('');

  useEffect(() => {
    fetchContacts(page, 10, searchTerm, selectedGroupId);
  }, [page, searchTerm, selectedGroupId]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || text.trim().length === 0) {
          alert('CSV file is empty');
          return;
        }

        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          alert('CSV file must have a header row and at least one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Find phone column
        const phoneKey = headers.find(h => 
          h.includes('phone') || h.includes('mobile') || h.includes('number') || h === 'wa' || h === 'whatsapp'
        );
        
        // Find country code column (separate from phone)
        const countryCodeKey = headers.find(h => 
          h.includes('country') || h.includes('code') || h === 'cc' || h === 'dialcode'
        );
        
        if (!phoneKey) {
          alert('CSV must have a column containing "phone", "mobile", "number", or "whatsapp" in the header');
          return;
        }

        const nameKey = headers.find(h => h.includes('name'));
        
        const parsedContacts = lines.slice(1).filter(l => l.trim()).map(line => {
          // Handle quoted CSV values
          const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || line.split(',').map(v => v.trim());
          
          const obj: any = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] || '';
          });

          // Get country code and phone separately
          let countryCode = countryCodeKey ? obj[countryCodeKey]?.replace(/[^0-9+]/g, '') || '' : '';
          let phone = obj[phoneKey]?.replace(/[^0-9+]/g, '') || '';
          
          // If country code exists and phone doesn't start with it, combine them
          if (countryCode && phone) {
            // Remove + from country code if present, we'll add it back
            countryCode = countryCode.replace(/^\+/, '');
            // Remove leading + from phone if present
            phone = phone.replace(/^\+/, '');
            // If phone doesn't already start with country code, prepend it
            if (!phone.startsWith(countryCode)) {
              phone = countryCode + phone;
            }
          }
          
          if (!phone) return null;

          return {
            phoneNumber: phone,
            name: nameKey ? obj[nameKey] : phone,
            waId: phone.replace(/[^0-9]/g, '')
          };
        }).filter(Boolean);

        if (parsedContacts.length === 0) {
          alert('No valid contacts found in CSV. Make sure phone numbers are present.');
          return;
        }

        await bulkImport(parsedContacts as any[], importGroupId || undefined);
        setIsImportModalOpen(false);
        setImportGroupId('');
        alert(`Successfully imported ${parsedContacts.length} contacts!`);
      } catch (err: any) {
        console.error('CSV parsing error:', err);
        alert('Failed to parse or import CSV: ' + (err.message || 'Unknown error'));
      }
    };

    reader.onerror = () => {
      alert('Failed to read file');
    };

    reader.readAsText(file);
    
    // Reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['Name', 'Country_Code', 'Phone_Number', 'Email', 'Company', 'City', 'Tags'],
      ['John Doe', '91', '9876543210', 'john@example.com', 'Acme Corp', 'Mumbai', 'VIP'],
      ['Jane Smith', '91', '9123456789', 'jane@example.com', 'XYZ Ltd', 'Delhi', 'Premium'],
      ['Bob Wilson', '1', '5551234567', 'bob@example.com', 'ABC Inc', 'New York', 'New'],
      ['Alice Brown', '44', '7911123456', 'alice@example.com', 'UK Corp', 'London', 'Regular']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    try {
      await createGroup({ name: newGroupName, description: newGroupDesc });
      setNewGroupName('');
      setNewGroupDesc('');
      setIsGroupModalOpen(false);
    } catch (err: any) {
      alert('Failed to create group: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;
    try {
      await updateContact(editingContact.id, {
        name: editingContact.name,
        labels: editingContact.labels
      });
      setIsEditModalOpen(false);
      setEditingContact(null);
    } catch (err) {
      alert('Failed to update contact');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Audience Explorer</h1>
          <p className="text-gray-500 font-medium text-sm">Organize contacts and phone book groups</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Upload size={18} />
            <span>Import CSV</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <UserPlus size={18} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar: Groups */}
        <div className="w-72 flex flex-col space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Phone Books</h2>
              <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <button 
                onClick={() => setSelectedGroupId('')}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold transition-all group",
                  selectedGroupId === '' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Users size={18} className={selectedGroupId === '' ? "text-white" : "text-gray-400"} />
                  <span>All Contacts</span>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full",
                  selectedGroupId === '' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                )}>{total}</span>
              </button>

              {groups.map((group) => (
                <button 
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl text-sm font-bold transition-all group",
                    selectedGroupId === group.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      selectedGroupId === group.id ? "bg-white" : "bg-primary/40"
                    )} />
                    <span className="truncate">{group.name}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    selectedGroupId === group.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                  )}>{group._count?.contacts || 0}</span>
                </button>
              ))}

              {groupsLoading && (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin text-gray-300" size={20} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main: Contact List */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-gray-50 bg-white/50 backdrop-blur-md flex items-center justify-between space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or number..." 
                className="input pl-10 h-11 bg-gray-50 border-transparent focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-primary transition-all">
              <Filter size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md border-b border-gray-50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Labels</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Added</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Loader2 className="animate-spin text-primary mx-auto mb-2" size={32} />
                      <p className="text-gray-400 font-bold">Synchronizing Contacts...</p>
                    </td>
                  </tr>
                ) : contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {contact.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{contact.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{contact.phoneNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                          {contact.waId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.labels?.length > 0 ? (
                            contact.labels.map(l => (
                              <span key={l} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                {l}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                              Unlabeled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-bold uppercase">
                        {format(new Date(contact.createdAt), 'MMM dd')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingContact({...contact});
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                               if (confirm('Delete this contact?')) deleteContact(contact.id);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                      <div className="mb-4 flex justify-center opacity-20">
                        <User size={48} />
                      </div>
                      <p className="text-lg font-black text-gray-900">No contacts here</p>
                      <p className="font-medium">Try changing your search or group filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase">
              Page <span className="text-gray-900">{page}</span>
            </p>
            <div className="flex items-center space-x-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={contacts.length < 10}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Create Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">New Phone Book</h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Group Name</label>
                <input 
                  type="text" 
                  className="input h-12 text-sm" 
                  placeholder="e.g. VIP Customers" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                <textarea 
                  className="input h-24! p-4 text-sm resize-none" 
                  placeholder="Notes for this group..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={handleCreateGroup}
              className="btn-primary w-full h-12 rounded-2xl"
            >
              Create Group
            </button>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {isEditModalOpen && editingContact && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Edit Contact</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  className="input h-12 text-sm" 
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 mr-1">Labels (Comma separated)</label>
                <div className="relative">
                   <Tags className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input 
                    type="text" 
                    className="input h-12 pl-12 text-sm" 
                    value={editingContact.labels.join(', ')}
                    onChange={(e) => setEditingContact({...editingContact, labels: e.target.value.split(',').map(l => l.trim()).filter(l => l)})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 h-12 font-bold text-gray-500">Cancel</button>
              <button onClick={handleUpdateContact} className="flex-2 btn-primary h-12 rounded-2xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Bulk Import</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Select Target Group</label>
                  <select 
                    className="input h-12 px-4 text-sm font-bold bg-gray-50 border-transparent"
                    value={importGroupId}
                    onChange={(e) => setImportGroupId(e.target.value)}
                  >
                    <option value="">None (Bulk List)</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
               </div>

               <div className="pt-4">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv" 
                    onChange={handleCSVUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-44 border-2 border-dashed border-primary/20 bg-gray-50 hover:bg-primary/5 rounded-[30px] flex flex-col items-center justify-center transition-all group"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={28} />
                    </div>
                    <p className="font-black text-gray-900 uppercase tracking-tight">Choose CSV File</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Must have 'Phone' column</p>
                  </button>
               </div>

               {/* Download Sample */}
               <div className="pt-2 border-t border-gray-100">
                  <button 
                    onClick={downloadSampleCSV}
                    className="w-full flex items-center justify-center space-x-2 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-all"
                  >
                    <Download size={18} />
                    <span>Download Sample CSV Template</span>
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Columns: Name, Country_Code, Phone_Number, Email, Company, City, Tags
                  </p>
                  <p className="text-[10px] text-gray-500 text-center mt-1 font-medium">
                    Country code and phone number can be separate or combined
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
