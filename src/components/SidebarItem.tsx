
import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default SidebarItem;
