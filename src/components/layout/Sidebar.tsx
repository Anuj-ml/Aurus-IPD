import { NavLink } from 'react-router-dom';
import { Activity, Inbox, Mic, Settings } from 'lucide-react';
import { useComplaintsStore } from '../../stores/complaintsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import clsx from 'clsx';

export default function Sidebar() {
  const agentName = useSettingsStore((state) => state.agentName);
  const agentBranch = useSettingsStore((state) => state.agentBranch);
  const complaints = useComplaintsStore((state) => state.complaints);
  
  const unreadCount = complaints.filter(c => c.unread).length;

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex items-center px-4 h-[52px] rounded-full transition-all duration-300 shadow-sm relative shrink-0",
      isActive
        ? "bg-black text-white"
        : "bg-white text-gray-500 hover:text-black hover:drop-shadow-md"
    );

  return (
    <div className="flex flex-col h-full w-[200px] shrink-0 items-start py-8 gap-6 bg-transparent border-r border-gray-100">
      {/* Top Floating Logo Area (Invisible Spacer or custom if needed) */}
      <div className="h-12 w-full flex items-center px-6 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white font-bold text-lg">
          CB
        </div>
      </div>

      {/* Floating Center Icons */}
      <nav className="flex flex-col gap-4 flex-1 w-full px-4">
        <NavLink to="/pulse" className={navItemClass} title="Pulse">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">Pulse</span>
          </div>
        </NavLink>
        
        <NavLink to="/resolve" className={navItemClass} title="Resolve">
          <div className="flex items-center gap-3">
            <Inbox className="w-5 h-5" />
            <span className="text-sm font-medium">Resolve</span>
          </div>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
          )}
        </NavLink>
        
        <NavLink to="/assist" className={navItemClass} title="Assist">
          <div className="flex items-center gap-3">
            <Mic className="w-5 h-5" />
            <span className="text-sm font-medium">Assist</span>
          </div>
        </NavLink>

        <NavLink to="/settings" className={navItemClass} title="Settings">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </div>
        </NavLink>
      </nav>

      {/* Bottom User Area */}
      <div className="mt-auto flex items-center px-6 pb-4 w-full gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
          {agentName.charAt(0)}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold truncate text-gray-900">{agentName}</span>
          <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">{agentBranch}</span>
        </div>
      </div>
    </div>
  );
}

