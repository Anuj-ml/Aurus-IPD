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
      "flex items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300 shadow-sm",
      isActive
        ? "bg-black text-white"
        : "bg-white text-gray-500 hover:text-black hover:drop-shadow-md"
    );

  return (
    <div className="flex flex-col h-full w-[100px] shrink-0 items-center py-8 gap-6 bg-transparent">
      {/* Top Floating Logo Area (Invisible Spacer or custom if needed) */}
      <div className="h-12 w-full flex items-center justify-center mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white font-bold text-lg">
          CB
        </div>
      </div>

      {/* Floating Center Icons */}
      <nav className="flex flex-col gap-5 flex-1 w-full items-center justify-center">
        <NavLink to="/pulse" className={navItemClass} title="Pulse">
          <Activity className="w-5 h-5" />
        </NavLink>
        
        <NavLink to="/resolve" className={clsx(navItemClass, "relative")} title="Resolve">
          <Inbox className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 border-2 border-[var(--bg)]" />
          )}
        </NavLink>
        
        <NavLink to="/assist" className={navItemClass} title="Assist">
          <Mic className="w-5 h-5" />
        </NavLink>

        <NavLink to="/settings" className={navItemClass} title="Settings">
          <Settings className="w-5 h-5" />
        </NavLink>
      </nav>

      {/* Bottom User Area */}
      <div className="mt-auto flex flex-col items-center pb-4 w-full px-2 text-center overflow-hidden gap-1">
        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-gray-600">
          {agentName.charAt(0)}
        </div>
      </div>
    </div>
  );
}

