import { Bell, Search, Settings as SettingsIcon, Activity, Inbox, Mic } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSettingsStore } from '../../stores/settingsStore';
import { useComplaintsStore } from '../../stores/complaintsStore';
import clsx from 'clsx';

export default function Topbar() {
  const agentName = useSettingsStore((state) => state.agentName);
  const complaints = useComplaintsStore((state) => state.complaints);
  
  const hasCriticalOpen = complaints.some(
    c => c.severity === 'critical' && (c.status === 'open' || c.status === 'in_progress')
  );

  const unreadCount = complaints.filter(c => c.unread).length;

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm",
      isActive
        ? "bg-black text-white"
        : "bg-transparent text-gray-500 hover:text-black border border-transparent hover:border-gray-300 hover:bg-gray-100"
    );

  return (
    <header className="flex items-center justify-between h-[80px] bg-transparent shrink-0 mb-4 px-2">
      {/* Top Left Logo Area */}
      <div className="flex items-center gap-3 w-[250px]">
        <div className="flex items-center justify-center p-2 rounded-full border border-gray-300">
          <div className="w-4 h-4 rounded-sm bg-black rotate-45 transform"></div>
        </div>
        <span className="font-['DM_Sans'] text-xl font-bold tracking-tight text-gray-900">
          Aurus
        </span>
      </div>

      {/* Center Navigation Pills */}
      <nav className="flex items-center bg-white/60 p-1.5 rounded-full border border-gray-200 shadow-sm gap-1">
        <NavLink to="/pulse" className={navItemClass}>
          <Activity className="w-4 h-4" />
          <span>Pulse</span>
        </NavLink>
        
        <NavLink to="/resolve" className={clsx(navItemClass, "relative")}>
          <Inbox className="w-4 h-4" />
          <span>Resolve</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
          )}
        </NavLink>
        
        <NavLink to="/assist" className={navItemClass}>
          <Mic className="w-4 h-4" />
          <span>Assist</span>
        </NavLink>

        <NavLink to="/settings" className={navItemClass}>
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
      </nav>
      
      {/* Right User & Search actions */}
      <div className="flex items-center gap-4 w-[250px] justify-end">
        {/* Notifications pill */}
        <button className="relative flex items-center justify-center w-11 h-11 bg-white rounded-full border border-gray-200 shadow-sm text-gray-500 hover:text-black hover:border-gray-300 transition-colors">
          <Bell className="w-5 h-5" />
          {hasCriticalOpen && (
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
          )}
        </button>
        
        {/* User pill */}
        <div className="flex items-center bg-white rounded-full pl-1.5 pr-4 py-1.5 gap-3 h-11 border border-gray-200 shadow-sm cursor-pointer hover:border-gray-300 transition-all">
          <img 
            src={`https://ui-avatars.com/api/?name=${agentName}&background=FF5533&color=fff`} 
            alt={agentName} 
            className="w-8 h-8 rounded-full shadow-sm"
          />
          <div className="flex flex-col justify-center text-left">
            <span className="text-xs font-bold text-gray-900 leading-none truncate max-w-[80px]">{agentName}</span>
            <span className="text-[10px] text-gray-400 font-bold mt-0.5 truncate max-w-[80px]">agent@aurus.cx</span>
          </div>
        </div>
      </div>
    </header>
  );
}

