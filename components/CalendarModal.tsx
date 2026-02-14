import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { UPMAgenda } from '../types';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  events: UPMAgenda[]; // Using UPMAgenda as the event type
  onAddEvent?: (date: string) => void;
  onEditEvent?: (event: UPMAgenda) => void;
  onDeleteEvent?: (id: number) => void;
  isAdmin?: boolean;
  monthTheme?: string; // The main theme/task for this month
  onEditTheme?: (newTheme: string) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ 
  isOpen, onClose, initialDate, events, onAddEvent, onEditEvent, onDeleteEvent, isAdmin, monthTheme, onEditTheme 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [localTheme, setLocalTheme] = useState(monthTheme || '');

  useEffect(() => {
    setCurrentDate(new Date(initialDate));
    setLocalTheme(monthTheme || '');
  }, [initialDate, monthTheme]);

  if (!isOpen) return null;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0=Sun
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth });

  const getEventsForDay = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    checkDate.setHours(0,0,0,0);
    
    return events.filter(m => {
        const start = new Date(m.start_date);
        start.setHours(0,0,0,0);
        // Simple single day check or range check if needed
        // For now, let's assume events mark specific days or ranges
        // If target_date exists, treat as range? Or just start_date?
        // Let's stick to start_date placement for simplicity unless range is clear
        return start.getTime() === checkDate.getTime();
    });
  };

  const handleThemeSave = () => {
      if (onEditTheme) {
          onEditTheme(localTheme);
          setIsEditingTheme(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    Kalender Siklus AMI
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                </h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        {/* Month Theme Section */}
        <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Fokus Bulan Ini</p>
                    {isEditingTheme ? (
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 p-2 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={localTheme}
                                onChange={(e) => setLocalTheme(e.target.value)}
                            />
                            <button onClick={handleThemeSave} className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg">Simpan</button>
                        </div>
                    ) : (
                        <h4 className="text-lg font-bold text-indigo-900">{localTheme || "Belum ada aktivitas utama."}</h4>
                    )}
                </div>
                {isAdmin && !isEditingTheme && (
                    <button onClick={() => setIsEditingTheme(true)} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors">
                        <Edit size={16} />
                    </button>
                )}
            </div>
        </div>

        <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, i) => <div key={`e-${i}`} className="h-24 bg-slate-50/50 rounded-xl" />)}
                {calendarDays.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1).toISOString().split('T')[0]; // +1 because day is 1-based, but need to be careful with timezone. simpler:
                    // Construct correct YYYY-MM-DD
                    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isoDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

                    return (
                        <div key={day} 
                             className="h-24 p-2 border border-slate-100 rounded-xl relative hover:shadow-md transition-shadow group bg-white flex flex-col"
                             onClick={() => isAdmin && onAddEvent && onAddEvent(isoDate)}
                        >
                            <span className={`font-bold text-xs mb-1 w-6 h-6 flex items-center justify-center rounded-full ${dayEvents.length > 0 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{day}</span>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                {dayEvents.map(event => (
                                    <div key={event.id} 
                                         className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-1 rounded border border-indigo-100 truncate cursor-pointer hover:bg-indigo-100 relative group/item"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             if(isAdmin && onEditEvent) onEditEvent(event);
                                         }}
                                    >
                                        {event.title}
                                        {isAdmin && onDeleteEvent && (
                                            <button 
                                                className="absolute right-0 top-0 bottom-0 px-1 bg-rose-500 text-white opacity-0 group-hover/item:opacity-100 flex items-center"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteEvent(event.id);
                                                }}
                                            >
                                                <X size={8} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {isAdmin && (
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus size={14} className="text-slate-300 hover:text-indigo-600 cursor-pointer" />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;