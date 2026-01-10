import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore } from '../../store/useFlowStore';
import {
  MessageSquare,
  Clock,
  GitBranch,
  Globe,
  UserPlus,
  Trash2,
  MousePointer2,
  Play,
  Save,
  Plus,
  ShoppingBag,
  Activity,
  Database,
  ImageIcon,
  Video as VideoIcon,
  FileText,
  MousePointerClick,
  List,
  Copy,
  Settings,
  Repeat,
  FileSpreadsheet,
  CheckCircle,
  ShoppingCart,
  Key,
  UserCog,
  Share2,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelRight,
  Zap,
  Upload,
  Search
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom Node: Button with dynamic output handles based on configured buttons
const ButtonNode = ({ data }: any) => {
  // Get configured buttons (up to 3)
  const buttons = [
    { title: data.btn0Title, id: data.btn0Id || 'btn_1' },
    { title: data.btn1Title, id: data.btn1Id || 'btn_2' },
    { title: data.btn2Title, id: data.btn2Id || 'btn_3' },
  ].filter(btn => btn.title);
  
  const handleColors = ['#06b6d4', '#8b5cf6', '#f59e0b'];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-400 p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
          <MousePointerClick size={16} className="text-white" />
        </div>
        <span className="font-bold text-sm text-gray-800">{data.label || 'Button Node'}</span>
        {data.variable && (
          <div className="ml-auto bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full text-[8px] font-black border border-cyan-200 flex items-center gap-1">
            <Database size={8} /> {data.variable}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {buttons.map((btn, idx) => (
          <div key={idx} className="relative flex items-center gap-2 border border-gray-100 rounded-lg p-2 bg-gray-50">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: handleColors[idx] }}>
              {idx + 1}
            </div>
            <span className="text-xs truncate flex-1">{btn.title}</span>
            <span className="text-[8px] font-mono text-gray-400 bg-white px-1 rounded">{btn.id}</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`btn${idx}`}
              style={{ right: -8, top: '50%', transform: 'translateY(-50%)', background: handleColors[idx] }}
            />
          </div>
        ))}
        {buttons.length === 0 && (
          <div className="text-xs text-gray-400 italic p-2">Configure buttons in sidebar</div>
        )}
      </div>
      {(buttons.length > 0) && (
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Any Selection</span>
          <Handle 
            type="source" 
            position={Position.Right} 
            id={undefined} 
            style={{ bottom: 12, top: 'auto', background: '#94a3b8', width: 10, height: 10, right: -10 }} 
          />
        </div>
      )}
    </div>
  );
};

// Custom Node: Condition with true/false handles
const ConditionNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-400 p-4 min-w-[180px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
        <GitBranch size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Condition'}</span>
    </div>
    <div className="text-[10px] text-gray-500 mb-2">
      {data.field} {data.operator} "{data.value}"
    </div>
    <div className="flex justify-between text-[9px] font-bold mt-3">
      <span className="text-green-600">✓ True</span>
      <span className="text-red-600">✗ False</span>
    </div>
    <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%', background: '#22c55e' }} />
    <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%', background: '#ef4444' }} />
  </div>
);

// Custom Node: Media Forward - Upload media to external API (OCR, storage, etc.)
const MediaForwardNode = ({ data }: any) => {
  const mappings = data.mapping || [];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-400 p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
          <Upload size={16} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-800 tracking-tight">{data.label || 'Media Forward'}</span>
          <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest leading-none">OCR / UPLOAD</span>
        </div>
      </div>
      
      <div className="text-[10px] text-gray-400 font-mono truncate mb-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
        {data.url || 'https://api.example.com/upload...'}
      </div>
      
      <div className="text-[9px] text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 mb-2">
        📄 Uses: <span className="font-mono font-bold">{`{{${data.mediaIdVariable || 'document_id'}}}`}</span>
      </div>

      {mappings.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {mappings.slice(0, 3).map((m: any, idx: number) => (
            <div key={idx} className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100/50">
               <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
               <span className="truncate max-w-[60px]">{m.path}</span>
               <span className="text-purple-500">→</span>
               <span className="text-gray-800 font-mono"> {"{{"} {m.variable} {"}}"} </span>
            </div>
          ))}
          {mappings.length > 3 && <div className="text-[8px] text-gray-400 italic ml-2">+ {mappings.length - 3} more</div>}
        </div>
      )}

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
        <div className="flex flex-col items-start gap-1">
           <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">SUCCESS</span>
           <Handle type="source" position={Position.Bottom} id="success" className="bg-green-500!" style={{ left: '20%' }} />
        </div>
        <div className="flex flex-col items-end gap-1">
           <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">FAIL</span>
           <Handle type="source" position={Position.Bottom} id="fail" className="bg-red-500!" style={{ left: '80%' }} />
        </div>
      </div>
    </div>
  );
};

// Custom Node: API with success/fail handles
const ApiNode = ({ data }: any) => {
  const mappings = data.mapping || [];
  const routes = data.routes || [];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-400 p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-sm">
          <Globe size={16} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-800 tracking-tight">{data.label || 'HTTP Request'}</span>
          <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest leading-none">{data.method || 'GET'}</span>
        </div>
      </div>
      
      <div className="text-[10px] text-gray-400 font-mono truncate mb-3 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
        {data.url || 'https://api.example.com/...'}
      </div>

      {(mappings.length > 0 || routes.length > 0) && (
        <div className="space-y-1.5 mb-2">
          {mappings.slice(0, 3).map((m: any, idx: number) => (
            <div key={idx} className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100/50">
               <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
               <span className="truncate max-w-[60px]">{m.path}</span>
               <span className="text-teal-500">→</span>
               <span className="text-gray-800 font-mono"> {"{{"} {m.variable} {"}}"} </span>
            </div>
          ))}
          {mappings.length > 3 && <div className="text-[8px] text-gray-400 italic ml-2">+ {mappings.length - 3} more savings</div>}
          
          {routes.map((route: any, idx: number) => (
             <div key={idx} className="flex items-center justify-end gap-1.5 relative h-6">
                <span className="text-[9px] font-bold text-rose-500 whitespace-nowrap">{route.operator || '=='} "{route.value}"</span>
                <Handle 
                  type="source" 
                  position={Position.Right} 
                  id={route.id} 
                  className="bg-rose-500!"
                  style={{ top: '50%', right: '-16px' }} 
                />
             </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
        <div className="flex flex-col items-start gap-1">
           <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">SUCCESS</span>
           <Handle type="source" position={Position.Bottom} id="success" className="bg-green-500!" style={{ left: '20%' }} />
        </div>
        <div className="flex flex-col items-end gap-1">
           <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">FAIL</span>
           <Handle type="source" position={Position.Bottom} id="fail" className="bg-red-500!" style={{ left: '80%' }} />
        </div>
      </div>
    </div>
  );
};

const SqlNode = ({ data }: any) => {
  const mappings = data.mapping || [];
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-400 p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
          <Database size={16} className="text-white" />
        </div>
        <span className="font-bold text-sm text-gray-800">{data.label || 'SQL Query'}</span>
      </div>
      <div className="text-[10px] text-gray-400 font-mono line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-100 mb-3 italic">
        {data.query || 'SELECT ...'}
      </div>

      {mappings.length > 0 && (
        <div className="space-y-1 mb-3">
           {mappings.slice(0, 3).map((m: any, idx: number) => (
            <div key={idx} className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100/50">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
               <span className="truncate max-w-[60px]">{m.path}</span>
               <span className="text-emerald-500">→</span>
               <span className="text-gray-800 font-mono"> {"{{"} {m.variable} {"}}"} </span>
            </div>
          ))}
          {mappings.length > 3 && <div className="text-[8px] text-gray-400 italic ml-2">+ {mappings.length - 3} more</div>}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
        <div className="flex flex-col items-start gap-1">
           <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">SUCCESS</span>
           <Handle type="source" position={Position.Bottom} id="success" className="bg-green-500!" style={{ left: '20%' }} />
        </div>
        <div className="flex flex-col items-end gap-1">
           <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">FAIL</span>
           <Handle type="source" position={Position.Bottom} id="fail" className="bg-red-500!" style={{ left: '80%' }} />
        </div>
      </div>
    </div>
  );
};

const FlowNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-400 p-4 min-w-[180px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
        <Activity size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Meta Flow'}</span>
    </div>
    <div className="text-[10px] text-gray-500 font-mono truncate">
       ID: {data.flowId || '...'}
    </div>
    <div className="text-[10px] text-gray-500 mt-1 line-clamp-1 italic">
       "{data.body || 'Please fill the form...'}"
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-yellow-400!" />
  </div>
);

// Custom Node: List with dynamic handles and section headers
const ListNode = ({ data }: any) => {
  const sections = data.sections || [];
  const handleColors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];
  
  // If no sections, show flat items with auto-generated IDs
  const items = data.items || [];
  const hasSection = sections.length > 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-400 p-3 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
            <List size={12} className="text-white" />
        </div>
        <span className="font-bold text-xs text-gray-800">{data.label || 'List Menu'}</span>
        {data.variable && (
          <div className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[8px] font-black border border-indigo-200 flex items-center gap-1">
            <Database size={8} /> {data.variable}
          </div>
        )}
        {(hasSection ? sections.flatMap((s: any) => s.rows || []).length : items.length) > 0 && (
          <span className="ml-auto text-[8px] font-bold bg-indigo-100 text-indigo-600 px-1 rounded">
            {hasSection ? sections.flatMap((s: any) => s.rows || []).length : items.length}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {hasSection ? (
          // Render with sections
          sections.map((section: any, sIdx: number) => (
            <div key={sIdx} className="space-y-1">
              <div className="text-[9px] font-black text-indigo-600 uppercase">
                📁 {section.title || `Section ${sIdx + 1}`}
              </div>
              {(section.rows || []).map((row: any, rIdx: number) => {
                const rowId = row.id || `list_${sIdx}_${rIdx + 1}`;
                const globalIdx = sections.slice(0, sIdx).flatMap((s: any) => s.rows || []).length + rIdx;
                return (
                  <div key={rIdx} className="relative flex items-center gap-1 border border-gray-100 rounded p-1.5 bg-gray-50 ml-1 pr-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: handleColors[globalIdx % handleColors.length] }}>
                      {globalIdx + 1}
                    </div>
                    <span className="text-[10px] truncate max-w-[80px]">{row.title}</span>
                    <Handle 
                      type="source" 
                      position={Position.Right} 
                      id={rowId}
                      style={{ right: -6, background: handleColors[globalIdx % handleColors.length], width: 8, height: 8 }}
                    />
                  </div>
                );
              })}
            </div>
          ))
        ) : items.length > 0 ? (
          // Render flat items with auto-generated IDs
          items.map((item: any, idx: number) => {
            const itemId = item.id || `list_${idx + 1}`;
            return (
              <div key={idx} className="relative flex items-center gap-1 border border-gray-100 rounded p-1.5 bg-gray-50 pr-3">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: handleColors[idx % handleColors.length] }}>
                  {idx + 1}
                </div>
                <span className="text-[10px] truncate max-w-[80px]">{item.title}</span>
                <Handle 
                  type="source" 
                  position={Position.Right} 
                  id={itemId}
                  style={{ right: -6, background: handleColors[idx % handleColors.length], width: 8, height: 8 }}
                />
              </div>
            );
          })
        ) : (
          <div className="text-[9px] text-gray-400 italic p-1">Add items in sidebar</div>
        )}
      </div>
      {((hasSection ? sections.flatMap((s: any) => s.rows || []).length : items.length) > 0) && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
           <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Any Selection</span>
           <Handle 
             type="source" 
             position={Position.Right} 
             id={undefined} 
             style={{ bottom: 10, top: 'auto', background: '#94a3b8', width: 8, height: 8, right: -8 }} 
           />
        </div>
      )}
    </div>
  );
};



const LoopNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-400 p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-3">
         <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
             <Repeat size={16} className="text-white" />
         </div>
         <span className="font-bold text-sm text-gray-800">{data.label || 'Loop Array'}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2">
         Iterate: <span className="font-mono bg-gray-100 px-1 rounded">{data.arrayVariable || '[]'}</span>
      </div>
      <div className="flex flex-col gap-4 mt-2">
        <div className="relative h-6">
           <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-600 uppercase">Loop Item</span>
           <Handle type="source" position={Position.Right} id="loop" className="bg-orange-500!" style={{top: '50%'}} />
        </div>
        <div className="relative h-6">
           <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Done</span>
           <Handle type="source" position={Position.Right} id="done" className="bg-gray-400!" style={{top: '50%'}} />
        </div>
      </div>
    </div>
  );
};

const SessionConfigNode = ({ data }: any) => {
  return (
     <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-400 p-4 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-3">
         <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
             <Settings size={16} className="text-white" />
         </div>
         <span className="font-bold text-sm text-gray-800">Session Config</span>
      </div>
      <div className="text-xs text-slate-500">
         Timeout: {data.timeout ? `${data.timeout}h` : 'Default'}
      </div>
      <Handle type="source" position={Position.Bottom} className="bg-slate-400!" />
     </div>
  );
};



const SetVariableNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-400 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
         <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
             <Database size={16} className="text-white" />
         </div>
         <span className="font-bold text-sm text-gray-800">{data.label || 'Set Variable'}</span>
    </div>
    <div className="text-xs text-gray-500">
         Set <span className="font-mono bg-gray-100 px-1 rounded">{data.variableName || 'var'}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-gray-400!" />
  </div>
);

const ListVariableNode = ({ data }: any) => {
  const items = (data.items || '').split('\n').filter((s: string) => s.trim().length > 0);
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-violet-400 p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-3">
           <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
               <Database size={16} className="text-white" />
           </div>
           <div>
               <span className="font-bold text-sm text-gray-800">{data.label || 'List Variable'}</span>
               <div className="text-[9px] text-violet-600 font-bold uppercase tracking-wider">List Source</div>
           </div>
      </div>
      <div className="text-xs text-gray-500 flex items-center justify-between">
           <span>Var: <span className="font-mono bg-gray-100 px-1 rounded">{data.variableName || 'list_var'}</span></span>
           <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{items.length} items</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="bg-gray-400!" />
    </div>
  );
};

const UpdateContactNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-500 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
         <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
             <UserCog size={16} className="text-white" />
         </div>
         <div>
            <span className="font-bold text-sm text-gray-800">{data.label || 'Update Contact'}</span>
            <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Profile Sync</div>
         </div>
    </div>
    <div className="space-y-1">
        {data.contactName && <div className="text-[10px] text-gray-400">👤 Set Name</div>}
        {data.contactEmail && <div className="text-[10px] text-gray-400">📧 Set Email</div>}
        {data.contactTags && <div className="text-[10px] text-gray-400">🏷️ Add Tags</div>}
        {!data.contactName && !data.contactEmail && !data.contactTags && (
            <div className="text-[10px] text-gray-400 italic">No updates configured</div>
        )}
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-gray-400!" />
  </div>
);

const SendExternalNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-500 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
         <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
             <Share2 size={16} className="text-white" />
         </div>
         <div>
            <span className="font-bold text-sm text-gray-800">{data.label || 'Send to External'}</span>
            <div className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Third-Party Notify</div>
         </div>
    </div>
    <div className="space-y-1">
        <div className="text-[10px] text-gray-500">
            To: <span className="font-mono bg-amber-50 px-1 rounded text-amber-700">{data.to || 'No Number'}</span>
        </div>
        <div className="text-[10px] text-gray-400 line-clamp-2 italic">
            "{data.message || 'No message content'}"
        </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-gray-400!" />
  </div>
);

const MapNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-400 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
         <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
             <Copy size={16} className="text-white" />
         </div>
         <span className="font-bold text-sm text-gray-800">{data.label || 'Map Array'}</span>
    </div>
    <div className="text-[10px] text-gray-500">
      Map: <span className="font-mono bg-gray-100 px-1 rounded">{data.sourceArray || 'items'}</span>
    </div>
    <div className="text-[10px] text-gray-500 mt-1">
      To: <span className="font-mono bg-gray-100 px-1 rounded">{data.outputVariable || 'mapped_result'}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-emerald-400!" />
  </div>
);

const GoogleSheetsNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-green-500 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
         <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
             <FileSpreadsheet size={16} className="text-white" />
         </div>
         <span className="font-bold text-sm text-gray-800">{data.label || 'Google Sheet'}</span>
    </div>
    <div className="text-xs text-gray-500">
         Sends Data to Sheet
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-gray-400!" />
  </div>
);

// Custom Node: Google Sheet Query - Dynamic search with multiple match conditions
const GoogleSheetQueryNode = ({ data }: any) => {
  const matchConditions = data.matchConditions || [];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-500 p-4 min-w-[220px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
          <Search size={16} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-sm text-gray-800">{data.label || 'Sheet Query'}</span>
          <div className="text-[9px] text-teal-600 font-bold uppercase tracking-wider">
            {matchConditions.length || 0} Match {matchConditions.length === 1 ? 'Condition' : 'Conditions'}
          </div>
        </div>
      </div>
      
      <div className="space-y-1.5 text-[10px] mb-3">
        {matchConditions.length > 0 ? (
          matchConditions.slice(0, 3).map((cond: any, idx: number) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-gray-400">🔍</span>
              <span className="font-mono bg-blue-50 text-blue-600 px-1 rounded truncate max-w-[60px]">{cond.variable || 'var'}</span>
              <span className="text-gray-300">→</span>
              <span className="font-mono bg-gray-100 text-gray-600 px-1 rounded">{cond.column || 'Col'}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic">No conditions set</div>
        )}
        {matchConditions.length > 3 && (
          <div className="text-[8px] text-gray-400 italic">+ {matchConditions.length - 3} more</div>
        )}
        
        {data.outputColumns && (
          <div className="flex items-center gap-1 pt-1 border-t border-gray-50">
            <span className="text-gray-400">📤 Output:</span>
            <span className="font-mono bg-green-50 text-green-600 px-1 rounded truncate max-w-[100px]">{data.outputColumns}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-[9px] font-bold mt-3 pt-2 border-t border-gray-100">
        <span className="text-green-600">✓ Found</span>
        <span className="text-red-600">✗ Not Found</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="success" style={{ left: '30%', background: '#22c55e', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} id="fail" style={{ left: '70%', background: '#ef4444', width: 8, height: 8 }} />
    </div>
  );
};


// Custom Node: Message
const MessageNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-400 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
        <MessageSquare size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Message'}</span>
    </div>
    <div className="text-[10px] text-gray-500 line-clamp-2 italic">
      "{data.message || 'Your message text...'}"
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-blue-400!" />
  </div>
);

// Custom Node: Image
const ImageNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-400 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
        <ImageIcon size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Send Image'}</span>
    </div>
    <div className="text-[10px] text-gray-500 font-mono truncate">
      {data.mediaUrl || 'No URL set'}
    </div>
    {data.caption && <div className="text-[10px] text-gray-400 mt-1 italic line-clamp-1">"{data.caption}"</div>}
    <Handle type="source" position={Position.Bottom} className="bg-indigo-400!" />
  </div>
);

// Custom Node: Video
const VideoNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-400 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
        <VideoIcon size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Send Video'}</span>
    </div>
    <div className="text-[10px] text-gray-500 font-mono truncate">
      {data.mediaUrl || 'No URL set'}
    </div>
    {data.caption && <div className="text-[10px] text-gray-400 mt-1 italic line-clamp-1">"{data.caption}"</div>}
    <Handle type="source" position={Position.Bottom} className="bg-purple-400!" />
  </div>
);

// Custom Node: Document
const DocumentNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-500 p-4 min-w-[200px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
        <FileText size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Send Document'}</span>
    </div>
    <div className="text-[10px] text-gray-500 font-mono truncate">
      {data.mediaUrl || 'No URL set'}
    </div>
    {data.caption && <div className="text-[10px] text-gray-400 mt-1 italic line-clamp-1">"{data.caption}"</div>}
    <Handle type="source" position={Position.Bottom} className="bg-gray-500!" />
  </div>
);

// Custom Node: Delay
const DelayNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-400 p-4 min-w-[160px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
        <Clock size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Delay'}</span>
    </div>
    <div className="text-xs text-gray-500 font-mono">
      Wait {data.delay || '3'} seconds
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-amber-400!" />
  </div>
);

// Custom Node: Wait for Input
const WaitNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-400 p-4 min-w-[180px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
        <Clock size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Wait for Input'}</span>
    </div>
    <div className="text-[10px] text-gray-500">
      Save to: <span className="font-mono bg-gray-100 px-1 rounded">{data.variableName || 'user_response'}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-orange-400!" />
  </div>
);

// Custom Node: Hand-off to Agent
const AgentNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-red-400 p-4 min-w-[180px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
        <UserPlus size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Hand-off'}</span>
    </div>
    <div className="text-[10px] text-gray-500">
      Transfer to human agent
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-red-400!" />
  </div>
);

// Custom Node: Catalogue
const CatalogueNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-pink-400 p-4 min-w-[180px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
        <ShoppingBag size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Catalogue'}</span>
    </div>
    <div className="text-[10px] text-gray-500">
      Show product catalogue
    </div>
    <Handle type="source" position={Position.Bottom} className="bg-pink-400!" />
  </div>
);

// Custom Node: Google Drive Image Lookup
// Takes a variable value (e.g. "plywood"), searches for matching folder, returns images
const DriveImageLookupNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 p-4 min-w-[220px]">
    <Handle type="target" position={Position.Top} className="bg-gray-400!" />
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
        <ImageIcon size={16} className="text-white" />
      </div>
      <span className="font-bold text-sm text-gray-800">{data.label || 'Drive Image Lookup'}</span>
    </div>
    <div className="space-y-1 text-[10px]">
      <div className="flex items-center gap-1">
        <span className="text-gray-400">Search:</span>
        <span className="font-mono bg-blue-50 text-blue-600 px-1 rounded">{data.searchVariable || 'user_input'}</span>
        <span className="text-[8px] bg-gray-100 text-gray-500 px-1 rounded uppercase">in {data.searchMode || 'folder'}s</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-gray-400">Parent:</span>
        <span className="font-mono bg-gray-100 text-gray-600 px-1 rounded truncate max-w-[100px]">{data.parentFolderId || 'Not set'}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-gray-400">Output:</span>
        <span className="font-mono bg-green-50 text-green-600 px-1 rounded">{data.outputVariable || 'image_urls'}</span>
      </div>
      {data.sendAutomatically && (
        <div className="flex items-center gap-1 mt-1">
          <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1">
            🚀 Direct Send: ON
          </span>
        </div>
      )}
    </div>

    <div className="flex justify-between text-[9px] font-bold mt-3">
      <span className="text-green-600">✓ Found</span>
      <span className="text-red-600">✗ Not Found</span>
    </div>
    <Handle type="source" position={Position.Bottom} id="found" style={{ left: '30%', background: '#22c55e' }} />
    <Handle type="source" position={Position.Bottom} id="not_found" style={{ left: '70%', background: '#ef4444' }} />
  </div>
);

// Custom Node: Validator (Email, Phone, Image, PDF, PAN)
const ValidatorNode = ({ data }: any) => {
  const validatorTypes: Record<string, { icon: string; color: string; label: string }> = {
    email: { icon: '📧', color: '#3b82f6', label: 'Email' },
    phone: { icon: '📱', color: '#22c55e', label: 'Phone' },
    image: { icon: '🖼️', color: '#8b5cf6', label: 'Image' },
    pdf: { icon: '📄', color: '#ef4444', label: 'PDF' },
    pan: { icon: '🪪', color: '#f59e0b', label: 'PAN Number' },
    aadhar: { icon: '🆔', color: '#06b6d4', label: 'Aadhar' },
    gst: { icon: '🏢', color: '#10b981', label: 'GST Number' },
    pincode: { icon: '📍', color: '#ec4899', label: 'PIN Code' },
  };
  
  const type = data.validationType || 'email';
  const config = validatorTypes[type] || validatorTypes.email;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 p-3 min-w-[180px]" style={{ borderColor: config.color }}>
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: config.color + '20' }}>
          {config.icon}
        </div>
        <div>
          <span className="font-bold text-xs text-gray-800">{data.label || `${config.label} Validator`}</span>
          <div className="text-[9px] font-mono text-gray-400">{type.toUpperCase()}</div>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 mb-2">
        Input: <span className="font-mono bg-gray-100 px-1 rounded">{data.inputVariable || 'user_input'}</span>
      </div>
      <div className="flex justify-between text-[9px] font-bold">
        <span className="text-green-600">✓ Valid</span>
        <span className="text-red-600">✗ Invalid</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="valid" style={{ left: '30%', background: '#22c55e', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} id="invalid" style={{ left: '70%', background: '#ef4444', width: 8, height: 8 }} />
    </div>
  );
};

// Custom Node: Phone Parser - Identifies country from WhatsApp sender number
const PhoneParserNode = ({ data }: any) => {
  const commonCountries = [
    { code: '91', name: 'India', flag: '🇮🇳' },
    { code: '1', name: 'USA/Canada', flag: '🇺🇸' },
    { code: '44', name: 'UK', flag: '🇬🇧' },
    { code: '971', name: 'UAE', flag: '🇦🇪' },
    { code: '966', name: 'Saudi', flag: '🇸🇦' },
    { code: '65', name: 'Singapore', flag: '🇸🇬' },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-sky-400 p-3 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center text-base">
          🌍
        </div>
        <div>
          <span className="font-bold text-xs text-gray-800">{data.label || 'Phone Parser'}</span>
          <div className="text-[9px] text-gray-400">Country Detector</div>
        </div>
      </div>
      <div className="space-y-1 text-[9px]">
        <div className="flex items-center justify-between bg-sky-50 rounded px-2 py-1">
          <span className="text-sky-600">From sender's WhatsApp number</span>
        </div>
        <div className="text-gray-400">
          Outputs: <span className="font-mono">country_code</span>, <span className="font-mono">country_name</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {commonCountries.slice(0, 3).map((c, idx) => (
          <div key={idx} className="relative">
            <span className="text-[8px] bg-gray-100 rounded px-1">{c.flag}</span>
            <Handle 
              type="source" 
              position={Position.Bottom} 
              id={`country_${c.code}`}
              style={{ left: 8 + idx * 20, background: '#0ea5e9', width: 6, height: 6 }}
            />
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} id="default" style={{ left: '80%', background: '#94a3b8', width: 8, height: 8 }} />
    </div>
  );
};

// Custom Node: Business Hours - Routing based on time/day
const BusinessHoursNode = ({ data }: any) => {
  const timezone = data.timezone || 'Asia/Kolkata (IST)';
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-400 p-3 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-base">
          🕒
        </div>
        <div>
          <span className="font-bold text-xs text-gray-800">{data.label || 'Business Hours'}</span>
          <div className="text-[9px] text-gray-400">{timezone}</div>
        </div>
      </div>
      <div className="space-y-1 text-[9px]">
        <div className="flex items-center justify-between bg-amber-50 rounded px-2 py-1 border border-amber-100">
          <span className="text-amber-600 font-bold">Time-based Routing</span>
        </div>
        <p className="text-gray-400 italic">Routes flow based on your business schedule.</p>
      </div>
      <div className="flex justify-between text-[9px] font-bold mt-3">
        <span className="text-green-600 flex items-center gap-1">🟢 Open</span>
        <span className="text-red-600 flex items-center gap-1">🔴 Closed</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="open" style={{ left: '30%', background: '#22c55e', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} id="closed" style={{ left: '70%', background: '#ef4444', width: 8, height: 8 }} />
    </div>
  );
};

// Custom Node: Shopify Integration
const ShopifyNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-400 p-3 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-base">
          🛍️
        </div>
        <div>
          <span className="font-bold text-xs text-gray-800">{data.label || 'Shopify Order'}</span>
          <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">E-Commerce</div>
        </div>
      </div>
      <div className="space-y-1 text-[9px] mb-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
        <div className="flex justify-between">
          <span className="text-gray-500">Shop:</span>
          <span className="font-mono text-emerald-700 truncate max-w-[80px]">{data.shopDomain || 'myshop.myshopify.com'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Order Variable:</span>
          <span className="font-mono text-emerald-700">{data.orderVariable || 'order_id'}</span>
        </div>
      </div>
      <div className="flex justify-between text-[9px] font-bold">
        <span className="text-green-600">✓ Found</span>
        <span className="text-red-600">✗ Not Found</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="success" style={{ left: '30%', background: '#22c55e', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} id="fail" style={{ left: '70%', background: '#ef4444', width: 8, height: 8 }} />
    </div>
  );
};

// Custom Node: WooCommerce Integration
const WooCommerceNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-400 p-3 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-base">
          🛒
        </div>
        <div>
          <span className="font-bold text-xs text-gray-800">{data.label || 'WooCommerce Order'}</span>
          <div className="text-[9px] text-purple-600 font-bold uppercase tracking-wider">E-Commerce</div>
        </div>
      </div>
      <div className="space-y-1 text-[9px] mb-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex justify-between">
          <span className="text-gray-500">URL:</span>
          <span className="font-mono text-purple-700 truncate max-w-[80px]">{data.storeUrl || 'myshop.com'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Search:</span>
          <span className="font-mono text-purple-700">{data.orderVariable || 'order_id'}</span>
        </div>
      </div>
      <div className="flex justify-between text-[9px] font-bold">
        <span className="text-green-600">✓ Success</span>
        <span className="text-red-600">✗ Error</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="success" style={{ left: '30%', background: '#22c55e', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} id="fail" style={{ left: '70%', background: '#ef4444', width: 8, height: 8 }} />
    </div>
  );
};

// Custom Node: Keyword Match - Match multiple keywords/phrases to trigger specific flows
const KeywordMatchNode = ({ data }: any) => {
  const keywords = data.keywords || [];
  const handleColors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-sky-400 p-3 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
          <Key size={16} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-sm text-gray-800">{data.label || 'Keyword Match'}</span>
          <div className="text-[9px] text-gray-400 font-mono">Dynamic Routing</div>
        </div>
      </div>
      <div className="space-y-1 mt-2">
        {keywords.map((kw: any, idx: number) => (
          <div key={idx} className="relative flex items-center gap-2 border border-gray-100 rounded-lg p-2 bg-gray-50">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: handleColors[idx % handleColors.length] }}>
              {idx + 1}
            </div>
            <span className="text-[10px] truncate flex-1 font-medium">{kw.keyword}</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={kw.id || `kw_${idx}`}
              style={{ right: -6, top: '50%', transform: 'translateY(-50%)', background: handleColors[idx % handleColors.length], width: 8, height: 8 }}
            />
          </div>
        ))}
        {keywords.length === 0 && (
          <div className="text-[10px] text-gray-400 italic p-2 text-center border border-dashed border-gray-100 rounded-lg">
            No keywords configured
          </div>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
         <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Default Path</span>
         <Handle 
           type="source" 
           position={Position.Right} 
           id="default" 
           style={{ bottom: 12, top: 'auto', background: '#94a3b8', width: 10, height: 10, right: -10 }} 
         />
      </div>
    </div>
  );
};

const RouterNode = ({ data }: any) => {
  const routes = data.routes || [];
  const handleColors = ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-rose-400 p-3 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
          <GitBranch size={16} className="text-white rotate-90" />
        </div>
        <div>
          <span className="font-bold text-sm text-gray-800">{data.label || 'Condition Router'}</span>
          <div className="text-[9px] text-gray-400 font-mono italic">Switching "{data.variable || 'variable'}"</div>
        </div>
      </div>
      <div className="space-y-1 mt-2">
        {routes.map((route: any, idx: number) => (
          <div key={idx} className="relative flex items-center gap-2 border border-gray-100 rounded-lg p-2 bg-gray-50">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: handleColors[idx % handleColors.length] }}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-1">
              <span className="text-[10px] font-bold text-rose-500 whitespace-nowrap">{route.operator || '=='}</span>
              <span className="text-[10px] truncate font-medium italic">"{route.value}"</span>
            </div>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={route.id || `route_${idx}`}
              style={{ right: -6, top: '50%', transform: 'translateY(-50%)', background: handleColors[idx % handleColors.length], width: 8, height: 8 }}
            />
          </div>
        ))}
        {routes.length === 0 && (
          <div className="text-[10px] text-gray-400 italic p-2 text-center border border-dashed border-gray-100 rounded-lg">
            No routes configured
          </div>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
         <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Default / Else</span>
         <Handle 
           type="source" 
           position={Position.Right} 
           id="default" 
           style={{ bottom: 12, top: 'auto', background: '#94a3b8', width: 10, height: 10, right: -10 }} 
         />
      </div>
    </div>
  );
};

