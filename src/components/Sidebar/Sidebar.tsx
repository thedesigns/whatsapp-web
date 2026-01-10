import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Share2,
  Bot, 
  FileText, 
  Users, 
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Plug,
  Layers,
  Monitor
} from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const userNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Live Chat', path: '/chat' },
    { icon: Share2, label: 'Broadcasts', path: '/broadcasts' },
    { icon: Bot, label: 'Chatbot Builder', path: '/chatbot' },
    { icon: Plug, label: 'Integrations', path: '/integrations' },
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'SUPERVISOR' || user?.role === 'SUPER_ADMIN') {
    userNavItems.push({ icon: UserCog, label: 'Agents', path: '/agents' });
  }

  const adminNavItems = [
    { icon: ShieldCheck, label: 'Platform Hub', path: '/admin/dashboard' },
    { icon: Building2, label: 'Customers', path: '/admin/organizations' },
    { icon: Layers, label: 'Plans', path: '/admin/plans' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings' },
  ];

  const currentNavItems = isAdminRoute ? adminNavItems : userNavItems;

  return (
    <aside className={cn(
      "bg-dark-100 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white border-2 border-dark-100 z-50 hover:scale-110 transition-transform shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={cn("p-4 flex-1", isCollapsed ? "px-2" : "p-6")}>
        <div className={cn(
          "flex items-center space-x-3 mb-10 overflow-hidden transition-all duration-300",
          isCollapsed ? "justify-center" : "px-2"
        )}>
          <img 
            src={isCollapsed ? "/images/bizwhatzcollapse.png" : "/images/bizwhatzwhite.png"} 
            alt="Bizwhatz Logo" 
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "w-10 h-10 object-contain" : "h-10 w-auto object-contain"
            )}
          />
        </div>

        <nav className="space-y-2">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ""}
              className={({ isActive }) => cn(
                "flex items-center rounded-xl transition-all duration-200 group relative",
                isCollapsed ? "justify-center h-12 w-12 mx-auto" : "space-x-3 px-4 py-3",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors shrink-0",
                "group-hover:text-white"
              )} />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap animate-in slide-in-from-left-2 duration-300">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 uppercase tracking-widest border border-white/10 shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={cn("mt-auto space-y-2", isCollapsed ? "p-2 pb-6" : "p-6")}>
        {user?.role === 'SUPER_ADMIN' && (
          <NavLink
            to={isAdminRoute ? "/dashboard" : "/admin/dashboard"}
            title={isCollapsed ? (isAdminRoute ? "App View" : "Admin View") : ""}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 bg-white/5 text-primary hover:bg-white/10 group relative mb-4",
              isCollapsed ? "justify-center h-12 w-12 mx-auto" : "space-x-3 px-4 py-3"
            )}
          >
            {isAdminRoute ? <Monitor size={20} /> : <ShieldCheck size={20} />}
            {!isCollapsed && <span className="font-black uppercase text-[10px] tracking-widest">{isAdminRoute ? 'Switch to App' : 'Switch to Admin'}</span>}
          </NavLink>
        )}

        <NavLink
          to="/settings"
          title={isCollapsed ? "Settings" : ""}
          className={cn(
            "flex items-center rounded-xl transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white group relative",
            isCollapsed ? "justify-center h-12 w-12 mx-auto" : "space-x-3 px-4 py-3"
          )}
        >
          <Settings size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 uppercase tracking-widest border border-white/10 shadow-xl">
              Settings
            </div>
          )}
        </NavLink>
        <button 
          onClick={() => logout()}
          className={cn(
          "w-full flex items-center rounded-xl transition-all duration-200 text-gray-400 hover:bg-red-500/10 hover:text-red-500 group relative",
          isCollapsed ? "justify-center h-12 w-12 mx-auto" : "space-x-3 px-4 py-3"
        )}>
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
          {isCollapsed && (
             <div className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 uppercase tracking-widest shadow-xl">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
