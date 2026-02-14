
import React from 'react';

interface SidebarItemProps {
  icon: React.ReactElement<{ size?: number | string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, isCollapsed }) => {
  return (
    <div className="relative group">
      <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 ${
          isCollapsed ? 'justify-center' : ''
        } ${
          active 
            ? 'bg-pepi-green-900 text-white shadow-lg shadow-pepi-green-900/50' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      >
        <span className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}>
          {React.cloneElement(icon, { size: 20 })}
        </span>
        <span className={`text-sm font-bold transition-all whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          {label}
        </span>
      </button>

      {isCollapsed && (
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-lg
                       invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 
                       pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;