// Custom Node: Group Image - Send multiple images from an array
const GroupImageNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-fuchsia-400 p-3 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="bg-gray-400!" />
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-fuchsia-500 rounded-lg flex items-center justify-center text-base">
          🖼️
        </div>
        <div>
          <span className="font-bold text-xs text-gray-800">{data.label || 'Group Images'}</span>
          <div className="text-[9px] text-fuchsia-600 font-bold uppercase tracking-wider">Multi-Send</div>
        </div>
      </div>
      <div className="space-y-1 text-[9px] mb-2 p-2 bg-fuchsia-50 rounded-lg border border-fuchsia-100 max-w-[180px]">
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-gray-500">Source:</span>
            {data.arrayVariable && (
              <span className="bg-fuchsia-500 text-white px-1 rounded-sm font-bold">
                {String(data.arrayVariable).split(/[,\n]/).filter(s => s.trim().startsWith('http')).length} imgs
              </span>
            )}
          </div>
          <span className="font-mono bg-fuchsia-200 text-fuchsia-700 px-1.5 py-0.5 rounded text-[8px] truncate block" title={data.arrayVariable || 'image_urls'}>
            {data.arrayVariable || 'image_urls'}
          </span>
        </div>
        {data.delayBetween && (
          <div className="text-[8px] text-fuchsia-600">⏱️ {data.delayBetween}s delay between images</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="bg-fuchsia-400!" />
    </div>
  );
};

// Custom Node: Start Trigger - Entry point for chatbot flows
const StartNode = ({ data }: any) => {
  const triggerMode = data.triggerMode || 'any'; // 'any' or 'keywords'
  const keywords = data.keywords || [];
  const handleColors = ['#22c55e', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899'];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-green-500 p-4 min-w-[220px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-sm text-gray-800">{data.label || 'Start Trigger'}</span>
          <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: triggerMode === 'any' ? '#22c55e' : '#0ea5e9' }}>
            {triggerMode === 'any' ? '🌐 ANY MESSAGE' : '🎯 KEYWORDS'}
          </div>
        </div>
      </div>
      
      {triggerMode === 'any' ? (
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-green-700">Triggers on ANY message</div>
              <div className="text-[9px] text-green-600">All incoming messages will start this flow</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {keywords.length > 0 ? (
            keywords.map((kw: any, idx: number) => (
              <div key={idx} className="relative flex items-center gap-2 border border-gray-100 rounded-lg p-2 bg-gray-50">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ background: handleColors[idx % handleColors.length] }}>
                  {idx + 1}
                </div>
                <span className="text-xs font-medium truncate flex-1">{kw}</span>
                <Handle 
                  type="source" 
                  position={Position.Right} 
                  id={`kw_${idx}`}
                  style={{ right: -8, top: '50%', transform: 'translateY(-50%)', background: handleColors[idx % handleColors.length], width: 8, height: 8 }}
                />
              </div>
            ))
          ) : (
            <div className="text-[10px] text-gray-400 italic p-3 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
              No keywords configured<br/>
              <span className="text-[9px]">Add keywords in the sidebar</span>
            </div>
          )}
        </div>
      )}
      
      {/* Default output handle */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
          {triggerMode === 'any' ? 'Continue' : 'Default Path'}
        </span>
        <Handle 
          type="source" 
          position={Position.Right} 
          id="default" 
          style={{ bottom: 12, top: 'auto', background: '#22c55e', width: 10, height: 10, right: -10 }} 
        />
      </div>
    </div>
  );
};

