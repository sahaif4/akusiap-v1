
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Clock, Building2, User, ChevronRight, ChevronLeft, BarChart3, TrendingUp, AlertCircle, CalendarDays, 
  Lock, GanttChart, FileUp, ClipboardCheck, MessageSquareText, PenSquare, Users, CheckCircle, Database, Server, Info, X, Target, Loader2
} from 'lucide-react';
import { Role, CurrentUser } from '../types';
import { getAuditCycles } from '../services/apiService';

// --- TEMPLATE MILESTONES (Structure without dates) ---
const TEMPLATE_MILESTONES = [
  { 
    id: 1, label: 'Perencanaan Audit', icon: GanttChart, 
    description: "Menetapkan lingkup, jadwal, standar, dan instrumen audit untuk siklus berjalan.",
    tasks: [
      { role: [Role.ADMIN_UPM, Role.SUPER_ADMIN], text: "Membuat jadwal audit tahunan & mengunggah SK Penugasan Auditor." },
      { role: [Role.AUDITOR], text: "Menyusun instrumen audit (checklist) spesifik berdasarkan standar yang dipilih." }
    ],
    outputs: ["Jadwal Audit Final", "SK Tim Auditor", "Instrumen Audit per Unit"],
    consequence: "Ketidakjelasan lingkup audit dapat menyebabkan proses evaluasi tidak fokus dan tidak efektif."
  },
  { 
    id: 2, label: 'Penyediaan Dokumen', icon: FileUp, 
    description: "Unit kerja (auditee) mengumpulkan dan mengunggah semua dokumen bukti yang diminta oleh auditor.",
    tasks: [
      { role: [Role.ADMIN_PRODI, Role.AUDITEE], text: "Mengunggah semua dokumen bukti (evidence) yang disyaratkan dalam instrumen." },
      { role: [Role.ADMIN_PRODI, Role.AUDITEE], text: "Mengisi Laporan Evaluasi Diri (LED) sebagai data pendukung." },
      { role: [Role.ADMIN_UPM], text: "Memonitor progres kelengkapan dokumen dari semua unit." }
    ],
    outputs: ["Dokumen Bukti per Standar", "Laporan Evaluasi Diri (LED)"],
    consequence: "Keterlambatan penyediaan dokumen akan menunda seluruh jadwal audit berikutnya dan mengurangi waktu evaluasi."
  },
  { 
    id: 3, label: 'Desk Evaluation', icon: ClipboardCheck, 
    description: "Auditor memeriksa kelengkapan dan kesesuaian dokumen yang diunggah sebelum melakukan visitasi.",
    tasks: [
      { role: [Role.AUDITOR], text: "Memverifikasi kelengkapan dan relevansi dokumen bukti." },
      { role: [Role.AUDITOR], text: "Memberikan skor awal berdasarkan data yang tersedia." },
      { role: [Role.AUDITOR], text: "Meminta revisi dokumen jika ditemukan ketidaksesuaian." }
    ],
    outputs: ["Hasil Desk Evaluation", "Skor Awal Kepatuhan"],
    consequence: "Evaluasi yang tidak teliti dapat menyebabkan visitasi lapangan tidak efisien."
  },
  { 
    id: 4, label: 'Visitasi Lapangan', icon: Building2, 
    description: "Auditor melakukan verifikasi faktual, wawancara, dan observasi langsung di unit kerja.",
    tasks: [
      { role: [Role.AUDITOR], text: "Melakukan wawancara dengan auditee dan staf terkait." },
      { role: [Role.AUDITOR], text: "Mencatat temuan (Major/Minor/Observasi) secara real-time." },
      { role: [Role.AUDITEE], text: "Menyediakan akses ke fasilitas dan data yang dibutuhkan." }
    ],
    outputs: ["Daftar Tilik Terisi", "Catatan Temuan Lapangan"],
    consequence: "Data yang tidak akurat akan menghasilkan rekomendasi yang tidak tepat sasaran."
  },
  { 
    id: 5, label: 'Pelaporan & RTL', icon: PenSquare, 
    description: "Finalisasi hasil audit, penyusunan berita acara, dan rencana tindak lanjut.",
    tasks: [
      { role: [Role.AUDITOR, Role.AUDITEE], text: "Menandatangani Berita Acara Hasil Audit secara digital." },
      { role: [Role.ADMIN_UPM, Role.PIMPINAN], text: "Membahas hasil audit dalam Rapat Tinjauan Manajemen (RTM)." },
      { role: [Role.AUDITEE], text: "Menyusun Rencana Tindak Lanjut (RTL) berdasarkan temuan." }
    ],
    outputs: ["Berita Acara Audit", "Notulensi RTM", "Dokumen RTL"],
    consequence: "Tanpa RTL yang jelas, siklus perbaikan mutu tidak akan berjalan."
  }
];

