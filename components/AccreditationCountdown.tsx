
import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StrategicAgenda } from '../types';

interface CountdownWidgetProps {
  agenda: StrategicAgenda | null;
}

const CountdownWidget: React.FC<CountdownWidgetProps> = ({ agenda }) => {
  const calculateTimeLeft = () => {
    if (!agenda) return null;

    const difference = +new Date(agenda.targetDate) - +new Date();
    let timeLeft: { days?: number; hours?: number; minutes?: number; seconds?: number } = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!agenda) return;
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [agenda]);

  if (!agenda) {
    return null; // Don't render if no active agenda
  }

  const hasTimeLeft = timeLeft && timeLeft.days !== undefined;
  const daysLeft = hasTimeLeft ? timeLeft.days! : 0;
  const reminderThreshold = agenda.reminderDaysBefore ?? 180;
  const isUrgent = hasTimeLeft && daysLeft <= reminderThreshold;

  const formattedTargetDate = new Date(agenda.targetDate).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className={`group relative p-4 rounded-2xl border transition-all duration-300 w-full ${isUrgent ? 'bg-pepi-warning-500/10 border-pepi-warning-500/20' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center gap-4">
        <div className={`flex-shrink-0 text-center w-16 h-16 flex flex-col items-center justify-center rounded-2xl shadow-inner ${isUrgent ? 'bg-pepi-warning-700 text-white' : hasTimeLeft ? 'bg-pepi-green-700 text-white' : 'bg-emerald-500 text-white'}`}>
          <span className="text-3xl font-black tracking-tighter leading-none">{hasTimeLeft ? daysLeft : <CheckCircle2 size={24} />}</span>
          <span className="text-[10px] font-bold uppercase">{hasTimeLeft ? 'Hari' : 'Selesai'}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <p className={`text-[9px] font-black uppercase tracking-widest ${isUrgent ? 'text-pepi-warning-300' : hasTimeLeft ? 'text-pepi-green-300' : 'text-emerald-300'}`}>Agenda Strategis</p>
          <h4 className="font-bold text-white text-sm leading-tight truncate" title={agenda.name}>{agenda.name}</h4>
          {hasTimeLeft && (
            <p className="font-mono text-xs mt-1 font-bold text-slate-400">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Kesiapan</p>
            <p className="text-[10px] font-black text-emerald-300">75%</p>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>
      {/* Tooltip on hover - POSISI DIPINDAHKAN KE BAWAH */}
      <div className="absolute top-full mt-2 left-0 w-full p-4 bg-slate-800 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none text-xs z-50 animate-in fade-in duration-200">
        <p className="font-bold">{agenda.description || "Tidak ada deskripsi."}</p>
        <p className="text-slate-300 mt-1">Target: {formattedTargetDate}</p>
        {agenda.responsibleUnit && <p className="text-slate-300">Unit: {agenda.responsibleUnit}</p>}
      </div>
    </div>
  );
};

export default CountdownWidget;