const ChatbotBuilder: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    saveFlow,
    loadFlow,
    fetchFlows,
    flowList,
    resetFlow,
    duplicateNode,
    testFlow,
    deleteFlow,
  } = useFlowStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Sidebar States
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  
  // Testing State
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message?: string} | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Current flow identifier
  const [flowId, setFlowId] = useState<string>(() => {
    return localStorage.getItem('chatbotFlowId') || '';
  });

  // State for new flow creation
  const [newFlowName, setNewFlowName] = useState('');

  // Search States
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [canvasSearchQuery, setCanvasSearchQuery] = useState('');
  const [showCanvasSearchResults, setShowCanvasSearchResults] = useState(false);


  // Fetch flows from backend on mount
  useEffect(() => {
    const init = async () => {
      await fetchFlows();
    };
    init();
  }, [fetchFlows]);

  // Set default flowId if empty and flowList loads
  useEffect(() => {
    if (!flowId && flowList.length > 0) {
      const firstId = flowList[0].id;
      setFlowId(firstId);
      localStorage.setItem('chatbotFlowId', firstId);
    }
  }, [flowId, flowList]);

  // Load selected flow when flowId changes
  useEffect(() => {
    if (flowId) {
      loadFlow(flowId).catch(err => console.error('Failed to load flow:', err));
    }
  }, [flowId, loadFlow]);

  // Handler to create a new flow
  const handleCreateNewFlow = async () => {
    if (!newFlowName.trim()) return;
    // Reset canvas to empty state
    resetFlow();
    // Save new flow to backend
    setIsSaving(true);
    const createdId = await saveFlow('new', newFlowName.trim());
    setIsSaving(false);
    if (createdId) {
      localStorage.setItem('chatbotFlowId', createdId);
      setFlowId(createdId);
    }
    setNewFlowName('');
  };

  // Handler to select a flow from dropdown
  const handleFlowSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    localStorage.setItem('chatbotFlowId', selected);
    setFlowId(selected);
  };

  // Handler to delete current flow
  const handleDeleteFlow = async () => {
    if (!flowId) return;
    setIsDeleting(true);
    const result = await deleteFlow(flowId);
    setIsDeleting(false);
    setShowDeleteModal(false);
    if (result.success) {
      // Switch to first available flow or clear
      if (flowList.length > 1) {
        const nextFlow = flowList.find(f => f.id !== flowId);
        if (nextFlow) {
          setFlowId(nextFlow.id);
          localStorage.setItem('chatbotFlowId', nextFlow.id);
        }
      } else {
        setFlowId('');
        localStorage.removeItem('chatbotFlowId');
      }
    } else {
      alert(result.message || 'Failed to delete flow');
    }
  };

  // Register custom node types
  const nodeTypes = useMemo(() => ({
    message: MessageNode,
    image: ImageNode,
    video: VideoNode,
    document: DocumentNode,
    button: ButtonNode,
    list: ListNode,
    condition: ConditionNode,
    loop: LoopNode,
    session_config: SessionConfigNode,
    variable: SetVariableNode,
    list_variable: ListVariableNode,
    update_contact: UpdateContactNode,
    send_external: SendExternalNode,
    map: MapNode,
    google_sheet: GoogleSheetsNode,
    google_sheet_query: GoogleSheetQueryNode,
    api: ApiNode,
    sql: SqlNode,
    flow: FlowNode,
    delay: DelayNode,
    wait: WaitNode,
    agent: AgentNode,
    catalogue: CatalogueNode,
    drive_image_lookup: DriveImageLookupNode,
    validator: ValidatorNode,
    phone_parser: PhoneParserNode,
    business_hours: BusinessHoursNode,
    shopify: ShopifyNode,
    woocommerce: WooCommerceNode,
    keyword_match: KeywordMatchNode,
    router: RouterNode,
    group_images: GroupImageNode,
    start_trigger: StartNode,
    media_forward: MediaForwardNode,
  }), []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;
      
      // Use ReactFlow's screenToFlowPosition to properly convert coordinates
      // This accounts for pan, zoom, and canvas position
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(type, position);
    },
    [addNode, reactFlowInstance]
  );

  const onNodeClick = (_: any, node: any) => {
    setSelectedNodeId(node.id);
    setRightSidebarOpen(true);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
    setRightSidebarOpen(false);
  };

  // Current flow name for display/editing
  const [flowName, setFlowName] = useState('');
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Update flow name/trigger when selected flow changes
  useEffect(() => {
    const current = flowList.find(f => f.id === flowId);
    if (current) {
      setFlowName(current.name);
      setTriggerKeyword(current.triggerKeyword || '');
      setIsDefault((current as any).isDefault || false);
    }
  }, [flowId, flowList]);

  // Restore selectedNode declaration
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleSaveFlow = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    if (!flowName.trim()) {
      alert('Please enter a flow name');
      setIsSaving(false);
      return;
    }
    try {
      // If saving a new/default flow, use the name state
      const savedId = await saveFlow(flowId || 'new', flowName.trim(), triggerKeyword, isDefault);
      
      if (savedId && savedId !== flowId) {
        localStorage.setItem('chatbotFlowId', savedId);
        setFlowId(savedId);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestFlow = async () => {
    if (!testPhoneNumber) return;
    setIsTesting(true);
    setTestResult(null);
    const result = await testFlow(flowId, testPhoneNumber);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleDuplicateNode = useCallback(() => {
    if (!selectedNodeId) return;
    const nodeFromStore = nodes.find(n => n.id === selectedNodeId);
    if (nodeFromStore) duplicateNode(nodeFromStore);
  }, [nodes, selectedNodeId, duplicateNode]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Bot Architect</h1>
          <p className="text-gray-500 font-medium text-sm">Design visual workflows for automated conversations</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Flow Selector */}
          <select
            value={flowId}
            onChange={handleFlowSelect}
            className="input h-10 text-sm min-w-[160px]"
          >
            {flowList.length === 0 && <option value="">No flows yet</option>}
            {flowList.map((flow: any) => (
              <option key={flow.id} value={flow.id}>
                {flow.name} {flow.isDefault ? '🌟' : ''}
              </option>
            ))}
          </select>
          {/* Delete Flow Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={!flowId || flowList.length === 0}
            className="btn-secondary h-10 px-3 text-red-500 hover:bg-red-50 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete this flow"
          >
            <Trash2 size={18} />
          </button>
          {/* Flow Name Edit */}
          <input
             type="text"
             placeholder="Flow Name"
             value={flowName}
             onChange={e => setFlowName(e.target.value)}
             className="input h-10 text-sm font-bold min-w-[200px]"
          />
          {/* Trigger Keyword */}
          <input
             type="text"
             placeholder="Trigger (e.g. HI)"
             value={triggerKeyword}
             onChange={e => setTriggerKeyword(e.target.value.toUpperCase())}
             className="input h-10 text-sm px-2 w-32 border-primary/30"
             title="Keyword to trigger this flow"
          />

          <div className="flex items-center gap-2 bg-gray-50 px-3 h-10 rounded-2xl border border-gray-100">
            <input 
                type="checkbox" 
                id="isDefaultFlow"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="isDefaultFlow" className="text-[10px] font-bold text-gray-500 uppercase cursor-pointer">
                Default
            </label>
          </div>
          
          {/* New Flow Input */}
          <div className="flex items-center space-x-1">
            <input
              type="text"
              placeholder="New flow name"
              value={newFlowName}
              onChange={e => setNewFlowName(e.target.value)}
              className="input h-10 text-sm w-32"
            />
            <button onClick={handleCreateNewFlow} disabled={isSaving} className="btn-secondary whitespace-nowrap">
              + New
            </button>
          </div>
          <button
            onClick={() => setShowTestModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Play size={18} className="text-green-500" />
            <span>Test Flow</span>
          </button>
          <button
            onClick={handleSaveFlow}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <span className="text-green-300">✓</span>
            ) : (
              <Save size={18} />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Test Flow Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTestModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-gray-900 mb-4">Test Your Flow</h2>
            <p className="text-sm text-gray-500 mb-4">Send a test message to trigger this flow. Make sure you've saved the flow first.</p>
            
            <div className="bg-gray-50 rounded-xl p-4 text-sm mb-4">
              <div className="font-mono text-gray-600 mb-2">
                Trigger keyword: <span className="text-primary font-bold">{triggerKeyword || 'WELCOME'}</span>
              </div>
              
              <div className="flex flex-col space-y-2 mt-4">
                <label className="text-xs font-bold text-gray-400 uppercase">Test Phone Number (e.g. 919876543210)</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="919876543210" 
                    className="input flex-1"
                    value={testPhoneNumber}
                    onChange={e => setTestPhoneNumber(e.target.value)}
                  />
                  <button 
                    onClick={handleTestFlow} 
                    disabled={isTesting || !testPhoneNumber}
                    className="btn-primary whitespace-nowrap"
                  >
                    {isTesting ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`mt-3 p-2 rounded text-xs ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {testResult.success ? '✅ Trigger Sent! Check your WhatsApp.' : `❌ Error: ${testResult.message}`}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowTestModal(false)}
              className="btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Flow Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Delete Flow</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm mb-6">
              <p className="text-red-700">
                Are you sure you want to delete <strong>"{flowName}"</strong>? 
                All nodes, connections, and associated session data will be permanently removed.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFlow}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                {isDeleting ? 'Deleting...' : 'Delete Flow'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex space-x-2 overflow-hidden relative">
        {/* Left Sidebar - Node Toolset */}
        <aside 
          className={cn(
            "transition-all duration-300 ease-in-out flex flex-col relative",
            leftSidebarOpen ? "w-80 mr-2" : "w-0 mr-0"
          )}
        >
          <div className={cn(
            "w-80 bg-white h-full rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col space-y-6 overflow-y-auto transition-opacity duration-300",
            leftSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Triggers & Actions</h3>
                  <div className="relative group">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search nodes..."
                      value={sidebarSearchQuery}
                      onChange={(e) => setSidebarSearchQuery(e.target.value)}
                      className="w-32 pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all transition-duration-300"
                    />
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-2">

                  {[
                     { type: 'start_trigger', label: 'Start Trigger', icon: Zap, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
                     { type: 'message', label: 'Message', icon: MessageSquare, color: 'bg-blue-500' },
                     { type: 'image', label: 'Image', icon: ImageIcon, color: 'bg-indigo-500' },
                     { type: 'video', label: 'Video', icon: VideoIcon, color: 'bg-purple-500' },
                     { type: 'document', label: 'Document', icon: FileText, color: 'bg-gray-700' },
                     { type: 'button', label: 'Buttons', icon: MousePointerClick, color: 'bg-cyan-500' },
                     { type: 'list', label: 'List Menu', icon: List, color: 'bg-indigo-600' },
                     { type: 'catalogue', label: 'Catalogue', icon: ShoppingBag, color: 'bg-pink-500' },
                     { type: 'flow', label: 'Meta Flow', icon: Activity, color: 'bg-yellow-500' },
                     { type: 'wait', label: 'Wait for Input', icon: Clock, color: 'bg-orange-500' },
                     { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-purple-600' },
                     { type: 'api', label: 'HTTP Request', icon: Globe, color: 'bg-teal-500' },
                     { type: 'media_forward', label: 'Media Forward', icon: Upload, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
                     { type: 'sql', label: 'SQL Query', icon: Database, color: 'bg-emerald-600' },
                     { type: 'delay', label: 'Delay', icon: Clock, color: 'bg-amber-600' },
                     { type: 'agent', label: 'Hand-off', icon: UserPlus, color: 'bg-red-500' },
                     { type: 'loop', label: 'Loop Array', icon: Repeat, color: 'bg-orange-600' },
                     { type: 'map', label: 'Map Array', icon: Copy, color: 'bg-emerald-500' },
                     { type: 'session_config', label: 'Session Config', icon: Settings, color: 'bg-slate-500' },
                     { type: 'variable', label: 'Response Saver', icon: Database, color: 'bg-indigo-700' },
                     { type: 'list_variable', label: 'List Variable', icon: Database, color: 'bg-violet-500' },
                     { type: 'update_contact', label: 'Update Contact', icon: UserCog, color: 'bg-emerald-500' },
                     { type: 'send_external', label: 'Send to External', icon: Share2, color: 'bg-amber-500' },
                     { type: 'google_sheet', label: 'Google Sheet', icon: FileSpreadsheet, color: 'bg-green-600' },
                     { type: 'google_sheet_query', label: 'Sheet Query', icon: Search, color: 'bg-teal-600' },
                     { type: 'drive_image_lookup', label: 'Drive Image Lookup', icon: ImageIcon, color: 'bg-linear-to-r from-blue-500 to-green-500' },
                     { type: 'validator', label: 'Validator', icon: CheckCircle, color: 'bg-emerald-500' },
                     { type: 'phone_parser', label: 'Phone Parser', icon: Globe, color: 'bg-sky-500' },
                     { type: 'business_hours', label: 'Business Hours', icon: Clock, color: 'bg-amber-500' },
                     { type: 'shopify', label: 'Shopify', icon: ShoppingBag, color: 'bg-emerald-600' },
                     { type: 'woocommerce', label: 'WooCommerce', icon: ShoppingCart, color: 'bg-purple-600' },
                     { type: 'keyword_match', label: 'Keyword Match', icon: Key, color: 'bg-sky-500' },
                     { type: 'router', label: 'Condition Router', icon: GitBranch, color: 'bg-rose-500' },
                     { type: 'group_images', label: 'Group Images', icon: ImageIcon, color: 'bg-fuchsia-500' },
                  ].filter(node => 
                    node.label.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
                    node.type.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
                  ).map((node) => (

                     <div
                       key={node.type}
                       className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-3 cursor-grab hover:bg-white hover:border-primary transition-all group active:cursor-grabbing"
                       onDragStart={(event) => {
                         event.dataTransfer.setData('application/reactflow', node.type);
                         event.dataTransfer.effectAllowed = 'move';
                       }}
                       draggable
                     >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm", node.color)}>
                           <node.icon size={16} />
                        </div>
                        <span className="font-bold text-gray-700 text-xs group-hover:text-primary">{node.label}</span>
                        <Plus size={14} className="ml-auto text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                  ))}
               </div>
            </div>
          </div>
        </aside>

        {/* Left Sidebar Toggle Button */}
        <div className="absolute top-1/2 -translate-y-1/2 left-[310px] z-50 flex flex-col space-y-2 pointer-events-none transition-all duration-300" style={{ left: leftSidebarOpen ? '310px' : '10px' }}>
           <button 
             onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
             className="p-2 bg-white shadow-xl border border-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all pointer-events-auto hover:scale-110 active:scale-95"
             title={leftSidebarOpen ? "Hide Tools" : "Show Tools"}
           >
              {leftSidebarOpen ? <ChevronLeft size={16} /> : <PanelLeft size={16} />}
           </button>
        </div>

        {/* Canvas Area */}
        <div 
          className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative"
          ref={reactFlowWrapper}
        >
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onInit={setReactFlowInstance}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.3}
              maxZoom={2}
              className="bg-gray-50/50"
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls className="bg-white border-gray-100 shadow-xl rounded-2xl bottom-6! left-6! overflow-hidden" />
              
              <Panel position="top-right" className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-xl flex items-center space-x-1">
                  <button 
                    onClick={handleDuplicateNode}
                    className="p-2 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-500 transition-colors"
                    title="Duplicate Node"
                  >
                     <Copy size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedNodeId) {
                        alert('Configure the selected node in the sidebar on the right');
                      } else {
                        alert('Select a node first to configure its settings');
                      }
                    }}
                    className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                    title="Node Settings"
                  >
                     <Settings size={18} />
                  </button>
                 <button 
                   onClick={() => {
                     if (!selectedNodeId) {
                       alert('Select a node first to delete it');
                       return;
                     }
                     if (window.confirm('Delete this node?')) {
                       onNodesChange([{ id: selectedNodeId, type: 'remove' }]);
                       setSelectedNodeId(null);
                     }
                   }}
                   className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                   title="Delete Node"
                 >
                    <Trash2 size={18} />
                 </button>
                  <div className="h-4 w-px bg-gray-100 mx-1" />

                  {/* Canvas Node Finder */}
                  <div className="relative group/search flex items-center pr-2">
                    <Search size={14} className="absolute left-3 text-gray-400 group-focus-within/search:text-primary transition-colors z-10" />
                    <input 
                      type="text"
                      placeholder="Find node on canvas..."
                      value={canvasSearchQuery}
                      onChange={(e) => {
                        setCanvasSearchQuery(e.target.value);
                        setShowCanvasSearchResults(true);
                      }}
                      onFocus={() => setShowCanvasSearchResults(true)}
                      className="w-48 pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-inner"
                    />
                    
                    {showCanvasSearchResults && canvasSearchQuery.length > 0 && (
                      <div className="absolute top-12 right-0 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-2 z-[999] max-h-60 overflow-y-auto">
                        <div className="flex items-center justify-between px-2 py-1 border-b border-gray-50 mb-1">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Search Results</span>
                          <button onClick={() => setShowCanvasSearchResults(false)} className="text-gray-300 hover:text-gray-600">
                             <Plus size={10} className="rotate-45" />
                          </button>
                        </div>
                        {nodes.filter(n => 
                            (n.data?.label || n.data?.body || n.type || '').toLowerCase().includes(canvasSearchQuery.toLowerCase())
                        ).length > 0 ? (
                          nodes.filter(n => 
                            (n.data?.label || n.data?.body || n.type || '').toLowerCase().includes(canvasSearchQuery.toLowerCase())
                          ).map(node => (
                            <button
                              key={node.id}
                              onClick={() => {
                                reactFlowInstance?.fitView({ nodes: [node], duration: 800, padding: 0.5 });
                                setSelectedNodeId(node.id);
                                setShowCanvasSearchResults(false);
                                setCanvasSearchQuery('');
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-primary/5 group transition-colors flex items-center gap-3"
                            >
                               <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                  <Activity size={12} />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <div className="text-[10px] font-bold text-gray-700 truncate">{node.data?.label || node.data?.body || 'Unnamed Node'}</div>
                                  <div className="text-[8px] text-gray-400 uppercase font-black">{node.type} • {node.id.substring(0, 6)}</div>
                               </div>
                            </button>
                          ))
                        ) : (
                          <div className="py-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                             No nodes found on canvas
                          </div>
                        )}
                      </div>
                    )}
                  </div>
              </Panel>

            </ReactFlow>
          </ReactFlowProvider>
          
          {/* Instructions Overlay */}
          <div className="absolute top-6 left-6 pointer-events-none">
             {!nodes.length && (
                 <div className="bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20 animate-bounce">
                    Drag nodes from sidebar to start building
                 </div>
             )}
          </div>
        </div>

        {/* Right Sidebar Toggle Button */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[10px] z-50 flex flex-col space-y-2 transition-all duration-300" style={{ right: rightSidebarOpen ? '310px' : '10px' }}>
           <button 
             onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
             className="p-2 bg-white shadow-xl border border-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all pointer-events-auto hover:scale-110 active:scale-95"
             title={rightSidebarOpen ? "Hide Config" : "Show Config"}
           >
              {rightSidebarOpen ? <ChevronRight size={16} /> : <PanelRight size={16} />}
           </button>
        </div>

        <aside 
          className={cn(
            "transition-all duration-300 ease-in-out flex flex-col h-full relative",
            rightSidebarOpen ? "w-80 ml-2" : "w-0 ml-0"
          )}
        >
          <div className={cn(
            "w-80 bg-white h-full rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col space-y-6 overflow-y-auto transition-opacity duration-300",
            rightSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Configuration</h3>
                 {selectedNode && (
                     <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                        {selectedNode.type}
                     </span>
                 )}
              </div>
              
              {selectedNode ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Node Title</label>
                        <input 
                            type="text" 
                            className="input h-10 text-xs"
                            value={selectedNode.data.label || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                        />
                     </div>

                     {selectedNode.type === 'message' && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Message Body</label>
                            <textarea 
                                className="input py-3 text-xs resize-none"
                                rows={4}
                                placeholder="Type the message bot will send..."
                                value={selectedNode.data.message || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { message: e.target.value })}
                            />
                        </div>
                     )}

                     {(selectedNode.type === 'image' || selectedNode.type === 'video' || selectedNode.type === 'document') && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Media URL</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="https://example.com/media.jpg"
                                    value={selectedNode.data.mediaUrl || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { mediaUrl: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Caption</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="Optional caption..."
                                    value={selectedNode.data.caption || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { caption: e.target.value })}
                                />
                            </div>
                        </div>
                      )}

                      {selectedNode.type === 'delay' && (
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Delay (seconds)</label>
                            <input 
                                type="number" 
                                className="input h-10 text-xs"
                                placeholder="3"
                                value={selectedNode.data.delay || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { delay: e.target.value })}
                            />
                         </div>
                      )}

                       {selectedNode.type === 'button' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5 bg-cyan-50/50 p-3 rounded-xl border border-cyan-100/50">
                                <label className="text-[10px] font-black text-cyan-600 uppercase tracking-tighter ml-1">Response Saver</label>
                                <input 
                                    className="input h-10 text-xs font-mono border-cyan-200 focus:border-cyan-400"
                                    placeholder="variable_name"
                                    value={selectedNode.data.variable || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { variable: e.target.value })}
                                />
                                <p className="text-[8px] text-cyan-600/70 mt-1 uppercase font-bold tracking-widest">Saves selected button title to variable</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Header Message</label>
                                <textarea 
                                    className="input py-3 text-xs resize-none"
                                    rows={2}
                                    placeholder="Please select an option:"
                                    value={selectedNode.data.headerMessage || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { headerMessage: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Button Options (Max 3)</label>
                                {[0, 1, 2].map((idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-300 w-4">{idx + 1}</span>
                                        <input 
                                            className="input h-9 text-xs flex-1"
                                            placeholder={`Button ${idx + 1} Title`}
                                            value={selectedNode.data[`btn${idx}Title`] || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, { [`btn${idx}Title`]: e.target.value })}
                                        />
                                        <input 
                                            className="input h-9 text-xs w-20 font-mono"
                                            placeholder="ID"
                                            value={selectedNode.data[`btn${idx}Id`] || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, { [`btn${idx}Id`]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Fallback Message (Invalid Input)</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="Sorry, please select a valid option."
                                    value={selectedNode.data.fallbackMessage || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { fallbackMessage: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="retryOnInvalid"
                                    checked={selectedNode.data.retryOnInvalid || false}
                                    onChange={(e) => updateNodeData(selectedNode.id, { retryOnInvalid: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor="retryOnInvalid" className="text-[10px] font-bold text-gray-500">
                                    Retry on invalid input (loop back)
                                </label>
                            </div>
                            <p className="text-[9px] text-gray-400 bg-cyan-50 p-2 rounded-lg border border-cyan-100">
                                🔀 Connect each button's output handle (<code className="bg-cyan-100 px-1 rounded">btn0</code>, <code className="bg-cyan-100 px-1 rounded">btn1</code>, <code className="bg-cyan-100 px-1 rounded">btn2</code>) to different target nodes.
                            </p>
                        </div>
                      )}

                      {selectedNode.type === 'list' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter ml-1">Response Saver</label>
                                <input 
                                    className="input h-10 text-xs font-mono border-indigo-200 focus:border-indigo-400"
                                    placeholder="variable_name"
                                    value={selectedNode.data.variable || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { variable: e.target.value })}
                                />
                                <p className="text-[8px] text-indigo-600/70 mt-1 uppercase font-bold tracking-widest">Saves selected item title to variable</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Menu Button Text</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="View Options"
                                    value={selectedNode.data.menuTitle || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { menuTitle: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Body Text</label>
                                <textarea 
                                    className="input py-3 text-xs resize-none"
                                    rows={2}
                                    placeholder="Please select an item from the list"
                                    value={selectedNode.data.body || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { body: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5 pt-4 border-t border-gray-100">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Dynamic Source (Variable)</label>
                                <input 
                                    className="input h-10 text-xs font-mono"
                                    placeholder="e.g. products_array"
                                    value={selectedNode.data.dynamicArray || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { dynamicArray: e.target.value })}
                                />
                                <p className="text-[9px] text-gray-400 leading-tight">If set, list rows will be generated from this variable.</p>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                <label className="text-[10px] font-black text-green-600 uppercase tracking-tighter ml-1">📊 Google Sheet Source</label>
                                <p className="text-[8px] text-gray-400">Fetch list items directly from a Google Sheet at runtime.</p>
                                
                                <div className="bg-green-50/50 p-3 rounded-lg border border-green-100/50 space-y-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase">Apps Script URL</label>
                                        <input 
                                            className="input h-8 text-[10px] font-mono"
                                            placeholder="https://script.google.com/macros/s/..."
                                            value={selectedNode.data.sheetUrl || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, { sheetUrl: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-bold text-gray-500 uppercase">Title Col</label>
                                            <input 
                                                className="input h-7 text-[10px] font-mono"
                                                placeholder="A"
                                                value={selectedNode.data.sheetTitleCol || ''}
                                                onChange={(e) => updateNodeData(selectedNode.id, { sheetTitleCol: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-bold text-gray-500 uppercase">Desc Col</label>
                                            <input 
                                                className="input h-7 text-[10px] font-mono"
                                                placeholder="B"
                                                value={selectedNode.data.sheetDescCol || ''}
                                                onChange={(e) => updateNodeData(selectedNode.id, { sheetDescCol: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-bold text-gray-500 uppercase">ID Col</label>
                                            <input 
                                                className="input h-7 text-[10px] font-mono"
                                                placeholder="C"
                                                value={selectedNode.data.sheetIdCol || ''}
                                                onChange={(e) => updateNodeData(selectedNode.id, { sheetIdCol: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    
                                    <p className="text-[7px] text-gray-400 italic">Script should return: {"{ items: [{ title, description, id }] }"}</p>
                                </div>
                            </div>


                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">List Items (Static)</label>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                    {(selectedNode.data.sections?.[0]?.rows || []).map((row: any, idx: number) => (
                                        <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm relative group">
                                            <button 
                                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    const sections = [...(selectedNode.data.sections || [{ title: 'Main', rows: [] }])];
                                                    sections[0].rows = sections[0].rows.filter((_: any, i: number) => i !== idx);
                                                    updateNodeData(selectedNode.id, { sections });
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    className="input h-7 text-xs"
                                                    placeholder="Title"
                                                    value={row.title}
                                                    onChange={(e) => {
                                                        const sections = [...(selectedNode.data.sections || [{ title: 'Main', rows: [] }])];
                                                        sections[0].rows[idx].title = e.target.value;
                                                        updateNodeData(selectedNode.id, { sections });
                                                    }}
                                                />
                                                <input 
                                                    className="input h-7 text-xs font-mono text-gray-500"
                                                    placeholder="ID"
                                                    value={row.id}
                                                    onChange={(e) => {
                                                        const sections = [...(selectedNode.data.sections || [{ title: 'Main', rows: [] }])];
                                                        sections[0].rows[idx].id = e.target.value;
                                                        updateNodeData(selectedNode.id, { sections });
                                                    }}
                                                />
                                            </div>
                                            <input 
                                                className="input h-7 text-xs text-gray-500"
                                                placeholder="Description (Optional)"
                                                value={row.description || ''}
                                                onChange={(e) => {
                                                    const sections = [...(selectedNode.data.sections || [{ title: 'Main', rows: [] }])];
                                                    sections[0].rows[idx].description = e.target.value;
                                                    updateNodeData(selectedNode.id, { sections });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-indigo-100"
                                    onClick={() => {
                                         const sections = [...(selectedNode.data.sections || [{ title: 'Main', rows: [] }])];
                                         if (!sections[0]) sections[0] = { title: 'Main', rows: [] };
                                         if (!sections[0].rows) sections[0].rows = [];
                                         
                                         const newIndex = sections[0].rows.length + 1;
                                         sections[0].rows.push({ 
                                             id: `list_${newIndex}`, 
                                             title: `Option ${newIndex}`,
                                             description: ''
                                         });
                                         updateNodeData(selectedNode.id, { sections });
                                    }}
                                >
                                    <Plus size={14} /> Add List Item
                                </button>
                            </div>

                            <div className="space-y-1.5 border-t border-gray-100 pt-4 mt-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Fallback Message</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="Invalid selection."
                                    value={selectedNode.data.fallbackMessage || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { fallbackMessage: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="retryOnInvalid-list"
                                    checked={selectedNode.data.retryOnInvalid || false}
                                    onChange={(e) => updateNodeData(selectedNode.id, { retryOnInvalid: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor="retryOnInvalid-list" className="text-[10px] font-bold text-gray-500">
                                    Retry on invalid (re-send list)
                                </label>
                            </div>
                        </div>
                      )}

                      {selectedNode.type === 'api' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Method</label>
                                    <select 
                                        className="input h-10 text-xs"
                                        value={selectedNode.data.method || 'GET'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { method: e.target.value })}
                                    >
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>PUT</option>
                                        <option>DELETE</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Endpoint URL</label>
                                    <input 
                                        className="input h-10 text-xs"
                                        placeholder="https://api.com/v1/{{path}}"
                                        value={selectedNode.data.url || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Headers */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Headers</label>
                                    <button 
                                        onClick={() => updateNodeData(selectedNode.id, { headers: [...(selectedNode.data.headers || []), { key: '', value: '' }] })}
                                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {(selectedNode.data.headers || []).map((h: any, idx: number) => (
                                        <div key={idx} className="flex gap-1">
                                            <input 
                                                className="input h-8 text-[10px] flex-1 min-w-[30%]"
                                                placeholder="Key"
                                                value={h.key}
                                                onChange={(e) => {
                                                    const newHeaders = [...(selectedNode.data.headers || [])];
                                                    newHeaders[idx].key = e.target.value;
                                                    updateNodeData(selectedNode.id, { headers: newHeaders });
                                                }}
                                            />
                                            <input 
                                                className="input h-8 text-[10px] flex-1"
                                                placeholder="Value"
                                                value={h.value}
                                                onChange={(e) => {
                                                    const newHeaders = [...(selectedNode.data.headers || [])];
                                                    newHeaders[idx].value = e.target.value;
                                                    updateNodeData(selectedNode.id, { headers: newHeaders });
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const newHeaders = [...(selectedNode.data.headers || [])];
                                                    newHeaders.splice(idx, 1);
                                                    updateNodeData(selectedNode.id, { headers: newHeaders });
                                                }}
                                                className="p-1 px-2 hover:bg-red-50 text-red-400 rounded transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Request Body */}
                            {(selectedNode.data.method === 'POST' || selectedNode.data.method === 'PUT') && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">JSON Body</label>
                                    <textarea 
                                        className="input py-3 text-xs font-mono resize-none"
                                        rows={4}
                                        placeholder={'{\n  "key": "{{value}}"\n}'}
                                        value={selectedNode.data.body || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { body: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Mapping Section */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Response Mapping</label>
                                    <button 
                                        onClick={() => updateNodeData(selectedNode.id, { mapping: [...(selectedNode.data.mapping || []), { path: '', variable: '' }] })}
                                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={12} /> Add Mapping
                                    </button>
                                </div>
                                <div className="space-y-2">
                                     {(selectedNode.data.mapping || []).map((m: any, idx: number) => (
                                        <div key={idx} className="flex gap-1 items-center">
                                            <input 
                                                className="input h-8 text-[10px] flex-1"
                                                placeholder="data.id"
                                                value={m.path}
                                                onChange={(e) => {
                                                    const newMapping = [...(selectedNode.data.mapping || [])];
                                                    newMapping[idx].path = e.target.value;
                                                    updateNodeData(selectedNode.id, { mapping: newMapping });
                                                }}
                                            />
                                            <div className="text-gray-400 px-1 text-[10px]">→</div>
                                            <input 
                                                className="input h-8 text-[10px] flex-1"
                                                placeholder="variable"
                                                value={m.variable}
                                                onChange={(e) => {
                                                    const newMapping = [...(selectedNode.data.mapping || [])];
                                                    newMapping[idx].variable = e.target.value;
                                                    updateNodeData(selectedNode.id, { mapping: newMapping });
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const newMapping = [...(selectedNode.data.mapping || [])];
                                                    newMapping.splice(idx, 1);
                                                    updateNodeData(selectedNode.id, { mapping: newMapping });
                                                }}
                                                className="p-1 px-2 hover:bg-red-50 text-red-400 rounded transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="space-y-1.5 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-tighter ml-1">Response Branching (Optional)</label>
                                    <button 
                                        onClick={() => updateNodeData(selectedNode.id, { routes: [...(selectedNode.data.routes || []), { id: `api_route_${Math.random().toString(36).substr(2, 9)}`, operator: '==', value: '' }] })}
                                        className="text-[10px] font-bold text-rose-500 flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={12} /> Add Rule
                                    </button>
                                </div>
                                <div className="space-y-2">
                                     {(selectedNode.data.routes || []).map((route: any, idx: number) => (
                                        <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm relative group">
                                            <button 
                                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    const routes = [...(selectedNode.data.routes || [])];
                                                    const newRoutes = routes.filter((_: any, i: number) => i !== idx);
                                                    updateNodeData(selectedNode.id, { routes: newRoutes });
                                                }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Result Variable Match (Check Value):</label>
                                                <div className="flex items-center gap-1">
                                                    <select 
                                                        className="input h-8 text-[10px] w-20 px-1"
                                                        value={route.operator || '=='}
                                                        onChange={(e) => {
                                                            const routes = [...(selectedNode.data.routes || [])];
                                                            routes[idx].operator = e.target.value;
                                                            updateNodeData(selectedNode.id, { routes });
                                                        }}
                                                    >
                                                        <option value="==">==</option>
                                                        <option value=">">&gt;</option>
                                                        <option value="<">&lt;</option>
                                                    </select>
                                                    <input 
                                                        className="input h-8 text-xs font-medium flex-1"
                                                        placeholder="e.g. success or 200"
                                                        value={route.value}
                                                        onChange={(e) => {
                                                            const routes = [...(selectedNode.data.routes || [])];
                                                            routes[idx].value = e.target.value;
                                                            updateNodeData(selectedNode.id, { routes });
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-[8px] text-gray-400 leading-tight">Bot will compare the <strong>first</strong> mapped variable value above with this.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>

                            <p className="text-[9px] text-gray-400 bg-gray-50 p-2 rounded-lg">
                                ⚡ Use <code className="bg-gray-200 px-1 rounded">{'{{variable}}'}</code> syntax to inject captured values. Connect <span className="text-green-600 font-bold">Success</span>, <span className="text-red-600 font-bold">Fail</span>, or your custom handles to different nodes.
                            </p>
                        </div>
                      )}

                       {selectedNode.type === 'media_forward' && (
                         <div className="space-y-4">
                             <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                                 <p className="text-[9px] text-purple-700 font-bold">📤 Forward uploaded media to an external API for OCR, storage, or processing.</p>
                             </div>

                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">API Endpoint URL</label>
                                 <input 
                                     className="input h-10 text-xs"
                                     placeholder="https://api.ocr.space/parse/image"
                                     value={selectedNode.data.url || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                                 />
                                 <p className="text-[8px] text-gray-400 ml-1">The external API that will receive the media file (multipart/form-data)</p>
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                                 <div className="space-y-1.5">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Media ID Variable</label>
                                     <input 
                                         className="input h-10 text-xs font-mono"
                                         placeholder="document_id"
                                         value={selectedNode.data.mediaIdVariable || ''}
                                         onChange={(e) => updateNodeData(selectedNode.id, { mediaIdVariable: e.target.value })}
                                     />
                                     <p className="text-[8px] text-gray-400 ml-1">Variable containing the WhatsApp Media ID</p>
                                 </div>
                                 <div className="space-y-1.5">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Form Field Name</label>
                                     <input 
                                         className="input h-10 text-xs font-mono"
                                         placeholder="file"
                                         value={selectedNode.data.fieldName || ''}
                                         onChange={(e) => updateNodeData(selectedNode.id, { fieldName: e.target.value })}
                                     />
                                     <p className="text-[8px] text-gray-400 ml-1">Field name for the file in form data</p>
                                 </div>
                             </div>

                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Result Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="ocr_result"
                                     value={selectedNode.data.resultVariable || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { resultVariable: e.target.value })}
                                 />
                                 <p className="text-[8px] text-gray-400 ml-1">Variable to store the full API response</p>
                             </div>

                             {/* Headers */}
                             <div className="space-y-1.5">
                                 <div className="flex items-center justify-between">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Headers</label>
                                     <button 
                                         onClick={() => updateNodeData(selectedNode.id, { headers: [...(selectedNode.data.headers || []), { key: '', value: '' }] })}
                                         className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                     >
                                         <Plus size={12} /> Add
                                     </button>
                                 </div>
                                 <div className="space-y-2">
                                     {(selectedNode.data.headers || []).map((h: any, idx: number) => (
                                         <div key={idx} className="flex gap-1">
                                             <input 
                                                 className="input h-8 text-[10px] flex-1 min-w-[30%]"
                                                 placeholder="Key (e.g. apikey)"
                                                 value={h.key}
                                                 onChange={(e) => {
                                                     const newHeaders = [...(selectedNode.data.headers || [])];
                                                     newHeaders[idx].key = e.target.value;
                                                     updateNodeData(selectedNode.id, { headers: newHeaders });
                                                 }}
                                             />
                                             <input 
                                                 className="input h-8 text-[10px] flex-1"
                                                 placeholder="Value"
                                                 value={h.value}
                                                 onChange={(e) => {
                                                     const newHeaders = [...(selectedNode.data.headers || [])];
                                                     newHeaders[idx].value = e.target.value;
                                                     updateNodeData(selectedNode.id, { headers: newHeaders });
                                                 }}
                                             />
                                             <button 
                                                 onClick={() => {
                                                     const newHeaders = [...(selectedNode.data.headers || [])];
                                                     newHeaders.splice(idx, 1);
                                                     updateNodeData(selectedNode.id, { headers: newHeaders });
                                                 }}
                                                 className="p-1 px-2 hover:bg-red-50 text-red-400 rounded transition-colors"
                                             >
                                                 <Trash2 size={12} />
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* Response Mapping */}
                             <div className="space-y-1.5">
                                 <div className="flex items-center justify-between">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Response Mapping</label>
                                     <button 
                                         onClick={() => updateNodeData(selectedNode.id, { mapping: [...(selectedNode.data.mapping || []), { path: '', variable: '' }] })}
                                         className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                     >
                                         <Plus size={12} /> Add Mapping
                                     </button>
                                 </div>
                                 <div className="space-y-2">
                                     {(selectedNode.data.mapping || []).map((m: any, idx: number) => (
                                         <div key={idx} className="flex gap-1 items-center">
                                             <input 
                                                 className="input h-8 text-[10px] flex-1"
                                                 placeholder="ParsedResults[0].ParsedText"
                                                 value={m.path}
                                                 onChange={(e) => {
                                                     const newMapping = [...(selectedNode.data.mapping || [])];
                                                     newMapping[idx].path = e.target.value;
                                                     updateNodeData(selectedNode.id, { mapping: newMapping });
                                                 }}
                                             />
                                             <div className="text-gray-400 px-1 text-[10px]">→</div>
                                             <input 
                                                 className="input h-8 text-[10px] flex-1"
                                                 placeholder="ocr_text"
                                                 value={m.variable}
                                                 onChange={(e) => {
                                                     const newMapping = [...(selectedNode.data.mapping || [])];
                                                     newMapping[idx].variable = e.target.value;
                                                     updateNodeData(selectedNode.id, { mapping: newMapping });
                                                 }}
                                             />
                                             <button 
                                                 onClick={() => {
                                                     const newMapping = [...(selectedNode.data.mapping || [])];
                                                     newMapping.splice(idx, 1);
                                                     updateNodeData(selectedNode.id, { mapping: newMapping });
                                                 }}
                                                 className="p-1 px-2 hover:bg-red-50 text-red-400 rounded transition-colors"
                                             >
                                                 <Trash2 size={12} />
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             <p className="text-[9px] text-gray-400 bg-gray-50 p-2 rounded-lg">
                                 📄 This node downloads media from WhatsApp and POSTs it to your API. Use for OCR services (like OCR.space) or cloud storage (S3, Cloudinary). Map response fields to variables.
                             </p>
                         </div>
                       )}

                       {selectedNode.type === 'sql' && (
                         <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">SQL Query</label>
                                <textarea 
                                    className="input py-3 text-xs font-mono resize-none"
                                    rows={4}
                                    placeholder="SELECT * FROM contacts WHERE email = {{email}}"
                                    value={selectedNode.data.query || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { query: e.target.value })}
                                />
                            </div>

                            {/* Mapping Section */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1 flex items-center gap-1">
                                        Result Mapping
                                    </label>
                                    <button 
                                        onClick={() => updateNodeData(selectedNode.id, { mapping: [...(selectedNode.data.mapping || []), { path: '', variable: '' }] })}
                                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline underline-offset-2"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                     {(selectedNode.data.mapping || []).map((m: any, idx: number) => (
                                        <div key={idx} className="flex gap-1 items-center bg-gray-50/50 p-1.5 rounded-lg border border-gray-100">
                                            <input 
                                                className="input h-7 text-[10px] flex-1 bg-white border-gray-200"
                                                placeholder="[0].name"
                                                value={m.path}
                                                onChange={(e) => {
                                                    const newMapping = [...(selectedNode.data.mapping || [])];
                                                    newMapping[idx].path = e.target.value;
                                                    updateNodeData(selectedNode.id, { mapping: newMapping });
                                                }}
                                            />
                                            <div className="text-gray-400 px-0.5 text-[10px]">→</div>
                                            <input 
                                                className="input h-7 text-[10px] flex-1 bg-white border-gray-200"
                                                placeholder="var"
                                                value={m.variable}
                                                onChange={(e) => {
                                                    const newMapping = [...(selectedNode.data.mapping || [])];
                                                    newMapping[idx].variable = e.target.value;
                                                    updateNodeData(selectedNode.id, { mapping: newMapping });
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const newMapping = [...(selectedNode.data.mapping || [])];
                                                    newMapping.splice(idx, 1);
                                                    updateNodeData(selectedNode.id, { mapping: newMapping });
                                                }}
                                                className="p-1 text-red-400 hover:bg-white rounded transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!selectedNode.data.mapping || selectedNode.data.mapping.length === 0) && (
                                        <p className="text-[9px] text-gray-400 italic text-center py-2">No mappings added. Result is not saved.</p>
                                    )}
                                </div>
                            </div>
                         </div>
                       )}

                       {selectedNode.type === 'shopify' && (
                         <div className="space-y-4">
                             <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                 <p className="text-[9px] text-emerald-600 font-bold">🛍️ Fetch order details, billing info, and status directly from Shopify.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Shop Domain</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="myshop.myshopify.com"
                                     value={selectedNode.data.shopDomain || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { shopDomain: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5 border-b border-gray-100 pb-3">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Authentication</label>
                                 <select 
                                     className="input h-10 text-xs"
                                     value={selectedNode.data.authType || 'token'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { authType: e.target.value })}
                                 >
                                     <option value="token">🔑 Admin Access Token (shpat_...)</option>
                                     <option value="basic">🔌 API Key & Secret (Basic Auth)</option>
                                 </select>
                             </div>

                             {selectedNode.data.authType === 'basic' ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-emerald-600">Shopify Client ID (API Key)</label>
                                        <input 
                                            className="input h-10 text-xs font-mono"
                                            placeholder="ec103dcc..."
                                            value={selectedNode.data.apiKey || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, { apiKey: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-emerald-600">Shopify Client Secret</label>
                                        <input 
                                            type="password"
                                            className="input h-10 text-xs font-mono"
                                            placeholder="shpss_..."
                                            value={selectedNode.data.apiSecret || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, { apiSecret: e.target.value })}
                                        />
                                    </div>
                                </>
                             ) : (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Admin Access Token</label>
                                    <input 
                                        type="password"
                                        className="input h-10 text-xs font-mono"
                                        placeholder="shpat_..."
                                        value={selectedNode.data.accessToken || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { accessToken: e.target.value })}
                                    />
                                    <p className="text-[8px] text-gray-400">Generate this in Shopify Admin &gt; Apps &gt; Develop Apps.</p>
                                </div>
                             )}

                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-emerald-600">Order Search Settings</label>
                                 <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50 space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase">Search Variable (Order #)</label>
                                        <input 
                                            className="input h-8 text-[10px] font-mono"
                                            placeholder="order_id"
                                            value={selectedNode.data.orderVariable || 'order_id'}
                                            onChange={(e) => updateNodeData(selectedNode.id, { orderVariable: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase">Order Prefix to Strip (Optional)</label>
                                        <input 
                                            className="input h-8 text-[10px] font-mono"
                                            placeholder="LRL-"
                                            value={selectedNode.data.orderPrefix || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, { orderPrefix: e.target.value })}
                                        />
                                    </div>
                                 </div>
                             </div>

                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Output Result Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="order_details"
                                     value={selectedNode.data.outputVariable || 'order_details'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { outputVariable: e.target.value })}
                                 />
                             </div>
                         </div>
                       )}

                       {selectedNode.type === 'woocommerce' && (
                         <div className="space-y-4">
                             <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                                 <p className="text-[9px] text-purple-600 font-bold">🛒 Fetch order and billing details from your WooCommerce store.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Store URL</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="https://myshop.com"
                                     value={selectedNode.data.storeUrl || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { storeUrl: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Consumer Key</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="ck_..."
                                     value={selectedNode.data.consumerKey || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { consumerKey: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Consumer Secret</label>
                                 <input 
                                     type="password"
                                     className="input h-10 text-xs font-mono"
                                     placeholder="cs_..."
                                     value={selectedNode.data.consumerSecret || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { consumerSecret: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Search Variable (Order ID)</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="order_id"
                                     value={selectedNode.data.orderVariable || 'order_id'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { orderVariable: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Output Result Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="order_details"
                                     value={selectedNode.data.outputVariable || 'order_details'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { outputVariable: e.target.value })}
                                 />
                             </div>
                         </div>
                       )}

                       {selectedNode.type === 'google_sheet_query' && (
                         <div className="space-y-4">
                             <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                                 <p className="text-[9px] text-teal-600 font-bold">🔍 Search Google Sheet with dynamic match conditions. Add any number of variable → column mappings.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Google Apps Script URL</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="https://script.google.com/macros/s/..."
                                     value={selectedNode.data.scriptUrl || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { scriptUrl: e.target.value })}
                                 />
                                 <p className="text-[8px] text-gray-400">Deploy a Google Apps Script web app to query your sheet.</p>
                             </div>
                             
                             <div className="space-y-2 border-t border-gray-100 pt-3">
                                 <label className="text-[10px] font-black text-teal-600 uppercase tracking-tighter ml-1">Match Conditions</label>
                                 <p className="text-[8px] text-gray-400">Define which bot variables should match which sheet columns. All conditions must match.</p>
                                 
                                 <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                     {(selectedNode.data.matchConditions || []).map((cond: any, idx: number) => (
                                         <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 shadow-sm relative group">
                                             <div className="flex-1 space-y-1">
                                                 <div className="flex items-center gap-1">
                                                     <span className="text-[8px] text-gray-400 w-12">Variable:</span>
                                                     <input 
                                                         className="input h-7 text-[10px] font-mono flex-1"
                                                         placeholder="sender_mobile, passport, etc."
                                                         value={cond.variable || ''}
                                                         onChange={(e) => {
                                                             const conditions = [...(selectedNode.data.matchConditions || [])];
                                                             conditions[idx].variable = e.target.value;
                                                             updateNodeData(selectedNode.id, { matchConditions: conditions });
                                                         }}
                                                     />
                                                 </div>
                                                 <div className="flex items-center gap-1">
                                                     <span className="text-[8px] text-gray-400 w-12">Column:</span>
                                                     <input 
                                                         className="input h-7 text-[10px] font-mono flex-1"
                                                         placeholder="A, Phone, Passport, etc."
                                                         value={cond.column || ''}
                                                         onChange={(e) => {
                                                             const conditions = [...(selectedNode.data.matchConditions || [])];
                                                             conditions[idx].column = e.target.value;
                                                             updateNodeData(selectedNode.id, { matchConditions: conditions });
                                                         }}
                                                     />
                                                 </div>
                                             </div>
                                             <button 
                                                 className="text-gray-300 hover:text-red-500 transition-colors"
                                                 onClick={() => {
                                                     const conditions = [...(selectedNode.data.matchConditions || [])];
                                                     const newConditions = conditions.filter((_: any, i: number) => i !== idx);
                                                     updateNodeData(selectedNode.id, { matchConditions: newConditions });
                                                 }}
                                             >
                                                 <Trash2 size={12} />
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                                 
                                 <button 
                                     className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-teal-100"
                                     onClick={() => {
                                         const conditions = [...(selectedNode.data.matchConditions || [])];
                                         conditions.push({ id: `cond_${Math.random().toString(36).substr(2, 9)}`, variable: '', column: '' });
                                         updateNodeData(selectedNode.id, { matchConditions: conditions });
                                     }}
                                 >
                                     <Plus size={14} /> Add Match Condition
                                 </button>
                                 
                                 <div className="text-[8px] text-gray-400 bg-gray-50 p-2 rounded-lg mt-2">
                                     <strong>Examples:</strong><br/>
                                     • <code>sender_mobile</code> → <code>Phone</code> (auto-captured from WhatsApp)<br/>
                                     • <code>passport</code> → <code>Passport</code> (captured via Wait node)<br/>
                                     • <code>email</code> → <code>Email</code>
                                 </div>
                             </div>
                             
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Output Columns (comma-separated)</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="Name, Status, Balance, ExpiryDate"
                                     value={selectedNode.data.outputColumns || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { outputColumns: e.target.value })}
                                 />
                                 <p className="text-[8px] text-gray-400">Column headers/letters to return. Each becomes a variable.</p>
                             </div>

                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Result Message (Found)</label>
                                 <textarea 
                                     className="input text-xs min-h-[60px]"
                                     placeholder="Hello {{Name}}, your status is: {{Status}}"
                                     value={selectedNode.data.foundMessage || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { foundMessage: e.target.value })}
                                 />
                             </div>
                             
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Not Found Message</label>
                                 <textarea 
                                     className="input text-xs min-h-[60px]"
                                     placeholder="Sorry, we couldn't find a record matching your details."
                                     value={selectedNode.data.notFoundMessage || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { notFoundMessage: e.target.value })}
                                 />
                             </div>
                         </div>
                       )}


                        {selectedNode.type === 'keyword_match' && (
                          <div className="space-y-4">
                              <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
                                  <p className="text-[9px] text-sky-600 font-bold">🔑 Match user input against multiple keywords. Each keyword gets its own output handle.</p>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Keywords</label>
                                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                      {(selectedNode.data.keywords || []).map((kw: any, idx: number) => (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 shadow-sm relative group">
                                              <input 
                                                  className="input h-8 text-xs flex-1"
                                                  placeholder="Keyword"
                                                  value={kw.keyword}
                                                  onChange={(e) => {
                                                      const keywords = [...(selectedNode.data.keywords || [])];
                                                      keywords[idx].keyword = e.target.value;
                                                      updateNodeData(selectedNode.id, { keywords });
                                                  }}
                                              />
                                              <button 
                                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                                  onClick={() => {
                                                      const keywords = [...(selectedNode.data.keywords || [])];
                                                      const newKeywords = keywords.filter((_: any, i: number) => i !== idx);
                                                      updateNodeData(selectedNode.id, { keywords: newKeywords });
                                                  }}
                                              >
                                                  <Trash2 size={12} />
                                              </button>
                                          </div>
                                      ))}
                                  </div>
                                  <button 
                                      className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-sky-100"
                                      onClick={() => {
                                           const keywords = [...(selectedNode.data.keywords || [])];
                                           keywords.push({ id: `kw_${Math.random().toString(36).substr(2, 9)}`, keyword: '' });
                                           updateNodeData(selectedNode.id, { keywords });
                                      }}
                                  >
                                      <Plus size={14} /> Add Keyword
                                  </button>
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Input Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="last_input"
                                     value={selectedNode.data.inputVariable || 'last_input'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { inputVariable: e.target.value })}
                                 />
                             </div>
                             <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border">
                                 <input 
                                     type="checkbox"
                                     className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                                     checked={selectedNode.data.caseSensitive || false}
                                     onChange={(e) => updateNodeData(selectedNode.id, { caseSensitive: e.target.checked })}
                                 />
                                 <span className="text-xs font-bold text-gray-700">Case Sensitive</span>
                             </label>
                             <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border">
                                 <input 
                                     type="checkbox"
                                     className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                                     checked={selectedNode.data.partialMatch || false}
                                     onChange={(e) => updateNodeData(selectedNode.id, { partialMatch: e.target.checked })}
                                 />
                                 <span className="text-xs font-bold text-gray-700">Partial Match (contains)</span>
                             </label>
                          </div>
                        )}

                        {selectedNode.type === 'router' && (
                          <div className="space-y-6">
                              <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Variable to Switch</label>
                                  <input 
                                      className="input h-10 text-xs font-mono"
                                      placeholder="e.g. user_category"
                                      value={selectedNode.data.variable || ''}
                                      onChange={(e) => updateNodeData(selectedNode.id, { variable: e.target.value })}
                                  />
                                  <p className="text-[9px] text-gray-400 leading-tight">The bot will check the value of this variable and route accordingly.</p>
                              </div>

                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Routing Cases</label>
                                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                      {(selectedNode.data.routes || []).map((route: any, idx: number) => (
                                          <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm relative group">
                                              <button 
                                                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                  onClick={() => {
                                                      const routes = [...(selectedNode.data.routes || [])];
                                                      const newRoutes = routes.filter((_: any, i: number) => i !== idx);
                                                      updateNodeData(selectedNode.id, { routes: newRoutes });
                                                  }}
                                              >
                                                  <Trash2 size={12} />
                                              </button>
                                              <div className="space-y-1.5">
                                                  <label className="text-[8px] font-bold text-gray-400 uppercase">Condition:</label>
                                                  <div className="flex items-center gap-1">
                                                      <select 
                                                          className="input h-8 text-[10px] w-20 px-1"
                                                          value={route.operator || '=='}
                                                          onChange={(e) => {
                                                              const routes = [...(selectedNode.data.routes || [])];
                                                              routes[idx].operator = e.target.value;
                                                              updateNodeData(selectedNode.id, { routes });
                                                          }}
                                                      >
                                                          <option value="==">==</option>
                                                          <option value=">">&gt;</option>
                                                          <option value="<">&lt;</option>
                                                      </select>
                                                      <input 
                                                          className="input h-8 text-xs font-medium flex-1"
                                                          placeholder="e.g. 100 or Plywood"
                                                          value={route.value}
                                                          onChange={(e) => {
                                                              const routes = [...(selectedNode.data.routes || [])];
                                                              routes[idx].value = e.target.value;
                                                              updateNodeData(selectedNode.id, { routes });
                                                          }}
                                                      />
                                                  </div>
                                              </div>
                                              <div className="text-[8px] text-rose-500 font-bold uppercase tracking-widest">
                                                  Handle ID: <span className="font-mono">{route.id || `route_${idx}`}</span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                  <button 
                                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-rose-100"
                                      onClick={() => {
                                           const routes = [...(selectedNode.data.routes || [])];
                                           const newIndex = routes.length + 1;
                                           routes.push({ 
                                               id: `route_${Math.random().toString(36).substr(2, 9)}`, 
                                               value: `Value ${newIndex}`
                                           });
                                           updateNodeData(selectedNode.id, { routes });
                                      }}
                                  >
                                      <Plus size={14} /> Add Routing Case
                                  </button>
                              </div>

                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                  <p className="text-[9px] text-gray-400 leading-relaxed italic">
                                      Each case creates a new dynamic output on the node. If no case matches, the bot follows the <strong>Default / Else</strong> path.
                                  </p>
                              </div>
                          </div>
                        )}

                       {selectedNode.type === 'group_images' && (
                         <div className="space-y-4">
                             <div className="bg-fuchsia-50 rounded-xl p-3 border border-fuchsia-100">
                                 <p className="text-[9px] text-fuchsia-600 font-bold">🖼️ Send multiple images sequentially from an array of URLs.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Images Source</label>
                                 <textarea 
                                     className="input text-xs min-h-[80px] font-mono"
                                     placeholder="image_urls OR https://url1.com, https://url2.com"
                                     value={selectedNode.data.arrayVariable || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { arrayVariable: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400 ml-1">Variable name (e.g. <code>image_urls</code>) OR literal comma-separated list of URLs.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Delay Between Images (seconds)</label>
                                 <input 
                                     type="number"
                                     min="0"
                                     max="10"
                                     className="input h-10 text-xs font-mono"
                                     placeholder="1"
                                     value={selectedNode.data.delayBetween || '1'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { delayBetween: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Caption (optional)</label>
                                 <input 
                                     className="input h-10 text-xs"
                                     placeholder="Check out these images!"
                                     value={selectedNode.data.caption || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { caption: e.target.value })}
                                 />
                             </div>
                         </div>
                       )}

                       {selectedNode.type === 'start_trigger' && (
                          <div className="space-y-4">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                                  <p className="text-[9px] text-green-700 font-bold">⚡ Entry point for your chatbot flow. Choose when this flow should be triggered.</p>
                              </div>
                              
                              {/* Trigger Mode Selection */}
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Trigger Mode</label>
                                  <div className="grid grid-cols-2 gap-2">
                                      <button
                                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                                              (selectedNode.data.triggerMode || 'any') === 'any'
                                                  ? 'border-green-500 bg-green-50 text-green-700'
                                                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                          }`}
                                          onClick={() => updateNodeData(selectedNode.id, { triggerMode: 'any' })}
                                      >
                                          <div className="text-lg mb-1">🌐</div>
                                          <div className="text-[10px] font-bold">Any Word</div>
                                          <div className="text-[8px] opacity-70">All messages</div>
                                      </button>
                                      <button
                                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                                              selectedNode.data.triggerMode === 'keywords'
                                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                          }`}
                                          onClick={() => updateNodeData(selectedNode.id, { triggerMode: 'keywords' })}
                                      >
                                          <div className="text-lg mb-1">🎯</div>
                                          <div className="text-[10px] font-bold">Specific Words</div>
                                          <div className="text-[8px] opacity-70">Keyword triggers</div>
                                      </button>
                                  </div>
                              </div>

                              {/* Keywords Configuration - Only show when triggerMode is 'keywords' */}
                              {selectedNode.data.triggerMode === 'keywords' && (
                                  <div className="space-y-3">
                                      <div className="space-y-2">
                                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Trigger Keywords</label>
                                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                              {(selectedNode.data.keywords || []).map((kw: string, idx: number) => (
                                                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 shadow-sm group">
                                                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white bg-blue-500">
                                                          {idx + 1}
                                                      </div>
                                                      <input 
                                                          className="input h-8 text-xs flex-1"
                                                          placeholder="Enter keyword..."
                                                          value={kw}
                                                          onChange={(e) => {
                                                              const keywords = [...(selectedNode.data.keywords || [])];
                                                              keywords[idx] = e.target.value;
                                                              updateNodeData(selectedNode.id, { keywords });
                                                          }}
                                                      />
                                                      <button 
                                                          className="text-gray-300 hover:text-red-500 transition-colors"
                                                          onClick={() => {
                                                              const keywords = [...(selectedNode.data.keywords || [])];
                                                              const newKeywords = keywords.filter((_: any, i: number) => i !== idx);
                                                              updateNodeData(selectedNode.id, { keywords: newKeywords });
                                                          }}
                                                      >
                                                          <Trash2 size={12} />
                                                      </button>
                                                  </div>
                                              ))}
                                          </div>
                                          <button 
                                              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-blue-100"
                                              onClick={() => {
                                                   const keywords = [...(selectedNode.data.keywords || [])];
                                                   keywords.push('');
                                                   updateNodeData(selectedNode.id, { keywords });
                                              }}
                                          >
                                              <Plus size={14} /> Add Keyword
                                          </button>
                                      </div>

                                      <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border">
                                          <input 
                                              type="checkbox"
                                              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                              checked={selectedNode.data.caseSensitive || false}
                                              onChange={(e) => updateNodeData(selectedNode.id, { caseSensitive: e.target.checked })}
                                          />
                                          <span className="text-xs font-bold text-gray-700">Case Sensitive</span>
                                      </label>
                                      
                                      <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border">
                                          <input 
                                              type="checkbox"
                                              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                              checked={selectedNode.data.partialMatch || false}
                                              onChange={(e) => updateNodeData(selectedNode.id, { partialMatch: e.target.checked })}
                                          />
                                          <span className="text-xs font-bold text-gray-700">Partial Match (contains)</span>
                                      </label>
                                  </div>
                              )}

                              {/* Info box for 'any' mode */}
                              {(selectedNode.data.triggerMode || 'any') === 'any' && (
                                  <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                      <p className="text-[9px] text-green-600 leading-relaxed">
                                          <strong>Any Word mode:</strong> This flow will be triggered when a user sends any message. Use this as a catch-all or welcome flow.
                                      </p>
                                  </div>
                              )}

                              {/* Info box for 'keywords' mode */}
                              {selectedNode.data.triggerMode === 'keywords' && (
                                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                      <p className="text-[9px] text-blue-600 leading-relaxed">
                                          <strong>Specific Words mode:</strong> This flow will only be triggered when a user sends a message containing one of the keywords. Each keyword creates a separate output handle.
                                      </p>
                                  </div>
                              )}
                          </div>
                        )}

                       {selectedNode.type === 'catalogue' && (
                         <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Catalog ID</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="8784431548366614"
                                    value={selectedNode.data.catalogId || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { catalogId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Product SKUs (comma separated)</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="PROD-1, PROD-2"
                                    value={selectedNode.data.skus || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { skus: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5 border-t border-gray-100 pt-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Header Text</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="Our Best Products"
                                    value={selectedNode.data.header || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { header: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Body Message</label>
                                <textarea 
                                    className="input min-h-20 py-2 text-xs"
                                    placeholder="Check out these items..."
                                    value={selectedNode.data.body || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { body: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Footer Text</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="Tap to view items"
                                    value={selectedNode.data.footer || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { footer: e.target.value })}
                                />
                            </div>
                         </div>
                      )}

                      {selectedNode.type === 'flow' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Flow ID</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="your-flow-id"
                                    value={selectedNode.data.flowId || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { flowId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Button Text</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="Open Form"
                                    value={selectedNode.data.buttonText || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { buttonText: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Header Text (Optional)</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="Registration"
                                    value={selectedNode.data.header || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { header: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Body Message</label>
                                <textarea 
                                    className="input min-h-20 py-2 text-xs"
                                    placeholder="Please fill the form below:"
                                    value={selectedNode.data.body || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { body: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Footer Text (Optional)</label>
                                <input 
                                    className="input h-10 text-xs"
                                    placeholder="Thank you!"
                                    value={selectedNode.data.footer || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { footer: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">First Screen ID (Optional)</label>
                                <input 
                                    className="input h-10 text-xs font-mono"
                                    placeholder="QUESTION_ONE"
                                    value={selectedNode.data.screenId || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { screenId: e.target.value })}
                                />
                            </div>
                        </div>
                      )}

                     {selectedNode.type === 'wait' && (
                         <div className="space-y-4">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Store Input As</label>
                               <input 
                                   className="input h-10 text-xs"
                                   placeholder="variable_name"
                                   value={selectedNode.data.variable || ''}
                                   onChange={(e) => updateNodeData(selectedNode.id, { variable: e.target.value })}
                               />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Expected Format</label>
                                <select 
                                    className="input h-10 text-xs"
                                    value={selectedNode.data.expectedType || 'text'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { expectedType: e.target.value })}
                                >
                                    <option value="any">Any Message</option>
                                    <option value="text">Text Only</option>
                                    <option value="image">Image Only</option>
                                    <option value="document">PDF/Document Only</option>
                                    <option value="file">Any File (Image/Doc/Audio)</option>
                                </select>
                            </div>
                             {(selectedNode.data.expectedType && selectedNode.data.expectedType !== 'any') && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Error Message</label>
                                    <input 
                                        className="input h-10 text-xs"
                                        placeholder="Please upload valid content."
                                        value={selectedNode.data.errorMessage || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { errorMessage: e.target.value })}
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <input 
                                            type="checkbox" 
                                            id="retryOnInvalid-wait"
                                            checked={selectedNode.data.retryOnInvalid || false}
                                            onChange={(e) => updateNodeData(selectedNode.id, { retryOnInvalid: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <label htmlFor="retryOnInvalid-wait" className="text-[10px] font-bold text-gray-500">
                                            Retry on mismatch
                                        </label>
                                    </div>
                                </div>
                             )}
                         </div>
                     )}

                     {selectedNode.type === 'condition' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Variable to Check</label>
                                <input 
                                    className="input h-10 text-xs font-mono"
                                    placeholder="user_response"
                                    value={selectedNode.data.field || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { field: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Operator</label>
                                    <select 
                                        className="input h-10 text-xs"
                                        value={selectedNode.data.operator || 'equals'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { operator: e.target.value })}
                                    >
                                        <option value="equals">Equals</option>
                                        <option value="contains">Contains</option>
                                        <option value="not_equals">Not Equals</option>
                                        <option value="exists">Is Not Empty</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Value</label>
                                    <input 
                                        className="input h-10 text-xs"
                                        placeholder="expected value"
                                        value={selectedNode.data.value || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { value: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                     )}


                      {selectedNode.type === 'loop' && (
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Array Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="items_array"
                                     value={selectedNode.data.arrayVariable || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { arrayVariable: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400">Name of the variable containing the JSON array to iterate.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Item Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="item"
                                     value={selectedNode.data.currentItemVariable || 'item'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { currentItemVariable: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400">Variable to store the current item for this iteration.</p>
                             </div>
                         </div>
                      )}

                      {selectedNode.type === 'session_config' && (
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Session Timeout (Hours)</label>
                                 <input 
                                     type="number"
                                     className="input h-10 text-xs"
                                     placeholder="24"
                                     value={selectedNode.data.timeout || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { timeout: parseInt(e.target.value) })}
                                 />
                             </div>
                             <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="clearVars"
                                    checked={selectedNode.data.clearVariables || false}
                                    onChange={(e) => updateNodeData(selectedNode.id, { clearVariables: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor="clearVars" className="text-[10px] font-bold text-gray-500">
                                    Clear Variables on Restart
                                </label>
                             </div>
                         </div>
                      )}

                       {selectedNode.type === 'variable' && (
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Variable Name</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="my_var"
                                     value={selectedNode.data.variableName || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { variableName: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Value (supports {'{{var}}'})</label>
                                 <input 
                                     className="input h-10 text-xs"
                                     placeholder="some value"
                                     value={selectedNode.data.value || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { value: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400 mt-1">⚡ Use <code className="bg-gray-100 px-1 rounded">{'{{last_input}}'}</code> to save the previous button click or message.</p>
                             </div>
                         </div>
                      )}

                       {selectedNode.type === 'list_variable' && (
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Variable Name</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="image_list"
                                     value={selectedNode.data.variableName || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { variableName: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Items (One per line)</label>
                                 <textarea 
                                     className="input text-xs min-h-[150px] font-mono py-2"
                                     placeholder="https://image1.jpg&#10;https://image2.jpg"
                                     value={selectedNode.data.items || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { items: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400 mt-1">Paste your links or text here, one item per line.</p>
                             </div>
                         </div>
                      )}

                       {selectedNode.type === 'update_contact' && (
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-emerald-600">Contact Name</label>
                                 <input 
                                     className="input h-10 text-xs"
                                     placeholder="e.g. {{last_input}}"
                                     value={selectedNode.data.contactName || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { contactName: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400 ml-1 italic">Permanently updates their name in CRM</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-emerald-600">Contact Email</label>
                                 <input 
                                     className="input h-10 text-xs"
                                     placeholder="e.g. {{email_var}}"
                                     value={selectedNode.data.contactEmail || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { contactEmail: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-emerald-600">Tags (Comma separated)</label>
                                 <input 
                                     className="input h-10 text-xs"
                                     placeholder="lead, interested, vvip"
                                     value={selectedNode.data.contactTags || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { contactTags: e.target.value })}
                                 />
                             </div>
                         </div>
                      )}

                       {selectedNode.type === 'send_external' && (
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-amber-600">Recipient WhatsApp Number</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="e.g. 919876543210 or {{admin_mobile}}"
                                     value={selectedNode.data.to || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { to: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400 ml-1 italic">Include country code, no "+" sign.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-amber-600">Notification Message</label>
                                 <textarea 
                                     className="input text-xs min-h-[120px] py-2"
                                     placeholder="New Lead Alert!&#10;Name: {{sender_name}}&#10;Phone: {{sender_mobile}}&#10;Choice: {{last_input}}"
                                     value={selectedNode.data.message || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { message: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400 mt-1">📊 Supports all variables.</p>
                             </div>
                         </div>
                      )}

                       {selectedNode.type === 'map' && (
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1 flex items-center gap-1">
                                     Source Array Variable
                                 </label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="e.g. items"
                                     value={selectedNode.data.sourceArray || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { sourceArray: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Item Template</label>
                                 <textarea 
                                     className="input py-2 text-xs min-h-[80px]"
                                     placeholder="e.g. - {{name}}: {{price}}"
                                     value={selectedNode.data.template || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { template: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400">Specify properties to extract from each item.</p>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Separator</label>
                                    <select 
                                        className="input h-10 text-xs"
                                        value={selectedNode.data.separator || '\n'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { separator: e.target.value })}
                                    >
                                        <option value="\n">New Line</option>
                                        <option value=", ">Comma</option>
                                        <option value=" | ">Pipe</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Output Variable</label>
                                    <input 
                                        className="input h-10 text-xs font-mono"
                                        placeholder="result"
                                        value={selectedNode.data.outputVariable || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { outputVariable: e.target.value })}
                                    />
                                </div>
                             </div>
                         </div>
                      )}

                      {selectedNode.type === 'google_sheet' && (
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Web App URL</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="https://script.google.com/..."
                                     value={selectedNode.data.url || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400">Deploy your Google Apps Script as Web App (Anyone can access).</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">JSON Payload</label>
                                 <textarea 
                                     className="input py-3 text-xs font-mono resize-none"
                                     rows={4}
                                     placeholder={'{\n  "name": "{{name}}",\n  "phone": "{{phone}}"\n}'}
                                     value={selectedNode.data.payload || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { payload: e.target.value })}
                                 />
                             </div>
                         </div>
                      )}

                      {selectedNode.type === 'drive_image_lookup' && (
                         <div className="space-y-4">
                             <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                 <p className="text-[9px] text-blue-600 font-bold">📸 This node searches for a folder matching the variable value and returns images from it.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Search Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="user_input"
                                     value={selectedNode.data.searchVariable || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { searchVariable: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400">Variable containing search term (e.g. "plywood", "louver")</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Search Mode</label>
                                 <select 
                                     className="input h-10 text-xs"
                                     value={selectedNode.data.searchMode || 'folder'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { searchMode: e.target.value })}
                                 >
                                     <option value="folder">📁 Search in Folder Names (Best for collections)</option>
                                     <option value="file">🖼️ Search in File Names (Matches photo directly)</option>
                                 </select>
                             </div>

                             <div className="space-y-1.5 border-b border-gray-100 pb-3">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Connect via</label>
                                 <select 
                                     className="input h-10 text-xs"
                                     value={selectedNode.data.connectionType || 'script'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { connectionType: e.target.value })}
                                 >
                                     <option value="script">🔗 Google Apps Script (Recommended)</option>
                                     <option value="api_key">🔑 Native Google API Key (Pro)</option>
                                 </select>
                             </div>

                             {selectedNode.data.connectionType === 'api_key' ? (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-blue-600">Google Cloud API Key</label>
                                    <input 
                                        className="input h-10 text-xs font-mono"
                                        placeholder="AIzaSy..."
                                        value={selectedNode.data.apiKey || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { apiKey: e.target.value })}
                                    />
                                    <p className="text-[9px] text-gray-400">Get this from Google Cloud Console. Enable "Google Drive API" first.</p>
                                </div>
                             ) : (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Google Apps Script URL</label>
                                    <input 
                                        className="input h-10 text-xs font-mono"
                                        placeholder="https://script.google.com/..."
                                        value={selectedNode.data.apiUrl || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { apiUrl: e.target.value })}
                                    />
                                    <p className="text-[9px] text-gray-400">Your Google Apps Script Web App URL that returns images.</p>
                                </div>
                             )}

                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Parent Folder ID (Optional)</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="1abc...xyz"
                                     value={selectedNode.data.parentFolderId || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { parentFolderId: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400">Root folder ID to search within (leave empty for all)</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Output Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="image_urls"
                                     value={selectedNode.data.outputVariable || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { outputVariable: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400">Variable to store array of image URLs found.</p>
                             </div>
                             <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                 <div>
                                     <p className="text-[10px] font-bold text-gray-700">Send Automatically</p>
                                     <p className="text-[9px] text-gray-400">Directly send found images to WhatsApp</p>
                                 </div>
                                 <input 
                                     type="checkbox"
                                     className="toggle toggle-primary toggle-sm"
                                     checked={selectedNode.data.sendAutomatically || false}
                                     onChange={(e) => updateNodeData(selectedNode.id, { sendAutomatically: e.target.checked })}
                                 />
                             </div>
                             {selectedNode.data.sendAutomatically && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Caption (Optional)</label>
                                    <input 
                                        className="input h-10 text-xs"
                                        placeholder="Here is the image for you!"
                                        value={selectedNode.data.caption || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { caption: e.target.value })}
                                    />
                                    <p className="text-[9px] text-blue-500 font-medium">💡 Images will be sent as individual messages with this caption.</p>
                                </div>
                             )}

                         </div>
                      )}

                      {selectedNode.type === 'validator' && (
                         <div className="space-y-4">
                             <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                 <p className="text-[9px] text-emerald-600 font-bold">✓ Validates user input and routes flow based on result.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Validation Type</label>
                                 <select 
                                     className="input h-10 text-xs"
                                     value={selectedNode.data.validationType || 'email'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { validationType: e.target.value })}
                                 >
                                     <option value="email">📧 Email Address</option>
                                     <option value="phone">📱 Phone Number</option>
                                     <option value="image">🖼️ Image File</option>
                                     <option value="pdf">📄 PDF Document</option>
                                     <option value="pan">🪪 PAN Number</option>
                                     <option value="aadhar">🆔 Aadhar Number</option>
                                     <option value="gst">🏢 GST Number</option>
                                     <option value="pincode">📍 PIN Code</option>
                                 </select>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Input Variable</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="user_input"
                                     value={selectedNode.data.inputVariable || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { inputVariable: e.target.value })}
                                 />
                                 <p className="text-[9px] text-gray-400">Variable containing the value to validate.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Error Message</label>
                                 <input 
                                     className="input h-10 text-xs"
                                     placeholder="Please enter a valid email"
                                     value={selectedNode.data.errorMessage || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { errorMessage: e.target.value })}
                                 />
                             </div>
                         </div>
                      )}

                      {selectedNode.type === 'phone_parser' && (
                         <div className="space-y-4">
                             <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
                                 <p className="text-[9px] text-sky-600 font-bold">🌍 Automatically detects the country from the sender's WhatsApp number.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Output Formatted Phone</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="formatted_phone"
                                     value={selectedNode.data.outputVariable || 'formatted_phone'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { outputVariable: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Include Country Code in Output</label>
                                 <select 
                                     className="input h-10 text-xs"
                                     value={selectedNode.data.includeCountryCode === false ? 'no' : 'yes'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { includeCountryCode: e.target.value === 'yes' })}
                                 >
                                     <option value="yes">Yes (e.g. 919876543210)</option>
                                     <option value="no">No (e.g. 9876543210)</option>
                                 </select>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Output Country Name</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="country_name"
                                     value={selectedNode.data.countryNameVariable || 'country_name'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { countryNameVariable: e.target.value })}
                                 />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Output Country Code</label>
                                 <input 
                                     className="input h-10 text-xs font-mono"
                                     placeholder="country_code"
                                     value={selectedNode.data.countryCodeVariable || 'country_code'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { countryCodeVariable: e.target.value })}
                                 />
                             </div>
                         </div>
                      )}

                      {selectedNode.type === 'business_hours' && (
                         <div className="space-y-4">
                             <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                                 <p className="text-[9px] text-amber-600 font-bold">🕒 Routes the flow based on whether your business is currently open or closed.</p>
                             </div>
                             <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Timezone</label>
                                 <select 
                                     className="input h-10 text-xs"
                                     value={selectedNode.data.timezone || 'Asia/Kolkata'}
                                     onChange={(e) => updateNodeData(selectedNode.id, { timezone: e.target.value })}
                                 >
                                     <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                     <option value="UTC">UTC / GMT</option>
                                     <option value="America/New_York">America/New_York (EST)</option>
                                     <option value="Europe/London">Europe/London (GMT/BST)</option>
                                     <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                 </select>
                             </div>
                             
                             <div className="space-y-2 border-t border-gray-100 pt-3">
                                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-amber-600">Daily Schedule</label>
                                 {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                     <div key={day} className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-lg border border-gray-100">
                                         <span className="text-[10px] font-bold text-gray-600 w-14">{day.slice(0,3)}</span>
                                         <input 
                                             type="time" 
                                             className="input h-7 text-[10px] px-1 flex-1 border-amber-100 focus:border-amber-400"
                                             value={selectedNode.data[`${day.toLowerCase()}_start`] || '09:00'}
                                             onChange={(e) => updateNodeData(selectedNode.id, { [`${day.toLowerCase()}_start`]: e.target.value })}
                                         />
                                         <span className="text-[9px] font-bold text-gray-300">to</span>
                                         <input 
                                             type="time" 
                                             className="input h-7 text-[10px] px-1 flex-1 border-amber-100 focus:border-amber-400"
                                             value={selectedNode.data[`${day.toLowerCase()}_end`] || '18:00'}
                                             onChange={(e) => updateNodeData(selectedNode.id, { [`${day.toLowerCase()}_end`]: e.target.value })}
                                         />
                                     </div>
                                 ))}
                             </div>
                         </div>
                      )}


                     <button 
                        onClick={() => setSelectedNodeId(null)}
                        className="w-full py-2.5 rounded-xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase hover:bg-gray-50 transition-colors"
                     >
                        Done Editing
                     </button>
                  </div>
              ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                     <MousePointer2 className="mx-auto text-gray-300 mb-3" size={32} />
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed">
                        Select a node on the canvas to configure its behavior and data.
                     </p>
                  </div>
              )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChatbotBuilder;