// --- UTILITY FUNCTIONS ---
const getDeadlineInfo = (endDateStr: string) => {
  const end = new Date(endDateStr);
  const today = new Date();
  
  // Reset both to midnight for accurate date comparison
  today.setHours(0, 0, 0, 0); 
  end.setHours(0, 0, 0, 0); 

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { days: Math.abs(diffDays), label: `Terlambat ${Math.abs(diffDays)} hari`, color: 'rose', icon: <AlertCircle size={16}/> };
  if (diffDays === 0) return { days: 0, label: 'Batas Waktu Hari Ini', color: 'amber', icon: <Clock size={16}/> };
  if (diffDays <= 3) return { days: diffDays, label: `${diffDays} hari lagi`, color: 'amber', icon: <Clock size={16}/> };
  return { days: diffDays, label: `Sisa ${diffDays} hari`, color: 'emerald', icon: <CheckCircle2 size={16}/> };
};

const AuditTimelineView: React.FC<{ currentUser: CurrentUser | null }> = ({ currentUser }) => {
  const [selectedStage, setSelectedStage] = useState<any | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userRole = currentUser?.role || Role.AUDITEE;
  let isOverdueBlock = false;

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const cycles = await getAuditCycles();
        // Prioritize active cycle, otherwise latest
        const activeCycle = cycles.find(c => c.status === 'Aktif') || cycles[0];
        
        if (activeCycle && activeCycle.start_date && activeCycle.end_date) {
          const start = new Date(activeCycle.start_date);
          const end = new Date(activeCycle.end_date);
          const totalDuration = end.getTime() - start.getTime();
          
          const addDays = (base: Date, percent: number) => {
            return new Date(base.getTime() + totalDuration * percent);
          };

          const today = new Date();
          today.setHours(0,0,0,0);

          const getStatus = (s: Date, e: Date) => {
            const sTime = s.getTime();
            const eTime = e.getTime();
            const now = today.getTime();
            
            if (now > eTime) return 'completed'; // Or overdue if strict logic
            if (now >= sTime && now <= eTime) return 'active';
            return 'pending';
          };

          // Define timeline distribution (approximate percentages)
          // 1. Planning: 0-10%
          // 2. Docs: 10-30%
          // 3. Desk: 30-50%
          // 4. Visit: 50-70%
          // 5. Report: 70-100%
          
          const stages = [
            { pctStart: 0, pctEnd: 0.1 },
            { pctStart: 0.1, pctEnd: 0.3 },
            { pctStart: 0.3, pctEnd: 0.5 },
            { pctStart: 0.5, pctEnd: 0.7 },
            { pctStart: 0.7, pctEnd: 1.0 },
          ];

          const generatedMilestones = TEMPLATE_MILESTONES.map((tmpl, idx) => {
            const sDate = addDays(start, stages[idx].pctStart);
            const eDate = addDays(start, stages[idx].pctEnd);
            
            // Adjust end date to end of day for comparison logic if needed, 
            // but string format YYYY-MM-DD is standard.
            // Let's keep them as Date objects for logic, convert to string for display/interface
            
            const startDateStr = sDate.toISOString().split('T')[0];
            const endDateStr = eDate.toISOString().split('T')[0];
            
            let status = getStatus(sDate, eDate);
            
            // Refine overdue logic: if today > endDate and we assume it's strictly enforced deadlines
            // For now, let's stick to simple logic: if passed, it's completed unless we have specific flag.
            // But UI shows 'Terlambat' if overdue. 
            // Let's check: if status is 'completed' (time passed) but activeCycle is still active, maybe mark previous stages as completed?
            // Actually, without real progress tracking per stage, time-based is the best we can do.
            // However, to show 'overdue' specifically, we'd need to know if it *wasn't* done.
            // Since we don't have that data, 'completed' (passed time) is safer than 'overdue' (red alert).
            // UNLESS it is the *current* stage and today > endDate? No that's impossible.
            // Let's modify getStatus to support 'overdue' if we want.
            // Current mockup logic: "isOverdue = deadline.color === 'rose' && !isCompleted"
            // So if status is NOT 'completed' but deadline is passed.
            // We'll set status to 'completed' if passed for now to be "clean".
            // If the user wants "overdue" warnings, we'd need real progress data.
            
            return {
              ...tmpl,
              startDate: startDateStr,
              endDate: endDateStr,
              status: status
            };
          });
          
          setMilestones(generatedMilestones);
        } else {
            // Fallback if no cycle
            setMilestones([]);
        }
      } catch (e) {
        console.error("Failed to load audit cycle", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCycle();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>;
  if (milestones.length === 0) return <div className="text-center p-10 text-slate-500">Belum ada siklus audit aktif.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Progres Siklus Mutu</h2>
          <p className="text-sm text-slate-500 font-medium">Panduan operasional alur kerja PPEPP.</p>
        </div>
        <button onClick={() => setIsCalendarOpen(true)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
          <CalendarDays size={16} /> Lihat Kalender Detail
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="relative flex flex-col gap-12 ml-4">
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-100" />
          
          {milestones.map((stage) => {
            const deadline = getDeadlineInfo(stage.endDate);
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';
            const isOverdue = deadline.color === 'rose' && !isCompleted;
            const isLocked = isOverdueBlock && !isCompleted && !isActive;

            if(isOverdue) isOverdueBlock = true;

            return (
              <div 
                key={stage.id} 
                onClick={() => !isLocked && setSelectedStage(stage)}
                className={`relative z-10 flex items-start gap-8 group ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 flex-shrink-0 transition-all duration-500 ${
                  isLocked ? 'bg-slate-100 border-white' :
                  isCompleted ? 'bg-emerald-500 border-white text-white' : 
                  isActive ? 'bg-indigo-600 border-white text-white animate-pulse' : 'bg-white border-slate-200'
                }`}>
                  {isLocked ? <Lock size={20} className="text-slate-400"/> : <stage.icon size={24} />}
                </div>
                
                <div className={`flex-1 bg-slate-50 rounded-3xl p-6 border transition-all duration-300 ${
                    isLocked ? 'opacity-50' : 
                    selectedStage?.id === stage.id ? 'border-indigo-300 shadow-xl bg-white' : 
                    'border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-lg'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{stage.label}</h4>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                        <CalendarDays size={12} /> {new Date(stage.startDate).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})} - {new Date(stage.endDate).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}
                      </p>
                    </div>
                    
                    {!isLocked && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                        deadline.color === 'rose' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                        deadline.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        {deadline.icon} {deadline.label}
                      </div>
                    )}
                  </div>
                  {isLocked && (
                    <p className="mt-2 text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">Tahap ini ditunda hingga tahap sebelumnya selesai.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* STAGE DETAIL MODAL */}
      {selectedStage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStage(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg"><selectedStage.icon size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">{selectedStage.label}</h3>
                    <p className="text-sm text-slate-500 font-medium">{selectedStage.description}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedStage(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200"><X size={20}/></button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="p-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
                 <h4 className="font-bold text-indigo-800">Tugas Anda ({userRole}):</h4>
                 <div className="flex flex-col items-center md:items-end">
                    <span className="text-2xl font-black text-indigo-900">{getDeadlineInfo(selectedStage.endDate).days} hari lagi</span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Batas Waktu: {new Date(selectedStage.endDate).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})}</span>
                 </div>
              </div>

              <div className="space-y-3">
                 {selectedStage.tasks.filter((t: any) => t.role.includes(userRole)).map((task: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                       <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                       <p className="text-sm font-medium text-slate-700">{task.text}</p>
                    </div>
                 ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                 <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pihak Terkait Lainnya</h5>
                    <div className="flex flex-wrap gap-2">
                       {Array.from(new Set(selectedStage.tasks.flatMap((t:any) => t.role))).map((role: any, idx: number) => (
                          <span key={idx} className={`px-2 py-1 rounded text-[9px] font-bold border ${role === userRole ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{role}</span>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dampak Keterlambatan</h5>
                    <p className="text-xs text-rose-700 font-medium italic p-2 bg-rose-50 rounded-lg border border-rose-100">{selectedStage.consequence}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR MODAL */}
      {isCalendarOpen && <CalendarModal milestones={milestones} onClose={() => setIsCalendarOpen(false)} />}
    </div>
  );
};

// --- Calendar Modal Sub-component ---
const CalendarModal: React.FC<{ milestones: any[], onClose: () => void }> = ({ milestones, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0=Sun, 1=Mon
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth });

  const getEventForDay = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return milestones.find(m => {
        const start = new Date(m.startDate);
        const end = new Date(m.endDate);
        return checkDate >= start && checkDate <= end;
    });
  };

  const eventColors: any = { 1: 'bg-red-200', 2: 'bg-blue-200', 3: 'bg-yellow-200', 4: 'bg-green-200', 5: 'bg-purple-200'};

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold">Kalender Siklus AMI</h3>
            <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronLeft size={20}/></button>
              <div className="text-lg font-black text-slate-800 uppercase tracking-widest">{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronRight size={20}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, i) => <div key={`e-${i}`} />)}
                {calendarDays.map(day => {
                    const event = getEventForDay(day);
                    return (
                        <div key={day} className={`h-20 p-2 border rounded-lg relative ${event ? eventColors[event.id] : 'bg-slate-50'}`}>
                            <span className="font-bold text-xs">{day}</span>
                            {event && (
                                <div className="absolute bottom-1 left-1 right-1 text-[8px] font-bold truncate bg-white/50 px-1 rounded">
                                    {event.label}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  )
}


export default AuditTimelineView;
